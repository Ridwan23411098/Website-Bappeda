/**
 * SIP-KOMPETENSI — NOTIFICATION SERVICE (REAL-TIME)
 * Mengelola notifikasi real-time menggunakan Supabase Realtime
 */

const NotificationService = {
  notifications: [],
  channel: null,
  isListening: false,

  // =====================
  // INISIALISASI
  // =====================
  async init() {
    // Muat notifikasi dari Supabase
    await this.loadFromSupabase();
    // Mulai mendengarkan perubahan real-time
    this.startListening();
    // Render UI awal
    this.renderDropdown();
  },

  // =====================
  // MUAT NOTIFIKASI DARI DATABASE
  // =====================
  async loadFromSupabase() {
    if (typeof supabaseClient === 'undefined') return;
    const user = Store.state.user;
    if (!user || !user.role) return;

    try {
      const { data, error } = await supabaseClient
        .from('notifikasi')
        .select('*')
        .or(`penerima_role.eq.${user.role},penerima_nip.eq.${user.nip}`)
        .order('dibuat_pada', { ascending: false })
        .limit(20);

      if (!error && data) {
        this.notifications = data;
      }
    } catch (e) {
      console.warn('Gagal memuat notifikasi:', e);
    }
  },

  // =====================
  // SUPABASE REALTIME LISTENER
  // =====================
  startListening() {
    if (typeof supabaseClient === 'undefined' || this.isListening) return;
    const user = Store.state.user;
    if (!user || !user.role) return;

    this.channel = supabaseClient
      .channel('notifikasi_realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifikasi' },
        (payload) => {
          const notif = payload.new;
          // Tampilkan hanya jika notifikasi ditujukan untuk user ini
          if (notif.penerima_role === user.role || notif.penerima_nip === user.nip) {
            this.notifications.unshift(notif);
            this.renderDropdown();
            this.showToastNotification(notif);
            this.playNotifSound();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.isListening = true;
          console.log('Realtime notifikasi aktif.');
        }
      });
  },

  stopListening() {
    if (this.channel) {
      supabaseClient.removeChannel(this.channel);
      this.channel = null;
      this.isListening = false;
    }
  },

  // =====================
  // KIRIM NOTIFIKASI KE DATABASE
  // =====================
  async send(targetRole, targetNip, judul, pesan) {
    if (typeof supabaseClient === 'undefined') return;
    try {
      await supabaseClient
        .from('notifikasi')
        .insert({
          penerima_role: targetRole,
          penerima_nip: targetNip || null,
          judul: judul,
          pesan: pesan
        });
    } catch (e) {
      console.warn('Gagal mengirim notifikasi:', e);
    }
  },

  // =====================
  // TANDAI SUDAH DIBACA
  // =====================
  async markAsRead(notifId) {
    const notif = this.notifications.find(n => n.id === notifId);
    if (notif) notif.sudah_dibaca = true;
    this.renderDropdown();

    if (typeof supabaseClient !== 'undefined') {
      try {
        await supabaseClient
          .from('notifikasi')
          .update({ sudah_dibaca: true })
          .eq('id', notifId);
      } catch (e) {
        console.warn('Gagal menandai notifikasi:', e);
      }
    }
  },

  async markAllAsRead() {
    const unreadIds = this.notifications.filter(n => !n.sudah_dibaca).map(n => n.id);
    this.notifications.forEach(n => n.sudah_dibaca = true);
    this.renderDropdown();

    if (typeof supabaseClient !== 'undefined' && unreadIds.length > 0) {
      try {
        await supabaseClient
          .from('notifikasi')
          .update({ sudah_dibaca: true })
          .in('id', unreadIds);
      } catch (e) {
        console.warn('Gagal menandai semua notifikasi:', e);
      }
    }
  },

  // =====================
  // EFEK SUARA & TOAST
  // =====================
  playNotifSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) { /* Abaikan jika browser tidak mendukung */ }
  },

  showToastNotification(notif) {
    // Buat elemen toast khusus yang lebih mencolok
    const toastEl = document.createElement('div');
    toastEl.className = 'realtime-toast';
    toastEl.innerHTML = `
      <div class="realtime-toast-icon"><span data-icon="BellRing" data-icon-size="20"></span></div>
      <div class="realtime-toast-body">
        <div class="realtime-toast-title">${notif.judul}</div>
        <div class="realtime-toast-msg">${notif.pesan}</div>
      </div>
      <button class="realtime-toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    document.body.appendChild(toastEl);
    if (window.lucide) window.lucide.createIcons({ nodes: [toastEl] });

    // Animate in
    requestAnimationFrame(() => toastEl.classList.add('show'));

    // Auto remove after 6 seconds
    setTimeout(() => {
      toastEl.classList.remove('show');
      setTimeout(() => toastEl.remove(), 400);
    }, 6000);
  },

  // =====================
  // RENDER UI DROPDOWN
  // =====================
  renderDropdown() {
    const unreadCount = this.notifications.filter(n => !n.sudah_dibaca).length;
    
    // Update badge count
    const badge = document.querySelector('.notification-badge');
    if (badge) {
      badge.textContent = unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : '';
      badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    // Update unread count text
    const countText = document.querySelector('.notification-unread-count');
    if (countText) {
      countText.textContent = unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca';
    }

    // Render notification items
    const listContainer = document.querySelector('.notification-list');
    if (!listContainer) return;

    if (this.notifications.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 32px 16px; color: var(--color-text-muted);">
          <span data-icon="BellOff" data-icon-size="32"></span>
          <div style="margin-top: 8px; font-size: 13px;">Belum ada notifikasi</div>
        </div>
      `;
    } else {
      listContainer.innerHTML = this.notifications.slice(0, 10).map(n => {
        const timeAgo = this.timeAgo(n.dibuat_pada);
        const iconName = this.getNotifIcon(n.judul);
        const unreadClass = n.sudah_dibaca ? '' : 'unread';
        return `
          <div class="notification-item ${unreadClass}" onclick="NotificationService.markAsRead('${n.id}')">
            <div class="notification-icon"><span data-icon="${iconName}" data-icon-size="16"></span></div>
            <div class="notification-content">
              <div class="notification-text">${n.judul}</div>
              <div class="notification-detail">${n.pesan}</div>
              <div class="notification-time">${timeAgo}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Re-render Lucide icons
    if (window.lucide) window.lucide.createIcons({ nodes: [listContainer] });
  },

  getNotifIcon(judul) {
    const j = (judul || '').toLowerCase();
    if (j.includes('diajukan')) return 'Send';
    if (j.includes('disetujui') || j.includes('final')) return 'CircleCheck';
    if (j.includes('revisi') || j.includes('ditolak')) return 'AlertTriangle';
    if (j.includes('sertifikat') || j.includes('unggah')) return 'Upload';
    return 'Bell';
  },

  timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const d = new Date(dateStr);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }
};

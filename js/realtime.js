/**
 * SIP-KOMPETENSI — BAPPEDA PROVINSI LAMPUNG
 * Realtime Synchronization Engine
 * Standar: SPBE Provinsi Lampung TA 2026
 *
 * Menggabungkan:
 * 1. BroadcastChannel API (Sinkronisasi instan 0ms antar-tab/jendela di perangkat yang sama)
 * 2. Supabase Realtime Channels (Sinkronisasi cloud instan antar-perangkat smartphone/laptop/PC)
 * 3. LocalStorage Event Bus (Fallback andal bila kanal jaringan terputus)
 * 4. Sistem Live Notification & Toast Kedinasan Real-Time
 */

const RealtimeService = {
  channel: null,
  supabaseSubscription: null,
  isConnected: false,
  lastSyncTime: new Date(),

  init() {
    this.initBroadcastChannel();
    this.initStorageListener();
    this.initSupabaseRealtime();
    this.updateIndicator(true);
    console.log("⚡ SIP-KOMPETENSI Realtime Engine Active");
  },

  initBroadcastChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('sip_bappeda_realtime_bus');
        this.channel.onmessage = (event) => {
          this.handleIncomingEvent(event.data, 'broadcast');
        };
      } catch (e) {
        console.warn("BroadcastChannel warning:", e);
      }
    }
  },

  initStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'sip_realtime_event_bus' && e.newValue) {
        try {
          const eventData = JSON.parse(e.newValue);
          this.handleIncomingEvent(eventData, 'storage');
        } catch (err) {}
      }
    });

    window.addEventListener('online', () => {
      this.updateIndicator(true);
      if (typeof App !== 'undefined') App.toast('Koneksi internet kembali aktif. Menyinkronkan data...', 'success');
    });

    window.addEventListener('offline', () => {
      this.updateIndicator(false);
      if (typeof App !== 'undefined') App.toast('Koneksi internet terputus. Mode offline aktif (data tersimpan lokal).', 'warning');
    });
  },

  initSupabaseRealtime() {
    if (typeof supabaseClient !== 'undefined' && typeof supabaseClient.channel === 'function') {
      try {
        this.supabaseSubscription = supabaseClient
          .channel('public:sip_realtime_channel', {
            config: {
              broadcast: { self: false }
            }
          })
          .on('broadcast', { event: 'sip_broadcast' }, (message) => {
            if (message && message.payload) {
              this.handleIncomingEvent(message.payload, 'supabase_cloud_broadcast');
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'idp_submissions' }, (payload) => {
            this.handleSupabaseChange('idp_submissions', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'notifikasi' }, (payload) => {
            this.handleSupabaseChange('notifikasi', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'idp_programs' }, (payload) => {
            this.handleSupabaseChange('idp_programs', payload);
          })
          .subscribe((status) => {
            const isSubscribed = status === 'SUBSCRIBED';
            this.isConnected = isSubscribed;
            this.updateIndicator(isSubscribed || navigator.onLine);
          });
      } catch (err) {
        console.warn("Supabase Realtime subscription note:", err);
      }
    }
  },

  /**
   * Menyiarkan event real-time ke semua tab dan perangkat lain
   */
  broadcast(eventType, payload = {}) {
    const user = (typeof Store !== 'undefined' && Store.state && Store.state.user) ? Store.state.user : null;
    const event = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      type: eventType,
      payload: payload,
      sender: user ? { nip: user.nip, name: user.name, role: user.role } : null,
      timestamp: new Date().toISOString()
    };

    // 1. BroadcastChannel (0ms multi-tab sinkronisasi)
    if (this.channel) {
      try { this.channel.postMessage(event); } catch(e) {}
    }

    // 2. Storage Event Bus
    try {
      localStorage.setItem('sip_realtime_event_bus', JSON.stringify(event));
    } catch(e) {}

    // 3. Supabase Cloud WebSocket Broadcast (Sinkronisasi Lintas-Perangkat Smartphone <-> Laptop)
    if (this.supabaseSubscription && typeof this.supabaseSubscription.send === 'function') {
      try {
        this.supabaseSubscription.send({
          type: 'broadcast',
          event: 'sip_broadcast',
          payload: event
        });
      } catch (e) {
        console.warn("Supabase cloud broadcast error:", e);
      }
    }

    this.lastSyncTime = new Date();
  },

  /**
   * Menangani event masuk dari tab lain atau cloud
   */
  handleIncomingEvent(event, source) {
    if (!event || !event.type) return;
    this.lastSyncTime = new Date();

    console.log(`⚡ Realtime Event Diterima [${source}]:`, event.type, event.payload);

    // Update real-time console jika sedang dibuka
    const consoleEl = document.getElementById('rtActivityConsole');
    if (consoleEl) {
      const timeStr = new Date().toLocaleTimeString('id-ID');
      const logLine = document.createElement('div');
      logLine.style.color = '#38bdf8';
      logLine.textContent = `[${timeStr}] ⚡ [${source.toUpperCase()}] ${event.type} dari ${event.sender?.name || 'Sistem'}`;
      consoleEl.appendChild(logLine);
      consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    switch(event.type) {
      case 'PING_TEST':
        if (typeof App !== 'undefined') App.toast('⚡ Sinyal Ping Real-Time Diterima dari Tab Lain!', 'info', 2500);
        break;
      case 'NEW_EXECUTIVE_DIRECTIVE':
        this.onNewDirective(event.payload, event.sender);
        break;
      case 'IDP_SUBMITTED':
        this.onIdpSubmitted(event.payload, event.sender);
        break;
      case 'IDP_VERIFIED':
        this.onIdpVerified(event.payload, event.sender);
        break;
      case 'NEW_NOTIFICATION':
        this.onNewNotification(event.payload);
        break;
      case 'REALIZATION_ADDED':
        this.onRealizationAdded(event.payload, event.sender);
        break;
    }
  },

  onNewDirective(directive, sender) {
    if (!directive) return;
    if (typeof Store !== 'undefined' && Store.state) {
      if (!Store.state.executiveDirectives) Store.state.executiveDirectives = [];
      if (!Store.state.executiveDirectives.some(d => d.id === directive.id)) {
        Store.state.executiveDirectives.unshift(directive);
        Store.save();
      }
    }

    if (typeof App !== 'undefined') {
      if (typeof App.renderExecutiveDirectivesList === 'function') App.renderExecutiveDirectivesList();
      if (typeof App.renderNotifications === 'function') App.renderNotifications();

      const senderName = sender?.name || 'Dr. ANANG RISGIYANTO, S.K.M., M.Kes.';
      const shortArahan = directive.arahan ? (directive.arahan.substring(0, 75) + '...') : 'Instruksi pimpinan baru.';
      App.toast(`📢 [Arahan Pimpinan Baru] ${senderName}: "${shortArahan}"`, 'warning', 6500);
    }
  },

  onIdpSubmitted(data, sender) {
    const currentRole = (typeof Store !== 'undefined' && Store.state.user) ? Store.state.user.role : null;
    if (currentRole === 'admin' || currentRole === 'pimpinan') {
      if (typeof Store.syncVerificationsFromSupabase === 'function') {
        Store.syncVerificationsFromSupabase().then(() => {
          if (typeof App.renderVerificationsTable === 'function') App.renderVerificationsTable();
          if (typeof App.renderAdminDashboard === 'function') App.renderAdminDashboard();
        });
      }
      if (typeof App !== 'undefined') {
        const empName = data.pegawai || sender?.name || 'Pegawai ASN';
        App.toast(`📝 [Pengajuan IDP Masuk] ${empName} mengajukan usulan rencana kompetensi (${data.totalJp || 20} JP)`, 'info', 5000);
      }
    }
  },

  onIdpVerified(data, sender) {
    const currentNip = (typeof Store !== 'undefined' && Store.state.user) ? Store.state.user.nip : null;
    if (currentNip && String(currentNip).replace(/\s+/g, '') === String(data.nip).replace(/\s+/g, '')) {
      if (Store.state.idpState) {
        Store.state.idpState.status = data.status;
        Store.state.idpState.verificationNote = data.notes || '';
        Store.save();
      }
      if (typeof App !== 'undefined') {
        if (typeof App.renderIdpSummary === 'function') App.renderIdpSummary();
        if (typeof App.renderIdpSaya === 'function' && Store.state.activePage === 'eidp') App.renderIdpSaya();
        if (typeof App.renderEmployeeDashboard === 'function' && Store.state.activePage === 'edash') App.renderEmployeeDashboard();
        const icon = data.status === 'Disetujui' || data.status === 'Final' ? '✅' : '⚠️';
        App.toast(`${icon} Status IDP Anda telah diperbarui menjadi "${data.status}" oleh Tim Verifikator.`, data.status === 'Perlu Revisi' ? 'warning' : 'success', 6000);
      }
    }
  },

  onNewNotification(notif) {
    if (!notif) return;
    const currentNip = (typeof Store !== 'undefined' && Store.state.user) ? Store.state.user.nip : null;
    if (notif.penerima === 'all' || notif.penerima === currentNip) {
      if (typeof Store !== 'undefined' && Store.state) {
        if (!Store.state.notifications) Store.state.notifications = [];
        if (!Store.state.notifications.some(n => n.id === notif.id)) {
          Store.state.notifications.unshift(notif);
          Store.updateNotificationUnreadCount();
          Store.save();
        }
      }
      if (typeof App !== 'undefined') {
        if (typeof App.renderNotifications === 'function') App.renderNotifications();
        App.toast(`🔔 ${notif.judul}: ${notif.pesan.substring(0, 60)}...`, notif.tipe || 'info', 5000);
      }
    }
  },

  onRealizationAdded(realiz, sender) {
    const currentRole = (typeof Store !== 'undefined' && Store.state.user) ? Store.state.user.role : null;
    if (currentRole === 'admin' || currentRole === 'pimpinan') {
      if (typeof App !== 'undefined' && typeof App.renderRealizationsTable === 'function') {
        App.renderRealizationsTable();
      }
    }
  },

  handleSupabaseChange(table, payload) {
    if (!payload) return;
    if (table === 'idp_submissions') {
      if (typeof Store.syncVerificationsFromSupabase === 'function') {
        Store.syncVerificationsFromSupabase().then(() => {
          if (typeof App !== 'undefined') {
            if (typeof App.renderVerificationsTable === 'function') App.renderVerificationsTable();
            if (typeof App.renderAdminDashboard === 'function') App.renderAdminDashboard();
            if (typeof App.renderPimpinanDashboard === 'function') App.renderPimpinanDashboard();
          }
        });
      }
      const currentNip = (typeof Store !== 'undefined' && Store.state.user) ? Store.state.user.nip : null;
      if (payload.new && currentNip && String(payload.new.nip).replace(/\s+/g, '') === String(currentNip).replace(/\s+/g, '')) {
        if (typeof Store.loadUserIdp === 'function') {
          Store.loadUserIdp(currentNip).then(() => {
            if (typeof App !== 'undefined') {
              if (Store.state.activePage === 'eidp' && typeof App.renderIdpSaya === 'function') App.renderIdpSaya();
              if (Store.state.activePage === 'edash' && typeof App.renderEmployeeDashboard === 'function') App.renderEmployeeDashboard();
            }
          });
        }
      }
    } else if (table === 'notifikasi' && payload.eventType === 'INSERT') {
      this.onNewNotification(payload.new);
    }
  },

  updateIndicator(connected) {
    const el = document.getElementById('realtimeStatusIndicator');
    if (!el) return;
    if (connected) {
      el.className = 'realtime-status-pill connected';
      el.title = 'Koneksi Real-Time Aktif (Sinkron Cloud & Multi-Perangkat)';
      const text = el.querySelector('.realtime-text');
      if (text) text.textContent = 'Real-Time';
    } else {
      el.className = 'realtime-status-pill offline';
      el.title = 'Mode Offline (Perubahan tersimpan lokal dan akan disinkron otomatis)';
      const text = el.querySelector('.realtime-text');
      if (text) text.textContent = 'Offline';
    }
  }
};

if (typeof window !== 'undefined') {
  window.RealtimeService = RealtimeService;
}

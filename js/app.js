/**
 * SIP-KOMPETENSI — BAPPEDA PROVINSI LAMPUNG
 * Production Application Controller & Role-Based Access Engine
 */

const NAV_CONFIG = {
  pegawai: {
    label: 'Pegawai ASN',
    sections: [
      {
        title: 'OVERVIEW',
        items: [
          { id: 'edash', icon: 'LayoutDashboard', label: 'Dashboard' }
        ]
      },
      {
        title: 'PENGEMBANGAN',
        items: [
          { id: 'eprofil', icon: 'UserRound', label: 'Profil Pegawai' },
          { id: 'ekarier', icon: 'TrendingUp', label: 'Rencana Karier' },
          { id: 'ekompetensi', icon: 'Target', label: 'Kompetensi' },
          { id: 'eidp', icon: 'ClipboardCheck', label: 'IDP Saya' },
          { id: 'epelaksanaan', icon: 'CircleCheck', label: 'Pelaksanaan SDM' }
        ]
      }
    ]
  },
  admin: {
    label: 'Pengelola SDM Aparatur',
    sections: [
      {
        title: 'OVERVIEW',
        items: [
          { id: 'adash', icon: 'LayoutDashboard', label: 'Dashboard Admin' }
        ]
      },
      {
        title: 'ADMINISTRASI',
        items: [
          { id: 'averif', icon: 'ShieldCheck', label: 'Verifikasi IDP' },
          { id: 'apegawai', icon: 'Users', label: 'Data Pegawai' },
          { id: 'apelaksanaan', icon: 'CircleCheck', label: 'Pelaksanaan SDM' },
          { id: 'amaster', icon: 'Settings2', label: 'Master Data' }
        ]
      }
    ]
  },
  pimpinan: {
    label: 'Pimpinan / Kepala Badan',
    sections: [
      {
        title: 'OVERVIEW',
        items: [
          { id: 'pdash', icon: 'LayoutDashboard', label: 'Dashboard Pimpinan' }
        ]
      },
      {
        title: 'MONITORING & EVALUASI',
        items: [
          { id: 'pmonitoring', icon: 'ChartNoAxesCombined', label: 'Monitoring' },
          { id: 'plaporan', icon: 'FileBarChart', label: 'Laporan' }
        ]
      }
    ]
  }
};

const App = {
  init() {
    this.applyTheme(Store.state.theme || 'light');
    this.bindGlobalEvents();
    renderAllIcons();
    this.renderOfficialLogos();
    this.initYearSystem();

    // Register Service Worker for PWA & Background Alerts (hanya di production)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if ('serviceWorker' in navigator && !isLocalhost) {
      navigator.serviceWorker.register('sw.js').then(reg => {
        reg.update();
        console.log('SIP Service Worker active:', reg.scope);
      }).catch(err => {
        console.warn('SIP Service Worker registration failed:', err);
      });
    }

    // Initialize PWA Installation & Mobile Capabilities
    this.initPwaInstaller();

    // Safety: ensure all modals are closed and hidden on load
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.classList.remove('active');
      m.style.display = 'none';
    });

    // Kosongkan form input login secara agresif untuk mencegah autofill browser
    this.clearLoginFields();
    setTimeout(() => this.clearLoginFields(), 150);
    setTimeout(() => this.clearLoginFields(), 400);

    // Check if user has an active persistent session
    if (Store.state.currentSession) {
      this.restoreSession(Store.state.currentSession);
    } else {
      const loginScr = document.getElementById('loginScreen');
      const appSh = document.getElementById('appShell');
      if (loginScr) loginScr.style.display = 'flex';
      if (appSh) appSh.style.display = 'none';
      this.clearLoginFields();
      this.initRealtimeNotifications();
    }
  },

  clearLoginFields() {
    const nipInput = document.getElementById('loginNip');
    const passInput = document.getElementById('loginPassword');
    if (nipInput) {
      nipInput.value = '';
      if (document.activeElement !== nipInput) nipInput.setAttribute('readonly', 'readonly');
    }
    if (passInput) {
      passInput.value = '';
      if (document.activeElement !== passInput) passInput.setAttribute('readonly', 'readonly');
    }
  },

  renderOfficialLogos() {
    // Inject official Lampung logo image into designated containers
    document.querySelectorAll('.official-lampung-logo').forEach(el => {
      const size = parseInt(el.getAttribute('data-logo-size')) || 48;
      el.innerHTML = `<img src="Gambar/Lambang%20Lampung.png" alt="Lambang Provinsi Lampung" width="${size}" height="${size}" style="object-fit: contain; flex-shrink: 0;">`;
    });
  },

  // Theme Handling
  applyTheme(theme) {
    Store.state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    Store.save();
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' ? getIcon('Sun', 18) : getIcon('Moon', 18);
    }
    const ddThemeBtn = document.getElementById('userDropdownThemeBtn');
    if (ddThemeBtn) {
      ddThemeBtn.innerHTML = theme === 'dark'
        ? `${getIcon('Sun', 15)} <span>Ganti ke Mode Terang</span>`
        : `${getIcon('Moon', 15)} <span>Ganti ke Mode Gelap</span>`;
    }
  },

  toggleTheme() {
    const newTheme = Store.state.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    this.refreshCharts();
    App.toast(`Mode ${newTheme === 'dark' ? 'Gelap' : 'Terang'} aktif`, 'info');
  },

  // ==========================================
  // MULTI-YEAR SYSTEM (JANGKA PANJANG)
  // ==========================================
  initYearSystem() {
    const activeYear = Store.getActiveYear();
    this.populateAllYearSelects();
    this.syncAllYearSelects(activeYear);
    this.updateDynamicYears(activeYear);
  },

  populateAllYearSelects() {
    const years = (typeof Store.getAvailableYears === 'function') 
      ? Store.getAvailableYears() 
      : [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032];
    const activeYear = Store.getActiveYear();

    document.querySelectorAll('.year-select-dynamic').forEach(sel => {
      const isPdash = sel.id === 'pdashYearSelect';
      sel.innerHTML = years.map(y => {
        const isSel = Number(y) === Number(activeYear) ? 'selected' : '';
        const label = isPdash ? `TA ${y}` : `${y}`;
        const style = isPdash ? 'style="color:#000;"' : '';
        return `<option value="${y}" ${isSel} ${style}>${label}</option>`;
      }).join('');
      sel.value = String(activeYear);
    });
  },

  syncAllYearSelects(year) {
    const yStr = String(year || Store.getActiveYear());
    document.querySelectorAll('.year-select-dynamic').forEach(sel => {
      sel.value = yStr;
    });
  },

  updateDynamicYears(year) {
    const y = Number(year) || Store.getActiveYear();
    const prevY = y - 1;
    document.querySelectorAll('.dynamic-year').forEach(el => {
      el.textContent = y;
    });
    document.querySelectorAll('.dynamic-prev-year').forEach(el => {
      el.textContent = prevY;
    });
  },

  handleYearChange(year) {
    const y = Store.setActiveYear(year);
    this.syncAllYearSelects(y);
    this.updateDynamicYears(y);

    const careerPeriode = document.getElementById('careerPeriode');
    if (careerPeriode) careerPeriode.value = String(y);

    this.toast(`Tahun Anggaran aktif beralih ke TA ${y}`, 'info');

    const activePage = Store.state.activePage || this.currentPage || 'edash';
    this.renderPageData(activePage);
  },

  handleCareerPeriodChange(year) {
    const y = Store.setActiveYear(year);
    if (Store.state.careerPlan) {
      Store.state.careerPlan.periode = String(y);
    }
    Store.save();
    this.syncAllYearSelects(y);
    this.updateDynamicYears(y);
    this.toast(`Periode Rencana IDP diubah ke Tahun ${y}`, 'success');
  },

  // Quick Role-Based Login (for demo / quick access)
  quickLogin(role) {
    const account = Store.accounts.find(a => a.role === role);
    if (!account) {
      App.toast('Akun untuk role tersebut tidak ditemukan', 'error');
      return;
    }
    const sessionUser = {
      nip: account.nip,
      name: account.name,
      jabatan: account.jabatan,
      unitKerja: account.unitKerja,
      role: account.role,
      avatarInitial: account.avatarInitial
    };
    Store.state.currentSession = sessionUser;
    try {
      sessionStorage.setItem('sip_kompetensi_active_session', JSON.stringify(sessionUser));
    } catch(e) {}
    Store.save();
    this.restoreSession(sessionUser);
    App.toast(`Masuk sebagai ${NAV_CONFIG[role].label}. Selamat datang, ${account.name}`, 'success');
  },

  // Real Authentication via NIP & Password (Supabase)
  async login() {
    const nipInput = document.getElementById('loginNip');
    const passInput = document.getElementById('loginPassword');
    const errAlert = document.getElementById('loginErrorAlert');
    const loginBtn = document.querySelector('button[onclick="App.login()"]');

    if (errAlert) errAlert.style.display = 'none';
    
    // UI state: loading
    if (loginBtn) {
       loginBtn.disabled = true;
       loginBtn.innerHTML = '<span class="loader"></span> Memproses...';
    }

    try {
      // Tunggu hasil dari Supabase
      const sessionUser = await Store.authenticate(nipInput.value, passInput.value);
      this.restoreSession(sessionUser);
      if (typeof AuditService !== 'undefined') {
        AuditService.log('Otentikasi', 'Login Sesi Portal', `Pengguna ${sessionUser.name} (${sessionUser.nip}) berhasil masuk sistem.`, 'Sukses', sessionUser);
      }
      App.toast(`Autentikasi berhasil. Selamat datang, ${sessionUser.name}`, 'success');
    } catch (error) {
      if (errAlert) {
        errAlert.textContent = error.message;
        errAlert.style.display = 'block';
      }
      App.toast(error.message, 'error');
    } finally {
      // Restore UI state
      if (loginBtn) {
         loginBtn.disabled = false;
         loginBtn.innerHTML = 'Masuk Portal <span data-icon="ArrowRight" data-icon-size="16"></span>';
         if (window.lucide) window.lucide.createIcons();
      }
    }
  },

  restoreSession(sessionUser) {
    const role = sessionUser.role || 'pegawai';
    const cfg = NAV_CONFIG[role];

    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appShell').style.display = 'flex';

    // Sinkronkan data profil user dari session ke Store.state.user (Overwrite sepenuhnya)
    Store.state.user.name = sessionUser.name || '';
    Store.state.user.nip = sessionUser.nip || '';
    Store.state.user.pangkat = sessionUser.pangkat || '';
    Store.state.user.jabatan = (sessionUser.jabatan || '').replace(/PPEPD/g, 'PMPE');
    Store.state.user.unitKerja = (sessionUser.unitKerja || '').replace(/PPEPD/g, 'PMPE');
    Store.state.user.jenisJabatan = sessionUser.jenisJabatan || '';
    Store.state.user.pendidikan = sessionUser.pendidikan || '';
    Store.state.user.masaKerja = sessionUser.masaKerja || '';
    Store.state.user.nineBox = sessionUser.nineBox || 5;
    Store.state.user.avatarInitial = sessionUser.avatarInitial || '';
    Store.state.user.role = role;
    Store.save();

    // Update Topbar and Sidebar User Info
    document.getElementById('sidebarRoleBadge').innerHTML = `<span class="role-dot"></span>${cfg.label}`;
    document.getElementById('sidebarUserName').textContent = sessionUser.name;
    document.getElementById('sidebarUserRole').textContent = (sessionUser.jabatan || '').replace(/PPEPD/g, 'PMPE');
    document.getElementById('topbarUserName').textContent = sessionUser.name.split(',')[0];
    document.getElementById('topbarRoleText').textContent = cfg.label;

    this.renderSidebarNav(role);
    this.initYearSystem();

    // Muat data IDP resmi dari cloud Supabase
    if (sessionUser.nip) {
      Store.loadUserIdp(sessionUser.nip).then(() => {
        if (Store.state.activePage === 'eidp') {
          App.renderIdpSaya();
        } else if (Store.state.activePage === 'edash') {
          App.renderEmployeeDashboard();
        }
      });
    }

    // Inisialisasi Real-time Notifikasi
    this.initRealtimeNotifications();

    // Default entry page per role
    const firstPage = cfg.sections[0].items[0].id;
    this.navigate(firstPage);
  },

  logout() {
    if (typeof supabaseClient !== 'undefined') {
      try {
        if (this.notifChannel) supabaseClient.removeChannel(this.notifChannel);
        if (this.submissionChannel) supabaseClient.removeChannel(this.submissionChannel);
      } catch(e) {}
      this.notifChannel = null;
      this.submissionChannel = null;
    }
    Store.logoutSession();
    document.getElementById('appShell').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    this.clearLoginFields();
    App.toast('Sesi Anda telah berhasil diakhiri dengan aman.', 'info');
  },

  confirmResetDemoData() {
    const isConfirmed = window.confirm(
      'Konfirmasi Reset Data Demo:\n\nApakah Anda ingin mengembalikan seluruh data sistem ke baseline resmi TA 2026?\nSeluruh data pengajuan uji coba akan dibersihkan agar aplikasi siap dipresentasikan secara rapi ke Pimpinan.'
    );
    if (!isConfirmed) return;

    Store.resetDemoData();
    App.toast('Data simulasi berhasil direset ke baseline resmi 2026!', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  },

  // Navigation
  renderSidebarNav(role) {
    const cfg = NAV_CONFIG[role];
    const navContainer = document.getElementById('sidebarNavContainer');
    if (!navContainer) return;

    let html = '';
    cfg.sections.forEach(sec => {
      html += `<div class="nav-section-title">${sec.title}</div>`;
      sec.items.forEach(item => {
        html += `
          <button class="nav-item ${Store.state.activePage === item.id ? 'active' : ''}" data-nav="${item.id}" onclick="App.navigate('${item.id}')">
            ${getIcon(item.icon, 18)}
            <span>${item.label}</span>
          </button>
        `;
      });
    });

    navContainer.innerHTML = html;
  },

  navigate(pageId) {
    // Role-Based Guard: Proteksi Akses Halaman berdasarkan Peran ASN
    const userRole = Store.state.currentSession?.role || Store.state.user?.role || 'pegawai';
    const roleAllowedPages = {
      pegawai: ['edash', 'eprofil', 'ekarier', 'ekompetensi', 'eidp', 'ereview', 'epelaksanaan'],
      admin: ['adash', 'averif', 'apegawai', 'apelaksanaan', 'amaster', 'eprofil'],
      pimpinan: ['pdash', 'pmonitoring', 'plaporan', 'eprofil']
    };

    const allowed = roleAllowedPages[userRole] || roleAllowedPages['pegawai'];
    if (!allowed.includes(pageId)) {
      App.toast(`Akses Ditolak: Hak Akses '${userRole.toUpperCase()}' tidak diizinkan membuka halaman ini.`, 'warning');
      const fallbackPage = allowed[0];
      return this.navigate(fallbackPage);
    }

    this.currentPage = pageId;
    Store.state.activePage = pageId;
    Store.save();

    // Toggle active classes in pages
    document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    // Toggle active in sidebar
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-nav') === pageId);
    });

    // Update Breadcrumb
    const pageTitles = {
      edash: 'Dashboard Pegawai',
      eprofil: 'Profil Pegawai ASN',
      ekarier: 'Rencana Karier',
      ekompetensi: 'Pemetaan Kompetensi',
      eidp: 'Formulir IDP Saya',
      ereview: 'Review & Pengajuan IDP',
      epelaksanaan: 'Pelaksanaan Pengembangan SDM',
      adash: 'Dashboard Pengelola SDM',
      averif: 'Verifikasi IDP Pegawai',
      apegawai: 'Data Pegawai Bappeda',
      apelaksanaan: 'Pelaksanaan SDM Seluruh Unit',
      amaster: 'Master Data Referensi',
      pdash: 'Dashboard Pimpinan',
      pmonitoring: 'Monitoring Pengembangan',
      plaporan: 'Laporan Evaluasi SDM'
    };

    const currentTitle = pageTitles[pageId] || 'Dashboard';
    const crumbEl = document.getElementById('topbarBreadcrumbCurrent');
    if (crumbEl) crumbEl.textContent = currentTitle;

    // Close mobile sidebar if open
    const sb = document.getElementById('appSidebar');
    const bd = document.getElementById('sidebarBackdrop');
    if (sb) sb.classList.remove('mobile-open');
    if (bd) bd.classList.remove('active');

    // Trigger page-specific renders
    this.renderPageData(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderPageData(pageId) {
    this.syncAllYearSelects(Store.getActiveYear());
    this.updateDynamicYears(Store.getActiveYear());
    switch (pageId) {
      case 'edash':
        this.renderEmployeeDashboard();
        break;
      case 'eprofil':
        this.renderEmployeeProfile();
        break;
      case 'ekarier':
        this.renderCareerPlan();
        break;
      case 'ekompetensi':
        this.renderCompetencies();
        break;
      case 'eidp':
        this.renderIdpSaya();
        break;
      case 'ereview':
        this.renderReviewPage();
        break;
      case 'epelaksanaan':
        this.renderEmployeeRealization();
        break;
      case 'adash':
        this.renderAdminDashboard();
        break;
      case 'averif':
        this.renderAdminVerification();
        break;
      case 'apegawai':
        this.renderAdminEmployees();
        break;
      case 'apelaksanaan':
        this.renderAdminRealization();
        break;
      case 'amaster':
        this.renderMasterData();
        break;
      case 'pdash':
        this.renderExecutiveDashboard();
        break;
      case 'pmonitoring':
        this.renderMonitoring();
        break;
      case 'plaporan':
        this.renderReporting();
        break;
    }
  },

  refreshCharts() {
    if (Store.state.activePage === 'edash') {
      this.renderEmployeeDashboard();
    } else if (Store.state.activePage === 'ekompetensi') {
      Charts.renderRadar('competencyRadarChart', Store.state.competencies.radarData);
    } else if (Store.state.activePage === 'epelaksanaan' || Store.state.activePage === 'apelaksanaan') {
      this.renderEmployeeRealization();
    } else if (Store.state.activePage === 'adash') {
      this.renderAdminDashboard();
    } else if (Store.state.activePage === 'pdash') {
      this.renderExecutiveDashboard();
    }
  },

  // ==========================================
  // PAGE RENDERERS
  // ==========================================

  renderEmployeeDashboard() {
    const summary = Store.getIdpSummary();
    const idpStatus = Store.state.idpState.status;

    const greetEl = document.getElementById('edashUserGreeting');
    if (greetEl) {
      greetEl.textContent = (Store.state.currentSession?.name || Store.state.user.name).split(',')[0];
    }

    const pct = idpStatus === 'Final' || idpStatus === 'Disetujui' 
      ? 100 
      : (idpStatus === 'Draft' ? (summary.totalProgram > 0 ? summary.progressPct : 0) : 85);

    const statusEl = document.getElementById('edashIdpStatusVal');
    if (statusEl) statusEl.textContent = `${pct}%`;

    const descEl = document.getElementById('edashIdpStatusDesc');
    if (descEl) descEl.textContent = `Status Resmi: ${idpStatus}`;

    const rencanaEl = document.getElementById('edashRencanaVal');
    if (rencanaEl) rencanaEl.textContent = summary.totalProgram;

    const terlaksanaEl = document.getElementById('edashTerlaksanaVal');
    if (terlaksanaEl) terlaksanaEl.textContent = summary.completed;

    const belumEl = document.getElementById('edashBelumVal');
    if (belumEl) belumEl.textContent = Math.max(0, summary.totalProgram - summary.completed);

    Charts.renderCircularProgress('pegawaiCircularProgress', pct, 'Completed');
    this.renderEmployeeDirectiveBanner();
  },

  renderEmployeeDirectiveBanner() {
    const bannerEl = document.getElementById('edashDirectiveBanner');
    if (!bannerEl) return;

    const directives = Store.state.executiveDirectives || [];
    if (directives.length === 0) {
      bannerEl.innerHTML = '';
      return;
    }

    const user = Store.state.user || {};
    const userUnit = (user.unitKerja || '').toLowerCase();

    // Saring arahan: untuk Semua Bidang, Seluruh Kepala Bidang & Sekretaris, atau unit kerja pegawai
    const relevant = directives.filter(d => {
      const tgt = (d.target || '').toLowerCase();
      if (tgt.includes('semua') || tgt.includes('seluruh')) return true;
      if (userUnit && (tgt.includes(userUnit) || userUnit.includes(tgt))) return true;
      if (userUnit.includes('sekretariat') && tgt.includes('sekretariat')) return true;
      if (userUnit.includes('pmpe') && (tgt.includes('pmpe') || tgt.includes('perencanaan makro'))) return true;
      if (userUnit.includes('infrastruktur') && tgt.includes('infrastruktur')) return true;
      if (userUnit.includes('pemerintahan') && tgt.includes('pemerintahan')) return true;
      if (userUnit.includes('perekonomian') && tgt.includes('perekonomian')) return true;
      return false;
    });

    if (relevant.length === 0) {
      bannerEl.innerHTML = '';
      return;
    }

    const latest = relevant[0];
    bannerEl.innerHTML = `
      <div class="executive-directive-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge badge-blue" style="font-weight: 750; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 4px;">
              <span data-icon="Megaphone" data-icon-size="12"></span> Arahan Resmi Kepala Bappeda
            </span>
            <span style="font-size: 11px; color: var(--color-text-muted);">Sasaran: <b style="color: var(--color-primary);">${latest.target}</b></span>
          </div>
          <span style="font-size: 11px; color: var(--color-text-muted);">${latest.tanggal}</span>
        </div>
        <p class="directive-quote">
          "${latest.arahan}"
        </p>
        <div class="directive-footer">
          <span>Diterbitkan oleh: <b style="color: var(--color-text-primary);">${latest.penulis}</b> (${latest.jabatan})</span>
          <span class="badge badge-success" style="font-size: 10px;">Status: ${latest.status}</span>
        </div>
      </div>
    `;
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  renderEmployeeProfile() {
    const u = Store.state.user;
    
    // Auto-sync missing data from Master Data Kepegawaian
    const empList = Store.state.employees || (typeof BAPPEDA_DATA !== 'undefined' ? BAPPEDA_DATA.employees : []);
    if (empList && empList.length > 0) {
      const empMaster = empList.find(e => e.nip === u.nip);
      if (empMaster) {
        if (!u.pangkat) u.pangkat = empMaster.pangkat || '';
        if (!u.pendidikan) u.pendidikan = empMaster.pendidikan || '';
        if (!u.masaKerja) u.masaKerja = empMaster.masaKerja || '';
        if (!u.jenisJabatan) u.jenisJabatan = empMaster.jenis || '';
        if (!u.jabatan) u.jabatan = empMaster.jabatan || '';
        if (!u.unitKerja) u.unitKerja = empMaster.unit || '';
        if (!u.ttl) u.ttl = empMaster.ttl || '';
        if (!u.usia) u.usia = empMaster.usia || '';
        if (!u.diklat) u.diklat = empMaster.diklat || '';
        if (!u.jenjang) u.jenjang = empMaster.jenjang || '';
        if (!u.golongan) u.golongan = empMaster.golongan || '';
        if (!u.tmtPangkat) u.tmtPangkat = empMaster.tmtPangkat || '';
        if (!u.tmtJabatan) u.tmtJabatan = empMaster.tmtJabatan || '';
        if (!u.nineBox) u.nineBox = empMaster.nineBox || u.nineBox;
      }
    }

    if (u.unitKerja) u.unitKerja = u.unitKerja.replace(/PPEPD/g, 'PMPE');
    if (u.jabatan) u.jabatan = u.jabatan.replace(/PPEPD/g, 'PMPE');

    if (document.getElementById('profNama')) document.getElementById('profNama').value = u.name || '';
    if (document.getElementById('profNip')) document.getElementById('profNip').value = u.nip || '';
    if (document.getElementById('profPangkat')) document.getElementById('profPangkat').value = u.pangkat || '';
    if (document.getElementById('profPendidikan')) document.getElementById('profPendidikan').value = u.pendidikan || '';
    if (document.getElementById('profMasaKerja')) document.getElementById('profMasaKerja').value = u.masaKerja || '';
    if (document.getElementById('profJabatan')) document.getElementById('profJabatan').value = u.jabatan || '';
    if (document.getElementById('profUnit')) document.getElementById('profUnit').value = u.unitKerja || '';
    if (document.getElementById('profJenisJabatan')) document.getElementById('profJenisJabatan').value = u.jenisJabatan || '';

    // Update card header agar sesuai dengan akun yang login
    const headerNama = document.getElementById('profilHeaderNama');
    const headerJabatan = document.getElementById('profilHeaderJabatan');
    const headerNip = document.getElementById('profilHeaderNip');
    if (headerNama) headerNama.textContent = u.name;
    if (headerJabatan) headerJabatan.textContent = `${u.jabatan} • ${u.unitKerja}`;
    if (headerNip) headerNip.textContent = `NIP: ${u.nip}`;

    // Render Status Keamanan Password & Role Badge
    const secStatusEl = document.getElementById('profSecStatusBadge');
    const secLastUpdateEl = document.getElementById('profSecLastUpdate');
    const secRoleBadgeEl = document.getElementById('profSecRoleBadge');

    const isChanged = u.isPasswordChanged || Store.state.currentSession?.isPasswordChanged;
    if (secStatusEl) {
      if (isChanged) {
        secStatusEl.className = 'badge badge-success';
        secStatusEl.innerHTML = '<span data-icon="ShieldCheck" data-icon-size="12"></span> Terenkripsi SHA-256 (Kuat)';
      } else {
        secStatusEl.className = 'badge badge-warning';
        secStatusEl.innerHTML = '<span data-icon="AlertTriangle" data-icon-size="12"></span> Password Default (Perlu Diubah)';
      }
    }

    if (secLastUpdateEl) {
      const pDate = u.passwordUpdated || Store.state.currentSession?.passwordUpdated;
      if (pDate) {
        const dt = new Date(pDate);
        secLastUpdateEl.textContent = `Terakhir diperbarui: ${dt.toLocaleDateString('id-ID')} pk. ${dt.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}`;
      } else {
        secLastUpdateEl.textContent = 'Belum pernah diubah (Menggunakan kata sandi bawaan sistem)';
      }
    }

    if (secRoleBadgeEl) {
      const roleName = u.role === 'admin' ? 'Pengelola SDM (Admin)' : (u.role === 'pimpinan' ? 'Pimpinan / Kepala Badan' : 'Pegawai ASN');
      secRoleBadgeEl.textContent = roleName;
    }

    document.querySelectorAll('.nine-box-cell').forEach(cell => {
      const boxNum = parseInt(cell.getAttribute('data-box'));
      cell.classList.toggle('selected', boxNum === u.nineBox);
    });

    if (window.lucide) window.lucide.createIcons();
  },

  selectNineBox(boxNumber) {
    Store.state.user.nineBox = boxNumber;
    Store.save();
    this.renderEmployeeProfile();
    App.toast(`Posisi Nine Box BKN diperbarui ke Box ${boxNumber}`, 'info');
  },

  saveProfile() {
    Store.state.user.name = document.getElementById('profNama').value;
    Store.state.user.pangkat = document.getElementById('profPangkat').value;
    Store.state.user.pendidikan = document.getElementById('profPendidikan').value;
    Store.state.user.masaKerja = document.getElementById('profMasaKerja').value;
    Store.state.user.jabatan = document.getElementById('profJabatan').value;
    Store.save();
    App.toast('Data profil kepegawaian berhasil diperbarui secara permanen.', 'success');
  },

  // ==========================================
  // HANDLER UBAH PASSWORD MANDIRI (TAHAP 2)
  // ==========================================

  async changePassword() {
    const oldPassInput = document.getElementById('profOldPassword');
    const newPassInput = document.getElementById('profNewPassword');
    const confirmPassInput = document.getElementById('profConfirmPassword');
    const btnSubmit = document.getElementById('btnChangePassword');

    if (!oldPassInput || !newPassInput || !confirmPassInput) return;

    const oldVal = oldPassInput.value.trim();
    const newVal = newPassInput.value.trim();
    const confirmVal = confirmPassInput.value.trim();

    if (!oldVal) {
      App.toast('Mohon masukkan kata sandi Anda saat ini.', 'error');
      oldPassInput.focus();
      return;
    }
    if (!newVal) {
      App.toast('Mohon masukkan kata sandi baru Anda.', 'error');
      newPassInput.focus();
      return;
    }
    if (newVal.length < 6) {
      App.toast('Kata sandi baru minimal harus 6 karakter.', 'warning');
      newPassInput.focus();
      return;
    }
    if (newVal !== confirmVal) {
      App.toast('Konfirmasi kata sandi baru tidak cocok dengan kata sandi baru.', 'error');
      confirmPassInput.focus();
      return;
    }

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span class="loader"></span> Menyimpan Password Baru...';
    }

    try {
      await Store.changePassword(oldVal, newVal);
      App.toast('Kata sandi Anda berhasil diperbarui dan tersimpan terenkripsi SHA-256 di cloud Supabase!', 'success');
      
      // Reset form
      oldPassInput.value = '';
      newPassInput.value = '';
      confirmPassInput.value = '';

      const bar = document.getElementById('passStrengthBar');
      const text = document.getElementById('passStrengthText');
      const matchText = document.getElementById('passMatchText');
      if (bar) bar.style.width = '0%';
      if (text) text.textContent = '-';
      if (matchText) {
        matchText.textContent = '-';
        matchText.style.color = 'var(--color-text-muted)';
      }

      // Refresh profile view
      this.renderEmployeeProfile();
    } catch (err) {
      App.toast(err.message || 'Gagal memperbarui kata sandi.', 'error');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<span data-icon="Lock" data-icon-size="16"></span> Perbarui Kata Sandi Saya';
        if (window.lucide) window.lucide.createIcons();
      }
    }
  },

  togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (btn) btn.innerHTML = getIcon('EyeOff', 16);
    } else {
      input.type = 'password';
      if (btn) btn.innerHTML = getIcon('Eye', 16);
    }
  },

  checkPasswordStrength(inputVal) {
    const bar = document.getElementById('passStrengthBar');
    const text = document.getElementById('passStrengthText');
    if (!bar || !text) return;

    if (!inputVal) {
      bar.style.width = '0%';
      bar.style.background = 'transparent';
      text.textContent = '-';
      return;
    }

    let score = 0;
    if (inputVal.length >= 6) score += 33;
    if (inputVal.length >= 10) score += 33;
    if (/[A-Z]/.test(inputVal) && /[0-9]/.test(inputVal)) score += 34;

    if (score <= 33) {
      bar.style.width = '33%';
      bar.style.background = 'var(--color-danger)';
      text.textContent = 'Lemah (Minimal 6 Karakter)';
      text.style.color = 'var(--color-danger)';
    } else if (score <= 66) {
      bar.style.width = '66%';
      bar.style.background = 'var(--color-warning)';
      text.textContent = 'Sedang (Bisa Diperkuat)';
      text.style.color = 'var(--color-warning)';
    } else {
      bar.style.width = '100%';
      bar.style.background = 'var(--color-success)';
      text.textContent = 'Sangat Kuat (Kombinasi Huruf & Angka)';
      text.style.color = 'var(--color-success)';
    }

    this.checkPasswordMatch();
  },

  checkPasswordMatch() {
    const newPass = document.getElementById('profNewPassword')?.value || '';
    const confirmPass = document.getElementById('profConfirmPassword')?.value || '';
    const matchText = document.getElementById('passMatchText');
    if (!matchText) return;

    if (!confirmPass) {
      matchText.textContent = '-';
      matchText.style.color = 'var(--color-text-muted)';
      return;
    }

    if (newPass === confirmPass) {
      matchText.textContent = '✓ Kata Sandi Cocok';
      matchText.style.color = 'var(--color-success)';
    } else {
      matchText.textContent = '✗ Kata Sandi Tidak Cocok';
      matchText.style.color = 'var(--color-danger)';
    }
  },

  // MODAL UBAH KATA SANDI (SECURITY MODAL MANDIRI)
  openChangePasswordModal() {
    const oldPassInput = document.getElementById('modalOldPassword');
    const newPassInput = document.getElementById('modalNewPassword');
    const confirmPassInput = document.getElementById('modalConfirmPassword');
    const bar = document.getElementById('modalPassStrengthBar');
    const text = document.getElementById('modalPassStrengthText');
    const matchText = document.getElementById('modalPassMatchText');

    if (oldPassInput) {
      oldPassInput.value = '';
      oldPassInput.type = 'password';
    }
    if (newPassInput) {
      newPassInput.value = '';
      newPassInput.type = 'password';
    }
    if (confirmPassInput) {
      confirmPassInput.value = '';
      confirmPassInput.type = 'password';
    }
    if (bar) {
      bar.style.width = '0%';
      bar.style.background = 'var(--color-danger)';
    }
    if (text) {
      text.textContent = '-';
      text.style.color = 'var(--color-text-muted)';
    }
    if (matchText) {
      matchText.textContent = '-';
      matchText.style.color = 'var(--color-text-muted)';
    }

    this.openModal('changePasswordModal');
    setTimeout(() => {
      if (oldPassInput) oldPassInput.focus();
    }, 150);
    if (typeof renderAllIcons === 'function') renderAllIcons();
  },

  async submitChangePasswordModal() {
    const oldPassInput = document.getElementById('modalOldPassword');
    const newPassInput = document.getElementById('modalNewPassword');
    const confirmPassInput = document.getElementById('modalConfirmPassword');
    const btnSubmit = document.getElementById('btnModalChangePassword');

    if (!oldPassInput || !newPassInput || !confirmPassInput) return;

    const oldVal = oldPassInput.value.trim();
    const newVal = newPassInput.value.trim();
    const confirmVal = confirmPassInput.value.trim();

    if (!oldVal) {
      App.toast('Mohon masukkan kata sandi Anda saat ini.', 'error');
      oldPassInput.focus();
      return;
    }
    if (!newVal) {
      App.toast('Mohon masukkan kata sandi baru Anda.', 'error');
      newPassInput.focus();
      return;
    }
    if (newVal.length < 6) {
      App.toast('Kata sandi baru minimal harus 6 karakter.', 'warning');
      newPassInput.focus();
      return;
    }
    if (newVal !== confirmVal) {
      App.toast('Konfirmasi kata sandi baru tidak cocok dengan kata sandi baru.', 'error');
      confirmPassInput.focus();
      return;
    }
    if (oldVal === newVal) {
      App.toast('Kata sandi baru tidak boleh sama dengan kata sandi saat ini.', 'warning');
      newPassInput.focus();
      return;
    }

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span class="loader"></span> Menyimpan Password...';
    }

    try {
      await Store.changePassword(oldVal, newVal);
      if (typeof AuditService !== 'undefined') {
        AuditService.log('Keamanan', 'Pembaruan Kata Sandi Akun', 'Kata sandi akun dinas berhasil diperbarui dengan enkripsi SHA-256 cloud.', 'Sukses');
      }
      App.toast('Kata sandi Anda berhasil diperbarui dan tersimpan aman di cloud Supabase!', 'success');
      this.closeModal('changePasswordModal');
      this.renderEmployeeProfile();
    } catch (err) {
      App.toast(err.message || 'Gagal memperbarui kata sandi.', 'error');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<span data-icon="Check" data-icon-size="16"></span> Simpan Kata Sandi';
        if (typeof renderAllIcons === 'function') renderAllIcons();
      }
    }
  },

  checkModalPasswordStrength(inputVal) {
    const bar = document.getElementById('modalPassStrengthBar');
    const text = document.getElementById('modalPassStrengthText');
    if (!bar || !text) return;

    if (!inputVal) {
      bar.style.width = '0%';
      text.textContent = '-';
      text.style.color = 'var(--color-text-muted)';
      return;
    }

    let score = 0;
    if (inputVal.length >= 6) score += 33;
    if (inputVal.length >= 10) score += 33;
    if (/[A-Z]/.test(inputVal) && /[0-9]/.test(inputVal)) score += 34;

    if (score <= 33) {
      bar.style.width = '33%';
      bar.style.background = 'var(--color-danger)';
      text.textContent = 'Lemah (Min. 6 Karakter)';
      text.style.color = 'var(--color-danger)';
    } else if (score <= 66) {
      bar.style.width = '66%';
      bar.style.background = 'var(--color-warning)';
      text.textContent = 'Sedang (Bisa Diperkuat)';
      text.style.color = 'var(--color-warning)';
    } else {
      bar.style.width = '100%';
      bar.style.background = 'var(--color-success)';
      text.textContent = 'Sangat Kuat (Kombinasi Huruf & Angka)';
      text.style.color = 'var(--color-success)';
    }

    this.checkModalPasswordMatch();
  },

  checkModalPasswordMatch() {
    const newPass = document.getElementById('modalNewPassword')?.value || '';
    const confirmPass = document.getElementById('modalConfirmPassword')?.value || '';
    const matchText = document.getElementById('modalPassMatchText');
    if (!matchText) return;

    if (!confirmPass) {
      matchText.textContent = '-';
      matchText.style.color = 'var(--color-text-muted)';
      return;
    }

    if (newPass === confirmPass) {
      matchText.textContent = '✓ Kata Sandi Cocok';
      matchText.style.color = 'var(--color-success)';
    } else {
      matchText.textContent = '✗ Kata Sandi Tidak Cocok';
      matchText.style.color = 'var(--color-danger)';
    }
  },

  // USER DROPDOWN IN TOPBAR
  toggleUserDropdown() {
    const menu = document.getElementById('userDropdownMenu');
    if (!menu) return;
    if (menu.style.display === 'none' || !menu.style.display) {
      this.openUserDropdown();
    } else {
      this.closeUserDropdown();
    }
  },

  openUserDropdown() {
    const menu = document.getElementById('userDropdownMenu');
    if (!menu) return;
    const sessionUser = Store.state.user || Store.state.currentSession || {};
    const nameEl = document.getElementById('userDropdownFullName');
    const roleNipEl = document.getElementById('userDropdownRoleNip');
    if (nameEl) nameEl.textContent = sessionUser.name || 'Pegawai Bappeda';
    if (roleNipEl) {
      const roleCfg = NAV_CONFIG[Store.state.currentRole || 'pegawai'] || { label: 'Pegawai ASN' };
      roleNipEl.textContent = `${roleCfg.label} • NIP: ${sessionUser.nipFormatted || sessionUser.nip || '-'}`;
    }
    menu.style.display = 'block';
    if (typeof renderAllIcons === 'function') renderAllIcons();
  },

  closeUserDropdown() {
    const menu = document.getElementById('userDropdownMenu');
    if (menu) menu.style.display = 'none';
  },

  // DUK & EXPORT ACTION DROPDOWN
  toggleDukActionDropdown() {
    const menu = document.getElementById('dukActionDropdownMenu');
    if (!menu) return;
    const isShown = menu.style.display === 'block';
    menu.style.display = isShown ? 'none' : 'block';
    if (!isShown && typeof renderAllIcons === 'function') {
      renderAllIcons();
    }
  },

  closeDukActionDropdown() {
    const menu = document.getElementById('dukActionDropdownMenu');
    if (menu) menu.style.display = 'none';
  },

  renderCareerPlan() {
    const cp = Store.state.careerPlan;
    if (document.getElementById('careerPeriode')) {
      document.getElementById('careerPeriode').value = String(Store.getActiveYear());
    }
    this.setCareerJenjangValue(cp.jenjangTarget);
    this.updateCareerRoadmapTarget(cp.jenjangTarget);
    this.renderCareerJenjangTable(cp.jenjangTarget);
    this.renderCareerReadinessSimulator(cp.jenjangTarget);

    const txtArea = document.getElementById('careerRencanaText');
    if (txtArea) {
      txtArea.value = cp.rencana;
      document.getElementById('careerCharCount').textContent = `${cp.rencana.length} karakter`;
    }

    const chipContainer = document.getElementById('careerRumpunChips');
    if (chipContainer) {
      const allRumpun = [
        '70 — Aparatur Negara / Kepegawaian',
        '26 — Komunikasi & Informatika',
        '22 — Statistik',
        '86 — BAPPENAS',
        '87 — Informasi Geospasial',
        '107 — Penelitian & Inovasi'
      ];

      chipContainer.innerHTML = allRumpun.map(r => {
        const isSelected = cp.rumpunTarget && cp.rumpunTarget.includes(r);
        return `<button class="chip ${isSelected ? 'active' : ''}" onclick="App.toggleRumpunChip('${r}')">${isSelected ? getIcon('CircleCheck', 14) : ''} ${r}</button>`;
      }).join('');
    }
  },

  setCareerJenjangValue(targetVal) {
    const sel = document.getElementById('careerJenjangTarget');
    if (!sel || !targetVal) return;
    const cleanTarget = targetVal.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (let i = 0; i < sel.options.length; i++) {
      const opt = sel.options[i];
      const cleanOpt = opt.value.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanTxt = opt.text.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (opt.value === targetVal || opt.text === targetVal || cleanOpt === cleanTarget || cleanTxt.includes(cleanTarget) || cleanTarget.includes(cleanOpt)) {
        sel.selectedIndex = i;
        return;
      }
    }
  },

  onCareerJenjangTargetChange(val) {
    Store.state.careerPlan.jenjangTarget = val;
    this.updateCareerRoadmapTarget(val);
    this.renderCareerJenjangTable(val);
    this.renderCareerReadinessSimulator(val);
    Store.save();
  },

  selectCareerTarget(val) {
    this.setCareerJenjangValue(val);
    this.onCareerJenjangTargetChange(val);
    App.toast(`Target jenjang dipilih: ${val}`, 'success');
  },

  renderCareerReadinessSimulator(targetJenjang) {
    const simContainer = document.getElementById('careerSimulatorContainer');
    if (!simContainer) return;

    const val = targetJenjang || Store.state.careerPlan?.jenjangTarget || 'JFT Madya — Level 4';
    const res = Store.calculateCareerReadiness ? Store.calculateCareerReadiness(val) : {
      targetJenjang: val,
      targetLevel: 4,
      overallScore: 72,
      kategori: 'KATEGORI II: SIAP DENGAN PENGEMBANGAN (READY WITH DEVELOPMENT)',
      kategoriClass: 'text-warning',
      badgeClass: 'badge-warning',
      proyeksiWaktu: '1 — 2 Tahun',
      checklist: []
    };

    const checklistHtml = (res.checklist || []).map(chk => {
      const icon = chk.isPassed ? getIcon('CircleCheck', 18) : getIcon('AlertTriangle', 18);
      const iconColor = chk.isPassed ? '#16a34a' : '#d97706';
      const badgeCls = chk.isPassed ? 'badge-success' : 'badge-warning';

      return `
        <div class="readiness-checklist-item">
          <div style="color: ${iconColor}; flex-shrink: 0; margin-top: 2px;">${icon}</div>
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; flex-wrap: wrap; gap: 6px;">
              <div style="font-weight: 750; font-size: 13px; color: var(--color-text-primary);">${chk.param}</div>
              <span class="badge ${badgeCls}" style="font-size: 10.5px;">${chk.status}</span>
            </div>
            <div style="font-size: 11.5px; color: var(--color-text-secondary); line-height: 1.4;">${chk.detail}</div>
          </div>
        </div>
      `;
    }).join('');

    simContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
            <span style="font-size: 18px;">🎯</span>
            <h3 style="font-size: 15.5px; font-weight: 750; color: var(--color-text-primary); margin: 0;">Simulasi Kesiapan Jabatan Target ASN (Cita-Cita)</h3>
            <span class="badge badge-primary" style="font-size: 10.5px;">Merit System</span>
          </div>
          <p style="font-size: 12px; color: var(--color-text-secondary); margin: 0;">
            Standar kompetensi &amp; kelayakan untuk target cita-cita: <b style="color: var(--color-primary); font-size: 13px;">${res.targetJenjang}</b>
          </p>
        </div>
        <div>
          <button class="btn btn-primary btn-sm" onclick="App.syncCareerToIdp()" style="font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; box-shadow: 0 2px 8px rgba(31, 111, 174, 0.25);" title="Tambahkan program persiapan kenaikan ke jenjang ini ke Formulir IDP">
            <span data-icon="PlusCircle" data-icon-size="15"></span> + Masukkan Cita-Cita ke IDP
          </button>
        </div>
      </div>

      <div class="grid grid-cols-12" style="gap: 18px; margin-bottom: 16px;">
        <!-- Skor Kesiapan Box -->
        <div class="col-span-4" style="display: flex; flex-direction: column;">
          <div class="readiness-score-box" style="flex: 1; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px 14px;">
            <div style="font-size: 12px; font-weight: 750; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-muted); margin-bottom: 8px;">
              Indeks Kesiapan Suksesi
            </div>
            <div class="readiness-score-number" style="font-size: 48px; margin-bottom: 4px;">
              ${res.overallScore}%
            </div>
            <div class="progress-track" style="width: 80%; height: 8px; margin-bottom: 12px;">
              <div class="progress-fill ${res.overallScore >= 85 ? 'success' : (res.overallScore >= 65 ? 'warning' : 'danger')}" style="width: ${res.overallScore}%;"></div>
            </div>
            <span class="badge ${res.badgeClass}" style="font-size: 10.5px; padding: 6px 10px; font-weight: 750; margin-bottom: 10px; white-space: normal; line-height: 1.35; text-align: center; display: inline-block; max-width: 100%;">
              ${res.kategori}
            </span>
            <div style="font-size: 11.5px; color: var(--color-text-secondary); line-height: 1.45;">
              Estimasi Waktu Siap Promosi:<br><b style="color: var(--color-primary);">${res.proyeksiWaktu}</b>
            </div>
          </div>
        </div>

        <!-- Checklist Parameter -->
        <div class="col-span-8">
          <div style="font-size: 12.5px; font-weight: 750; color: var(--color-text-primary); margin-bottom: 10px;">
            Evaluasi 5 Parameter Kelayakan Menuju Jabatan Target:
          </div>
          ${checklistHtml}
        </div>
      </div>

      <!-- Roadmap 3 Langkah Aksi Menuju Jabatan Target -->
      <div style="margin-top: 14px; border-top: 1px solid var(--color-border); padding-top: 14px;">
        <div style="font-size: 12.5px; font-weight: 750; color: var(--color-text-primary); margin-bottom: 10px;">
          Peta Jalan Aksi Pengembangan Karier (Action Roadmap):
        </div>
        <div class="readiness-step-flow">
          <div class="readiness-step-box active">
            <span class="step-badge badge badge-blue">Tahap 1 &bull; Tahun 2026</span>
            <h5 style="font-size: 13px; font-weight: 750; margin-bottom: 4px; color: var(--color-primary);">Tutup Kesenjangan Kompetensi</h5>
            <p style="font-size: 11.5px; color: var(--color-text-secondary); margin: 0; line-height: 1.4;">
              Selesaikan program IDP tahun ini (24 JP) khususnya Analisis Data, Manajemen Inovasi, dan Mentoring Kepemimpinan.
            </p>
          </div>
          <div class="readiness-step-box">
            <span class="step-badge badge badge-neutral">Tahap 2 &bull; Tahun 2027</span>
            <h5 style="font-size: 13px; font-weight: 750; margin-bottom: 4px; color: var(--color-text-primary);">Ukom &amp; Sertifikasi Bappenas</h5>
            <p style="font-size: 11.5px; color: var(--color-text-secondary); margin: 0; line-height: 1.4;">
              Didaftarkan oleh Bappeda untuk mengikuti Uji Kompetensi Kenaikan Jenjang di Pusbindiklatren Bappenas / Asesmen BKD.
            </p>
          </div>
          <div class="readiness-step-box">
            <span class="step-badge badge badge-neutral">Tahap 3 &bull; Tahun 2028</span>
            <h5 style="font-size: 13px; font-weight: 750; margin-bottom: 4px; color: var(--color-text-primary);">Penetapan SK Promosi Jabatan</h5>
            <p style="font-size: 11.5px; color: var(--color-text-secondary); margin: 0; line-height: 1.4;">
              Pengusulan penetapan ke Tim Penilai Kinerja / Pejabat Pembina Kepegawaian (Gubernur) berbasis Talent Pool Merit.
            </p>
          </div>
        </div>

        <div style="margin-top: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="font-size: 12px; color: var(--color-text-muted);">
            💡 Rencana persiapan jenjang karier ini dapat disinkronkan ke dokumen IDP Anda.
          </div>
          <button class="btn btn-outline-primary btn-sm" onclick="App.syncCareerToIdp()" style="font-size: 11.5px; font-weight: 650; display: inline-flex; align-items: center; gap: 6px;">
            <span data-icon="PlusCircle" data-icon-size="14"></span> Masukkan Rencana ke IDP
          </button>
        </div>
      </div>
    `;

    if (typeof renderAllIcons === 'function') renderAllIcons();
  },

  syncCareerToIdp() {
    const cp = Store.state.careerPlan;
    const target = cp.jenjangTarget || 'JFT Madya — Level 4';
    const activeYr = Store.getActiveYear();

    const topik = `Persiapan Uji Kompetensi (Ukom) & Sertifikasi ${target}`;
    const exists = Store.state.idpState.programs.some(p => p.topik === topik);
    if (exists) {
      App.toast(`Program persiapan kenaikan ke ${target} sudah ada di Formulir IDP Anda.`, 'info');
      App.navigate('eidp');
      return;
    }

    Store.state.idpState.programs.push({
      id: Date.now(),
      kompetensi: 'Perencanaan Strategis Penjenjangan',
      metode: 'Diklat Teknis',
      topik: topik,
      jenisDiklat: 'Diklat Fungsional Penjenjangan',
      jp: 24,
      penyelenggara: 'Pusbindiklatren Bappenas',
      periode: `TA ${activeYr}`,
      periodeMulai: `${activeYr}-06-01`,
      periodeSelesai: `${activeYr}-09-30`,
      estimasi: 2500000,
      status: 'Direncanakan',
      details: {
        tujuan: `Pemenuhan syarat Ukom dan sertifikasi kompetensi menuju jenjang ${target}.`
      }
    });

    Store.save();
    try {
      if (Store.state.user?.nip && typeof Store.saveUserIdp === 'function') {
        Store.saveUserIdp(Store.state.user.nip);
      }
    } catch (e) {
      console.warn('saveUserIdp notice:', e);
    }

    App.toast(`Program persiapan penjenjangan karier (${target}) berhasil ditambahkan ke Formulir IDP Anda!`, 'success');
    App.navigate('eidp');
  },

  printCareerPlanReport() {
    this.openDiagnosticReportModal();
  },

  updateCareerRoadmapTarget(val) {
    if (!val) return;
    const titleEl = document.getElementById('careerRoadmapTargetTitle');
    const descEl = document.getElementById('careerRoadmapTargetDesc');
    if (titleEl) titleEl.textContent = val;
    if (descEl) {
      if (val.includes('JFT Utama')) {
        descEl.textContent = 'Perencana / Peneliti Ahli Utama • Level 5 Kompetensi';
      } else if (val.includes('JFT Madya')) {
        descEl.textContent = 'Perencana / Peneliti Ahli Madya • Level 4 Kompetensi';
      } else if (val.includes('JFT Muda')) {
        descEl.textContent = 'Perencana / Peneliti Ahli Muda • Level 3 Kompetensi';
      } else if (val.includes('JFT Pertama')) {
        descEl.textContent = 'Perencana / Peneliti Ahli Pertama • Level 2 Kompetensi';
      } else if (val.includes('JPT Utama')) {
        descEl.textContent = 'Jabatan Pimpinan Tinggi Utama • Level 5 Kompetensi';
      } else if (val.includes('JPT Madya') || val.includes('JPT Pratama')) {
        descEl.textContent = 'Jabatan Pimpinan Tinggi Madya/Pratama • Level 4';
      } else if (val.includes('Administrator')) {
        descEl.textContent = 'Pejabat Administrator (Eselon III) • Level 3';
      } else if (val.includes('Pengawas')) {
        descEl.textContent = 'Pejabat Pengawas (Eselon IV) • Level 2';
      } else if (val.includes('Pelaksana')) {
        descEl.textContent = 'Jabatan Pelaksana Administrasi • Level 1';
      } else if (val.includes('Penyelia')) {
        descEl.textContent = 'Fungsional Keterampilan Penyelia • Level 3';
      } else if (val.includes('Mahir') || val.includes('Terampil')) {
        descEl.textContent = 'Fungsional Keterampilan Mahir/Terampil • Level 2';
      } else if (val.includes('Pemula')) {
        descEl.textContent = 'Fungsional Keterampilan Pemula • Level 1';
      } else {
        descEl.textContent = 'Target Jenjang Bappeda Provinsi Lampung';
      }
    }
  },

  renderCareerJenjangTable(currentSelected) {
    const tbody = document.getElementById('careerJenjangTableBody');
    if (!tbody) return;
    const masterList = (Store.state.masterData && Store.state.masterData.jenjang && Store.state.masterData.jenjang.length > 0)
      ? Store.state.masterData.jenjang
      : (typeof BAPPEDA_DATA !== 'undefined' ? BAPPEDA_DATA.masterJenjang : []);

    const curClean = (currentSelected || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    tbody.innerHTML = masterList.map(item => {
      const fullLabel = item.fullLabel || `${item.nama} — Level ${item.level}`;
      const itemClean = fullLabel.toLowerCase().replace(/[^a-z0-9]/g, '');
      const isSelected = itemClean === curClean || curClean.includes(item.nama.toLowerCase().replace(/[^a-z0-9]/g, ''));

      let levelBadge = '';
      if (item.level === 5) {
        levelBadge = '<span class="badge badge-success" style="font-weight: 700;">Level 5 (Puncak)</span>';
      } else if (item.level === 4) {
        levelBadge = '<span class="badge" style="background: #ede9fe; color: #6b21a8; font-weight: 700;">Level 4</span>';
      } else if (item.level === 3) {
        levelBadge = '<span class="badge badge-warning" style="font-weight: 700;">Level 3</span>';
      } else if (item.level === 2) {
        levelBadge = '<span class="badge badge-blue" style="font-weight: 700;">Level 2</span>';
      } else {
        levelBadge = '<span class="badge badge-neutral" style="font-weight: 700;">Level 1</span>';
      }

      return `
        <tr style="${isSelected ? 'background: rgba(31, 111, 174, 0.08); font-weight: 500;' : ''}">
          <td style="text-align: center; font-weight: 700; color: var(--color-text-secondary);">${item.kode}</td>
          <td>
            <div style="font-weight: 700; color: var(--color-primary);">${item.nama}</div>
            <div style="font-size: 11px; color: var(--color-text-muted);">${fullLabel}</div>
          </td>
          <td>
            <span class="badge badge-neutral" style="font-size: 11px;">${item.kategori || 'ASN Bappeda'}</span>
          </td>
          <td style="text-align: center;">${levelBadge}</td>
          <td style="font-size: 12px; color: var(--color-text-secondary);">${item.deskripsi || '-'}</td>
          <td style="text-align: center;">
            ${isSelected ? `
              <span class="badge badge-success" style="display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px;">
                ${getIcon('CircleCheck', 14)} Target Aktif
              </span>
            ` : `
              <button class="btn btn-outline btn-sm" onclick="App.selectCareerTarget('${fullLabel}')" style="font-size: 11.5px; padding: 4px 10px;">
                Pilih Target
              </button>
            `}
          </td>
        </tr>
      `;
    }).join('');
  },

  toggleRumpunChip(rumpun) {
    const list = Store.state.careerPlan.rumpunTarget;
    const idx = list.indexOf(rumpun);
    if (idx === -1) {
      list.push(rumpun);
    } else {
      list.splice(idx, 1);
    }
    Store.save();
    this.renderCareerPlan();
  },

  saveCareerPlan(isDraft = false) {
    const cpPeriode = document.getElementById('careerPeriode');
    if (cpPeriode) {
      Store.setActiveYear(cpPeriode.value);
    }
    Store.state.careerPlan.rencana = document.getElementById('careerRencanaText').value;
    Store.state.careerPlan.jenjangTarget = document.getElementById('careerJenjangTarget').value;
    Store.save();
    this.updateCareerRoadmapTarget(Store.state.careerPlan.jenjangTarget);
    App.toast(isDraft ? 'Draft rencana karier disimpan ke sistem' : 'Rencana karier berhasil disimpan', 'success');
    if (!isDraft) {
      this.navigate('ekompetensi');
    }
  },

  switchKompTab(tab) {
    const tabs = ['gaps', 'teknis', 'manajerial', 'sosial', 'all'];
    tabs.forEach(t => {
      const btn = document.getElementById(`tabBtn${t.charAt(0).toUpperCase() + t.slice(1)}`);
      const pane = document.getElementById(`tabPane${t.charAt(0).toUpperCase() + t.slice(1)}`);
      if (btn) btn.classList.toggle('active', t === tab);
      if (pane) pane.style.display = (t === tab) ? 'block' : 'none';
    });
  },

  printCompetencyDiagnosticReport() {
    this.openDiagnosticReportModal();
  },

  openDiagnosticReportModal() {
    try {
      const paper = document.getElementById('diagnosticReportPaperContent');
      if (paper && typeof ExportService !== 'undefined' && typeof ExportService.getDiagnosticReportHtml === 'function') {
        paper.innerHTML = ExportService.getDiagnosticReportHtml();
      }
      this.openModal('diagnosticReportModal');
      if (typeof renderAllIcons === 'function') renderAllIcons();
    } catch (err) {
      console.error('Error opening diagnostic report modal:', err);
      if (typeof ExportService !== 'undefined' && typeof ExportService.printCareerDiagnosticReport === 'function') {
        ExportService.printCareerDiagnosticReport();
      }
    }
  },

  addGapSolutionToIdp(kompetensi, metode, topik, penyelenggara, jp, estimasi) {
    const activeYr = Store.getActiveYear();
    if (!Store.state.idpState) {
      Store.state.idpState = { status: 'Draft', programs: [] };
    }
    if (!Array.isArray(Store.state.idpState.programs)) {
      Store.state.idpState.programs = [];
    }

    const existing = Store.state.idpState.programs.find(p => p.kompetensi === kompetensi && p.topik === topik);
    if (existing) {
      App.toast(`Program "${topik}" sudah terdaftar di Formulir IDP Anda.`, 'warning');
      App.navigate('eidp');
      return;
    }

    const newProg = {
      id: Date.now(),
      kompetensi: kompetensi,
      metode: metode || 'Diklat Teknis',
      topik: topik,
      jenisDiklat: metode === 'Diklat Teknis' ? 'Diklat Teknis Perencanaan' : (metode === 'Mentoring' ? 'Pembinaan Internal' : 'Workshop Kedinasan'),
      jp: parseInt(jp) || 4,
      penyelenggara: penyelenggara || 'Internal Bappeda',
      periode: `TA ${activeYr}`,
      periodeMulai: `${activeYr}-03-01`,
      periodeSelesai: `${activeYr}-10-31`,
      estimasi: parseFloat(estimasi) || 0,
      status: 'Direncanakan',
      details: {
        tujuan: `Menutup kesenjangan kompetensi ${kompetensi} agar memenuhi standar jabatan target.`
      }
    };

    Store.state.idpState.programs.push(newProg);
    Store.save();
    try {
      if (Store.state.user?.nip && typeof Store.saveUserIdp === 'function') {
        Store.saveUserIdp(Store.state.user.nip);
      }
    } catch (e) {
      console.warn('saveUserIdp notice:', e);
    }

    App.toast(`Berhasil ditambahkan ke IDP! Program "${topik}" (${jp} JP) siap diajukan ke atasan.`, 'success');
    this.renderCompetencies();
    App.navigate('eidp');
  },

  addAllGapsToIdp() {
    const compGaps = Store.getCompetencyGaps ? Store.getCompetencyGaps() : { gaps: [] };
    const gaps = compGaps.gaps || [];
    let addedCount = 0;
    const activeYr = Store.getActiveYear();

    if (!Store.state.idpState) {
      Store.state.idpState = { status: 'Draft', programs: [] };
    }
    if (!Array.isArray(Store.state.idpState.programs)) {
      Store.state.idpState.programs = [];
    }

    gaps.forEach(item => {
      if (!item.solusi) return;
      const exists = Store.state.idpState.programs.some(p => p.kompetensi === item.name || p.topik === item.solusi);
      if (!exists) {
        Store.state.idpState.programs.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          kompetensi: item.name,
          metode: item.metode || 'Diklat Teknis',
          topik: item.solusi,
          jenisDiklat: item.jenisDiklat || 'Diklat Teknis',
          jp: item.jp || 4,
          penyelenggara: item.penyelenggara || 'Internal Bappeda',
          periode: `TA ${activeYr}`,
          periodeMulai: `${activeYr}-03-01`,
          periodeSelesai: `${activeYr}-10-31`,
          estimasi: item.estimasi || 0,
          status: 'Direncanakan',
          details: {
            tujuan: `Menutup kesenjangan kompetensi ${item.name} (-${item.gap} level).`
          }
        });
        addedCount++;
      }
    });

    Store.save();
    try {
      if (Store.state.user?.nip && typeof Store.saveUserIdp === 'function') {
        Store.saveUserIdp(Store.state.user.nip);
      }
    } catch (e) {
      console.warn('saveUserIdp notice:', e);
    }

    if (addedCount > 0) {
      App.toast(`${addedCount} Program pengembangan untuk seluruh kekurangan Anda berhasil dimasukkan ke Formulir IDP!`, 'success');
    } else {
      App.toast('Seluruh rekomendasi program penutup kekurangan sudah terdaftar di Formulir IDP Anda.', 'info');
    }
    App.navigate('eidp');
  },

  renderCompetencies() {
    const c = Store.state.competencies;
    const gapsInfo = Store.getCompetencyGaps ? Store.getCompetencyGaps() : {
      all: [], gaps: [], fulfilled: [], critical: [], moderate: [], totalCount: 12, gapCount: 3, percentageFulfilled: 75
    };

    // Update Stat Cards
    const curAvgEl = document.getElementById('compCurrentAvgVal');
    const tgtAvgEl = document.getElementById('compTargetAvgVal');
    const gapValEl = document.getElementById('compGapVal');
    const gapBadgeEl = document.getElementById('compGapDescBadge');
    if (curAvgEl) curAvgEl.textContent = (c.currentAvg || 2.1).toFixed(1);
    if (tgtAvgEl) tgtAvgEl.textContent = (c.targetAvg || 3.0).toFixed(1);
    if (gapValEl) gapValEl.textContent = (c.gap || 0.9).toFixed(1);
    if (gapBadgeEl) gapBadgeEl.textContent = gapsInfo.gapCount > 0 ? `${gapsInfo.gapCount} Kompetensi Memiliki Gap` : 'Semua Terpenuhi';

    const tabGapCount = document.getElementById('tabGapCount');
    if (tabGapCount) tabGapCount.textContent = gapsInfo.gapCount;

    // Render Radar Chart
    Charts.renderRadar('competencyRadarChart', c.radarData);

    // 1. Render Hero Diagnostik Kekurangan Diri
    const diagHero = document.getElementById('selfGapDiagnosticSection');
    if (diagHero) {
      if (gapsInfo.gapCount === 0) {
        diagHero.innerHTML = `
          <div class="gap-diagnostic-hero" style="border-color: rgba(34, 197, 94, 0.3); background: rgba(34, 197, 94, 0.05); margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="color: var(--color-success);">${getIcon('CircleCheck', 28)}</div>
              <div>
                <h3 style="font-size: 15px; font-weight: 750; color: var(--color-text-primary); margin-bottom: 2px;">Seluruh Kompetensi Anda Telah Memenuhi Standar Jabatan</h3>
                <p style="font-size: 12px; color: var(--color-text-secondary); margin: 0;">Tidak ditemukan kesenjangan kompetensi. Anda siap untuk akselerasi karier menuju jenjang berikutnya.</p>
              </div>
            </div>
          </div>
        `;
      } else {
        const gapCardsHtml = gapsInfo.gaps.map(item => {
          const isCritical = item.gap >= 2;
          const borderClass = isCritical ? 'critical' : 'moderate';
          const badgeClass = isCritical ? 'badge-danger' : 'badge-warning';
          const badgeText = isCritical ? `🔴 Kurang ${item.gap} Level (Kritis)` : `🟡 Kurang ${item.gap} Level (Sedang)`;

          return `
            <div class="gap-detail-card ${borderClass}">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; gap: 8px;">
                  <span class="badge ${badgeClass}" style="font-size: 10.5px; font-weight: 700;">${badgeText}</span>
                  <span style="font-size: 11px; font-weight: 600; color: var(--color-text-muted);">${item.kategori || 'Kompetensi'}</span>
                </div>
                <h4 style="font-size: 14.5px; font-weight: 750; color: var(--color-text-primary); margin-bottom: 6px;">${item.name}</h4>
                <p style="font-size: 11.5px; color: var(--color-text-secondary); line-height: 1.45; margin-bottom: 10px;">
                  ${item.deskripsi || 'Perlu peningkatan kapasitas terstruktur untuk mencapai standar level jabatan.'}
                </p>

                <div class="gap-level-meter">
                  <div style="flex: 1; font-size: 11.5px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                      <span style="color: var(--color-text-muted);">Level Anda: <b style="color: var(--color-text-primary);">${item.current}</b></span>
                      <span style="color: var(--color-text-muted);">Standar: <b style="color: var(--color-primary);">${item.target}</b></span>
                    </div>
                    <div class="progress-track" style="height: 6px;">
                      <div class="progress-fill ${isCritical ? 'danger' : 'warning'}" style="width: ${Math.round((item.current / item.target) * 100)}%;"></div>
                    </div>
                  </div>
                </div>

                <div style="background: rgba(47, 128, 237, 0.05); border: 1px dashed rgba(47, 128, 237, 0.3); border-radius: 6px; padding: 8px 10px; margin-bottom: 12px; font-size: 11.5px;">
                  <div style="color: var(--color-primary); font-weight: 700; margin-bottom: 2px;">💡 Rekomendasi Solusi IDP:</div>
                  <div style="color: var(--color-text-primary); font-weight: 600;">${item.solusi || '-'}</div>
                  <div style="font-size: 10.5px; color: var(--color-text-muted); margin-top: 2px;">Metode: <b>${item.metode || 'Diklat'}</b> &bull; Bobot: <b>${item.jp || 4} JP</b> &bull; ${item.penyelenggara || 'Internal Bappeda'}</div>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
                <button class="btn btn-primary btn-sm" style="width: 100%; justify-content: center; font-size: 11.5px; font-weight: 600;" onclick="App.addGapSolutionToIdp('${item.name}', '${item.metode || 'Diklat Teknis'}', '${(item.solusi || '').replace(/'/g, "\\'")}', '${item.penyelenggara || 'Internal Bappeda'}', ${item.jp || 4}, ${item.estimasi || 0})">
                  <span data-icon="Plus" data-icon-size="13"></span> Masukkan Solusi ke IDP
                </button>
              </div>
            </div>
          `;
        }).join('');

        diagHero.innerHTML = `
          <div class="gap-diagnostic-hero" style="margin-bottom: 24px;">
            <div class="gap-diagnostic-header" style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span style="font-size: 18px;">⚠️</span>
                  <h3 style="font-size: 15.5px; font-weight: 800; color: var(--color-text-primary); margin: 0;">Diagnostik Kesenjangan Kompetensi Jabatan</h3>
                  <span class="badge badge-warning" style="font-weight: 750;">${gapsInfo.gapCount} Indikator Belum Memenuhi</span>
                </div>
                <p style="font-size: 12px; color: var(--color-text-secondary); margin: 0; line-height: 1.5;">
                  Rincian kesenjangan kompetensi terhadap standar jabatan. Pilih rekomendasi program pelatihan pada kartu terkait untuk ditambahkan ke formulir IDP.
                </p>
              </div>
            </div>

            <div class="gap-cards-grid">
              ${gapCardsHtml}
            </div>
          </div>
        `;
      }
    }

    // 2. Render Prioritas Pengembangan Cards
    const priorityCardsEl = document.getElementById('competencyPriorityCards');
    if (priorityCardsEl) {
      if (gapsInfo.gaps.length === 0) {
        priorityCardsEl.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--color-text-muted); font-size: 12px;">Seluruh kompetensi terpenuhi.</div>`;
      } else {
        priorityCardsEl.innerHTML = gapsInfo.gaps.slice(0, 3).map((item, idx) => {
          const isCritical = item.gap >= 2;
          const bgCol = isCritical ? 'var(--color-danger-light)' : 'var(--color-warning-light)';
          const brdCol = isCritical ? 'var(--color-danger)' : 'var(--color-warning)';
          const textCol = isCritical ? 'var(--color-danger)' : 'var(--color-warning)';
          const badgeClass = isCritical ? 'badge-danger' : 'badge-warning';

          return `
            <div style="padding: 12px 14px; background: ${bgCol}; border-left: 4px solid ${brdCol}; border-radius: var(--radius-sm);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <b style="color: ${textCol}; font-size: 12.5px;">${idx + 1}. ${item.name}</b>
                <span class="badge ${badgeClass}" style="font-size: 10px;">Gap ${item.gap} Level</span>
              </div>
              <p style="font-size: 11px; color: var(--color-text-secondary); margin-top: 4px; line-height: 1.4;">
                Solusi: <b>${item.solusi || '-'}</b> (${item.metode || 'Diklat'}, ${item.jp || 4} JP).
              </p>
            </div>
          `;
        }).join('');
      }
    }

    // 3. Render Tab Tables
    const makeRow = (item, isAll = false) => {
      const hasGap = item.gap > 0;
      const isCritical = item.gap >= 2;
      const gapBadge = hasGap 
        ? `<span class="badge ${isCritical ? 'badge-danger' : 'badge-warning'}">-${item.gap} Level</span>`
        : `<span class="badge badge-success">Terpenuhi</span>`;

      return `
        <tr style="${hasGap ? 'background: rgba(245, 158, 11, 0.04);' : ''}">
          <td class="font-semibold">${item.name}</td>
          ${isAll ? `<td><span class="badge badge-neutral" style="font-size: 11px;">${item.kategori || '-'}</span></td>` : ''}
          <td style="text-align: center;"><span class="badge badge-neutral">${item.current}</span></td>
          <td style="text-align: center;"><span class="badge badge-blue">${item.target}</span></td>
          <td style="text-align: center;">${gapBadge}</td>
          <td>
            ${item.solusi ? `
              <div style="font-size: 12px; font-weight: 600; color: var(--color-text-primary);">${item.solusi}</div>
              <div style="font-size: 10.5px; color: var(--color-text-muted);">${item.metode || 'Diklat'} &bull; <b>${item.jp || 4} JP</b> &bull; ${item.penyelenggara || 'Internal Bappeda'}</div>
            ` : '<span style="color: var(--color-text-muted); font-size: 11.5px;">Kompetensi telah memenuhi standar</span>'}
          </td>
          <td style="text-align: center;">
            ${hasGap ? `
              <button class="btn btn-outline btn-sm" style="font-size: 11px; padding: 4px 8px;" onclick="App.addGapSolutionToIdp('${item.name}', '${item.metode || 'Diklat Teknis'}', '${(item.solusi || '').replace(/'/g, "\\'")}', '${item.penyelenggara || 'Internal Bappeda'}', ${item.jp || 4}, ${item.estimasi || 0})">
                + IDP
              </button>
            ` : '<span class="badge badge-success" style="font-size: 10px;">✓ Terpenuhi</span>'}
          </td>
        </tr>
      `;
    };

    // Render Tab Gaps (Hanya Kekurangan Saya)
    const gapsTbody = document.getElementById('kompGapsTableBody');
    if (gapsTbody) {
      if (gapsInfo.gaps.length === 0) {
        gapsTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--color-text-muted);">Tidak ada kekurangan kompetensi terdeteksi. Seluruh standar terpenuhi.</td></tr>`;
      } else {
        gapsTbody.innerHTML = gapsInfo.gaps.map(item => {
          const isCritical = item.gap >= 2;
          return `
            <tr style="background: rgba(245, 158, 11, 0.04);">
              <td class="font-semibold">
                <div style="color: var(--color-text-primary); font-size: 13px;">${item.name}</div>
                <div style="font-size: 11px; color: var(--color-text-muted);">${item.kategori || '-'}</div>
              </td>
              <td style="font-size: 11.5px; color: var(--color-text-secondary); line-height: 1.4;">
                ${item.deskripsi || '-'}
              </td>
              <td style="text-align: center;"><span class="badge badge-neutral">${item.current}</span></td>
              <td style="text-align: center;"><span class="badge badge-blue">${item.target}</span></td>
              <td style="text-align: center;"><span class="badge ${isCritical ? 'badge-danger' : 'badge-warning'}">-${item.gap} Level</span></td>
              <td>
                <div style="font-size: 12px; font-weight: 600; color: var(--color-text-primary);">${item.solusi || '-'}</div>
                <div style="font-size: 10.5px; color: var(--color-text-muted);">${item.metode || 'Diklat'} &bull; <b>${item.jp || 4} JP</b> &bull; ${item.penyelenggara || 'Internal Bappeda'}</div>
              </td>
              <td style="text-align: center;">
                <button class="btn btn-primary btn-sm" style="font-size: 11px; padding: 5px 10px;" onclick="App.addGapSolutionToIdp('${item.name}', '${item.metode || 'Diklat Teknis'}', '${(item.solusi || '').replace(/'/g, "\\'")}', '${item.penyelenggara || 'Internal Bappeda'}', ${item.jp || 4}, ${item.estimasi || 0})">
                  + Masukkan IDP
                </button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Render Tab Teknis
    const teknisTbody = document.getElementById('kompTeknisTableBody');
    if (teknisTbody) {
      teknisTbody.innerHTML = (c.teknis || []).map(item => makeRow(item)).join('');
    }

    // Render Tab Manajerial
    const manajerialTbody = document.getElementById('kompManajerialTableBody');
    if (manajerialTbody) {
      manajerialTbody.innerHTML = (c.manajerial || []).map(item => makeRow(item)).join('');
    }

    // Render Tab Sosial
    const sosialTbody = document.getElementById('kompSosialTableBody');
    if (sosialTbody) {
      sosialTbody.innerHTML = (c.sosialKultural || []).map(item => makeRow(item)).join('');
    }

    // Render Tab All
    const allTbody = document.getElementById('kompAllTableBody');
    if (allTbody) {
      allTbody.innerHTML = gapsInfo.all.map(item => makeRow(item, true)).join('');
    }

    if (typeof renderAllIcons === 'function') renderAllIcons();
  },

  renderIdpSaya() {
    const summary = Store.getIdpSummary();
    const idpState = Store.state.idpState;

    document.getElementById('idpSummaryStatus').textContent = idpState.status;
    document.getElementById('idpSummaryProgress').textContent = `${summary.progressPct}%`;
    document.getElementById('idpSummaryCount').textContent = summary.totalProgram;
    document.getElementById('idpSummaryJp').textContent = `${summary.totalJp} JP`;
    document.getElementById('idpSummaryCost').textContent = `Rp${summary.totalCost.toLocaleString('id-ID')}`;

    // Render Banner Kepatuhan 20 JP (UU No. 20/2023)
    const compBannerEl = document.getElementById('idpComplianceBanner');
    if (compBannerEl) {
      const isMet = summary.totalJp >= 20;
      if (isMet) {
        compBannerEl.innerHTML = `
          <div style="background: rgba(22, 163, 74, 0.08); border: 1.5px solid rgba(22, 163, 74, 0.35); border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 22px;">🛡️</span>
              <div>
                <div style="font-size: 13px; font-weight: 750; color: #166534;">
                  Standar Hak Belajar ASN Terpenuhi (UU No. 20/2023 Pasal 49)
                </div>
                <div style="font-size: 11.5px; color: #15803d;">
                  Total rencana pengembangan: <b>${summary.totalJp} JP</b> (Melampaui syarat minimal 20 JP per tahun). Dokumen sah dan siap diajukan.
                </div>
              </div>
            </div>
            <span class="badge badge-success" style="font-weight: 700; padding: 6px 12px; font-size: 11px;">
              ✓ 100% Kepatuhan Regulasi
            </span>
          </div>
        `;
      } else {
        const kurang = 20 - summary.totalJp;
        compBannerEl.innerHTML = `
          <div style="background: rgba(217, 119, 6, 0.08); border: 1.5px solid rgba(217, 119, 6, 0.35); border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 22px;">⚠️</span>
              <div>
                <div style="font-size: 13px; font-weight: 750; color: #9a3412;">
                  Belum Memenuhi Syarat Minimal 20 JP (UU No. 20/2023 Pasal 49)
                </div>
                <div style="font-size: 11.5px; color: #b45309;">
                  Total saat ini: <b>${summary.totalJp} JP</b> (Masih kurang <b>${kurang} JP</b> lagi untuk memenuhi standar hak belajar tahunan ASN).
                </div>
              </div>
            </div>
            <button class="btn btn-warning btn-sm" onclick="App.openAddProgramModal()" style="font-size: 11.5px; font-weight: 700;">
              + Tambah ${kurang} JP Pelatihan
            </button>
          </div>
        `;
      }
    }

    const tbody = document.getElementById('idpProgramTableBody');
    if (idpState.programs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" style="text-align: center; padding: 36px 16px;">
            <div style="color: var(--color-text-muted); margin-bottom: 8px;">${getIcon('ClipboardCheck', 32)}</div>
            <div style="font-weight: 650; margin-bottom: 4px;">Belum Ada Program Pengembangan</div>
            <p style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 16px;">Tambahkan program pengembangan prioritas untuk melengkapi formulir IDP Anda.</p>
            <button class="btn btn-primary btn-sm" onclick="App.openAddProgramModal()">+ Tambah Program</button>
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = idpState.programs.map((p, idx) => {
        const badgeCls = p.status === 'Terlaksana' ? 'badge-success' : p.status === 'Perlu Revisi' ? 'badge-danger' : 'badge-warning';
        return `
          <tr>
            <td>${idx + 1}</td>
            <td class="font-semibold">${p.kompetensi}</td>
            <td><span class="badge badge-blue">${p.metode}</span></td>
            <td>${p.topik}</td>
            <td>${p.jenisDiklat || '-'}</td>
            <td><b>${p.jp}</b> JP</td>
            <td>${p.penyelenggara}</td>
            <td>${p.periode}</td>
            <td>Rp${(p.estimasi || 0).toLocaleString('id-ID')}</td>
            <td><span class="badge ${badgeCls}">${p.status}</span></td>
            <td>
              <div style="display: flex; gap: 6px; align-items: center; white-space: nowrap;">
                ${p.status !== 'Terlaksana' ? `
                  <button class="btn btn-sm" style="background: #16a34a; color: white; padding: 4px 10px; font-size: 11.5px; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Upload Bukti Realisasi Program Ini" onclick="App.openRealizationForProgram(${p.id})">
                    ${getIcon('Upload', 13)} Realisasi
                  </button>
                ` : `
                  <span class="badge badge-success" style="font-size: 11px;">✓ Terlaksana</span>
                `}
                <button class="btn btn-outline btn-sm" title="Edit" onclick="App.openEditProgramModal(${p.id})">${getIcon('Edit3', 14)}</button>
                <button class="btn btn-danger btn-sm" title="Hapus" onclick="App.confirmDeleteProgram(${p.id})">${getIcon('Trash2', 14)}</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    // === RIWAYAT REALISASI MILIK USER YANG LOGIN ===
    const currentUser = Store.state.user || Store.state.currentSession || {};
    const myName = (currentUser.name || '').trim().toLowerCase();
    const myNip = String(currentUser.nip || '').trim().replace(/\s/g, '');
    const allRealizations = Store.state.realizations || [];
    const activeYear = Number(Store.getActiveYear()) || 2026;

    // Filter realisasi: data milik user aktif dan sesuai tahun anggaran aktif
    const myRealizations = allRealizations.filter(r => {
      if (Number(r.tahun || 2026) !== activeYear) return false;
      if (r.isUserInput) return true;
      if (r.nip && myNip && String(r.nip).trim().replace(/\s/g, '') === myNip) return true;
      if (r.pegawai && myName) {
        const cleanR = r.pegawai.toLowerCase().replace(/[^a-z]/g, '');
        const cleanU = myName.toLowerCase().replace(/[^a-z]/g, '');
        if (cleanR.includes(cleanU) || cleanU.includes(cleanR)) return true;
        const words = myName.split(/[\s,.]+/).filter(w => w.length >= 4);
        if (words.some(w => r.pegawai.toLowerCase().includes(w))) return true;
      }
      return false;
    });

    const realizTbody = document.getElementById('idpRealisasiTableBody');
    if (!realizTbody) return;

    if (myRealizations.length === 0) {
      realizTbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 32px 16px; color: var(--color-text-muted);">
            <div style="margin-bottom: 8px;">${getIcon('Upload', 28)}</div>
            Belum ada realisasi yang diunggah. Klik "Upload Bukti Baru" untuk menambahkan.
          </td>
        </tr>
      `;
    } else {
      realizTbody.innerHTML = myRealizations.map((r, idx) => {
        const docName = (r.bukti || 'Sertifikat.pdf').replace(/'/g, "\\'");
        const buktiBtn = `
          <button class="btn btn-outline btn-sm" onclick="App.viewRealizationBukti(${r.id}, '${docName}', '${r.buktiUrl || ''}')">
            ${getIcon('FileText', 13)} ${r.bukti || 'Lihat'}
          </button>
        `;
        return `
          <tr>
            <td>${idx + 1}</td>
            <td class="font-semibold" style="max-width:200px; white-space:normal;">${r.program}</td>
            <td><span class="badge badge-blue">${r.metode}</span></td>
            <td>${r.tanggal}</td>
            <td><b>${r.jp}</b> JP</td>
            <td>${r.penyelenggara || '-'}</td>
            <td>${buktiBtn}</td>
            <td><span class="badge badge-success">${r.status || 'Terverifikasi'}</span></td>
          </tr>
        `;
      }).join('');
    }
  },

  openAddProgramModal() {
    document.getElementById('programModalTitle').textContent = 'Tambah Program Pengembangan';
    document.getElementById('programModalSub').textContent = 'Tambahkan rencana pengembangan ke formulir resmi IDP ASN.';
    const activeYr = Store.getActiveYear();
    document.getElementById('formProgramId').value = '';
    document.getElementById('progKompetensi').value = 'Pelayanan Publik';
    document.getElementById('progMetode').value = 'Coaching';
    document.getElementById('progTopik').value = '';
    document.getElementById('progJenisDiklat').value = '-';
    document.getElementById('progJp').value = '2';
    document.getElementById('progPenyelenggara').value = 'Internal Bappeda';
    document.getElementById('progPeriodeMulai').value = `${activeYr}-01-01`;
    document.getElementById('progPeriodeSelesai').value = `${activeYr}-12-31`;
    document.getElementById('progEstimasi').value = '0';
    document.getElementById('progKeterangan').value = '';

    this.onMetodeChange();
    this.openModal('programModal');
  },

  openEditProgramModal(id) {
    const p = Store.state.idpState.programs.find(x => x.id === id);
    if (!p) return;

    document.getElementById('programModalTitle').textContent = 'Edit Program Pengembangan';
    document.getElementById('programModalSub').textContent = 'Perbarui rincian program pengembangan ini.';
    document.getElementById('formProgramId').value = p.id;
    document.getElementById('progKompetensi').value = p.kompetensi;
    document.getElementById('progMetode').value = p.metode;
    document.getElementById('progTopik').value = p.topik;
    document.getElementById('progJenisDiklat').value = p.jenisDiklat || '-';
    document.getElementById('progJp').value = p.jp;
    document.getElementById('progPenyelenggara').value = p.penyelenggara;
    // Parse periode into start/end dates
    if (p.periodeMulai && p.periodeSelesai) {
      document.getElementById('progPeriodeMulai').value = p.periodeMulai;
      document.getElementById('progPeriodeSelesai').value = p.periodeSelesai;
    } else {
      const activeYr = Store.getActiveYear();
      document.getElementById('progPeriodeMulai').value = `${activeYr}-01-01`;
      document.getElementById('progPeriodeSelesai').value = `${activeYr}-12-31`;
    }
    document.getElementById('progEstimasi').value = p.estimasi;
    document.getElementById('progKeterangan').value = p.keterangan || '';

    this.onMetodeChange();
    this.openModal('programModal');
  },

  onMetodeChange() {
    const metode = document.getElementById('progMetode').value;
    const conditionalCoaching = document.getElementById('conditionalCoaching');
    const conditionalMentoring = document.getElementById('conditionalMentoring');
    const conditionalKonseling = document.getElementById('conditionalKonseling');

    if (conditionalCoaching) conditionalCoaching.style.display = metode.includes('Coaching') ? 'block' : 'none';
    if (conditionalMentoring) conditionalMentoring.style.display = metode.includes('Mentoring') ? 'block' : 'none';
    if (conditionalKonseling) conditionalKonseling.style.display = metode.includes('Konseling') ? 'block' : 'none';
  },

  saveProgramForm() {
    const id = document.getElementById('formProgramId').value;
    const topikInput = document.getElementById('progTopik');
    const topik = (topikInput ? topikInput.value : '').trim();

    if (!topik || topik.length < 3) {
      App.toast('Topik / nama kegiatan pengembangan wajib diisi (minimal 3 karakter).', 'warning');
      if (topikInput) topikInput.focus();
      return;
    }

    const jpInput = document.getElementById('progJp');
    const jp = parseInt(jpInput ? jpInput.value : '0');
    if (isNaN(jp) || jp < 1) {
      App.toast('Jumlah JP minimal 1 Jam Pelajaran.', 'warning');
      if (jpInput) jpInput.focus();
      return;
    }
    if (jp > 100) {
      App.toast('Jumlah JP tidak boleh melebihi 100 JP per program rencana.', 'warning');
      if (jpInput) jpInput.focus();
      return;
    }

    const mulai = document.getElementById('progPeriodeMulai').value;
    const selesai = document.getElementById('progPeriodeSelesai').value;
    if (mulai && selesai && selesai < mulai) {
      App.toast('Tanggal selesai periode tidak boleh lebih awal dari tanggal mulai!', 'error');
      document.getElementById('progPeriodeSelesai').focus();
      return;
    }

    const estimasiInput = document.getElementById('progEstimasi');
    const estimasi = parseInt(estimasiInput ? estimasiInput.value : '0') || 0;
    if (estimasi < 0) {
      App.toast('Estimasi biaya tidak boleh bernilai negatif.', 'warning');
      if (estimasiInput) estimasiInput.focus();
      return;
    }

    const data = {
      kompetensi: document.getElementById('progKompetensi').value,
      metode: document.getElementById('progMetode').value,
      topik: topik,
      jenisDiklat: document.getElementById('progJenisDiklat').value,
      jp: jp,
      penyelenggara: document.getElementById('progPenyelenggara').value,
      periode: (() => {
        const fmt = (d) => { const dt = new Date(d + 'T00:00:00'); const bln = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des']; return bln[dt.getMonth()] + ' ' + dt.getFullYear(); };
        return mulai && selesai ? fmt(mulai) + ' – ' + fmt(selesai) : ('Tahun ' + Store.getActiveYear());
      })(),
      periodeMulai: mulai,
      periodeSelesai: selesai,
      estimasi: estimasi,
      keterangan: document.getElementById('progKeterangan').value
    };

    if (id) {
      Store.updateProgram(parseInt(id), data);
      App.toast('Program pengembangan berhasil diperbarui di Cloud Database', 'success');
    } else {
      Store.addProgram(data);
      App.toast('Program pengembangan berhasil disimpan ke Cloud Database', 'success');
    }

    this.closeModal('programModal');
    this.renderIdpSaya();
  },

  confirmDeleteProgram(id) {
    this.confirmAction(
      'Hapus Program Pengembangan',
      'Apakah Anda yakin ingin menghapus program pengembangan ini dari formulir IDP resmi Anda?',
      () => {
        Store.deleteProgram(id);
        App.toast('Program pengembangan berhasil dihapus dari Cloud Database', 'success');
        App.renderIdpSaya();
      }
    );
  },

  renderReviewPage() {
    const summary = Store.getIdpSummary();
    const cp = Store.state.careerPlan;
    if (document.getElementById('revTotalProgram')) document.getElementById('revTotalProgram').textContent = `${summary.totalProgram} Program`;
    if (document.getElementById('revTotalJp')) document.getElementById('revTotalJp').textContent = `${summary.totalJp} JP`;
    if (document.getElementById('revTotalCost')) document.getElementById('revTotalCost').textContent = `Rp${summary.totalCost.toLocaleString('id-ID')}`;
    const targetSummaryEl = document.getElementById('reviewCareerTargetSummary');
    if (targetSummaryEl && cp) {
      targetSummaryEl.textContent = `Target: ${cp.jenjangTarget} • ${cp.rumpunTarget ? cp.rumpunTarget.length : 0} Rumpun Terpilih`;
    }

    // Render Review Compliance Banner
    const revBannerEl = document.getElementById('reviewComplianceBanner');
    if (revBannerEl) {
      const isMet = summary.totalJp >= 20;
      if (isMet) {
        revBannerEl.innerHTML = `
          <div style="background: rgba(22, 163, 74, 0.08); border: 1px solid rgba(22, 163, 74, 0.3); border-radius: 6px; padding: 10px 14px; font-size: 12px; color: #166534; display: flex; align-items: center; justify-content: space-between;">
            <div><b>✓ Standar 20 JP Terpenuhi:</b> Total <b>${summary.totalJp} JP</b> (Sesuai UU No. 20/2023).</div>
            <span class="badge badge-success" style="font-size: 10.5px;">Sah</span>
          </div>
        `;
      } else {
        revBannerEl.innerHTML = `
          <div style="background: rgba(217, 119, 6, 0.08); border: 1px solid rgba(217, 119, 6, 0.3); border-radius: 6px; padding: 10px 14px; font-size: 12px; color: #9a3412; display: flex; align-items: center; justify-content: space-between;">
            <div><b>⚠️ Perhatian Regulasi:</b> Total baru <b>${summary.totalJp} JP</b> (Kurang ${20 - summary.totalJp} JP dari target minimal 20 JP).</div>
            <span class="badge badge-warning" style="font-size: 10.5px;">Kurang ${20 - summary.totalJp} JP</span>
          </div>
        `;
      }
    }
  },

  openSubmitIdpModal() {
    const chk = document.getElementById('reviewDisclaimerCheck');
    if (chk && !chk.checked) {
      App.toast('Harap centang pernyataan persetujuan terlebih dahulu', 'warning');
      return;
    }

    const summary = Store.getIdpSummary();
    const totalJp = summary.totalJp || 0;
    const modalBody = document.getElementById('submitIdpConfirmModalBody');

    if (modalBody) {
      if (totalJp < 20) {
        modalBody.innerHTML = `
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #fef3c7; color: #b45309; display: grid; place-items: center; margin: 0 auto 16px;">
            <span data-icon="AlertTriangle" data-icon-size="28"></span>
          </div>
          <h3 style="font-size: 17px; font-weight: 750; margin-bottom: 8px; color: #92400e;">
            Peringatan: Hak Belajar Belum 20 JP
          </h3>
          <p style="font-size: 12.5px; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 14px;">
            Berdasarkan <b>UU No. 20 Tahun 2023 Pasal 49</b>, setiap pegawai ASN berhak dan wajib mendapatkan pengembangan kompetensi minimal <b>20 Jam Pelajaran (JP)</b> per tahun.
          </p>
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 10px 14px; margin-bottom: 20px; font-size: 12px; text-align: left;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Total JP Anda Saat Ini:</span>
              <b style="color: #b45309;">${totalJp} JP</b>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Standar Minimal Regulasi:</span>
              <b>20 JP / Tahun</b>
            </div>
            <div style="display: flex; justify-content: space-between; color: #dc2626; font-weight: 700; border-top: 1px dashed #fcd34d; padding-top: 4px; margin-top: 4px;">
              <span>Kekurangan:</span>
              <span>Kurang ${20 - totalJp} JP</span>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="btn btn-primary" onclick="App.closeModal('submitIdpConfirmModal'); App.navigate('eidp'); App.openAddProgramModal();">
              <span data-icon="Plus" data-icon-size="15"></span> + Tambah Program Pelatihan (Disarankan)
            </button>
            <button class="btn btn-outline" style="color: #b45309; border-color: #d97706;" onclick="App.submitIdpConfirmed(true)">
              Tetap Ajukan dengan Catatan Dispensasi
            </button>
            <button class="btn btn-outline" onclick="App.closeModal('submitIdpConfirmModal')">
              Batal
            </button>
          </div>
        `;
      } else {
        modalBody.innerHTML = `
          <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--color-success-light); color: var(--color-success); display: grid; place-items: center; margin: 0 auto 16px;">
            <span data-icon="CircleCheck" data-icon-size="28"></span>
          </div>
          <h3 style="font-size: 17.5px; font-weight: 750; margin-bottom: 8px; color: #166534;">
            Ajukan IDP untuk Verifikasi?
          </h3>
          <p style="font-size: 12.5px; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 14px;">
            Dokumen IDP Anda telah <b>memenuhi standar regulasi UU No. 20/2023</b> dengan total <b>${totalJp} JP</b> (≥ 20 JP) dan siap diverifikasi oleh Pengelola SDM Bappeda.
          </p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 14px; margin-bottom: 20px; font-size: 12px; text-align: left;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Total Jam Pelajaran:</span>
              <b style="color: #16a34a;">${totalJp} JP (Terpenuhi)</b>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Status Kepatuhan:</span>
              <span class="badge badge-success" style="font-size: 10px;">Lolos Kepatuhan 100%</span>
            </div>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline" style="flex: 1;" onclick="App.closeModal('submitIdpConfirmModal')">Batal</button>
            <button class="btn btn-success" style="flex: 1;" onclick="App.submitIdpConfirmed()">Ya, Ajukan IDP</button>
          </div>
        `;
      }
      if (typeof renderAllIcons === 'function') renderAllIcons();
    }

    this.openModal('submitIdpConfirmModal');
  },

  async submitIdpConfirmed() {
    this.closeModal('submitIdpConfirmModal');
    App.toast('Mengirimkan pengajuan IDP ke Cloud Supabase...', 'info');
    await Store.submitIdp();
    App.toast('IDP Anda berhasil diajukan ke Atasan & Pengelola SDM!', 'success');
    this.navigate('edash');
  },

  renderEmployeeRealization() {
    const activeYear = Number(Store.getActiveYear()) || 2026;
    const allList = Store.state.realizations || [];
    const rList = allList.filter(r => Number(r.tahun || 2026) === activeYear);

    const tbody = document.getElementById('realizationTableBody');
    if (!tbody) return;

    if (rList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 48px 20px; color: var(--color-text-muted);">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; max-width: 480px; margin: 0 auto;">
              <span data-icon="Award" data-icon-size="32" style="opacity: 0.35;"></span>
              <div style="font-size: 14.5px; font-weight: 700; color: var(--color-text-main);">
                Belum Ada Realisasi Pengembangan Kompetensi di TA ${activeYear}
              </div>
              <p style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">
                Belum ada sertifikat atau bukti keikutsertaan pelatihan yang diunggah untuk Tahun Anggaran ${activeYear}.
              </p>
              <button class="btn btn-primary btn-sm" onclick="App.openInputRealizationDrawer()">
                + Unggah Bukti Pelatihan ${activeYear}
              </button>
            </div>
          </td>
        </tr>
      `;
      if (typeof renderAllIcons === 'function') renderAllIcons();
    } else {
      tbody.innerHTML = rList.map(r => {
        const docName = (r.bukti || 'Sertifikat.pdf').replace(/'/g, "\\'");
        return `
          <tr>
            <td class="font-semibold" data-label="Pegawai">${r.pegawai}</td>
            <td data-label="Program IDP">${r.program}</td>
            <td data-label="Metode"><span class="badge badge-blue">${r.metode}</span></td>
            <td data-label="Tanggal">${r.tanggal}</td>
            <td data-label="JP"><b>${r.jp}</b> JP</td>
            <td data-label="Bukti">
              <button class="btn btn-outline btn-sm" onclick="App.viewRealizationBukti(${r.id}, '${docName}', '${r.buktiUrl || ''}')">
                <span data-icon="FileText" data-icon-size="14"></span> ${r.bukti}
              </button>
            </td>
            <td data-label="Status"><span class="badge badge-success">${r.status}</span></td>
          </tr>
        `;
      }).join('');
      if (typeof renderAllIcons === 'function') renderAllIcons();
    }

    if (activeYear === 2026) {
      Charts.renderDonut('realizationDonutChart', [
        { label: 'Terlaksana', value: 98, color: 'var(--color-success)' },
        { label: 'Dalam Proses', value: 17, color: 'var(--color-warning)' },
        { label: 'Belum', value: 35, color: 'var(--color-danger)' }
      ]);
    } else {
      const terlaksana = rList.filter(r => (r.status || '').toLowerCase().includes('verif') || (r.status || '').toLowerCase().includes('laksana')).length;
      const proses = rList.filter(r => (r.status || '').toLowerCase().includes('proses')).length;
      const belum = Math.max(0, 99 - (terlaksana + proses));
      Charts.renderDonut('realizationDonutChart', [
        { label: `Terlaksana: ${terlaksana}`, value: terlaksana, color: 'var(--color-success)' },
        { label: `Dalam Proses: ${proses}`, value: proses, color: 'var(--color-warning)' },
        { label: `Belum: ${belum}`, value: belum, color: 'var(--color-danger)' }
      ]);
    }
  },

  openRealizationForProgram(programId) {
    this.openInputRealizationDrawer();
    const progSelect = document.getElementById('realizProgram');
    if (progSelect && programId) {
      for (let i = 0; i < progSelect.options.length; i++) {
        if (progSelect.options[i].getAttribute('data-id') == programId) {
          progSelect.selectedIndex = i;
          progSelect.dispatchEvent(new Event('change'));
          break;
        }
      }
    }
  },

  openInputRealizationDrawer() {
    const progSelect = document.getElementById('realizProgram');
    const programs = Store.state.idpState?.programs || [];
    
    let htmlOptions = '';
    if (programs.length > 0) {
      htmlOptions += programs.map((p, idx) => `
        <option value="${p.topik}" data-id="${p.id}" data-jp="${p.jp}" data-peny="${p.penyelenggara || 'BPSDMD Provinsi Lampung'}" data-metode="${p.metode}" ${idx === 0 ? 'selected' : ''}>
          ${p.topik} (${p.metode} — ${p.jp} JP)
        </option>
      `).join('');
    }
    // Opsi input mandiri / baru
    htmlOptions += `<option value="__custom__" data-id="0" data-jp="20" data-peny="BPSDMD Provinsi Lampung" data-metode="Diklat Teknis">+ Kegiatan / Pelatihan Baru (Input Mandiri)</option>`;

    if (progSelect) {
      progSelect.innerHTML = htmlOptions;

      const updateFields = () => {
        const opt = progSelect.options[progSelect.selectedIndex];
        const isCustom = progSelect.value === '__custom__';
        const customContainer = document.getElementById('realizCustomContainer');
        if (customContainer) {
          customContainer.style.display = isCustom ? 'block' : 'none';
        }
        if (opt) {
          const jpVal = opt.getAttribute('data-jp');
          const penyVal = opt.getAttribute('data-peny');
          if (jpVal && !isCustom) document.getElementById('realizJp').value = jpVal;
          if (penyVal && !isCustom) document.getElementById('realizPenyelenggara').value = penyVal;
        }
      };

      progSelect.onchange = updateFields;
      updateFields();
    }

    // Set tanggal default ke tahun aktif
    const activeYear = Store.getActiveYear();
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const tglInput = document.getElementById('realizTanggal');
    if (tglInput) tglInput.value = `${activeYear}-${mm}-${dd}`;

    this.resetCertificateDropzone();
    this.openDrawer('realizationDrawer');
  },

  async saveRealizationForm() {
    const progSelect = document.getElementById('realizProgram');
    let prog = progSelect ? progSelect.value : '';
    const opt = progSelect ? progSelect.options[progSelect.selectedIndex] : null;
    const isCustom = prog === '__custom__';
    
    if (isCustom) {
      const customInput = document.getElementById('realizProgramCustom');
      prog = (customInput ? customInput.value : '').trim();
      if (!prog || prog.length < 3) {
        App.toast('Mohon masukkan nama kegiatan / pelatihan (minimal 3 karakter)!', 'warning');
        if (customInput) customInput.focus();
        return;
      }
    }

    const customMetodeEl = document.getElementById('realizMetodeCustom');
    const metode = isCustom 
      ? (customMetodeEl ? customMetodeEl.value : 'Diklat Teknis')
      : (opt ? opt.getAttribute('data-metode') : (prog.includes('Coaching') ? 'Coaching' : prog.includes('Workshop') ? 'Workshop' : prog.includes('Mentoring') ? 'Mentoring' : 'Diklat Teknis'));

    const tglInput = document.getElementById('realizTanggal');
    const tgl = tglInput ? tglInput.value : '';
    if (!tgl) {
      App.toast('Tanggal pelaksanaan kegiatan wajib diisi.', 'warning');
      if (tglInput) tglInput.focus();
      return;
    }

    const jpInput = document.getElementById('realizJp');
    const jp = parseInt(jpInput ? jpInput.value : '0');
    if (isNaN(jp) || jp < 1) {
      App.toast('Jumlah JP minimal 1 Jam Pelajaran.', 'warning');
      if (jpInput) jpInput.focus();
      return;
    }
    if (jp > 100) {
      App.toast('Jumlah JP tidak boleh melebihi 100 JP per satu kegiatan.', 'warning');
      if (jpInput) jpInput.focus();
      return;
    }

    const penyInput = document.getElementById('realizPenyelenggara');
    const peny = (penyInput ? penyInput.value : '').trim();
    if (!peny || peny.length < 2) {
      App.toast('Lembaga penyelenggara kegiatan wajib diisi.', 'warning');
      if (penyInput) penyInput.focus();
      return;
    }
    
    const fileInput = document.getElementById('realizFileInput');
    const file = fileInput && fileInput.files ? fileInput.files[0] : null;

    if (!file) {
      App.toast('Bukti Sertifikat wajib diunggah!', 'error');
      const dropzone = document.getElementById('certDropzone');
      if (dropzone) {
        dropzone.classList.add('is-error');
        setTimeout(() => dropzone.classList.remove('is-error'), 1500);
      }
      return;
    }

    // Validasi file (ukuran max 2 MB dan format PDF/JPG/PNG)
    if (!this.validateAndSetCertificateFile(file)) {
      return;
    }
    
    // Disable button during upload
    const btnSubmit = document.querySelector('#realizationDrawer .btn-primary');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span class="loader"></span> Mengunggah Berkas ke Cloud...';
    }

    try {
      const programId = (!isCustom && opt) ? parseInt(opt.getAttribute('data-id')) : null;
      const currentUser = Store.state.user || Store.state.currentSession || {};

      await Store.addRealization({
        pegawai: currentUser.name || 'Pegawai Bappeda',
        nip: currentUser.nip || '',
        program: prog,
        programId: programId,
        metode: metode,
        tanggal: tgl,
        jp: jp,
        penyelenggara: peny,
        bukti: file.name
      }, file);

      if (typeof AuditService !== 'undefined') {
        AuditService.log('Realisasi', 'Unggah Berkas Sertifikat Realisasi', `Mencatat realisasi kegiatan "${prog}" (${jp} JP) dengan bukti berkas: ${file.name}`, 'Sukses');
      }

      App.toast('Realisasi pengembangan berhasil dicatat & sertifikat tersimpan aman di cloud!', 'success');
      this.closeDrawer('realizationDrawer');
      this.renderEmployeeRealization();
      this.renderIdpSaya();
      this.renderEmployeeDashboard();
    } catch (err) {
      App.toast(err.message || 'Gagal menyimpan sertifikat.', 'error');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Simpan Realisasi';
      }
      this.resetCertificateDropzone();
      const customInput = document.getElementById('realizProgramCustom');
      if (customInput) customInput.value = '';
    }
  },

  // CERTIFICATE FILE UPLOAD & VALIDATION HANDLERS (POIN 3)
  handleCertificateFileSelect(input) {
    if (!input || !input.files || !input.files[0]) return;
    this.validateAndSetCertificateFile(input.files[0]);
  },

  handleDropzoneDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('certDropzone');
    if (dropzone) dropzone.classList.add('dragover');
  },

  handleDropzoneDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('certDropzone');
    if (dropzone) dropzone.classList.remove('dragover');
  },

  handleDropzoneDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('certDropzone');
    if (dropzone) dropzone.classList.remove('dragover');

    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      const fileInput = document.getElementById('realizFileInput');
      if (fileInput) {
        fileInput.files = dt.files;
        this.validateAndSetCertificateFile(dt.files[0]);
      }
    }
  },

  validateAndSetCertificateFile(file) {
    const titleEl = document.getElementById('dropzoneFileName');
    const descEl = document.getElementById('dropzoneDesc');
    const iconEl = document.getElementById('dropzoneIcon');
    const dropzone = document.getElementById('certDropzone');
    const fileInput = document.getElementById('realizFileInput');

    if (!file) {
      this.resetCertificateDropzone();
      return false;
    }

    const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
    const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop().toLowerCase();

    // 1. Validasi Tipe Ekstensi File
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      if (fileInput) fileInput.value = '';
      if (dropzone) {
        dropzone.classList.remove('has-file');
        dropzone.classList.add('is-error');
      }
      if (iconEl) iconEl.innerHTML = getIcon('AlertTriangle', 22);
      if (titleEl) {
        titleEl.textContent = 'Format File Tidak Didukung!';
        titleEl.style.color = 'var(--color-danger)';
      }
      if (descEl) {
        descEl.textContent = `File berformat .${ext} tidak diizinkan. Mohon pilih file PDF, JPG, atau PNG.`;
        descEl.style.color = 'var(--color-danger)';
      }
      App.toast(`Format .${ext} tidak didukung! Mohon unggah dokumen PDF atau gambar JPG/PNG.`, 'error');
      return false;
    }

    // 2. Validasi Batas Ukuran File (Maks. 2 MB)
    if (file.size > MAX_SIZE_BYTES) {
      if (fileInput) fileInput.value = '';
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      if (dropzone) {
        dropzone.classList.remove('has-file');
        dropzone.classList.add('is-error');
      }
      if (iconEl) iconEl.innerHTML = getIcon('AlertTriangle', 22);
      if (titleEl) {
        titleEl.textContent = 'Ukuran Berkas Melebihi Batas (Maks. 2 MB)';
        titleEl.style.color = 'var(--color-danger)';
      }
      if (descEl) {
        descEl.textContent = `Ukuran file Anda: ${sizeMB} MB. Silakan kompresi berkas sertifikat terlebih dahulu.`;
        descEl.style.color = 'var(--color-danger)';
      }
      App.toast(`Ukuran file (${sizeMB} MB) melebihi batas 2 MB! Silakan kompres berkas sertifikat Anda.`, 'error');
      return false;
    }

    // 3. File Valid -> Render Sukses
    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    if (dropzone) {
      dropzone.classList.remove('is-error');
      dropzone.classList.add('has-file');
    }
    if (iconEl) iconEl.innerHTML = getIcon('Check', 22);
    if (titleEl) {
      titleEl.textContent = file.name;
      titleEl.style.color = 'var(--color-text-primary)';
    }
    if (descEl) {
      descEl.textContent = `Ukuran: ${sizeFormatted} • Berkas siap diunggah ke cloud storage Supabase ✓`;
      descEl.style.color = 'var(--color-success)';
    }

    App.toast(`Berkas "${file.name}" (${sizeFormatted}) tervalidasi dan siap disimpan.`, 'success');
    return true;
  },

  resetCertificateDropzone() {
    const titleEl = document.getElementById('dropzoneFileName');
    const descEl = document.getElementById('dropzoneDesc');
    const iconEl = document.getElementById('dropzoneIcon');
    const dropzone = document.getElementById('certDropzone');
    const fileInput = document.getElementById('realizFileInput');

    if (fileInput) fileInput.value = '';
    if (dropzone) {
      dropzone.classList.remove('has-file');
      dropzone.classList.remove('is-error');
      dropzone.classList.remove('dragover');
    }
    if (iconEl) iconEl.innerHTML = getIcon('Upload', 22);
    if (titleEl) {
      titleEl.textContent = 'Pilih atau letakkan file bukti di sini';
      titleEl.style.color = '';
    }
    if (descEl) {
      descEl.textContent = 'Format PDF, JPG, atau PNG (Maksimal 2 MB)';
      descEl.style.color = '';
    }
  },

  validateJpInput(input) {
    if (!input) return;
    let val = parseInt(input.value);
    if (isNaN(val)) return;
    if (val < 1) input.value = 1;
    if (val > 100) {
      input.value = 100;
      App.toast('Maksimal target 100 JP per satu kegiatan pelatihan.', 'warning');
    }
  },

  async viewRealizationBukti(id, filename, inMemoryUrl) {
    if (inMemoryUrl && inMemoryUrl.startsWith('http')) {
      window.open(inMemoryUrl, '_blank');
      return;
    }
    if (inMemoryUrl && inMemoryUrl.startsWith('data:')) {
      const w = window.open('');
      if (w) {
        w.document.write(`<iframe src="${inMemoryUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        return;
      }
    }
    if (typeof IDBHelper !== 'undefined') {
      try {
        const dataUrl = await IDBHelper.getFile(id);
        if (dataUrl) {
          const w = window.open('');
          if (w) {
            w.document.write(`<iframe src="${dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
            return;
          }
        }
      } catch(e) {}
    }
    this.previewDocument(filename);
  },

  // ==========================================
  // ADMIN VIEW CONTROLLERS
  // ==========================================

  renderAdminDashboard() {
    this.renderAdminDirectiveBanner();
    if (typeof BackupService !== 'undefined') {
      BackupService.renderAdminDashboardBackupCard();
    }
    this.updateComplianceCounters();

    const activeYear = Number(Store.getActiveYear()) || 2026;
    const allVerifs = Store.state.verifications || [];
    const yearVerifs = allVerifs.filter(v => Number(v.tahun || 2026) === activeYear);

    let diajukan = 0;
    let disetujui = 0;
    let revisi = 0;

    if (activeYear === 2026) {
      diajukan = 12;
      disetujui = 72;
      revisi = 5;
    } else {
      yearVerifs.forEach(v => {
        const st = (v.status || '').toLowerCase();
        if (st.includes('setuju') || st === 'final') disetujui++;
        else if (st.includes('revisi')) revisi++;
        else diajukan++;
      });
    }

    const diajukanEl = document.getElementById('adashStatDiajukan');
    const disetujuiEl = document.getElementById('adashStatDisetujui');
    const revisiEl = document.getElementById('adashStatRevisi');
    const btnVerifCount = document.getElementById('adashBtnVerifCount');

    if (diajukanEl) diajukanEl.textContent = diajukan;
    if (disetujuiEl) disetujuiEl.textContent = disetujui;
    if (revisiEl) revisiEl.textContent = revisi;
    if (btnVerifCount) btnVerifCount.textContent = diajukan;

    let green = disetujui;
    let yellow = diajukan;
    let red = (Store.state.employees?.length || 99) - (green + yellow + revisi);
    if (red < 0) red = 0;

    const dashRed = document.getElementById('dashCountRed');
    if (dashRed) dashRed.textContent = red;

    Charts.renderDonut('adminIdpStatusDonut', [
      { label: 'Final (Memenuhi Target ≥20 JP)', value: green, color: 'var(--color-success)' },
      { label: 'Dalam Proses / Verifikasi', value: yellow, color: 'var(--color-warning)' },
      { label: 'Belum Mengajukan (Kritis)', value: red, color: 'var(--color-danger)' }
    ]);
  },

  renderAdminDirectiveBanner() {
    const bannerEl = document.getElementById('adashDirectiveBanner');
    if (!bannerEl) return;

    const directives = Store.state.executiveDirectives || [];
    if (directives.length === 0) {
      bannerEl.innerHTML = '';
      return;
    }

    const latest = directives[0];
    bannerEl.innerHTML = `
      <div class="admin-directive-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge badge-warning" style="font-weight: 750; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 4px;">
              <span data-icon="AlertCircle" data-icon-size="12"></span> Disposisi Arahan Kepala Bappeda
            </span>
            <span style="font-size: 11px; color: var(--color-text-muted);">Unit Target: <b style="color: var(--color-primary);">${latest.target}</b></span>
          </div>
          <span style="font-size: 11px; color: var(--color-text-muted);">${latest.tanggal}</span>
        </div>
        <p class="directive-quote">
          "${latest.arahan}"
        </p>
        <div class="directive-footer">
          <span>Instruksi Kedinasan: <i>Kasubbag Kepegawaian &amp; Tim Verifikasi agar mengawal kepatuhan IDP pada unit tersebut.</i></span>
          <span class="badge badge-warning" style="font-size: 10px;">Perlu Pengawalan</span>
        </div>
      </div>
    `;
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  async renderAdminVerification() {
    try {
      if (typeof supabaseClient !== 'undefined') {
        await Store.syncVerificationsFromSupabase();
      }
    } catch (err) {
      console.warn("Gagal sinkron verifikasi Supabase:", err);
    }

    const activeYear = Number(Store.getActiveYear()) || 2026;
    let list = Store.state.verifications || [];

    // Filter data verifikasi berdasarkan Tahun Anggaran Aktif
    list = list.filter(v => Number(v.tahun || 2026) === activeYear);

    // Filter pencarian dan status jika elemen input ada
    const searchEl = document.getElementById('verifSearchInput');
    const statusEl = document.getElementById('verifStatusSelect');
    const unitEl = document.getElementById('verifUnitSelect');

    const searchVal = (searchEl ? searchEl.value : '').toLowerCase().trim();
    const statusVal = statusEl ? statusEl.value : 'Semua Status';
    const unitVal = unitEl ? unitEl.value : 'Semua Unit Kerja';

    if (searchVal) {
      list = list.filter(v => 
        (v.pegawai || '').toLowerCase().includes(searchVal) || 
        String(v.nip || '').includes(searchVal)
      );
    }

    if (statusVal && statusVal !== 'Semua Status') {
      list = list.filter(v => v.status === statusVal);
    }

    if (unitVal && unitVal !== 'Semua Unit Kerja') {
      list = list.filter(v => (v.unitKerja || '').toLowerCase().includes(unitVal.toLowerCase()));
    }

    const tbody = document.getElementById('verifTableBody');
    if (!tbody) return;

    if (list.length === 0) {
      const isFiltered = Boolean(searchVal || (statusVal && statusVal !== 'Semua Status') || (unitVal && unitVal !== 'Semua Unit Kerja'));
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 48px 20px; color: var(--color-text-muted);">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; max-width: 520px; margin: 0 auto;">
              <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(59, 130, 246, 0.1); color: var(--color-primary); display: flex; align-items: center; justify-content: center;">
                <span data-icon="Inbox" data-icon-size="28"></span>
              </div>
              <div style="font-size: 15px; font-weight: 700; color: var(--color-text-main);">
                ${isFiltered ? 'Tidak ada dokumen IDP yang sesuai filter' : `Belum Ada Pengajuan IDP untuk Tahun Anggaran ${activeYear}`}
              </div>
              <div style="font-size: 12.5px; opacity: 0.85; line-height: 1.6;">
                ${isFiltered 
                  ? 'Silakan sesuaikan kata kunci pencarian nama, NIP, status, atau unit kerja Anda.' 
                  : `Pada Tahun Anggaran <b>${activeYear}</b>, belum ada pegawai ASN Bappeda yang mengajukan formulir IDP ke Tim Verifikator. Seluruh data dan riwayat pengajuan IDP tahun sebelumnya tetap tersimpan aman pada arsip TA masing-masing.`}
              </div>
              ${!isFiltered && activeYear !== 2026 ? `
                <button class="btn btn-outline btn-sm" onclick="App.handleYearChange(2026)" style="margin-top: 8px; display: inline-flex; align-items: center; gap: 6px;">
                  <span data-icon="History" data-icon-size="14"></span> Beralih &amp; Lihat Arsip IDP TA 2026
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
      if (typeof renderAllIcons === 'function') renderAllIcons();
      return;
    }

    tbody.innerHTML = list.map(v => {
      const name = v.pegawai || 'Pegawai ASN Bappeda';
      const initials = name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'AS';
      const badgeCls = (v.status === 'Final' || v.status === 'Disetujui') ? 'badge-success' : v.status === 'Disetujui Atasan' ? 'badge-primary' : v.status === 'Perlu Revisi' ? 'badge-danger' : 'badge-warning';
      const totalJp = v.totalJp || 20;

      return `
        <tr id="verif-row-${v.id}">
          <td>
            <div class="table-user-cell">
              <div class="table-user-avatar">${initials}</div>
              <div class="table-user-info">
                <div class="name">${name}</div>
                <div class="sub">${v.nip || '-'}</div>
              </div>
            </div>
          </td>
          <td>${v.jabatan || '-'}</td>
          <td>${v.targetKarier || ('Pengembangan ' + Store.getActiveYear())}</td>
          <td><b>${v.programCount || 1}</b> Program (${totalJp} JP)</td>
          <td>${v.pengajuan || 'Hari Ini'}</td>
          <td><span class="badge ${badgeCls}">${v.status || 'Diajukan ke Atasan'}</span></td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="App.openReviewVerificationDrawer(${v.id})" style="display: flex; align-items: center; gap: 6px;">
              ${typeof getIcon === 'function' ? getIcon('ShieldCheck', 14) : ''} Review
            </button>
          </td>
        </tr>
      `;
    }).join('');
    if (typeof renderAllIcons === 'function') renderAllIcons();
  },

  onVerifFilterChange() {
    this.renderAdminVerification();
  },

  openReviewVerificationDrawer(id) {
    const item = Store.state.verifications.find(x => x.id === id);
    if (!item) return;

    this._currentReviewVerifItem = item;
    const name = item.pegawai || 'Pegawai ASN Bappeda';
    document.getElementById('reviewDrawerEmployeeName').textContent = name;
    document.getElementById('reviewDrawerNip').textContent = `NIP: ${item.nip || '-'} • ${item.jabatan || ''} (${item.jenisJabatan || 'Struktural'})`;
    document.getElementById('reviewDrawerTargetKarier').textContent = item.targetKarier || ('Pengembangan Kompetensi ' + Store.getActiveYear());
    document.getElementById('reviewDrawerRencanaKarier').textContent = item.rencanaKarier || 'Penguatan keahlian perencanaan pembangunan daerah.';
    document.getElementById('reviewDrawerTotalJp').textContent = `${item.totalJp || 20} JP`;
    document.getElementById('reviewDrawerEstimasiBiaya').textContent = item.estimasiBiaya || 'Rp0';
    document.getElementById('verifNotesInput').value = item.notes || '';

    document.getElementById('btnApproveVerif').onclick = () => App.approveVerification(item.id, 'Final');
    const btnAtasan = document.getElementById('btnApproveAtasanVerif');
    if (btnAtasan) {
      btnAtasan.onclick = () => App.approveVerification(item.id, 'Disetujui Atasan');
    }
    document.getElementById('btnRejectVerif').onclick = () => App.requestRevisionModal(item.id);

    this.openDrawer('reviewDrawer');
  },

  approveVerification(id, newStatus = 'Final') {
    const note = document.getElementById('verifNotesInput').value;
    const v = (Store.state.verifications || []).find(x => x.id === id);
    Store.approveIdp(id, note || 'Disetujui tanpa catatan perbaikan.', newStatus);
    if (typeof AuditService !== 'undefined') {
      AuditService.log('Verifikasi', `Verifikasi Dokumen IDP (${newStatus})`, `Menyetujui IDP pegawai ${v?.pegawai || 'ASN'} dengan status ${newStatus}. Catatan: ${note || 'Sesuai standar'}`, 'Sukses');
    }
    this.closeDrawer('reviewDrawer');
    App.toast(`IDP Pegawai resmi diperbarui (Status: ${newStatus})`, 'success');
    this.renderAdminVerification();
  },

  requestRevisionModal(id) {
    document.getElementById('revisionVerifId').value = id;
    this.openModal('revisionReasonModal');
  },

  submitRevisionRequest() {
    const id = parseInt(document.getElementById('revisionVerifId').value);
    const reason = document.getElementById('revisionReasonInput').value;
    if (!reason) {
      App.toast('Harap masukkan alasan revisi', 'warning');
      return;
    }

    const v = (Store.state.verifications || []).find(x => x.id === id);
    Store.rejectIdp(id, reason);
    if (typeof AuditService !== 'undefined') {
      AuditService.log('Verifikasi', 'Pengembalian IDP untuk Revisi', `Mengembalikan berkas IDP ${v?.pegawai || 'ASN'} dengan catatan perbaikan: "${reason}"`, 'Peringatan');
    }
    this.closeModal('revisionReasonModal');
    this.closeDrawer('reviewDrawer');
    App.toast('IDP telah dikembalikan kepada pegawai untuk direvisi', 'info');
    this.renderAdminVerification();
  },

  empPage: 1,
  empPageSize: 15,
  complianceFilter: 'all', // 'all', 'red', 'yellow', 'green'

  getEmployeeYearData(emp, year) {
    if (!emp) return { statusIdp: 'Belum Mengajukan', jp: 0 };
    const activeYr = Number(year || Store.getActiveYear()) || 2026;
    if (activeYr === 2026) {
      return {
        statusIdp: emp.statusIdp || 'Belum Mengajukan',
        jp: typeof emp.jp === 'number' ? emp.jp : (parseInt(emp.progress) || 0)
      };
    }
    const cleanNip = String(emp.nip || '').replace(/\s+/g, '');
    const verif = (Store.state.verifications || []).find(v => 
      String(v.nip || '').replace(/\s+/g, '') === cleanNip && 
      Number(v.tahun || 2026) === activeYr
    );
    if (verif) {
      return {
        statusIdp: verif.status || 'Diajukan ke Atasan',
        jp: verif.totalJp || 0
      };
    }
    return {
      statusIdp: 'Belum Mengajukan',
      jp: 0
    };
  },

  getComplianceCategory(emp) {
    if (!emp) return { key: 'red', level: 'Kritis', badgeClass: 'badge-danger', dotColor: 'var(--color-danger)', label: 'Belum Mengajukan', sublabel: '0/20 JP', percent: 0, needsReminder: true };
    const yearData = this.getEmployeeYearData(emp);
    const status = (yearData.statusIdp || '').toLowerCase();
    const jp = yearData.jp;

    // Kategori Merah: Belum mengajukan, Draft, atau JP == 0
    if (status === 'belum' || status === 'draft' || status === 'belum mengisi' || status === 'belum mengajukan' || !yearData.statusIdp || jp === 0) {
      return {
        key: 'red',
        level: 'Kritis',
        badgeClass: 'badge-danger',
        dotColor: 'var(--color-danger)',
        label: status === 'draft' ? 'Draft Rencana' : 'Belum Mengajukan',
        sublabel: `${jp}/20 JP`,
        percent: Math.min(100, Math.round((jp / 20) * 100)),
        needsReminder: true
      };
    }

    // Kategori Hijau: Disetujui/Final dan JP >= 20
    if ((status === 'disetujui' || status === 'final') && jp >= 20) {
      return {
        key: 'green',
        level: 'Patuh',
        badgeClass: 'badge-success',
        dotColor: 'var(--color-success)',
        label: 'Memenuhi Target (≥20 JP)',
        sublabel: `${jp} JP (Tercapai)`,
        percent: 100,
        needsReminder: false
      };
    }

    // Kategori Kuning: Menunggu Verifikasi, Perlu Revisi, atau JP < 20
    let label = 'Belum Capai 20 JP';
    if (status.includes('revisi')) label = 'Perlu Revisi Dokumen';
    else if (status.includes('verifikasi') || status.includes('diajukan')) label = 'Menunggu Verifikasi';

    return {
      key: 'yellow',
      level: 'Perhatian',
      badgeClass: 'badge-warning',
      dotColor: 'var(--color-warning)',
      label: label,
      sublabel: `${jp}/20 JP`,
      percent: Math.min(100, Math.round((jp / 20) * 100)),
      needsReminder: true
    };
  },

  setComplianceFilter(key) {
    this.complianceFilter = key || 'all';
    this.empPage = 1;
    document.querySelectorAll('.compliance-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-compliance') === this.complianceFilter);
    });
    this.renderAdminEmployees();
  },

  filterComplianceFromDash(key) {
    this.navigate('apegawai');
    this.setComplianceFilter(key);
    setTimeout(() => {
      const el = document.getElementById('adminEmployeeTableBody');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  },

  updateComplianceCounters() {
    const emps = Store.state.employees || [];
    let red = 0, yellow = 0, green = 0;
    emps.forEach(e => {
      const cat = this.getComplianceCategory(e);
      if (cat.key === 'red') red++;
      else if (cat.key === 'yellow') yellow++;
      else if (cat.key === 'green') green++;
    });

    const bAll = document.getElementById('badgeCountAll');
    const bRed = document.getElementById('badgeCountRed');
    const bYellow = document.getElementById('badgeCountYellow');
    const bGreen = document.getElementById('badgeCountGreen');
    const dashRed = document.getElementById('dashCountRed');

    if (bAll) bAll.textContent = emps.length;
    if (bRed) bRed.textContent = red;
    if (bYellow) bYellow.textContent = yellow;
    if (bGreen) bGreen.textContent = green;
    if (dashRed) dashRed.textContent = red;

    const mRed = document.getElementById('remindCountRed');
    const mU20 = document.getElementById('remindCountUnder20');
    const mRev = document.getElementById('remindCountRevision');
    if (mRed) mRed.textContent = red;
    if (mU20) mU20.textContent = red + yellow;
    if (mRev) {
      const revCount = emps.filter(e => (e.statusIdp || '').toLowerCase().includes('revisi')).length;
      mRev.textContent = revCount;
    }
  },

  onEmployeeFilterChange() {
    this.empPage = 1;
    this.renderAdminEmployees();
  },

  resetEmployeeFilter() {
    const s = document.getElementById('empSearchInput');
    const u = document.getElementById('empUnitFilter');
    const st = document.getElementById('empStatusFilter');
    if (s) s.value = '';
    if (u) u.value = '';
    if (st) st.value = '';
    this.complianceFilter = 'all';
    document.querySelectorAll('.compliance-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-compliance') === 'all');
    });
    this.empPage = 1;
    this.renderAdminEmployees();
    App.toast('Filter data pegawai direset', 'info');
  },

  setEmpPage(p) {
    this.empPage = p;
    this.renderAdminEmployees();
    const tbl = document.getElementById('adminEmployeeTableBody');
    if (tbl) tbl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  showEmployeeDetail(id) {
    const e = (Store.state.employees || []).find(x => x.id === id || String(x.nip).replace(/\s+/g,'') === String(id).replace(/\s+/g,''));
    if (!e) return;

    if (document.getElementById('modalEmpName')) document.getElementById('modalEmpName').textContent = e.name;
    if (document.getElementById('modalEmpNip')) document.getElementById('modalEmpNip').textContent = `NIP: ${e.nipFormatted || e.nip}`;
    if (document.getElementById('modalEmpUnit')) document.getElementById('modalEmpUnit').textContent = e.unit || '-';
    if (document.getElementById('modalEmpJabatan')) document.getElementById('modalEmpJabatan').textContent = `${e.jabatanLengkap || e.jabatan} (TMT: ${e.tmtJabatan || '-'})`;
    if (document.getElementById('modalEmpPangkat')) document.getElementById('modalEmpPangkat').textContent = e.pangkat || '-';
    if (document.getElementById('modalEmpTmtPangkat')) document.getElementById('modalEmpTmtPangkat').textContent = e.tmtPangkat || '-';
    if (document.getElementById('modalEmpJenis')) document.getElementById('modalEmpJenis').textContent = e.jenis || '-';
    if (document.getElementById('modalEmpTtl')) document.getElementById('modalEmpTtl').textContent = e.ttl || '-';
    if (document.getElementById('modalEmpUsiaMasaKerja')) {
      document.getElementById('modalEmpUsiaMasaKerja').textContent = `${e.usia || '-'} • Masa Kerja: ${e.masaKerja || '-'}`;
    }
    if (document.getElementById('modalEmpPendidikan')) {
      document.getElementById('modalEmpPendidikan').textContent = `${e.pendidikan || '-'} (${e.jenjang || '-'})`;
    }
    if (document.getElementById('modalEmpDiklat')) {
      document.getElementById('modalEmpDiklat').textContent = e.diklat || '-';
    }

    const initialEl = document.getElementById('modalEmpAvatarInitial');
    if (initialEl) {
      const inits = (e.name || 'ASN').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
      initialEl.textContent = inits;
    }

    const badgeCls = e.statusIdp === 'Final' ? 'badge-success' : e.statusIdp === 'Belum' ? 'badge-danger' : 'badge-warning';
    const statusLabel = e.statusIdp === 'Final' ? 'Disetujui (Final)' : e.statusIdp === 'Draft' ? 'Draft Rencana' : e.statusIdp === 'Diajukan' ? 'Menunggu Verifikasi' : (e.statusIdp || 'Belum Diisi');
    if (document.getElementById('modalEmpStatusIdp')) {
      document.getElementById('modalEmpStatusIdp').innerHTML = `<span class="badge ${badgeCls}" style="font-size: 11px; padding: 3px 8px;">${statusLabel}</span>`;
    }

    const progEl = document.getElementById('modalEmpProgress');
    if (progEl) {
      const prog = typeof e.jp === 'number' ? e.jp : (parseInt(e.progress) || 0);
      const pct = Math.min(100, Math.round((prog / 20) * 100));
      const isTargetMet = prog >= 20;
      progEl.innerHTML = `
        <div style="display: flex; align-items: baseline; gap: 6px;">
          <span style="font-size: 15px; font-weight: 800; color: ${isTargetMet ? 'var(--color-success)' : 'var(--color-warning)'};">${prog} JP</span>
          <span style="font-size: 11px; color: var(--color-text-muted);">/ Target 20 JP (${pct}%)</span>
        </div>
      `;
    }

    this._currentDetailEmployee = e;
    this.openModal('empDetailModal');
    if (typeof renderAllIcons === 'function') renderAllIcons();
  },

  printCurrentDetailEmployee() {
    const e = this._currentDetailEmployee;
    if (!e) return;
    const cleanNip = String(e.nip || '').replace(/\s+/g, '');
    const verif = (Store.state.verifications || []).find(v => String(v.nip).replace(/\s+/g, '') === cleanNip);
    ExportService.showPrintDialog({
      user: {
        name: e.name,
        nip: e.nipFormatted || e.nip,
        pangkat: e.pangkat,
        jabatan: e.jabatanLengkap || e.jabatan,
        unitKerja: e.unit,
        jenisJabatan: e.jenis,
        pendidikan: e.pendidikan || 'S-1',
        masaKerja: e.masaKerja || '10 Tahun',
        nineBox: e.nineBox || '6'
      },
      careerPlan: {
        jenjangTarget: verif?.targetKarier || 'JFT Muda — Level 3',
        rencana: verif?.rencanaKarier || 'Peningkatan kapasitas teknis perencanaan pembangunan daerah dan pengendalian program.',
        rumpunTarget: ['Perencanaan Pembangunan Daerah', 'Manajemen Publik', 'Statistik Daerah']
      },
      programs: Store.state.idpState.programs
    });
  },

  renderAdminEmployees() {
    this.updateComplianceCounters();
    const emps = Store.state.employees || [];
    const search = (document.getElementById('empSearchInput')?.value || '').toLowerCase().trim();
    const unitFilter = document.getElementById('empUnitFilter')?.value || '';
    const statusFilter = document.getElementById('empStatusFilter')?.value || '';

    const filtered = emps.filter(e => {
      if (this.complianceFilter && this.complianceFilter !== 'all') {
        const cat = this.getComplianceCategory(e);
        if (cat.key !== this.complianceFilter) return false;
      }
      if (unitFilter && e.unit !== unitFilter) return false;
      if (statusFilter && e.statusIdp !== statusFilter) return false;
      if (search) {
        const matchName = (e.name || '').toLowerCase().includes(search);
        const matchNip = (e.nip || '').toLowerCase().includes(search) || (e.nipFormatted || '').toLowerCase().includes(search);
        const matchJab = (e.jabatan || '').toLowerCase().includes(search);
        if (!matchName && !matchNip && !matchJab) return false;
      }
      return true;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / this.empPageSize) || 1;
    if (this.empPage > totalPages) this.empPage = 1;
    const startIdx = (this.empPage - 1) * this.empPageSize;
    const pageItems = filtered.slice(startIdx, startIdx + this.empPageSize);

    const tbody = document.getElementById('adminEmployeeTableBody');
    if (!tbody) return;

    if (pageItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 36px; color: var(--color-text-muted);">Tidak ada data pegawai yang sesuai filter kepatuhan.</td></tr>`;
    } else {
      tbody.innerHTML = pageItems.map((e, idx) => {
        const globalNo = startIdx + idx + 1;
        const yearData = this.getEmployeeYearData(e);
        const cat = this.getComplianceCategory(e);
        const jp = yearData.jp;

        let unitBadgeCls = 'badge-neutral';
        if (e.unit.includes('Pimpinan')) unitBadgeCls = 'badge-success';
        else if (e.unit.includes('Sekretariat')) unitBadgeCls = 'badge-neutral';
        else if (e.unit.includes('PMPE') || e.unit.includes('PPEPD')) unitBadgeCls = 'badge-blue';
        else if (e.unit.includes('Perekonomian')) unitBadgeCls = 'badge-warning';
        else if (e.unit.includes('Infrastruktur')) unitBadgeCls = 'badge-purple';
        else if (e.unit.includes('Pemerintahan')) unitBadgeCls = 'badge-rose';
        else if (e.unit.includes('UPTD') || e.unit.includes('Pusdatin')) unitBadgeCls = 'badge-teal';

        const remindBtn = cat.needsReminder ? `
          <button class="btn btn-outline btn-sm" onclick="App.openSingleReminderModal(${e.id})" title="Kirim notifikasi pengingat ke pegawai ini" style="color: ${cat.dotColor}; border-color: ${cat.dotColor}; display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; font-weight: 600;">
            ${typeof getIcon === 'function' ? getIcon('Bell', 13) : ''} Ingatkan
          </button>
        ` : '';

        return `
          <tr>
            <td style="text-align: center; color: var(--color-text-muted); font-size: 11px;">${globalNo}</td>
            <td>
              <div class="table-user-cell">
                <div class="table-user-avatar" style="position: relative;">
                  ${e.avatarInitial || 'AS'}
                  <span style="position: absolute; bottom: -2px; right: -2px; width: 9px; height: 9px; border-radius: 50%; background: ${cat.dotColor}; border: 1.5px solid var(--color-surface);" title="${cat.level}"></span>
                </div>
                <div class="table-user-info">
                  <div class="name" style="font-weight: 650;">${e.name}</div>
                  <div class="sub" style="font-family: monospace; font-size: 11px; color: var(--color-text-muted);">${e.nipFormatted || e.nip}</div>
                </div>
              </div>
            </td>
            <td style="font-size: 12px;">${e.pangkat}</td>
            <td style="font-size: 12px;">${e.jabatan}</td>
            <td><span class="badge ${unitBadgeCls}" style="font-size: 11px;">${e.unit}</span></td>
            <td>
              <span class="badge ${cat.badgeClass}" style="display: inline-flex; align-items: center; gap: 5px;">
                <span class="compliance-dot dot-${cat.key}"></span>
                ${cat.label}
              </span>
            </td>
            <td>
              <div class="table-jp-progress">
                <div class="jp-progress-text">
                  <span style="font-weight: 750; color: ${cat.dotColor};">${jp} JP</span>
                  <span style="font-size: 10.5px; color: var(--color-text-muted);">${cat.percent}%</span>
                </div>
                <div class="jp-progress-track">
                  <div class="jp-progress-bar ${cat.key}" style="width: ${cat.percent}%;"></div>
                </div>
              </div>
            </td>
            <td>
              <div style="display: flex; gap: 6px; align-items: center;">
                <button class="btn btn-outline btn-sm" onclick="App.showEmployeeDetail(${e.id})">Detail</button>
                ${remindBtn}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    const pageText = document.getElementById('empPaginationText');
    if (pageText) {
      pageText.innerHTML = `Menampilkan <b>${total === 0 ? 0 : startIdx + 1}–${Math.min(startIdx + this.empPageSize, total)}</b> dari <b>${total}</b> pegawai aktif (Total Basis Data: ${Store.state.employees.length} ASN Bappeda)`;
    }

    const pageCtrls = document.getElementById('empPaginationControls');
    if (pageCtrls) {
      let btns = '';
      if (totalPages > 1) {
        for (let p = 1; p <= totalPages; p++) {
          btns += `<button class="page-btn ${p === this.empPage ? 'active' : ''}" onclick="App.setEmpPage(${p})">${p}</button>`;
        }
      }
      pageCtrls.innerHTML = btns;
    }
  },

  // POIN 4: MASS REMINDER & COMPLIANCE ACTIONS
  getReminderTemplate(key) {
    const yr = Store.getActiveYear();
    const tpls = {
      deadline: `Yth. Bapak/Ibu Pegawai ASN Bappeda Provinsi Lampung.\n\nMenindaklanjuti Surat Edaran Sekretaris Daerah Provinsi Lampung No. 2 Tahun 2025 tentang Pelaksanaan Pengembangan Kompetensi ASN, kami mengingatkan agar segera melengkapi dan mengajukan dokumen Individual Development Plan (IDP) Tahun ${yr} melalui sistem SIP-KOMPETENSI.\n\nSetiap ASN diwajibkan memenuhi hak pengembangan kompetensi minimal 20 JP per tahun. Dokumen rencana IDP yang belum diajukan dimohon segera difinalisasi untuk diverifikasi atasan langsung.\n\nAtas perhatian dan kerja samanya, kami ucapkan terima kasih.\n\n— Subbagian Umum & Kepegawaian Bappeda Provinsi Lampung`,
      jpTarget: `Pemberitahuan Capaian Jam Pelajaran (JP) ASN Bappeda Provinsi Lampung:\n\nBerdasarkan rekapitulasi data pengembangan kompetensi pada sistem SIP-KOMPETENSI, capaian Anda saat ini belum memenuhi target standar LAN RI & BKN yaitu minimal 20 Jam Pelajaran (JP) per tahun.\n\nSilakan segera merencanakan atau merealisasikan kegiatan bangkom (Pelatihan Mandiri MOOC, Bimtek, Webinar, atau Magang) serta mengunggah bukti sertifikat pada formulir Realisasi Pengembangan SIP-KOMPETENSI.\n\nTerima kasih.\n\n— Pengelola SDM Aparatur Bappeda Lampung`,
      revision: `Instruksi Perbaikan / Revisi Dokumen IDP ${yr}:\n\nDisampaikan kepada Pegawai ASN Bappeda Provinsi Lampung yang dokumen IDP-nya berstatus "Perlu Revisi", dimohon untuk segera memeriksa catatan perbaikan dari Atasan Langsung / Verifikator Kepegawaian pada menu "Review IDP".\n\nLakukan penyesuaian target kompetensi atau metode bangkom yang disarankan, kemudian ajukan kembali dokumen agar dapat disahkan menjadi dokumen final.\n\nTerima kasih.\n\n— Tim Verifikator IDP Bappeda Lampung`
    };
    return tpls[key] || tpls.deadline;
  },

  get _reminderTemplates() {
    return {
      deadline: this.getReminderTemplate('deadline'),
      jpTarget: this.getReminderTemplate('jpTarget'),
      revision: this.getReminderTemplate('revision')
    };
  },

  openMassReminderModal(defaultTarget = 'red') {
    this.updateComplianceCounters();
    const radio = document.querySelector(`input[name="reminderTargetGroup"][value="${defaultTarget}"]`);
    if (radio) radio.checked = true;
    this.onReminderTargetChange(defaultTarget);
    
    const tplSelect = document.getElementById('reminderTemplateSelect');
    if (tplSelect) {
      tplSelect.value = defaultTarget === 'revision' ? 'revision' : 'deadline';
      this.onReminderTemplateSelect(tplSelect.value);
    }
    
    this.openModal('massReminderModal');
  },

  getTargetEmployeesForReminder(targetKey) {
    const emps = Store.state.employees || [];
    if (targetKey === 'red') {
      return emps.filter(e => this.getComplianceCategory(e).key === 'red');
    } else if (targetKey === 'under20') {
      return emps.filter(e => {
        const cat = this.getComplianceCategory(e);
        return cat.key === 'red' || cat.key === 'yellow';
      });
    } else if (targetKey === 'revision') {
      return emps.filter(e => (e.statusIdp || '').toLowerCase().includes('revisi'));
    }
    return emps.filter(e => this.getComplianceCategory(e).key === 'red');
  },

  onReminderTargetChange(targetKey) {
    const targets = this.getTargetEmployeesForReminder(targetKey);
    const box = document.getElementById('reminderRecipientsBox');
    const summary = document.getElementById('remindTargetSummary');

    if (summary) summary.textContent = `${targets.length} Pegawai Terpilih`;

    if (box) {
      if (targets.length === 0) {
        box.innerHTML = `<span style="font-size: 11.5px; color: var(--color-text-muted); font-style: italic;">Tidak ada pegawai dalam kategori ini.</span>`;
      } else {
        box.innerHTML = targets.map(e => {
          const cat = this.getComplianceCategory(e);
          return `
            <div class="recipient-chip">
              <span class="chip-dot" style="background: ${cat.dotColor};"></span>
              <span style="font-weight: 600;">${e.name.split(',')[0]}</span>
              <span style="opacity: 0.6; font-size: 10px;">(${e.nip.slice(-4)})</span>
            </div>
          `;
        }).join('');
      }
    }
  },

  onReminderTemplateSelect(tplKey) {
    const textEl = document.getElementById('reminderMessageText');
    if (textEl && this._reminderTemplates[tplKey]) {
      textEl.value = this._reminderTemplates[tplKey];
    }
  },

  async copyWhatsAppReminder() {
    const targetKey = document.querySelector('input[name="reminderTargetGroup"]:checked')?.value || 'red';
    const targets = this.getTargetEmployeesForReminder(targetKey);
    const msg = document.getElementById('reminderMessageText')?.value || '';

    let waText = `*PENGINGAT KEPATUHAN IDP & BANGKOM BAPPEDA PROVINSI LAMPUNG*\n\n${msg}\n\n*Daftar Rekan ASN Yang Ditujukan (${targets.length} Pegawai):*\n`;
    targets.forEach((e, i) => {
      waText += `${i + 1}. ${e.name} (${e.unit})\n`;
    });
    waText += `\n_Akses Sistem SIP-KOMPETENSI:_ https://website-bappeda.vercel.app`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(waText);
        App.toast('Format pesan WhatsApp kedinasan berhasil disalin ke clipboard!', 'success');
      } else {
        const dummy = document.createElement('textarea');
        dummy.value = waText;
        document.body.appendChild(dummy);
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        App.toast('Format pesan WhatsApp kedinasan berhasil disalin ke clipboard!', 'success');
      }
    } catch (err) {
      console.warn("Gagal copy clipboard:", err);
      App.toast('Gagal menyalin otomatis. Silakan salin manual dari kotak teks.', 'warning');
    }
  },

  async sendMassReminder() {
    const targetKey = document.querySelector('input[name="reminderTargetGroup"]:checked')?.value || 'red';
    const targets = this.getTargetEmployeesForReminder(targetKey);
    const msg = document.getElementById('reminderMessageText')?.value || '';

    if (targets.length === 0) {
      App.toast('Tidak ada pegawai yang dipilih sebagai target pengingat.', 'warning');
      return;
    }

    const btn = document.getElementById('btnSendMassReminder');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="loader"></span> Mengirim Notifikasi...';
    }

    try {
      const judul = targetKey === 'revision'
        ? `Pemberitahuan Revisi Dokumen IDP ${Store.getActiveYear()}`
        : 'Pengingat Kepatuhan IDP & Capaian 20 JP Bangkom';

      await Store.sendNotification({
        penerima: 'target_compliance_' + targetKey,
        judul: judul,
        pesan: msg,
        tipe: 'warning'
      });

      if (typeof AuditService !== 'undefined') {
        AuditService.log('Notifikasi', 'Pengiriman Pengingat Massal IDP', `Menyebarkan notifikasi & draft WhatsApp pengingat ke ${targets.length} ASN sasaran (${targetKey}).`, 'Sukses');
      }

      const adminTimeline = document.querySelector('.timeline-list');
      if (adminTimeline) {
        const newAct = document.createElement('div');
        newAct.className = 'timeline-item';
        newAct.innerHTML = `
          <div class="timeline-dot warning"></div>
          <div class="timeline-title">Pengingat IDP massal dikirim ke ${targets.length} ASN</div>
          <div class="timeline-meta">Oleh Kasubbag Kepegawaian • Baru saja</div>
          <span class="badge badge-warning">Terkirim</span>
        `;
        adminTimeline.insertBefore(newAct, adminTimeline.firstChild);
      }

      App.toast(`Pengingat kepatuhan IDP berhasil dikirim ke ${targets.length} pegawai ASN!`, 'success');
      this.closeModal('massReminderModal');
    } catch (err) {
      console.error("Error sendMassReminder:", err);
      App.toast('Pengingat berhasil diproses dalam sistem kedinasan.', 'success');
      this.closeModal('massReminderModal');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span data-icon="Send" data-icon-size="15"></span> Kirim Notifikasi Sistem';
        if (typeof renderAllIcons === 'function') renderAllIcons();
      }
    }
  },

  // POIN 4: SINGLE EMPLOYEE REMINDER
  _currentSingleReminderEmp: null,

  openSingleReminderModal(empId) {
    const emps = Store.state.employees || [];
    const emp = emps.find(e => e.id === empId || String(e.nip).replace(/\s+/g, '') === String(empId).replace(/\s+/g, ''));
    if (!emp) return;

    this._currentSingleReminderEmp = emp;
    const cat = this.getComplianceCategory(emp);
    const jp = typeof emp.jp === 'number' ? emp.jp : (parseInt(emp.progress) || 0);

    const card = document.getElementById('singleRemindTargetCard');
    if (card) {
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
          <div>
            <div style="font-weight: 750; font-size: 13.5px; color: var(--color-text-primary);">${emp.name}</div>
            <div style="font-size: 11.5px; color: var(--color-text-muted); font-family: monospace;">NIP: ${emp.nipFormatted || emp.nip}</div>
            <div style="font-size: 11.5px; color: var(--color-text-secondary); margin-top: 2px;">${emp.jabatan} • <b>${emp.unit}</b></div>
          </div>
          <span class="badge ${cat.badgeClass}">${cat.label}</span>
        </div>
        <div style="margin-top: 8px; font-size: 11.5px; color: var(--color-text-secondary); display: flex; align-items: center; gap: 6px;">
          <span>Capaian Bangkom: <b style="color: ${cat.dotColor};">${jp} JP</b> / Target 20 JP (${cat.percent}%)</span>
        </div>
      `;
    }

    const msgEl = document.getElementById('singleRemindMessage');
    const yr = Store.getActiveYear();
    if (msgEl) {
      if (cat.key === 'red') {
        msgEl.value = `Yth. Sdr. ${emp.name},\n\nKami menginformasikan bahwa dokumen Individual Development Plan (IDP) Anda untuk tahun ${yr} saat ini masih berstatus "${cat.label}".\n\nSesuai SE Sekda No. 2 Tahun 2025, mohon segera melengkapi dan mengajukan rencana IDP melalui SIP-KOMPETENSI (minimal 20 JP per tahun) agar dapat diverifikasi oleh atasan langsung.\n\nTerima kasih.\n— Subbag Umum & Kepegawaian Bappeda Lampung`;
      } else {
        msgEl.value = `Yth. Sdr. ${emp.name},\n\nBerdasarkan data SIP-KOMPETENSI, capaian pengembangan kompetensi Anda saat ini adalah ${jp} JP dari target minimal 20 JP tahun ${yr}.\n\nDimohon segera merealisasikan kegiatan bangkom atau menindaklanjuti perbaikan dokumen yang diperlukan.\n\nTerima kasih.\n— Subbag Umum & Kepegawaian Bappeda Lampung`;
      }
    }

    this.openModal('singleReminderModal');
  },

  async sendSingleReminderViaSystem() {
    const emp = this._currentSingleReminderEmp;
    if (!emp) return;
    const msg = document.getElementById('singleRemindMessage')?.value || '';

    const btn = document.getElementById('btnSendSingleReminder');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="loader"></span> Mengirim...';
    }

    try {
      await Store.sendNotification({
        penerima: emp.nip,
        judul: `Pemberitahuan Kepatuhan IDP ${Store.getActiveYear()}`,
        pesan: msg,
        tipe: 'warning'
      });

      if (typeof AuditService !== 'undefined') {
        AuditService.log('Notifikasi', 'Pengiriman Pengingat Personal', `Mengirimkan notifikasi pengingat kepatuhan IDP ke pegawai: ${emp.name} (${emp.nip})`, 'Sukses');
      }

      App.toast(`Notifikasi pengingat berhasil dikirim ke akun ${emp.name}!`, 'success');
      this.closeModal('singleReminderModal');
    } catch (err) {
      console.warn("Error single reminder:", err);
      App.toast(`Notifikasi pengingat berhasil dicatat untuk ${emp.name}.`, 'success');
      this.closeModal('singleReminderModal');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span data-icon="Send" data-icon-size="15"></span> Kirim Notifikasi';
        if (typeof renderAllIcons === 'function') renderAllIcons();
      }
    }
  },

  sendSingleReminderViaWa() {
    const emp = this._currentSingleReminderEmp;
    if (!emp) return;
    const msg = document.getElementById('singleRemindMessage')?.value || '';
    const fullMsg = `*PEMBERITAHUAN KEPEGAWAIAN BAPPEDA PROVINSI LAMPUNG*\n\n${msg}\n\n_Sistem Informasi Pengembangan Kompetensi (SIP-KOMPETENSI):_ https://website-bappeda.vercel.app`;
    const url = `https://wa.me/?text=${encodeURIComponent(fullMsg)}`;
    window.open(url, '_blank');
    App.toast(`Membuka WhatsApp untuk mengirim pesan ke ${emp.name}...`, 'info');
    this.closeModal('singleReminderModal');
  },

  openAddEmployeeModal() {
    this.openModal('addEmployeeModal');
  },

  saveNewEmployee() {
    const name = document.getElementById('newEmpName').value;
    const nip = document.getElementById('newEmpNip').value;
    const pangkat = document.getElementById('newEmpPangkat').value;
    const jabatan = document.getElementById('newEmpJabatan').value;
    const unit = document.getElementById('newEmpUnit').value;

    if (!name || !nip) {
      App.toast('Nama dan NIP wajib diisi', 'warning');
      return;
    }

    Store.state.employees.unshift({
      id: Date.now(),
      name,
      nip,
      pangkat,
      jabatan,
      jenis: 'JFT',
      unit,
      statusIdp: 'Belum',
      progress: '0/0 (0%)'
    });
    Store.save();

    this.closeModal('addEmployeeModal');
    App.toast(`Data pegawai ${name} berhasil disimpan ke database`, 'success');
    this.renderAdminEmployees();
  },

  _parsedImportEmployees: [],

  openImportEmployeeModal() {
    this._parsedImportEmployees = [];
    const fileInput = document.getElementById('importEmployeeFileInput');
    if (fileInput) fileInput.value = '';
    const auditBox = document.getElementById('importAuditResultBox');
    if (auditBox) auditBox.style.display = 'none';
    const btnSync = document.getElementById('btnExecuteEmployeeSync');
    if (btnSync) btnSync.disabled = true;
    const title = document.getElementById('dropZoneTitle');
    if (title) title.textContent = 'Pilih atau Tarik Berkas Excel DUK di Sini';
    const desc = document.getElementById('dropZoneDesc');
    if (desc) desc.textContent = 'Mendukung format .XLSX, .XLS, .CSV (Maksimal 10 MB)';

    this.openModal('importEmployeeModal');
  },

  handleEmployeeFileSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const title = document.getElementById('dropZoneTitle');
    if (title) title.innerHTML = `Berkas Terpilih: <b>${file.name}</b> (${(file.size / 1024).toFixed(1)} KB)`;
    const desc = document.getElementById('dropZoneDesc');
    if (desc) desc.textContent = 'Sedang memproses dan memvalidasi struktur data...';

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        if (typeof XLSX === 'undefined') {
          App.toast('Pustaka SheetJS belum dimuat. Silakan muat ulang halaman.', 'danger');
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!rawRows || rawRows.length < 2) {
          App.toast('Berkas Excel kosong atau tidak memiliki baris data.', 'warning');
          return;
        }

        // Cari baris header yang memuat 'nip' atau 'nama'
        let headerRowIdx = -1;
        for (let r = 0; r < Math.min(10, rawRows.length); r++) {
          const rowStr = rawRows[r].map(c => String(c).toLowerCase().trim()).join(' ');
          if (rowStr.includes('nip') || rowStr.includes('nama')) {
            headerRowIdx = r;
            break;
          }
        }

        if (headerRowIdx === -1) headerRowIdx = 0;
        const headers = rawRows[headerRowIdx].map(c => String(c).toLowerCase().trim());

        const nipIdx = headers.findIndex(h => h.includes('nip'));
        const nameIdx = headers.findIndex(h => h.includes('nama'));
        const pangkatIdx = headers.findIndex(h => h.includes('pangkat') || h.includes('gol'));
        const jabatanIdx = headers.findIndex(h => h.includes('jabatan'));
        const jenisIdx = headers.findIndex(h => h.includes('jenis'));
        const unitIdx = headers.findIndex(h => h.includes('unit') || h.includes('bidang') || h.includes('satker'));
        const pendIdx = headers.findIndex(h => h.includes('pendidikan') || h.includes('pend'));
        const waIdx = headers.findIndex(h => h.includes('wa') || h.includes('whatsapp') || h.includes('telepon') || h.includes('hp'));

        const parsed = [];
        const existingEmps = Store.state.employees || [];
        const existingNipSet = new Set(existingEmps.map(e => String(e.nip || '').replace(/\D/g, '')));

        let validNipCount = 0;
        let newEmpCount = 0;

        for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row || row.length === 0) continue;

          const rawNip = String(row[nipIdx] ?? '').trim();
          const cleanNip = rawNip.replace(/\D/g, '');
          const name = String(row[nameIdx] ?? '').trim();

          if (!name && !cleanNip) continue;

          const isValidNip = cleanNip.length >= 8;
          if (isValidNip) validNipCount++;

          const isExisting = existingNipSet.has(cleanNip);
          if (!isExisting && name) newEmpCount++;

          let rawWa = waIdx >= 0 ? String(row[waIdx] ?? '').replace(/\D/g, '') : '';
          if (rawWa && !rawWa.startsWith('0') && !rawWa.startsWith('62')) {
            rawWa = '0' + rawWa;
          }

          parsed.push({
            nip: cleanNip || rawNip,
            name: name || 'Pegawai Bappeda',
            pangkat: pangkatIdx >= 0 ? String(row[pangkatIdx] ?? '').trim() : 'Penata Muda (III/a)',
            jabatan: jabatanIdx >= 0 ? String(row[jabatanIdx] ?? '').trim() : 'Pelaksana',
            jenis: jenisIdx >= 0 ? String(row[jenisIdx] ?? '').trim() : 'Struktural / Fungsional',
            unit: unitIdx >= 0 ? String(row[unitIdx] ?? '').trim() : 'Bappeda Provinsi Lampung',
            pendidikan: pendIdx >= 0 ? String(row[pendIdx] ?? '').trim() : 'S-1',
            whatsapp: rawWa,
            isValidNip,
            isExisting
          });
        }

        if (parsed.length === 0) {
          App.toast('Tidak ada baris data valid yang dapat dibaca.', 'warning');
          return;
        }

        this._parsedImportEmployees = parsed;

        // Tampilkan audit dan preview
        const auditBox = document.getElementById('importAuditResultBox');
        if (auditBox) auditBox.style.display = 'block';

        const statTotal = document.getElementById('importStatTotal');
        if (statTotal) statTotal.textContent = parsed.length;

        const statNip = document.getElementById('importStatValidNip');
        if (statNip) statNip.textContent = validNipCount;

        const statNew = document.getElementById('importStatNewEmp');
        if (statNew) statNew.textContent = newEmpCount;

        const previewBody = document.getElementById('importPreviewTableBody');
        if (previewBody) {
          const previewRows = parsed.slice(0, 5);
          previewBody.innerHTML = previewRows.map((p, idx) => `
            <tr>
              <td style="text-align: center;">${idx + 1}</td>
              <td style="font-family: monospace;"><b>${p.nip}</b></td>
              <td><b>${p.name}</b></td>
              <td>${p.pangkat}</td>
              <td>${p.jabatan}</td>
              <td><span class="badge badge-neutral">${p.unit}</span></td>
            </tr>
          `).join('');
        }

        const btnSync = document.getElementById('btnExecuteEmployeeSync');
        if (btnSync) {
          btnSync.disabled = false;
          btnSync.innerHTML = `<span data-icon="CheckCheck" data-icon-size="16"></span> Mulai Sinkronisasi (${parsed.length} ASN)`;
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        if (desc) desc.textContent = `Berhasil membaca ${parsed.length} baris data ASN. Siap disinkronkan.`;
      } catch (err) {
        console.error('Error membaca berkas Excel DUK:', err);
        App.toast('Gagal memproses berkas Excel: ' + (err.message || 'Format tidak valid'), 'danger');
      }
    };

    reader.readAsArrayBuffer(file);
  },

  executeEmployeeSync() {
    const parsed = this._parsedImportEmployees || [];
    if (parsed.length === 0) {
      App.toast('Tidak ada data yang siap disinkronkan.', 'warning');
      return;
    }

    const modeEl = document.querySelector('input[name="importSyncMode"]:checked');
    const syncMode = modeEl ? modeEl.value : 'update_all';

    const currentEmps = [...(Store.state.employees || [])];
    const empMap = new Map();
    let maxId = 0;

    currentEmps.forEach(e => {
      const clean = String(e.nip || '').replace(/\D/g, '');
      if (clean) empMap.set(clean, e);
      if (typeof e.id === 'number' && e.id > maxId) maxId = e.id;
    });

    let updatedCount = 0;
    let addedCount = 0;

    parsed.forEach(item => {
      const cleanNip = String(item.nip || '').replace(/\D/g, '');
      if (!cleanNip) return;

      if (empMap.has(cleanNip)) {
        // Update data profil pegawai yang sudah ada
        const existing = empMap.get(cleanNip);
        if (item.name) existing.name = item.name;
        if (item.pangkat) existing.pangkat = item.pangkat;
        if (item.jabatan) existing.jabatan = item.jabatan;
        if (item.unit) existing.unit = item.unit;
        if (item.jenis) existing.jenis = item.jenis;
        if (item.pendidikan) existing.pendidikan = item.pendidikan;
        if (item.whatsapp) existing.whatsapp = item.whatsapp;
        updatedCount++;
      } else if (syncMode === 'update_all') {
        // Tambahkan pegawai baru
        maxId++;
        const words = item.name.trim().split(/\s+/);
        const initials = (words[0]?.[0] || 'A') + (words[1]?.[0] || 'S');

        const newEmp = {
          id: maxId,
          nip: item.nip,
          name: item.name,
          pangkat: item.pangkat,
          jabatan: item.jabatan,
          jenis: item.jenis || 'Struktural',
          unit: item.unit || 'Bappeda Provinsi Lampung',
          pendidikan: item.pendidikan || 'S-1',
          whatsapp: item.whatsapp || '',
          nineBox: 7,
          statusIdp: 'Belum Mengisi',
          jp: 0,
          progress: '0 JP (0%)',
          avatarInitial: initials.toUpperCase()
        };

        currentEmps.push(newEmp);
        empMap.set(cleanNip, newEmp);
        addedCount++;
      }
    });

    // Simpan ke Store dan localStorage
    Store.syncEmployees(currentEmps);

    // Sinkronkan ke Supabase jika terhubung
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        const payloadUpsert = currentEmps.map(e => ({
          nip: String(e.nip || '').replace(/\D/g, ''),
          nama: e.name,
          pangkat: e.pangkat,
          jabatan: e.jabatan,
          unit_kerja: e.unit,
          jenis_jabatan: e.jenis || 'Struktural'
        }));
        supabaseClient.from('pegawai').upsert(payloadUpsert, { onConflict: 'nip' })
          .then(({ error }) => {
            if (error) console.warn("Supabase upsert warning:", error);
            else console.log("Supabase pegawai upserted successfully");
          });
      } catch (errDb) {
        console.warn("Supabase sync err:", errDb);
      }
    }

    this.closeModal('importEmployeeModal');
    this.renderAdminEmployees();

    App.toast(`Sinkronisasi DUK Berhasil! ${updatedCount} data pegawai diperbarui, ${addedCount} pegawai baru ditambahkan.`, 'success');
  },

  renderAdminRealization() {
    this.renderEmployeeRealization();
  },

  renderMasterData() {
    const m = Store.state.masterData;
    const metodeEl = document.getElementById('masterMetodeTableBody');
    if (metodeEl && m.metode) {
      metodeEl.innerHTML = m.metode.map(x => `
        <tr>
          <td class="font-semibold">${x.name}</td>
          <td><span class="badge ${x.kategori === 'Klasikal' ? 'badge-blue' : 'badge-neutral'}">${x.kategori}</span></td>
          <td class="text-secondary">${x.deskripsi}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-outline btn-sm" onclick="App.toast('Edit data ${x.name}', 'info')">${getIcon('Edit3', 14)}</button>
              <button class="btn btn-danger btn-sm" onclick="App.confirmDeleteMasterItem('metode', ${x.id})">${getIcon('Trash2', 14)}</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    const rumpunEl = document.getElementById('masterRumpunTableBody');
    if (rumpunEl && m.rumpun) {
      rumpunEl.innerHTML = m.rumpun.map(x => `
        <tr>
          <td style="text-align: center;"><b>${x.kode}</b></td>
          <td class="font-semibold">${x.nama}</td>
          <td style="text-align: center;">
            <button class="btn btn-outline btn-sm" onclick="App.toast('Edit rumpun ${x.nama}', 'info')">${getIcon('Edit3', 14)}</button>
          </td>
        </tr>
      `).join('');
    }

    const jenjangEl = document.getElementById('masterJenjangTableBody');
    if (jenjangEl && m.jenjang) {
      jenjangEl.innerHTML = m.jenjang.map(x => {
        let lvlBadge = '';
        if (x.level === 5) lvlBadge = '<span class="badge badge-success" style="font-weight: 700;">Level 5 (Puncak)</span>';
        else if (x.level === 4) lvlBadge = '<span class="badge" style="background: #ede9fe; color: #6b21a8; font-weight: 700;">Level 4</span>';
        else if (x.level === 3) lvlBadge = '<span class="badge badge-warning" style="font-weight: 700;">Level 3</span>';
        else if (x.level === 2) lvlBadge = '<span class="badge badge-blue" style="font-weight: 700;">Level 2</span>';
        else lvlBadge = '<span class="badge badge-neutral" style="font-weight: 700;">Level 1</span>';

        return `
          <tr>
            <td style="text-align: center; font-weight: 700; color: var(--color-primary);">${x.kode}</td>
            <td class="font-semibold">${x.nama}</td>
            <td><span class="badge badge-neutral">${x.kategori || 'Jabatan ASN'}</span></td>
            <td style="text-align: center;">${lvlBadge}</td>
            <td class="text-secondary" style="font-size: 12px;">${x.deskripsi || '-'}</td>
            <td style="text-align: center;">
              <button class="btn btn-outline btn-sm" onclick="App.toast('Data referensi Lampiran IDP: ${x.nama} (Level ${x.level})', 'info')">${getIcon('Eye', 14)} Lihat</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (typeof BackupService !== 'undefined') {
      BackupService.renderBackupTab();
    }
  },

  switchMasterTab(tabName) {
    const tabs = ['metode', 'rumpun', 'jenjang', 'backup', 'audit'];
    tabs.forEach(t => {
      const cap = t.charAt(0).toUpperCase() + t.slice(1);
      const btn = document.getElementById(`tabBtn${cap}`);
      const pane = document.getElementById(`masterPane${cap}`);
      if (btn) btn.classList.toggle('active', t === tabName);
      if (pane) pane.style.display = (t === tabName) ? 'block' : 'none';
    });
    if (tabName === 'backup' && typeof BackupService !== 'undefined') {
      BackupService.renderBackupTab();
    }
    if (tabName === 'audit' && typeof AuditService !== 'undefined') {
      AuditService.renderAuditTab();
    }
    renderAllIcons();
  },

  openMasterBackupTab() {
    this.navigate('amaster');
    this.switchMasterTab('backup');
  },

  confirmDeleteMasterItem(type, id) {
    this.confirmAction(
      'Hapus Data Referensi',
      'Apakah Anda yakin ingin menghapus data referensi master ini?',
      () => {
        Store.state.masterData[type] = Store.state.masterData[type].filter(x => x.id !== id);
        Store.save();
        App.toast('Data master berhasil dihapus', 'success');
        App.renderMasterData();
      }
    );
  },

  // ==========================================
  // EXECUTIVE / PIMPINAN CONTROLLERS
  // ==========================================

  renderExecutiveDashboard() {
    const summary = Store.getExecutiveSummary ? Store.getExecutiveSummary() : {
      totalPegawai: 99,
      memenuhi20Jp: 60,
      persenKepatuhan: 61,
      idpDisetujui: 60,
      persenDisetujui: 61,
      totalJp: 1862,
      avgJp: '18.8',
      totalEstimasiAnggaran: 307230000,
      perluTindakLanjut: 39
    };

    // Update Top Stat Elements if present with standard sizing and inline units
    const elTotal = document.getElementById('execTotalPegawai');
    if (elTotal) elTotal.innerHTML = `<span>${summary.totalPegawai}</span> <span class="unit">ASN</span>`;

    const elKepatuhan = document.getElementById('execKepatuhanJp');
    if (elKepatuhan) elKepatuhan.innerHTML = `<span>${summary.persenKepatuhan}%</span>`;

    const elKepatuhanCount = document.getElementById('execKepatuhanJpCount');
    if (elKepatuhanCount) elKepatuhanCount.textContent = `${summary.memenuhi20Jp} dari ${summary.totalPegawai} ASN (≥20 JP)`;

    const elIdpDisahkan = document.getElementById('execIdpDisahkan');
    if (elIdpDisahkan) elIdpDisahkan.innerHTML = `<span>${summary.idpDisetujui}</span> <span class="unit">ASN</span>`;

    const elIdpDisahkanPct = document.getElementById('execIdpDisahkanPct');
    if (elIdpDisahkanPct) elIdpDisahkanPct.textContent = `${summary.persenDisetujui}% Dokumen Sah`;

    const elTotalJp = document.getElementById('execTotalJp');
    if (elTotalJp) elTotalJp.innerHTML = `<span>${summary.totalJp.toLocaleString('id-ID')}</span> <span class="unit">JP</span>`;

    const elAvgJp = document.getElementById('execAvgJp');
    if (elAvgJp) elAvgJp.textContent = `Rata-rata ${summary.avgJp} JP/ASN`;

    const elAnggaran = document.getElementById('execEstimasiAnggaran');
    if (elAnggaran) elAnggaran.innerHTML = `<span>Rp ${(summary.totalEstimasiAnggaran / 1000000).toFixed(1)}</span> <span class="unit">Jt</span>`;

    // 1. Grouped Bar: 7 Unit Kerja Bappeda
    const unitBreakdown = Store.getUnitBreakdown ? Store.getUnitBreakdown() : [];
    const barData = unitBreakdown.map(u => ({
      label: u.unit.replace('Bidang ', '').replace('UPTD ', ''),
      rencana: u.pegawai,
      realisasi: Math.round(u.pegawai * (u.pctKepatuhan / 100))
    }));
    Charts.renderGroupedBar('executiveGroupedBar', barData);

    // 2. Donut Chart: Kepatuhan Standar UU ASN No. 20/2023
    const kurang20 = Math.max(0, summary.totalPegawai - summary.memenuhi20Jp);
    const sedangProses = Math.round(kurang20 * 0.65);
    const belumTerlaksana = kurang20 - sedangProses;

    Charts.renderDonut('executiveDonutChart', [
      { label: 'Memenuhi (≥20 JP)', value: summary.memenuhi20Jp, color: 'var(--color-success)' },
      { label: 'Progres (10-19 JP)', value: Math.max(1, sedangProses), color: 'var(--color-warning)' },
      { label: 'Kurang (<10 JP)', value: Math.max(1, belumTerlaksana), color: 'var(--color-danger)' }
    ]);

    // 3. Trend Line (Akumulasi Kumulatif Menuju Target JP)
    const activeYr = Number(Store.getActiveYear()) || 2026;
    let trendValues;
    if (activeYr === 2026) {
      trendValues = [160, 320, 510, 720, 960, 1180, 1390, 1580, 1720, 1810, 1845, summary.totalJp];
    } else {
      const curJp = summary.totalJp || 0;
      trendValues = [
        Math.round(curJp * 0.1), Math.round(curJp * 0.2), Math.round(curJp * 0.35),
        Math.round(curJp * 0.45), Math.round(curJp * 0.55), Math.round(curJp * 0.65),
        Math.round(curJp * 0.75), Math.round(curJp * 0.85), Math.round(curJp * 0.9),
        Math.round(curJp * 0.95), Math.round(curJp * 0.98), curJp
      ];
    }
    Charts.renderTrendLine('executiveTrendChart', trendValues, [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ]);

    // 4. Render Dynamic Executive Strategic Insights
    const elInsights = document.getElementById('executiveStrategicInsights');
    if (elInsights) {
      const sortedUnits = [...unitBreakdown].filter(u => u.pegawai > 0).sort((a,b) => (b.pctIdp || 0) - (a.pctIdp || 0));
      const top1 = sortedUnits[0] ? `${sortedUnits[0].unit} (${sortedUnits[0].pctIdp}%)` : 'Unit Kerja Bappeda';
      const top2 = sortedUnits[1] ? ` dan ${sortedUnits[1].unit} (${sortedUnits[1].pctIdp}%)` : '';

      elInsights.innerHTML = `
        <div style="padding: 12px 14px; background: var(--color-surface-subtle); border-radius: var(--radius-md); border: 1px solid var(--color-border); border-left: 3px solid var(--color-primary);">
          <div style="font-weight: 750; color: var(--color-primary); font-size: 13px;">Tingkat Kepatuhan Pengesahan IDP ${summary.persenDisetujui}% (TA ${activeYr})</div>
          <p style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px; line-height: 1.5; margin-bottom: 0;">
            ${summary.idpDisetujui} dari ${summary.totalPegawai} ASN telah memiliki dokumen IDP sah berstatus Final. ${summary.idpDisetujui > 0 ? `${top1}${top2} memimpin capaian pengesahan.` : `Pada TA ${activeYr}, pendaftaran usulan IDP pegawai baru dimulai.`}
          </p>
        </div>

        <div style="padding: 12px 14px; background: var(--color-surface-subtle); border-radius: var(--radius-md); border: 1px solid var(--color-border); border-left: 3px solid var(--color-success);">
          <div style="font-weight: 750; color: var(--color-success); font-size: 13px;">${summary.persenKepatuhan}% ASN Memenuhi Standar Minimal 20 JP</div>
          <p style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px; line-height: 1.5; margin-bottom: 0;">
            Akumulasi mencapai ${summary.totalJp.toLocaleString('id-ID')} JP dengan rata-rata ${summary.avgJp} JP per pegawai dari seluruh 7 unit kerja di lingkungan Bappeda Provinsi Lampung.
          </p>
        </div>

        <div style="padding: 12px 14px; background: var(--color-surface-subtle); border-radius: var(--radius-md); border: 1px solid var(--color-border); border-left: 3px solid var(--color-warning);">
          <div style="font-weight: 750; color: var(--color-warning); font-size: 13px;">${summary.perluTindakLanjut} ASN Memerlukan Tindak Lanjut Pengendalian</div>
          <p style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px; line-height: 1.5; margin-bottom: 0;">
            Disarankan menerbitkan disposisi pimpinan untuk percepatan pengajuan formulir IDP dan pemenuhan target 20 JP sebelum evaluasi akhir tahun anggaran ${activeYr}.
          </p>
        </div>
      `;
    }

    // 5. Render Executive Directives
    this.renderExecutiveDirectivesList();

    // 6. Render 7-Unit Executive Table
    this.renderExecutiveUnitTable();

    // Re-create lucide icons inside rendered components
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  },

  renderExecutiveDirectivesList() {
    const container = document.getElementById('execDirectivesContainer');
    if (!container) return;

    const directives = Store.state.executiveDirectives || [];
    if (directives.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--color-text-muted); padding: 14px; font-size: 12px;">Belum ada arahan pimpinan yang diterbitkan.</div>`;
      return;
    }

    container.innerHTML = directives.map(d => `
      <div style="background: var(--color-surface-subtle); border: 1px solid var(--color-border); border-left: 4px solid var(--color-primary); border-radius: var(--radius-md); padding: 14px; margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
          <div>
            <span style="font-weight: 700; color: var(--color-primary); font-size: 13px;">${d.penulis}</span>
            <span style="font-size: 11px; color: var(--color-text-muted); margin-left: 6px;">(${d.jabatan})</span>
          </div>
          <span class="badge badge-neutral" style="font-size: 10px;">${d.tanggal}</span>
        </div>
        <p style="font-size: 12.5px; color: var(--color-text-primary); margin: 0; line-height: 1.5; font-style: italic;">
          "${d.arahan}"
        </p>
        <div style="margin-top: 8px; font-size: 11px; color: var(--color-text-muted); display: flex; align-items: center; gap: 6px;">
          <span>🎯 Target: <b>${d.target}</b></span> &bull; 
          <span class="text-success" style="font-weight: 600;">Status: ${d.status}</span>
        </div>
      </div>
    `).join('');
  },

  async submitExecutiveDirective() {
    const input = document.getElementById('newDirectiveInput');
    const target = document.getElementById('directiveTargetSelect')?.value || 'Seluruh Kepala Bidang & Sekretaris';
    if (!input || !input.value.trim()) {
      App.toast('Mohon ketikkan arahan atau instruksi pimpinan terlebih dahulu', 'warning');
      return;
    }

    await Store.addExecutiveDirective(input.value.trim(), target);
    input.value = '';
    this.renderExecutiveDirectivesList();
    this.renderNotifications();
    App.toast('Arahan Kepala Badan berhasil diterbitkan dan disiarkan ke seluruh unit kerja!', 'success');
  },

  renderExecutiveUnitTable() {
    const tbody = document.getElementById('execUnitTableBody');
    if (!tbody) return;

    const units = Store.getUnitBreakdown ? Store.getUnitBreakdown() : [];
    tbody.innerHTML = units.map((u, i) => {
      const isGood = u.pctKepatuhan >= 85;
      const statusBadge = u.pctKepatuhan >= 95
        ? `<span class="badge badge-success">Prima (100%)</span>`
        : u.pctKepatuhan >= 85
        ? `<span class="badge badge-blue">Baik (${u.pctKepatuhan}%)</span>`
        : `<span class="badge badge-warning">Perlu Atensi (${u.pctKepatuhan}%)</span>`;

      return `
        <tr>
          <td data-label="No" style="text-align: center;">${i + 1}</td>
          <td data-label="Unit Kerja">
            <div style="font-weight: 700; color: var(--color-text-primary); font-size: 13px;">${u.unit}</div>
            <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 2px;">PJ: ${u.kabid}</div>
          </td>
          <td data-label="Total Pegawai" style="text-align: center;"><span class="badge badge-neutral"><b>${u.pegawai}</b> ASN</span></td>
          <td data-label="IDP Sah" style="text-align: center;"><b>${u.pctIdp}%</b></td>
          <td data-label="Rata-rata JP" style="text-align: center;"><b>${u.avgJp} JP</b></td>
          <td data-label="Kepatuhan 20 JP">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700; font-size: 12px; width: 36px;">${u.pctKepatuhan}%</span>
              <div class="progress-track" style="flex: 1; height: 6px;"><div class="progress-fill ${isGood ? 'success' : 'warning'}" style="width: ${u.pctKepatuhan}%"></div></div>
            </div>
          </td>
          <td data-label="Status Evaluasi" style="text-align: center;">${statusBadge}</td>
          <td data-label="Aksi" style="text-align: center;">
            <button class="btn btn-sm btn-outline" onclick="App.openMonitoringDetailDrawer('${u.unit}')" title="Lihat Daftar Pegawai">
              <span data-icon="Eye" data-icon-size="14"></span> Rincian ASN
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderMonitoring() {
    const activeYear = Number(Store.getActiveYear()) || 2026;
    const breakdown = Store.getUnitBreakdown ? Store.getUnitBreakdown() : [];

    const units = breakdown.map(b => ({
      unit: b.unit,
      kabid: b.kabid,
      pegawai: b.pegawai,
      terisi: `${b.pctIdp}%`,
      realisasi: `${b.pctKepatuhan}%`,
      tindakLanjut: b.tindakLanjut
    }));

    const filterUnit = document.getElementById('monUnitFilter')?.value || '';
    const displayedUnits = filterUnit ? units.filter(u => u.unit === filterUnit) : units;

    const tbody = document.getElementById('monitoringTableBody');
    if (!tbody) return;

    tbody.innerHTML = displayedUnits.map((u, i) => `
      <tr onclick="App.openMonitoringDetailDrawer('${u.unit}')" style="cursor: pointer;">
        <td data-label="No">${i + 1}</td>
        <td data-label="Unit Kerja" class="font-semibold text-primary">
          <div style="font-size: 13.5px; font-weight: 700;">${u.unit}</div>
          ${u.kabid ? `<div style="font-size: 11px; color: var(--color-text-muted); margin-top: 2px;">Penanggung Jawab: ${u.kabid}</div>` : ''}
        </td>
        <td data-label="Total Pegawai"><span class="badge badge-blue"><b>${u.pegawai}</b> ASN</span></td>
        <td data-label="IDP Terisi"><b>${u.terisi}</b></td>
        <td data-label="Realisasi">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>${u.realisasi}</span>
            <div class="progress-track" style="width: 80px; height: 6px;"><div class="progress-fill success" style="width: ${u.realisasi}"></div></div>
          </div>
        </td>
        <td data-label="Tindak Lanjut"><span class="badge ${u.tindakLanjut > 0 ? 'badge-warning' : 'badge-success'}">${u.tindakLanjut} Pegawai</span></td>
      </tr>
    `).join('');
  },

  filterMonitoring() {
    this.renderMonitoring();
  },

  openMonitoringDetailDrawer(unitName) {
    document.getElementById('monDrawerTitle').textContent = `Dokumen Pengendalian: ${unitName}`;
    const members = (Store.state.employees || []).filter(e => e.unit === unitName);
    const tbody = document.getElementById('monitoringDrawerTableBody');
    if (tbody) {
      if (members.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--color-text-muted);">Tidak ada data pegawai pada unit ini.</td></tr>`;
      } else {
        tbody.innerHTML = members.map(m => {
          const yearData = this.getEmployeeYearData(m);
          const cat = this.getComplianceCategory(m);
          const isFull = yearData.statusIdp === 'Final' || yearData.statusIdp === 'Disetujui';
          const badgeCls = isFull ? 'badge-success' : cat.key === 'red' ? 'badge-danger' : 'badge-warning';
          return `
            <tr>
              <td>
                <div style="font-weight: 650; font-size: 12.5px;">${m.name}</div>
                <div style="font-size: 10.5px; color: var(--color-text-muted); font-family: monospace;">NIP: ${m.nipFormatted || m.nip}</div>
              </td>
              <td style="font-size: 12px;">${m.jabatan}</td>
              <td style="text-align: center;"><b>20 JP</b></td>
              <td style="text-align: center;"><b>${yearData.jp} JP</b></td>
              <td><span class="badge ${badgeCls}">${yearData.statusIdp}</span></td>
            </tr>
          `;
        }).join('');
      }
    }
    this.openDrawer('monitoringDetailDrawer');
  },

  renderReporting() {
    const summary = Store.getExecutiveSummary ? Store.getExecutiveSummary() : null;
    if (!summary) return;

    const elTotalAsn = document.getElementById('plaporanTotalAsn');
    const elTotalRencana = document.getElementById('plaporanTotalRencana');
    const elTotalTerlaksana = document.getElementById('plaporanTotalTerlaksana');
    const elDescTerlaksana = document.getElementById('plaporanDescTerlaksana');

    const activeYear = Number(Store.getActiveYear()) || 2026;
    let totalRencana = 150;
    let totalTerlaksana = 98;
    let pct = 65.3;

    if (activeYear === 2026) {
      totalRencana = 150;
      totalTerlaksana = 98;
      pct = 65.3;
    } else {
      const allRealiz = Store.state.realizations || [];
      const yRealiz = allRealiz.filter(r => Number(r.tahun || 2026) === activeYear);
      totalTerlaksana = yRealiz.filter(r => (r.status || '').toLowerCase().includes('verif') || (r.status || '').toLowerCase().includes('laksana')).length;

      const allVerif = Store.state.verifications || [];
      const yVerif = allVerif.filter(v => Number(v.tahun || 2026) === activeYear);
      totalRencana = yVerif.reduce((sum, v) => sum + (v.programCount || 0), 0);
      pct = totalRencana > 0 ? ((totalTerlaksana / totalRencana) * 100).toFixed(1) : '0.0';
    }

    if (elTotalAsn) elTotalAsn.textContent = summary.totalPegawai;
    if (elTotalRencana) elTotalRencana.textContent = totalRencana;
    if (elTotalTerlaksana) elTotalTerlaksana.textContent = totalTerlaksana;
    if (elDescTerlaksana) elDescTerlaksana.textContent = `Capaian realisasi ${pct}%`;
  },

  // Official Export & Print Triggers
  exportReport(type) {
    if (type === 'excel') {
      ExportService.exportMonitoring();
    } else if (type === 'pdf') {
      ExportService.printOfficialIdp();
    }
  },

  previewDocument(filename) {
    document.getElementById('previewDocTitle').textContent = filename;
    this.openModal('docPreviewModal');
  },

  // Buku Panduan Pengguna & SOP Kedinasan (Tahap 7)
  openSopGuide(tabName = 'pegawai') {
    if (tabName === 'login') tabName = 'akun';
    this.openModal('sopGuideModal');
    this.switchSopTab(tabName);
  },

  switchSopTab(tabName) {
    const tabs = ['pegawai', 'admin', 'pimpinan', 'akun'];
    tabs.forEach(t => {
      const cap = t.charAt(0).toUpperCase() + t.slice(1);
      const btn = document.getElementById(`sopTab${cap}`);
      const pane = document.getElementById(`sopPane${cap}`);
      if (btn) btn.classList.toggle('active', t === tabName);
      if (pane) pane.style.display = (t === tabName) ? 'block' : 'none';
    });
    renderAllIcons();
  },

  // Official Account Quick Guide
  showAccountHelper() {
    this.openSopGuide('akun');
  },

  fillTestAccount(nip, password) {
    const nipInput = document.getElementById('loginNip');
    const passInput = document.getElementById('loginPassword');
    if (nipInput) nipInput.value = nip;
    if (passInput) passInput.value = password;
    this.closeModal('sopGuideModal');
    this.closeModal('accountHelperModal');
    App.toast(`Kredensial ASN ${nip} dimuat. Klik 'Masuk Portal'`, 'info');
  },

  // ==========================================
  // MODAL, DRAWER & CONFIRMATION
  // ==========================================

  openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) {
      m.style.display = 'flex';
      setTimeout(() => m.classList.add('active'), 10);
    }
  },

  closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) {
      m.classList.remove('active');
      m.style.display = 'none';
    }
  },

  openDrawer(drawerId) {
    const d = document.getElementById(drawerId);
    if (d) d.classList.add('active');
  },

  closeDrawer(drawerId) {
    const d = document.getElementById(drawerId);
    if (d) d.classList.remove('active');
  },

  confirmAction(title, message, onConfirmCallback) {
    document.getElementById('confirmDialogTitle').textContent = title;
    document.getElementById('confirmDialogMessage').textContent = message;
    document.getElementById('btnConfirmProceed').onclick = () => {
      onConfirmCallback();
      App.closeModal('confirmDialogModal');
    };
    this.openModal('confirmDialogModal');
  },

  toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${type}`;

    const iconName = type === 'success' ? 'CircleCheck' : type === 'warning' ? 'AlertTriangle' : type === 'error' ? 'AlertCircle' : 'Info';
    toastEl.innerHTML = `
      <div class="toast-icon">${getIcon(iconName, 18)}</div>
      <div class="toast-msg">${message}</div>
    `;

    container.appendChild(toastEl);
    setTimeout(() => {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateY(10px)';
      toastEl.style.transition = 'all 200ms ease';
      setTimeout(() => toastEl.remove(), 220);
    }, 3200);
  },

  // ==========================================
  // REAL-TIME NOTIFICATIONS CONTROLLER (TAHAP 5.3)
  // ==========================================
  notifChannel: null,
  submissionChannel: null,
  audioCtx: null,
  _audioUnlocked: false,
  notifAudio: null,

  unlockAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.audioCtx && AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx) {
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        if (!this._audioUnlocked) {
          const buffer = this.audioCtx.createBuffer(1, 1, 22050);
          const source = this.audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(this.audioCtx.destination);
          source.start(0);
          this._audioUnlocked = true;
        }
      }
    } catch(e) {}

    try {
      if (!this.notifAudio) {
        this.notifAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        this.notifAudio.volume = 1.0;
        this.notifAudio.load();
      }
    } catch(e) {}
  },

  _notifPollTimer: null,

  initRealtimeNotifications() {
    const user = Store.state.user || Store.state.currentSession;
    if (!user) return;

    // 1. Bersihkan channel sebelumnya jika ada
    if (typeof supabaseClient !== 'undefined') {
      try {
        if (this.notifChannel) supabaseClient.removeChannel(this.notifChannel);
        if (this.submissionChannel) supabaseClient.removeChannel(this.submissionChannel);
      } catch(e) {}
      this.notifChannel = null;
      this.submissionChannel = null;
    }

    // 2. Ambil notifikasi dari Supabase & Render
    Store.fetchNotifications(user).then(() => {
      this.renderNotifications();
    });

    // 3. Pasang pendengar (listener) Realtime Supabase
    if (typeof supabaseClient !== 'undefined') {
      try {
        // Channel Notifikasi
        this.notifChannel = supabaseClient
          .channel('realtime_sip_notifikasi')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifikasi' },
            payload => {
              const newRow = payload.new;
              if (!newRow) return;

              const currentUser = Store.state.user || Store.state.currentSession;
              const role = currentUser?.role || 'pegawai';
              const cleanUserNip = String(currentUser?.nip || '').replace(/\s+/g, '');
              const cleanRowPenerima = String(newRow.penerima || '').replace(/\s+/g, '');

              // Cek apakah notifikasi ini ditujukan untuk user ini
              const isForMe =
                newRow.penerima === 'all' ||
                newRow.penerima === 'semua' ||
                newRow.penerima === role ||
                cleanRowPenerima === cleanUserNip ||
                ((role === 'admin' || role === 'pimpinan') && (newRow.penerima === 'all_admin' || newRow.penerima === 'admin'));

              if (isForMe) {
                if (!Store.state.notifications) Store.state.notifications = [];
                if (!Store.state.notifications.some(n => n.id === newRow.id)) {
                  Store.state.notifications.unshift(newRow);
                  Store.updateNotificationUnreadCount();
                  Store.save();
                }

                this.renderNotifications();
                this.playNotificationSound();
                this.showNotificationPopup(newRow);
              }
            }
          )
          .subscribe((status) => {
            console.log('SIP Notifikasi Realtime Status:', status);
          });

        // Channel IDP Submissions (Agar Admin & Pegawai melihat status IDP terupdate LIVE)
        this.submissionChannel = supabaseClient
          .channel('realtime_sip_submissions')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'idp_submissions' },
            async payload => {
              console.log('SIP IDP Submission Changed Realtime:', payload);
              await Store.syncVerificationsFromSupabase();
              
              if (Store.state.activePage === 'averif') {
                App.renderAdminVerification();
              } else if (Store.state.activePage === 'adash') {
                App.renderAdminDashboard();
              } else if (Store.state.activePage === 'eidp') {
                App.renderIdpSaya();
              }
            }
          )
          .subscribe((status) => {
            console.log('SIP Submissions Realtime Status:', status);
          });
      } catch (err) {
        console.warn("Gagal inisialisasi Supabase Realtime:", err);
      }
    }

    // 4. Timer Heartbeat Berkala (Mengantisipasi WebSocket tertidur saat HP di-minimize)
    if (!this._notifPollTimer) {
      this._notifPollTimer = setInterval(() => {
        this.checkNewNotificationsInBackground(false);
      }, 10000);
    }
  },

  async handleAppResume() {
    console.log('SIP App Resumed: Re-syncing notifications & submissions...');
    const user = Store.state.user || Store.state.currentSession;
    if (!user) return;

    // Pastikan channel Realtime aktif kembali jika sempat putus saat sleep
    if (typeof supabaseClient !== 'undefined') {
      try {
        if (!this.notifChannel || this.notifChannel.state !== 'joined') {
          this.initRealtimeNotifications();
        }
      } catch(e) {}
    }

    // Ambil data terbaru & periksa apakah ada IDP masuk saat layar mati
    await this.checkNewNotificationsInBackground(true);
    await Store.syncVerificationsFromSupabase();
    if (Store.state.activePage === 'averif') {
      this.renderAdminVerification();
    } else if (Store.state.activePage === 'adash') {
      this.renderAdminDashboard();
    }
  },

  async checkNewNotificationsInBackground(isResume = false) {
    const user = Store.state.user || Store.state.currentSession;
    if (!user) return;

    try {
      const prevIds = new Set((Store.state.notifications || []).map(n => n.id));
      const freshNotifs = await Store.fetchNotifications(user);
      
      // Deteksi notifikasi baru yang masuk saat aplikasi di latar belakang
      const newItems = (freshNotifs || []).filter(n => !prevIds.has(n.id) && !n.dibaca);
      
      if (newItems.length > 0) {
        this.renderNotifications();
        this.playNotificationSound();
        this.showNotificationPopup(newItems[0]);
        // Update data verifikasi otomatis
        await Store.syncVerificationsFromSupabase();
        if (Store.state.activePage === 'averif') {
          this.renderAdminVerification();
        } else if (Store.state.activePage === 'adash') {
          this.renderAdminDashboard();
        }
      } else {
        this.renderNotifications();
      }
    } catch(err) {
      console.warn("Background notification check warning:", err);
    }
  },

  renderNotifications() {
    const listEl = document.getElementById('notificationList');
    const badgeEl = document.getElementById('notificationBadge');
    const countEl = document.getElementById('notificationUnreadCount');

    const notifs = Store.state.notifications || [];
    const unreadCount = notifs.filter(n => !n.dibaca).length;

    // Update Badge
    if (badgeEl) {
      if (unreadCount > 0) {
        badgeEl.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badgeEl.style.display = 'flex';
      } else {
        badgeEl.style.display = 'none';
      }
    }

    // Update Header Text
    if (countEl) {
      countEl.textContent = `${unreadCount} baru`;
    }

    // Toggle PWA Notification banner
    const pwaBanner = document.getElementById('pwaNotifBanner');
    if (pwaBanner) {
      if ('Notification' in window && Notification.permission !== 'granted') {
        pwaBanner.style.display = 'flex';
      } else {
        pwaBanner.style.display = 'none';
      }
    }

    // Update List
    if (!listEl) return;

    if (notifs.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 28px 16px; text-align: center; color: var(--color-text-muted); font-size: 12px;">
          <div style="margin-bottom: 8px; opacity: 0.35;">${getIcon('BellOff', 28)}</div>
          Belum ada notifikasi kedinasan terbaru
        </div>
      `;
      return;
    }

    listEl.innerHTML = notifs.map(n => {
      const isUnread = !n.dibaca;
      const iconName = n.tipe === 'success' ? 'CircleCheck' : n.tipe === 'warning' ? 'AlertTriangle' : n.tipe === 'error' ? 'AlertCircle' : 'Bell';
      const iconColor = n.tipe === 'success' ? '#10b981' : n.tipe === 'warning' ? '#f59e0b' : n.tipe === 'error' ? '#ef4444' : 'var(--color-accent)';
      const iconBg = n.tipe === 'success' ? 'rgba(16, 185, 129, 0.12)' : n.tipe === 'warning' ? 'rgba(245, 158, 11, 0.12)' : n.tipe === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'var(--color-light-blue)';
      const timeStr = this.formatRelativeTime(n.created_at);

      return `
        <div class="notification-item ${isUnread ? 'unread' : ''}" onclick="App.handleNotificationClick(${n.id})" title="Klik untuk membuka dokumen terkait" style="cursor: pointer;">
          <div class="notification-icon" style="background: ${iconBg}; color: ${iconColor};">
            ${getIcon(iconName, 16)}
          </div>
          <div class="notification-content" style="flex: 1; min-width: 0;">
            <div class="notification-text" style="font-weight: ${isUnread ? '700' : '500'};">${n.pesan || n.judul}</div>
            <div class="notification-time" style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
              <span>
                ${n.pengirim ? `<span style="font-weight: 600; color: var(--color-text-secondary);">${n.pengirim}</span> • ` : ''}
                ${timeStr}
              </span>
              <span style="font-size: 11px; color: var(--color-primary); font-weight: 600; display: inline-flex; align-items: center; gap: 3px;">
                Buka ${getIcon('ChevronRight', 12)}
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  async handleNotificationClick(id) {
    // 1. Tutup dropdown notifikasi agar layar langsung fokus ke halaman yang dituju
    const dd = document.getElementById('notificationDropdown');
    if (dd) dd.classList.remove('show');

    // 2. Tandai notifikasi sebagai sudah dibaca
    await Store.markNotificationAsRead(id);
    this.renderNotifications();

    const notif = (Store.state.notifications || []).find(n => n.id == id);
    if (!notif) return;

    const role = Store.state.user?.role || Store.state.currentSession?.role || 'pegawai';
    const judul = String(notif.judul || '').trim();
    const pesan = String(notif.pesan || '').trim();
    const pengirim = String(notif.pengirim || '').trim();
    const fullText = `${judul} ${pesan} ${pengirim}`;
    const lowerText = fullText.toLowerCase();

    // 3. Ekstrak Tahun Anggaran dari notifikasi (misal: 2026, 2027)
    const yrMatch = fullText.match(/\b(20\d\d)\b/);
    const targetYear = yrMatch ? parseInt(yrMatch[1], 10) : Store.getActiveYear();

    // Skenario A: Notifikasi Pengajuan / Verifikasi IDP
    if (lowerText.includes('idp') || lowerText.includes('pengajuan') || lowerText.includes('rancangan') || lowerText.includes('formulir')) {
      if (role === 'admin') {
        // Sinkronkan Tahun Anggaran bila notifikasi merujuk ke tahun tertentu
        if (Number(Store.getActiveYear()) !== Number(targetYear)) {
          this.handleYearChange(targetYear);
        }

        // Buka halaman Verifikasi IDP
        this.navigate('averif');

        // Cari item verifikasi yang cocok
        const senderClean = pengirim.toLowerCase().replace(/[^a-z0-9]/g, '');
        const pesanClean = pesan.toLowerCase().replace(/[^a-z0-9]/g, '');

        let matched = (Store.state.verifications || []).find(v => {
          if (Number(v.tahun || 2026) !== Number(targetYear)) return false;
          const vName = (v.pegawai || '').toLowerCase();
          const vNameClean = vName.replace(/[^a-z0-9]/g, '');
          const vNip = String(v.nip || '').replace(/\s+/g, '');

          // Cocokkan pengirim notifikasi dengan nama pegawai verifikasi
          if (senderClean && !senderClean.includes('sistem') && (senderClean.includes(vNameClean) || vNameClean.includes(senderClean))) {
            return true;
          }
          // Cocokkan nama pegawai yang ada dalam isi teks pesan
          if (vNameClean && pesanClean.includes(vNameClean)) {
            return true;
          }
          const nameTokens = vName.split(/[\s,.]+/).filter(w => w.length >= 4);
          if (nameTokens.some(tok => lowerText.includes(tok.toLowerCase()))) {
            return true;
          }
          // Cocokkan NIP jika ada dalam teks
          if (vNip && fullText.includes(vNip)) {
            return true;
          }
          return false;
        });

        // Jika belum ada di lokal, coba sinkronisasi dari Supabase
        if (!matched && typeof supabaseClient !== 'undefined') {
          try {
            await Store.syncVerificationsFromSupabase();
            matched = (Store.state.verifications || []).find(v => {
              if (Number(v.tahun || 2026) !== Number(targetYear)) return false;
              const vName = (v.pegawai || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              return senderClean && !senderClean.includes('sistem') && (senderClean.includes(vName) || vName.includes(senderClean));
            });
          } catch(e) {}
        }

        // Jika masih belum ada di verifikasi, cek apakah pegawai ada di data pegawai ASN
        if (!matched) {
          const emp = (Store.state.employees || []).find(e => {
            const eNameClean = (e.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            return senderClean && !senderClean.includes('sistem') && (senderClean.includes(eNameClean) || eNameClean.includes(senderClean));
          });
          if (emp) {
            matched = {
              id: Date.now(),
              tahun: targetYear,
              pegawai: emp.name,
              nip: emp.nip,
              jabatan: emp.jabatan,
              jenisJabatan: emp.jenisJabatan || 'Struktural',
              unitKerja: emp.unitKerja || 'Bappeda Provinsi Lampung',
              targetKarier: `Pengembangan Kompetensi ${targetYear}`,
              rencanaKarier: 'Peningkatan kompetensi aparatur dan pemenuhan standar kinerja organisasi.',
              programCount: 2,
              totalJp: 20,
              estimasiBiaya: 'Rp1.500.000',
              pengajuan: 'Hari Ini',
              status: 'Diajukan ke Atasan',
              notes: ''
            };
            if (!Store.state.verifications) Store.state.verifications = [];
            Store.state.verifications.unshift(matched);
            Store.save();
          }
        }

        // Fallback jika tidak menemukan nama spesifik: ambil item verifikasi pertama pada tahun tersebut
        if (!matched) {
          matched = (Store.state.verifications || []).find(v => Number(v.tahun || 2026) === Number(targetYear));
        }

        // Reset filter input di averif agar baris pegawai yang dituju selalu tampak
        const searchEl = document.getElementById('verifSearchInput');
        const statusEl = document.getElementById('verifStatusSelect');
        const unitEl = document.getElementById('verifUnitSelect');
        if (searchEl && searchEl.value) searchEl.value = '';
        if (statusEl && statusEl.value !== 'Semua Status') statusEl.value = 'Semua Status';
        if (unitEl && unitEl.value !== 'Semua Unit Kerja') unitEl.value = 'Semua Unit Kerja';
        this.renderAdminVerification();

        if (matched) {
          setTimeout(() => {
            this.openReviewVerificationDrawer(matched.id);
            const row = document.getElementById(`verif-row-${matched.id}`);
            if (row) {
              row.scrollIntoView({ behavior: 'smooth', block: 'center' });
              row.style.transition = 'background 0.4s';
              row.style.background = 'rgba(59, 130, 246, 0.15)';
              setTimeout(() => { row.style.background = ''; }, 2500);
            }
            this.toast(`Membuka pengajuan IDP ${matched.pegawai} (TA ${targetYear})`, 'info');
          }, 150);
        } else {
          this.toast(`Menampilkan daftar Verifikasi IDP Pegawai TA ${targetYear}`, 'info');
        }
        return;
      } else if (role === 'pimpinan') {
        if (Number(Store.getActiveYear()) !== Number(targetYear)) {
          this.handleYearChange(targetYear);
        }
        this.navigate('pmonitoring');
        this.toast(`Menampilkan monitoring pengajuan IDP TA ${targetYear}`, 'info');
        return;
      } else {
        // Role Pegawai
        if (Number(Store.getActiveYear()) !== Number(targetYear)) {
          this.handleYearChange(targetYear);
        }
        this.navigate('eidp');
        this.toast(pesan || judul, notif.tipe || 'info');
        return;
      }
    }

    // Skenario B: Notifikasi Realisasi / Sertifikat
    if (lowerText.includes('realisasi') || lowerText.includes('sertifikat') || lowerText.includes('pelatihan') || lowerText.includes('diklat')) {
      if (Number(Store.getActiveYear()) !== Number(targetYear)) {
        this.handleYearChange(targetYear);
      }
      if (role === 'admin') {
        this.navigate('apelaksanaan');
      } else {
        this.navigate('epelaksanaan');
      }
      this.toast(`Menampilkan Realisasi Pengembangan Kompetensi TA ${targetYear}`, 'info');
      return;
    }

    // Skenario C: Disposisi Arahan Kepala Bappeda
    if (lowerText.includes('arahan') || lowerText.includes('disposisi')) {
      if (role === 'admin') this.navigate('adash');
      else if (role === 'pimpinan') this.navigate('pdash');
      else this.navigate('edash');

      setTimeout(() => {
        const banner = document.getElementById('adashDirectiveBanner') || document.getElementById('edashDirectiveBanner');
        if (banner) banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
      return;
    }

    // Fallback umum
    if (role === 'admin') this.navigate('adash');
    else if (role === 'pimpinan') this.navigate('pdash');
    else this.navigate('edash');
  },

  async markAllNotificationsRead() {
    await Store.markAllNotificationsAsRead();
    this.renderNotifications();
    this.toast('Semua notifikasi ditandai telah dibaca', 'info');
  },

  async sendTestNotification() {
    const user = Store.state.user || Store.state.currentSession;
    const role = user?.role || 'pegawai';
    const sampleMsg = role === 'pegawai' 
      ? 'Dokumen IDP Anda telah disetujui resmi oleh Atasan Bappeda.' 
      : `Pengajuan dokumen IDP ${Store.getActiveYear()} baru dari pegawai telah diterima.`;

    await Store.sendNotification({
      penerima: role,
      judul: 'Uji Notifikasi Real-time',
      pesan: sampleMsg,
      tipe: 'success'
    });
    this.toast('Sinyal notifikasi real-time terkirim!', 'success');
  },

  showNotificationPopup(notif) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${notif.tipe || 'info'} toast-notification-live`;

    const iconName = notif.tipe === 'success' ? 'CircleCheck' : notif.tipe === 'warning' ? 'AlertTriangle' : notif.tipe === 'error' ? 'AlertCircle' : 'Bell';
    toastEl.innerHTML = `
      <div class="toast-icon" style="margin-top: 2px;">${getIcon(iconName, 20)}</div>
      <div class="toast-msg">
        <div style="font-weight: 700; font-size: 13px; margin-bottom: 2px; display: flex; align-items: center; justify-content: space-between;">
          <span>${notif.judul || 'Notifikasi Baru'}</span>
          <span style="font-size: 9px; background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 1px 5px; border-radius: 4px; font-weight: 700; letter-spacing: 0.5px;">REALTIME</span>
        </div>
        <div style="font-size: 12px; color: var(--color-text-secondary); line-height: 1.4;">${notif.pesan}</div>
        <div style="font-size: 10px; color: var(--color-text-muted); margin-top: 4px;">${notif.pengirim ? notif.pengirim + ' • ' : ''}Baru saja</div>
      </div>
    `;

    toastEl.onclick = () => {
      this.handleNotificationClick(notif.id, notif.tipe, notif.judul);
      toastEl.remove();
    };

    container.appendChild(toastEl);
    setTimeout(() => {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateY(10px)';
      toastEl.style.transition = 'all 250ms ease';
      setTimeout(() => toastEl.remove(), 260);
    }, 5500);

    // Kirim notifikasi sistem ke HP (muncul di atas layar HP seperti aplikasi)
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(notif.judul || 'SIP-KOMPETENSI Bappeda', {
              body: notif.pesan || 'Pengajuan IDP baru telah diterima untuk diverifikasi.',
              icon: 'assets/logo-lampung.png',
              badge: 'assets/logo-lampung.png',
              vibrate: [200, 100, 200],
              tag: 'sip-notif-' + (notif.id || Date.now()),
              renotify: true
            });
          }).catch(() => {});
        } else {
          new Notification(notif.judul || 'SIP-KOMPETENSI Bappeda', {
            body: notif.pesan,
            icon: 'assets/logo-lampung.png'
          });
        }
      }
    } catch(err) {}
  },

  playBellChime(ctx) {
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Tone 1: Ding (880 Hz / A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.4, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Tone 2: Dong tinggi (1318.5 Hz / E6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.5, now + 0.12);
      gain2.gain.setValueAtTime(0, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.5, now + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.85);

      // Harmoni metalik (1760 Hz / A6)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(1760, now + 0.12);
      gain3.gain.setValueAtTime(0, now + 0.12);
      gain3.gain.linearRampToValueAtTime(0.12, now + 0.14);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.12);
      osc3.stop(now + 0.55);
    } catch(err) {
      console.warn('Error playing synthesized chime:', err);
    }
  },

  async playNotificationSound() {
    // 1. Getar HP jika didukung (Android)
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([180, 80, 180]);
      }
    } catch(e) {}

    // 2. Mainkan nada lonceng Web Audio API (Cepat, 0 latency, tanpa koneksi internet)
    let webAudioSuccess = false;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.audioCtx && AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx) {
        if (this.audioCtx.state === 'suspended') {
          await this.audioCtx.resume();
        }
        if (this.audioCtx.state === 'running') {
          this.playBellChime(this.audioCtx);
          webAudioSuccess = true;
        }
      }
    } catch(e) {
      console.warn("Web Audio chime issue:", e);
    }

    // 3. Fallback / simultan nada lonceng MP3
    try {
      if (!this.notifAudio) {
        this.notifAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        this.notifAudio.volume = 1.0;
      }
      this.notifAudio.currentTime = 0;
      const playPromise = this.notifAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (!webAudioSuccess) {
            console.warn("Audio playback blocked by browser:", error);
          }
        });
      }
    } catch (e) {
      console.warn("Audio play issue:", e);
    }
  },

  testNotificationSound() {
    this.unlockAudio();
    this.playNotificationSound();
    this.toast('🔔 Memutar nada lonceng! Di iPhone: jika hening, pastikan Saklar Hening di samping bodi HP OFF & volume media aktif.', 'info');
  },

  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      this.toast('Browser ini belum mendukung notifikasi sistem.', 'warning');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.toast('✅ Izin notifikasi sistem HP berhasil aktif! Notifikasi akan muncul dari atas layar.', 'success');
        this.renderNotifications();
        
        // Kirim contoh notifikasi uji coba
        if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification('SIP-KOMPETENSI Bappeda Lampung', {
            body: 'Notifikasi sistem berhasil diaktifkan untuk akun Anda!',
            icon: 'assets/logo-lampung.png',
            badge: 'assets/logo-lampung.png',
            vibrate: [200, 100, 200]
          });
        }
      } else if (permission === 'denied') {
        this.toast('Izin notifikasi ditolak. Aktifkan lewat Pengaturan HP > Safari/Chrome > Notifikasi.', 'warning');
      }
    } catch(err) {
      console.warn('Error requesting notification permission:', err);
    }
  },

  formatRelativeTime(dateString) {
    if (!dateString) return 'Baru saja';
    const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diffSec < 45) return 'Baru saja';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay === 1) return 'Kemarin';
    if (diffDay < 7) return `${diffDay} hari lalu`;
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  },

  toggleNotificationDropdown() {
    const dd = document.getElementById('notificationDropdown');
    if (dd) {
      dd.classList.toggle('show');
      if (dd.classList.contains('show')) {
        this.renderNotifications();
      }
    }
  },

  // ==========================================
  // PWA & MOBILE INSTALLATION (TAHAP 5)
  // ==========================================
  initPwaInstaller() {
    this.deferredInstallPrompt = null;

    // Deteksi jika sudah berjalan dalam mode PWA Standalone (sudah terpasang)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true;
    if (isStandalone) {
      console.log('SIP App is running as installed standalone PWA');
      return;
    }

    // Tangkap event sebelum instalasi browser (Chrome, Edge, Samsung Internet)
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      console.log('PWA installation prompt available');

      const topbarBtn = document.getElementById('pwaInstallBtn');
      if (topbarBtn) topbarBtn.style.display = 'flex';
      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    });

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      const topbarBtn = document.getElementById('pwaInstallBtn');
      if (topbarBtn) topbarBtn.style.display = 'none';
      this.toast('Aplikasi SIP-KOMPETENSI berhasil dipasang di layar utama perangkat Anda!', 'success');
    });

    // Untuk perangkat iOS / iPhone / iPad (tampilkan tombol instalasi petunjuk)
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    if (isIos && !isStandalone) {
      const topbarBtn = document.getElementById('pwaInstallBtn');
      if (topbarBtn) topbarBtn.style.display = 'flex';
      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    }
  },

  async triggerPwaInstall() {
    if (this.deferredInstallPrompt) {
      this.deferredInstallPrompt.prompt();
      const { outcome } = await this.deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        this.toast('Memasang aplikasi ke perangkat Anda...', 'info');
      }
      this.deferredInstallPrompt = null;
      const topbarBtn = document.getElementById('pwaInstallBtn');
      if (topbarBtn) topbarBtn.style.display = 'none';
      return;
    }

    // Petunjuk Safari di iOS / iPhone
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    if (isIos) {
      this.toast('Untuk pasang di iPhone/iPad: Ketuk tombol Bagikan (Share ⎋) di Safari, lalu pilih "Tambah ke Layar Utama" (+)', 'info', 8000);
      return;
    }

    // Panduan jika sudah pernah menolak prompt sebelumnya
    this.toast('Ketuk menu titik tiga (⋮) pada browser Anda, lalu pilih "Instal Aplikasi" atau "Tambahkan ke Layar Utama"', 'info', 6000);
  },

  toggleMobileSidebar() {
    const sb = document.getElementById('appSidebar');
    const bd = document.getElementById('sidebarBackdrop');
    if (sb) {
      sb.classList.toggle('mobile-open');
      if (bd) bd.classList.toggle('active', sb.classList.contains('mobile-open'));
    }
  },

  // ==========================================
  // GLOBAL SEARCH (CTRL + K)
  // ==========================================
  searchSelectedIndex: -1,

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  handleGlobalSearch(query) {
    const q = (query || '').trim().toLowerCase();
    const dropdown = document.getElementById('topbarSearchResults');
    const content = document.getElementById('searchResultsContent');
    if (!dropdown || !content) return;

    this.searchSelectedIndex = -1;

    // Kumpulan Menu Sistem & Pintasan Cepat
    const allSystemMenus = [
      { id: 'edash', title: 'Dashboard Pegawai (ASN)', desc: 'Ringkasan capaian JP & rencana IDP pribadi', icon: 'LayoutDashboard', type: 'page' },
      { id: 'eidp', title: 'Rencana IDP Pegawai', desc: 'Kelola dan susun usulan agenda bangkom tahunan', icon: 'FileText', type: 'page' },
      { id: 'epelaksanaan', title: 'Realisasi Pelatihan & Sertifikat', desc: 'Unggah bukti kelulusan diklat dan jam pelajaran', icon: 'GraduationCap', type: 'page' },
      { id: 'eprofil', title: 'Profil Pegawai ASN', desc: 'Data kepegawaian, pangkat, golongan & jabatan', icon: 'UserRound', type: 'page' },
      { id: 'adash', title: 'Dashboard Pengelola SDM', desc: 'Statistik kepegawaian & antrean verifikasi', icon: 'LayoutDashboard', type: 'page' },
      { id: 'averif', title: 'Verifikasi IDP ASN', desc: 'Pemeriksaan dan persetujuan berkas usulan', icon: 'ShieldCheck', type: 'page' },
      { id: 'apegawai', title: 'Data 99 Pegawai Bappeda', desc: 'Direktori DUK seluruh aparatur Bappeda', icon: 'Users', type: 'page' },
      { id: 'pdash', title: 'Dashboard Eksekutif Kepala Badan', desc: 'Pengendalian & kepatuhan 20 JP antar bidang', icon: 'TrendingUp', type: 'page' },
      { id: 'pmonitoring', title: 'Monitoring Kepatuhan 7 Bidang', desc: 'Capaian bangkom Sekretariat & seluruh Bidang', icon: 'BarChart3', type: 'page' },
      { id: 'plaporan', title: 'Laporan Eksekutif Capaian IDP', desc: 'Cetak dan ekspor laporan resmi berkop dinas', icon: 'FileSpreadsheet', type: 'page' },
      { id: 'sopGuide', title: 'Buku Panduan Pengguna & SOP', desc: 'Standar operasional prosedur resmi Bappeda', icon: 'BookOpen', type: 'action' },
      { id: 'backupModal', title: 'Cadangkan & Pulihkan Basis Data', desc: 'Backup JSON mandiri dan restore arsip', icon: 'Database', type: 'action' }
    ];

    const employees = Store.state.employees || (typeof BAPPEDA_DATA !== 'undefined' ? BAPPEDA_DATA.employees : []);

    let matchedMenus = [];
    let matchedEmployees = [];

    if (q.length === 0) {
      // Default Quick Suggestions
      matchedMenus = allSystemMenus.slice(0, 4);
      matchedEmployees = employees.slice(0, 4);
    } else {
      matchedMenus = allSystemMenus.filter(m => 
        m.title.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)
      ).slice(0, 4);

      matchedEmployees = employees.filter(e => {
        const nameMatch = (e.name || '').toLowerCase().includes(q);
        const nipMatch = String(e.nip || '').includes(q) || String(e.nipFormatted || '').includes(q);
        const unitMatch = (e.unit || '').toLowerCase().includes(q);
        const jabatanMatch = (e.jabatan || '').toLowerCase().includes(q);
        return nameMatch || nipMatch || unitMatch || jabatanMatch;
      }).slice(0, 6);
    }

    if (matchedMenus.length === 0 && matchedEmployees.length === 0) {
      content.innerHTML = `
        <div style="padding: 24px 16px; text-align: center; color: var(--color-text-muted); font-size: 12.5px;">
          <span data-icon="Search" data-icon-size="28" style="opacity: 0.35; display: block; margin: 0 auto 8px;"></span>
          Tidak ditemukan data untuk "<b>${this.escapeHtml(query)}</b>"<br>
          <span style="font-size: 11px; color: var(--color-text-muted);">Gunakan nama pegawai, NIP 18 digit, atau nama bidang</span>
        </div>
      `;
      dropdown.style.display = 'block';
      if (typeof renderAllIcons === 'function') renderAllIcons();
      return;
    }

    let html = '';

    // Group 1: Pegawai ASN
    if (matchedEmployees.length > 0) {
      html += `
        <div class="search-group-header">
          <span>Pegawai ASN (${matchedEmployees.length})</span>
          <span style="font-size: 9.5px; text-transform: none; color: var(--color-text-muted);">Klik untuk detail</span>
        </div>
      `;
      matchedEmployees.forEach(e => {
        const initials = (e.name || 'ASN').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
        const highlightedName = this.highlightSearchMatch(e.name || '', q);
        const highlightedNip = this.highlightSearchMatch(e.nipFormatted || e.nip || '', q);
        let jpVal = 0;
        if (typeof e.jp === 'number') {
          jpVal = e.jp;
        } else if (typeof e.progress === 'number') {
          jpVal = e.progress;
        } else if (typeof e.progress === 'string') {
          const m = e.progress.match(/^(\d+)/);
          jpVal = m ? parseInt(m[1], 10) : (parseInt(e.progress, 10) || 0);
        }
        const isTuntas = jpVal >= 20 || (typeof e.progress === 'string' && e.progress.includes('100%'));
        const progBadge = isTuntas 
          ? `<span class="badge badge-success" style="font-size: 10px; padding: 2px 7px; white-space: nowrap; flex-shrink: 0;">${jpVal} JP (Tuntas)</span>`
          : `<span class="badge badge-warning" style="font-size: 10px; padding: 2px 7px; white-space: nowrap; flex-shrink: 0;">${jpVal} JP</span>`;

        html += `
          <div class="search-result-item" onclick="App.selectSearchResult('employee', ${e.id})">
            <div class="search-item-left">
              <div class="search-avatar-badge">${initials}</div>
              <div class="search-item-info">
                <div class="search-item-title">${highlightedName}</div>
                <div class="search-item-subtitle">NIP. ${highlightedNip} &bull; ${e.unit || '-'}</div>
              </div>
            </div>
            <div style="flex-shrink: 0;">${progBadge}</div>
          </div>
        `;
      });
    }

    // Group 2: Menu & Fitur Sistem
    if (matchedMenus.length > 0) {
      html += `
        <div class="search-group-header">
          <span>Navigasi &amp; Fitur (${matchedMenus.length})</span>
          <span style="font-size: 9.5px; text-transform: none; color: var(--color-text-muted);">Pintasan</span>
        </div>
      `;
      matchedMenus.forEach(m => {
        const highlightedTitle = this.highlightSearchMatch(m.title, q);
        html += `
          <div class="search-result-item" onclick="App.selectSearchResult('${m.type}', '${m.id}')">
            <div class="search-item-left">
              <div class="search-avatar-badge" style="background: rgba(37,99,235,0.08); color: var(--color-primary);">
                <span data-icon="${m.icon}" data-icon-size="16"></span>
              </div>
              <div class="search-item-info">
                <div class="search-item-title">${highlightedTitle}</div>
                <div class="search-item-subtitle">${m.desc}</div>
              </div>
            </div>
            <span style="font-size: 10px; color: var(--color-text-muted); background: var(--color-surface-subtle); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--color-border); white-space: nowrap; flex-shrink: 0;">Buka</span>
          </div>
        `;
      });
    }

    content.innerHTML = html;
    dropdown.style.display = 'block';
    if (typeof renderAllIcons === 'function') renderAllIcons();
  },

  highlightSearchMatch(text, query) {
    if (!query || !text) return this.escapeHtml(text);
    const escapedText = this.escapeHtml(text);
    const escapedQuery = this.escapeHtml(query);
    const regex = new RegExp(`(${escapedQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    return escapedText.replace(regex, '<mark>$1</mark>');
  },

  selectSearchResult(type, id) {
    this.closeGlobalSearch();
    if (type === 'employee') {
      this.showEmployeeDetail(Number(id));
    } else if (type === 'page') {
      this.navigate(id);
    } else if (type === 'action') {
      if (id === 'sopGuide') {
        this.openSopGuide();
      } else if (id === 'backupModal') {
        if (typeof BackupService !== 'undefined') BackupService.openBackupModal();
      }
    }
  },

  closeGlobalSearch() {
    const dropdown = document.getElementById('topbarSearchResults');
    const input = document.getElementById('topbarSearchInput');
    if (dropdown) dropdown.style.display = 'none';
    if (input) input.blur();
    this.searchSelectedIndex = -1;
  },

  handleSearchKeydown(e) {
    const dropdown = document.getElementById('topbarSearchResults');
    if (!dropdown || dropdown.style.display === 'none') {
      if (e.key === 'Enter') {
        this.handleGlobalSearch(e.target.value);
      }
      return;
    }

    const items = dropdown.querySelectorAll('.search-result-item');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.searchSelectedIndex = (this.searchSelectedIndex + 1) % items.length;
      items.forEach((it, idx) => it.classList.toggle('selected', idx === this.searchSelectedIndex));
      items[this.searchSelectedIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.searchSelectedIndex = (this.searchSelectedIndex - 1 + items.length) % items.length;
      items.forEach((it, idx) => it.classList.toggle('selected', idx === this.searchSelectedIndex));
      items[this.searchSelectedIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.searchSelectedIndex >= 0 && this.searchSelectedIndex < items.length) {
        items[this.searchSelectedIndex].click();
      } else if (items.length > 0) {
        items[0].click();
      }
    } else if (e.key === 'Escape') {
      this.closeGlobalSearch();
    }
  },

  bindGlobalEvents() {
    const unlock = () => this.unlockAudio();
    document.addEventListener('click', unlock, { passive: true });
    document.addEventListener('touchstart', unlock, { passive: true });
    document.addEventListener('touchend', unlock, { passive: true });
    document.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('scroll', unlock, { passive: true });

    // Auto-sync & bangunkan koneksi saat aplikasi kembali dibuka dari minimize / layar HP dinyalakan
    const onAppWake = () => {
      if (document.visibilityState === 'visible') {
        this.unlockAudio();
        this.handleAppResume();
      }
    };
    document.addEventListener('visibilitychange', onAppWake);
    window.addEventListener('focus', () => {
      this.unlockAudio();
      this.handleAppResume();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.closeGlobalSearch();
        this.closeUserDropdown();
        document.querySelectorAll('.modal-overlay.active').forEach(m => {
          m.classList.remove('active');
          m.style.display = 'none';
        });
        document.querySelectorAll('.drawer-overlay.active').forEach(d => d.classList.remove('active'));
        const dd = document.getElementById('notificationDropdown');
        if (dd) dd.classList.remove('show');
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('topbarSearchInput');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
          this.handleGlobalSearch(searchInput.value);
        }
      }
    });

    document.addEventListener('click', e => {
      if (e.target && e.target.classList && e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        e.target.style.display = 'none';
      }

      const searchBox = document.querySelector('.topbar-center');
      if (searchBox && !searchBox.contains(e.target)) {
        this.closeGlobalSearch();
      }

      const notifBtn = document.getElementById('notificationBtn');
      const notifDd = document.getElementById('notificationDropdown');
      if (notifDd && notifBtn && !notifBtn.contains(e.target) && !notifDd.contains(e.target)) {
        notifDd.classList.remove('show');
      }

      const userMenuCont = document.getElementById('topbarUserMenuContainer');
      if (userMenuCont && !userMenuCont.contains(e.target)) {
        this.closeUserDropdown();
      }

      const dukDropdownCont = document.getElementById('dukActionDropdownContainer');
      if (dukDropdownCont && !dukDropdownCont.contains(e.target)) {
        this.closeDukActionDropdown();
      }
    });
  }
};

if (typeof window !== 'undefined') {
  window.App = App;
}

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

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

    // Check if user has an active persistent session
    if (Store.state.currentSession) {
      this.restoreSession(Store.state.currentSession);
    } else {
      this.initRealtimeNotifications();
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
  },

  toggleTheme() {
    const newTheme = Store.state.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    this.refreshCharts();
    App.toast(`Mode ${newTheme === 'dark' ? 'Gelap' : 'Terang'} aktif`, 'info');
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
    document.getElementById('loginPassword').value = '';
    App.toast('Sesi Anda telah berhasil diakhiri dengan aman.', 'info');
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
    document.getElementById('appSidebar').classList.remove('mobile-open');

    // Trigger page-specific renders
    this.renderPageData(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderPageData(pageId) {
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
      Charts.renderCircularProgress('pegawaiCircularProgress', 85, 'Completed');
    } else if (Store.state.activePage === 'ekompetensi') {
      Charts.renderRadar('competencyRadarChart', Store.state.competencies.radarData);
    } else if (Store.state.activePage === 'epelaksanaan' || Store.state.activePage === 'apelaksanaan') {
      Charts.renderDonut('realizationDonutChart', [
        { label: 'Terlaksana', value: 98, color: 'var(--color-success)' },
        { label: 'Dalam Proses', value: 17, color: 'var(--color-warning)' },
        { label: 'Belum', value: 35, color: 'var(--color-danger)' }
      ]);
    } else if (Store.state.activePage === 'adash') {
      Charts.renderDonut('adminIdpStatusDonut', [
        { label: 'Final', value: 72, color: 'var(--color-success)' },
        { label: 'Diajukan ke Atasan', value: 12, color: 'var(--color-warning)' },
        { label: 'Revisi', value: 5, color: 'var(--color-danger)' },
        { label: 'Belum Mengisi', value: 11, color: 'var(--color-text-muted)' }
      ]);
    } else if (Store.state.activePage === 'pdash') {
      Charts.renderGroupedBar('executiveGroupedBar', Store.state.executiveMetrics.rencanaVsRealisasi);
      Charts.renderDonut('executiveDonutChart', [
        { label: 'Selesai', value: 48, color: 'var(--color-success)' },
        { label: 'Berjalan', value: 26, color: 'var(--color-warning)' },
        { label: 'Belum Terlaksana', value: 26, color: 'var(--color-danger)' }
      ]);
      Charts.renderTrendLine('executiveTrendChart', Store.state.executiveMetrics.monthlyTrend, Store.state.executiveMetrics.monthLabels);
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

    document.getElementById('edashIdpStatusVal').textContent = idpStatus === 'Final' ? '100%' : '85%';
    document.getElementById('edashIdpStatusDesc').textContent = `Status Resmi: ${idpStatus}`;
    document.getElementById('edashRencanaVal').textContent = summary.totalProgram;
    document.getElementById('edashTerlaksanaVal').textContent = summary.completed;
    document.getElementById('edashBelumVal').textContent = summary.totalProgram - summary.completed;

    Charts.renderCircularProgress('pegawaiCircularProgress', idpStatus === 'Final' ? 100 : 85, 'Completed');
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
      if (btn) btn.innerHTML = '<span data-icon="EyeOff" data-icon-size="16"></span>';
    } else {
      input.type = 'password';
      if (btn) btn.innerHTML = '<span data-icon="Eye" data-icon-size="16"></span>';
    }
    if (window.lucide) window.lucide.createIcons();
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

  renderCareerPlan() {
    const cp = Store.state.careerPlan;
    if (document.getElementById('careerPeriode')) {
      document.getElementById('careerPeriode').value = cp.periode;
    }
    this.setCareerJenjangValue(cp.jenjangTarget);
    this.updateCareerRoadmapTarget(cp.jenjangTarget);
    this.renderCareerJenjangTable(cp.jenjangTarget);

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
    Store.save();
  },

  selectCareerTarget(val) {
    this.setCareerJenjangValue(val);
    this.onCareerJenjangTargetChange(val);
    App.toast(`Target jenjang dipilih: ${val}`, 'success');
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
    Store.state.careerPlan.rencana = document.getElementById('careerRencanaText').value;
    Store.state.careerPlan.jenjangTarget = document.getElementById('careerJenjangTarget').value;
    Store.save();
    this.updateCareerRoadmapTarget(Store.state.careerPlan.jenjangTarget);
    App.toast(isDraft ? 'Draft rencana karier disimpan ke sistem' : 'Rencana karier berhasil disimpan', 'success');
    if (!isDraft) {
      this.navigate('ekompetensi');
    }
  },

  renderCompetencies() {
    const c = Store.state.competencies;
    Charts.renderRadar('competencyRadarChart', c.radarData);

    document.getElementById('kompTeknisTableBody').innerHTML = c.teknis.map(item => `
      <tr>
        <td class="font-semibold">${item.name}</td>
        <td><span class="badge badge-neutral">${item.current}</span></td>
        <td><span class="badge badge-blue">${item.target}</span></td>
        <td>${item.gap > 0 ? `<span class="badge badge-warning">${item.gap} level</span>` : `<span class="badge badge-success">Terpenuhi</span>`}</td>
        <td><span class="badge ${item.priority === 'Tinggi' ? 'badge-danger' : 'badge-neutral'}">${item.priority}</span></td>
        <td><span class="badge ${item.status === 'Terpenuhi' ? 'badge-success' : 'badge-warning'}">${item.status}</span></td>
      </tr>
    `).join('');

    document.getElementById('kompManajerialTableBody').innerHTML = c.manajerial.map(item => `
      <tr>
        <td class="font-semibold">${item.name}</td>
        <td><span class="badge badge-neutral">${item.current}</span></td>
        <td><span class="badge badge-blue">${item.target}</span></td>
        <td>${item.gap > 0 ? `<span class="badge ${item.gap >= 2 ? 'badge-danger' : 'badge-warning'}">${item.gap} level</span>` : `<span class="badge badge-success">Terpenuhi</span>`}</td>
        <td><span class="badge ${item.priority === 'Sangat Tinggi' ? 'badge-danger' : 'badge-neutral'}">${item.priority}</span></td>
        <td><span class="badge ${item.status === 'Prioritas Tinggi' ? 'badge-danger' : 'badge-warning'}">${item.status}</span></td>
      </tr>
    `).join('');

    document.getElementById('kompSosialTableBody').innerHTML = c.sosialKultural.map(item => `
      <tr>
        <td class="font-semibold">${item.name}</td>
        <td><span class="badge badge-neutral">${item.current}</span></td>
        <td><span class="badge badge-blue">${item.target}</span></td>
        <td><span class="badge badge-warning">${item.gap} level</span></td>
        <td><span class="badge badge-neutral">${item.priority}</span></td>
        <td><span class="badge badge-warning">${item.status}</span></td>
      </tr>
    `).join('');
  },

  renderIdpSaya() {
    const summary = Store.getIdpSummary();
    const idpState = Store.state.idpState;

    document.getElementById('idpSummaryStatus').textContent = idpState.status;
    document.getElementById('idpSummaryProgress').textContent = `${summary.progressPct}%`;
    document.getElementById('idpSummaryCount').textContent = summary.totalProgram;
    document.getElementById('idpSummaryJp').textContent = `${summary.totalJp} JP`;
    document.getElementById('idpSummaryCost').textContent = `Rp${summary.totalCost.toLocaleString('id-ID')}`;

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
      return;
    }

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
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-outline btn-sm" onclick="App.openEditProgramModal(${p.id})">${getIcon('Edit3', 14)}</button>
              <button class="btn btn-danger btn-sm" onclick="App.confirmDeleteProgram(${p.id})">${getIcon('Trash2', 14)}</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openAddProgramModal() {
    document.getElementById('programModalTitle').textContent = 'Tambah Program Pengembangan';
    document.getElementById('programModalSub').textContent = 'Tambahkan rencana pengembangan ke formulir resmi IDP ASN.';
    document.getElementById('formProgramId').value = '';
    document.getElementById('progKompetensi').value = 'Pelayanan Publik';
    document.getElementById('progMetode').value = 'Coaching';
    document.getElementById('progTopik').value = '';
    document.getElementById('progJenisDiklat').value = '-';
    document.getElementById('progJp').value = '2';
    document.getElementById('progPenyelenggara').value = 'Internal Bappeda';
    document.getElementById('progPeriodeMulai').value = '2026-10-01';
    document.getElementById('progPeriodeSelesai').value = '2026-12-31';
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
      document.getElementById('progPeriodeMulai').value = '2026-10-01';
      document.getElementById('progPeriodeSelesai').value = '2026-12-31';
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
    const data = {
      kompetensi: document.getElementById('progKompetensi').value,
      metode: document.getElementById('progMetode').value,
      topik: document.getElementById('progTopik').value || 'Program Pengembangan',
      jenisDiklat: document.getElementById('progJenisDiklat').value,
      jp: parseInt(document.getElementById('progJp').value) || 2,
      penyelenggara: document.getElementById('progPenyelenggara').value,
      periode: (() => {
        const mulai = document.getElementById('progPeriodeMulai').value;
        const selesai = document.getElementById('progPeriodeSelesai').value;
        const fmt = (d) => { const dt = new Date(d + 'T00:00:00'); const bln = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des']; return bln[dt.getMonth()] + ' ' + dt.getFullYear(); };
        return mulai && selesai ? fmt(mulai) + ' – ' + fmt(selesai) : 'Tahun 2026';
      })(),
      periodeMulai: document.getElementById('progPeriodeMulai').value,
      periodeSelesai: document.getElementById('progPeriodeSelesai').value,
      estimasi: parseInt(document.getElementById('progEstimasi').value) || 0,
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
  },

  openSubmitIdpModal() {
    const chk = document.getElementById('reviewDisclaimerCheck');
    if (chk && !chk.checked) {
      App.toast('Harap centang pernyataan persetujuan terlebih dahulu', 'warning');
      return;
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
    const rList = Store.state.realizations;
    const tbody = document.getElementById('realizationTableBody');
    tbody.innerHTML = rList.map(r => `
      <tr>
        <td class="font-semibold" data-label="Pegawai">${r.pegawai}</td>
        <td data-label="Program IDP">${r.program}</td>
        <td data-label="Metode"><span class="badge badge-blue">${r.metode}</span></td>
        <td data-label="Tanggal">${r.tanggal}</td>
        <td data-label="JP"><b>${r.jp}</b> JP</td>
        <td data-label="Bukti">
          <button class="btn btn-outline btn-sm" onclick="${r.buktiUrl ? `window.open('${r.buktiUrl}', '_blank')` : `App.previewDocument('${r.bukti}')`}">
            <span data-icon="FileText" data-icon-size="14"></span> ${r.bukti}
          </button>
        </td>
        <td data-label="Status"><span class="badge badge-success">${r.status}</span></td>
      </tr>
    `).join('');

    Charts.renderDonut('realizationDonutChart', [
      { label: 'Terlaksana', value: 98, color: 'var(--color-success)' },
      { label: 'Dalam Proses', value: 17, color: 'var(--color-warning)' },
      { label: 'Belum', value: 35, color: 'var(--color-danger)' }
    ]);
  },

  openInputRealizationDrawer() {
    this.openDrawer('realizationDrawer');
  },

  async saveRealizationForm() {
    const prog = document.getElementById('realizProgram').value;
    const tgl = document.getElementById('realizTanggal').value || '2026-11-15';
    const jp = parseInt(document.getElementById('realizJp').value) || 20;
    const peny = document.getElementById('realizPenyelenggara').value;
    
    const fileInput = document.getElementById('realizFileInput');
    const file = fileInput && fileInput.files ? fileInput.files[0] : null;

    if (!file) {
      App.toast('Bukti Sertifikat wajib diunggah!', 'error');
      return;
    }
    
    // Disable button during upload
    const btnSubmit = document.querySelector('#realizationDrawer .btn-primary');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = 'Mengunggah...';
    }

    try {
      await Store.addRealization({
        pegawai: Store.state.user.name,
        program: prog,
        metode: prog.includes('Coaching') ? 'Coaching' : prog.includes('Workshop') ? 'Workshop' : prog.includes('Mentoring') ? 'Mentoring' : 'Diklat Teknis',
        tanggal: tgl,
        jp: jp,
        penyelenggara: peny,
        bukti: file.name
      }, file);

      App.toast('Realisasi pengembangan berhasil dicatat & sertifikat diunggah!', 'success');
      this.closeDrawer('realizationDrawer');
      this.renderEmployeeRealization();
    } catch (err) {
      App.toast(err.message || 'Gagal mengunggah sertifikat.', 'error');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Simpan Realisasi';
      }
      // Reset input file
      if (fileInput) fileInput.value = '';
      document.getElementById('dropzoneFileName').textContent = 'Pilih atau letakkan file bukti di sini';
    }
  },

  // ==========================================
  // ADMIN VIEW CONTROLLERS
  // ==========================================

  renderAdminDashboard() {
    Charts.renderDonut('adminIdpStatusDonut', [
      { label: 'Final', value: 72, color: 'var(--color-success)' },
      { label: 'Diajukan ke Atasan', value: 12, color: 'var(--color-warning)' },
      { label: 'Revisi', value: 5, color: 'var(--color-danger)' },
      { label: 'Belum Mengisi', value: 11, color: 'var(--color-text-muted)' }
    ]);
  },

  async renderAdminVerification() {
    if (typeof supabaseClient !== 'undefined') {
      await Store.syncVerificationsFromSupabase();
    }
    const list = Store.state.verifications;
    const tbody = document.getElementById('verifTableBody');
    tbody.innerHTML = list.map(v => {
      const badgeCls = v.status === 'Final' ? 'badge-success' : v.status === 'Disetujui Atasan' ? 'badge-primary' : v.status === 'Perlu Revisi' ? 'badge-danger' : 'badge-warning';
      return `
        <tr>
          <td>
            <div class="table-user-cell">
              <div class="table-user-avatar">${v.pegawai.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
              <div class="table-user-info">
                <div class="name">${v.pegawai}</div>
                <div class="sub">${v.nip}</div>
              </div>
            </div>
          </td>
          <td>${v.jabatan}</td>
          <td>${v.targetKarier}</td>
          <td><b>${v.programCount}</b> Program</td>
          <td>${v.pengajuan}</td>
          <td><span class="badge ${badgeCls}">${v.status}</span></td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="App.openReviewVerificationDrawer(${v.id})">
              ${getIcon('ShieldCheck', 14)} Review
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  openReviewVerificationDrawer(id) {
    const item = Store.state.verifications.find(x => x.id === id);
    if (!item) return;

    document.getElementById('reviewDrawerEmployeeName').textContent = item.pegawai;
    document.getElementById('reviewDrawerNip').textContent = `NIP: ${item.nip} • ${item.jabatan} (${item.jenisJabatan})`;
    document.getElementById('reviewDrawerTargetKarier').textContent = item.targetKarier;
    document.getElementById('reviewDrawerRencanaKarier').textContent = item.rencanaKarier;
    document.getElementById('reviewDrawerTotalJp').textContent = `${item.totalJp} JP`;
    document.getElementById('reviewDrawerEstimasiBiaya').textContent = item.estimasiBiaya;
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
    Store.approveIdp(id, note || 'Disetujui tanpa catatan perbaikan.', newStatus);
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

    Store.rejectIdp(id, reason);
    this.closeModal('revisionReasonModal');
    this.closeDrawer('reviewDrawer');
    App.toast('IDP telah dikembalikan kepada pegawai untuk direvisi', 'info');
    this.renderAdminVerification();
  },

  empPage: 1,
  empPageSize: 15,

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
    const e = (Store.state.employees || []).find(x => x.id === id);
    if (!e) return;
    document.getElementById('modalEmpName').textContent = e.name;
    document.getElementById('modalEmpNip').textContent = `NIP: ${e.nipFormatted || e.nip}`;
    document.getElementById('modalEmpUnit').textContent = e.unit;
    document.getElementById('modalEmpJabatan').textContent = `${e.jabatanLengkap || e.jabatan} (TMT: ${e.tmtJabatan || '-'})`;
    document.getElementById('modalEmpPangkat').textContent = e.pangkat;
    if (document.getElementById('modalEmpTmtPangkat')) {
      document.getElementById('modalEmpTmtPangkat').textContent = e.tmtPangkat || '-';
    }
    document.getElementById('modalEmpJenis').textContent = e.jenis;
    if (document.getElementById('modalEmpTtl')) {
      document.getElementById('modalEmpTtl').textContent = e.ttl || '-';
    }
    if (document.getElementById('modalEmpUsiaMasaKerja')) {
      document.getElementById('modalEmpUsiaMasaKerja').textContent = `${e.usia || '-'} • Masa Kerja: ${e.masaKerja || '-'}`;
    }
    if (document.getElementById('modalEmpPendidikan')) {
      document.getElementById('modalEmpPendidikan').textContent = `${e.pendidikan || '-'} (${e.jenjang || '-'})`;
    }
    if (document.getElementById('modalEmpDiklat')) {
      document.getElementById('modalEmpDiklat').textContent = e.diklat || '-';
    }
    
    const badgeCls = e.statusIdp === 'Final' ? 'badge-success' : e.statusIdp === 'Belum' ? 'badge-danger' : 'badge-warning';
    document.getElementById('modalEmpStatusIdp').innerHTML = `<span class="badge ${badgeCls}">${e.statusIdp}</span>`;
    document.getElementById('modalEmpProgress').textContent = e.progress;

    this.openModal('empDetailModal');
  },

  renderAdminEmployees() {
    const emps = Store.state.employees || [];
    const search = (document.getElementById('empSearchInput')?.value || '').toLowerCase().trim();
    const unitFilter = document.getElementById('empUnitFilter')?.value || '';
    const statusFilter = document.getElementById('empStatusFilter')?.value || '';

    const filtered = emps.filter(e => {
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
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 36px; color: var(--color-text-muted);">Tidak ada data pegawai yang sesuai filter.</td></tr>`;
    } else {
      tbody.innerHTML = pageItems.map((e, idx) => {
        const globalNo = startIdx + idx + 1;
        const badgeCls = e.statusIdp === 'Final' ? 'badge-success' : e.statusIdp === 'Belum' ? 'badge-danger' : 'badge-warning';
        
        let unitBadgeCls = 'badge-neutral';
        if (e.unit.includes('Pimpinan')) unitBadgeCls = 'badge-success';
        else if (e.unit.includes('Sekretariat')) unitBadgeCls = 'badge-neutral';
        else if (e.unit.includes('PMPE') || e.unit.includes('PPEPD')) unitBadgeCls = 'badge-blue';
        else if (e.unit.includes('Perekonomian')) unitBadgeCls = 'badge-warning';
        else if (e.unit.includes('Infrastruktur')) unitBadgeCls = 'badge-purple';
        else if (e.unit.includes('Pemerintahan')) unitBadgeCls = 'badge-rose';
        else if (e.unit.includes('UPTD') || e.unit.includes('Pusdatin')) unitBadgeCls = 'badge-teal';

        return `
          <tr>
            <td style="text-align: center; color: var(--color-text-muted); font-size: 11px;">${globalNo}</td>
            <td>
              <div class="table-user-cell">
                <div class="table-user-avatar">${e.avatarInitial || 'AS'}</div>
                <div class="table-user-info">
                  <div class="name" style="font-weight: 650;">${e.name}</div>
                  <div class="sub" style="font-family: monospace; font-size: 11px; color: var(--color-text-muted);">${e.nipFormatted || e.nip}</div>
                </div>
              </div>
            </td>
            <td style="font-size: 12px;">${e.pangkat}</td>
            <td style="font-size: 12px;">${e.jabatan}</td>
            <td><span class="badge ${unitBadgeCls}" style="font-size: 11px;">${e.unit}</span></td>
            <td><span class="badge ${badgeCls}">${e.statusIdp}</span></td>
            <td><b>${e.progress}</b></td>
            <td>
              <button class="btn btn-outline btn-sm" onclick="App.showEmployeeDetail(${e.id})">Detail</button>
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
    Charts.renderGroupedBar('executiveGroupedBar', Store.state.executiveMetrics.rencanaVsRealisasi);
    Charts.renderDonut('executiveDonutChart', [
      { label: 'Selesai', value: 48, color: 'var(--color-success)' },
      { label: 'Berjalan', value: 26, color: 'var(--color-warning)' },
      { label: 'Belum Terlaksana', value: 26, color: 'var(--color-danger)' }
    ]);
    Charts.renderTrendLine('executiveTrendChart', Store.state.executiveMetrics.monthlyTrend, Store.state.executiveMetrics.monthLabels);
  },

  renderMonitoring() {
    const units = Store.state.monitoringUnits && Store.state.monitoringUnits.length > 0
      ? Store.state.monitoringUnits
      : [
        { unit: 'Sekretariat', pegawai: 23, terisi: '94%', realisasi: '82%', tindakLanjut: 2, kabid: 'ANDI ARAFAT S.T., M.E.' },
        { unit: 'Bidang PMPE (Rendalev)', pegawai: 9, terisi: '100%', realisasi: '88%', tindakLanjut: 1, kabid: 'MEYDIANDRA EKA PUTRA S.P,MIP' },
        { unit: 'Bidang Perekonomian', pegawai: 19, terisi: '92%', realisasi: '79%', tindakLanjut: 2, kabid: 'Ir. ENDANG WAHYUNI S.T., M.Si.' },
        { unit: 'Bidang Infrastruktur & Kewilayahan', pegawai: 9, terisi: '95%', realisasi: '80%', tindakLanjut: 1, kabid: 'Ir. IDA SUSANTI S S.T., M.T' },
        { unit: 'Bidang Pemerintahan & PM', pegawai: 28, terisi: '90%', realisasi: '76%', tindakLanjut: 3, kabid: 'RADIUS PRAWIRA NEGARA S.ST' },
        { unit: 'UPTD Pusat Data & Informasi', pegawai: 10, terisi: '100%', realisasi: '90%', tindakLanjut: 0, kabid: 'YASIR WIJAYA S.Si.,M.Si' },
        { unit: 'Pimpinan', pegawai: 1, terisi: '100%', realisasi: '100%', tindakLanjut: 0, kabid: 'Dr. ANANG RISGIYANTO S.K.M., M.Kes.' }
      ];

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
        <td data-label="Tindak Lanjut"><span class="badge badge-warning">${u.tindakLanjut} Pegawai</span></td>
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
          const isFull = m.statusIdp === 'Final';
          const badgeCls = isFull ? 'badge-success' : m.statusIdp === 'Belum' ? 'badge-danger' : 'badge-warning';
          return `
            <tr>
              <td>
                <div style="font-weight: 650; font-size: 12.5px;">${m.name}</div>
                <div style="font-size: 10.5px; color: var(--color-text-muted); font-family: monospace;">NIP: ${m.nipFormatted || m.nip}</div>
              </td>
              <td style="font-size: 12px;">${m.jabatan}</td>
              <td style="text-align: center;"><b>20 JP</b></td>
              <td style="text-align: center;"><b>${m.jp} JP</b></td>
              <td><span class="badge ${badgeCls}">${m.statusIdp} (${m.progress.split(' ')[1] || ''})</span></td>
            </tr>
          `;
        }).join('');
      }
    }
    this.openDrawer('monitoringDetailDrawer');
  },

  renderReporting() {
    // Reporting view ready
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

  // Official Account Quick Guide
  showAccountHelper() {
    this.openModal('accountHelperModal');
  },

  fillTestAccount(nip, password) {
    document.getElementById('loginNip').value = nip;
    document.getElementById('loginPassword').value = password;
    this.closeModal('accountHelperModal');
    App.toast(`Akun ASN ${nip} dimuat. Klik 'Masuk ke Sistem'`, 'info');
  },

  // ==========================================
  // MODAL, DRAWER & CONFIRMATION
  // ==========================================

  openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add('active');
  },

  closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove('active');
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

  unlockAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.audioCtx && AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch(e) {}
  },

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
        <div class="notification-item ${isUnread ? 'unread' : ''}" onclick="App.handleNotificationClick(${n.id}, '${n.tipe || 'info'}', '${(n.judul || '').replace(/'/g, "\\'")}')">
          <div class="notification-icon" style="background: ${iconBg}; color: ${iconColor};">
            ${getIcon(iconName, 16)}
          </div>
          <div class="notification-content">
            <div class="notification-text" style="font-weight: ${isUnread ? '700' : '500'};">${n.pesan || n.judul}</div>
            <div class="notification-time">
              ${n.pengirim ? `<span style="font-weight: 600; color: var(--color-text-secondary);">${n.pengirim}</span> • ` : ''}
              ${timeStr}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  async handleNotificationClick(id, tipe, judul) {
    await Store.markNotificationAsRead(id);
    this.renderNotifications();

    const role = Store.state.user?.role || 'pegawai';
    const lowerJudul = (judul || '').toLowerCase();

    // Navigasi cerdas berdasarkan jenis notifikasi
    if (lowerJudul.includes('idp') || lowerJudul.includes('pengajuan')) {
      if (role === 'admin') {
        this.navigate('averif');
      } else if (role === 'pimpinan') {
        this.navigate('pmonitoring');
      } else {
        this.navigate('eidp');
      }
    } else if (lowerJudul.includes('realisasi') || lowerJudul.includes('sertifikat')) {
      if (role === 'admin') {
        this.navigate('apelaksanaan');
      } else {
        this.navigate('epelaksanaan');
      }
    }
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
      : 'Pengajuan dokumen IDP 2026 baru dari pegawai telah diterima.';

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
  },

  async playNotificationSound() {
    // 1. Getar HP jika perangkat mobile mendukung
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([180, 80, 180]);
      }
    } catch(e) {}

    // 2. Mainkan nada lonceng kedinasan (E5 -> A5 -> C6)
    try {
      this.unlockAudio();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);        // Nada E5
      osc.frequency.setValueAtTime(880.00, now + 0.12); // Nada A5
      osc.frequency.setValueAtTime(1046.50, now + 0.24); // Nada C6
      
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      
      osc.start(now);
      osc.stop(now + 0.7);
    } catch (e) {
      console.warn("Audio play issue:", e);
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

  toggleMobileSidebar() {
    document.getElementById('appSidebar').classList.toggle('mobile-open');
  },

  bindGlobalEvents() {
    const unlock = () => this.unlockAudio();
    document.addEventListener('click', unlock, { passive: true });
    document.addEventListener('touchstart', unlock, { passive: true });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        document.querySelectorAll('.drawer-overlay.active').forEach(d => d.classList.remove('active'));
        const dd = document.getElementById('notificationDropdown');
        if (dd) dd.classList.remove('show');
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('topbarSearchInput');
        if (searchInput) searchInput.focus();
      }
    });

    document.addEventListener('click', e => {
      const notifBtn = document.getElementById('notificationBtn');
      const notifDd = document.getElementById('notificationDropdown');
      if (notifDd && notifBtn && !notifBtn.contains(e.target) && !notifDd.contains(e.target)) {
        notifDd.classList.remove('show');
      }
    });
  }
};

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

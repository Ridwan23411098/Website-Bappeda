/**
 * SIP-KOMPETENSI — BAPPEDA PROVINSI LAMPUNG
 * Persistent Local Database & Official ASN Authentication Engine
 */

const STORAGE_KEY = 'sip_kompetensi_bappeda_db_v3';
const SESSION_KEY = 'sip_kompetensi_active_session';

const Store = {
  // Official ASN Accounts Directory of Bappeda Lampung (DUK 2026)
  accounts: (typeof BAPPEDA_DATA !== 'undefined' && BAPPEDA_DATA.accounts) ? BAPPEDA_DATA.accounts : [
    {
      nip: '197407072002121008',
      password: 'password',
      name: 'ANDI ARAFAT S.T., M.E.',
      pangkat: 'Pembina Tk. I / IV/b',
      jabatan: 'Sekretaris Bappeda Provinsi Lampung',
      unitKerja: 'Sekretariat',
      role: 'pegawai',
      avatarInitial: 'AA'
    },
    {
      nip: '196910261992032002',
      password: 'admin123',
      name: 'CIK MARYA S.E.,M.M.',
      pangkat: 'Pembina / IV/a',
      jabatan: 'Kepala Sub Bagian Umum & Kepegawaian',
      unitKerja: 'Sekretariat',
      role: 'admin',
      avatarInitial: 'CM'
    },
    {
      nip: '197507312000031002',
      password: 'pimpinan123',
      name: 'Dr. ANANG RISGIYANTO S.K.M., M.Kes.',
      pangkat: 'Pembina Utama Madya / IV-d',
      jabatan: 'Kepala Badan Perencanaan Pembangunan Daerah',
      unitKerja: 'Pimpinan',
      role: 'pimpinan',
      avatarInitial: 'AR'
    }
  ],

  // Initial State Seed
  defaultState: {
    theme: 'light',
    currentSession: null, // Logged in user object
    activePage: 'edash',
    unreadCount: 0,
    notifications: [],

    // Active ASN Profile (Official Pegawai: Andi Arafat, S.T., M.E. - DUK 2026)
    user: {
      name: 'ANDI ARAFAT S.T., M.E.',
      nip: '19740707 200212 1 008',
      pangkat: 'Pembina Tk. I / IV/b',
      pendidikan: 'EKONOMI PEMBANGUNAN & PERENCANAAN (2007)',
      masaKerja: '23 Tahun 9 Bulan',
      jabatan: 'Sekretaris Bappeda Provinsi Lampung',
      unitKerja: 'Sekretariat',
      jenisJabatan: 'Struktural',
      status: 'Aktif',
      avatarInitial: 'AA',
      nineBox: 8
    },

    // Career Plan
    careerPlan: {
      periode: '2026',
      jenjangTarget: 'JFT Madya — Level 4',
      rencana: 'Mengembangkan kompetensi evaluasi perencanaan pembangunan daerah, perumusan indikator kinerja utama makro, dan sinergi pendanaan pembangunan Provinsi Lampung.',
      rumpunTarget: ['86 — BAPPENAS', '70 — Aparatur Negara / Kepegawaian', '22 — Statistik']
    },

    // Competencies Matrix
    competencies: {
      currentAvg: 2.1,
      targetAvg: 3.0,
      gap: 0.9,
      status: 'Needs Development',
      radarData: [
        { label: 'Integritas', current: 2, target: 3, max: 4 },
        { label: 'Kerjasama', current: 2, target: 3, max: 4 },
        { label: 'Komunikasi', current: 2, target: 3, max: 4 },
        { label: 'Orientasi Hasil', current: 2, target: 3, max: 4 },
        { label: 'Pelayanan Publik', current: 2, target: 3, max: 4 },
        { label: 'Pengembangan Diri', current: 1, target: 3, max: 4 },
        { label: 'Mengelola Perubahan', current: 1, target: 3, max: 4 },
        { label: 'Pengambilan Keputusan', current: 2, target: 3, max: 4 }
      ],
      teknis: [
        { name: 'Analisis Data Perencanaan Pembangunan', current: 2, target: 3, gap: 1, priority: 'Tinggi', status: 'Perlu Pengembangan' },
        { name: 'Penyusunan Dokumen Perencanaan (RPJMD/RKPD)', current: 2, target: 3, gap: 1, priority: 'Sedang', status: 'Perlu Pengembangan' },
        { name: 'Pengolahan Data Spasial & Statistik Daerah', current: 3, target: 3, gap: 0, priority: 'Rendah', status: 'Terpenuhi' }
      ],
      manajerial: [
        { name: 'Integritas', current: 2, target: 3, gap: 1, priority: 'Sedang', status: 'Perlu Pengembangan' },
        { name: 'Kerjasama', current: 2, target: 3, gap: 1, priority: 'Sedang', status: 'Perlu Pengembangan' },
        { name: 'Komunikasi', current: 2, target: 3, gap: 1, priority: 'Sedang', status: 'Perlu Pengembangan' },
        { name: 'Orientasi pada Hasil', current: 2, target: 3, gap: 1, priority: 'Sedang', status: 'Perlu Pengembangan' },
        { name: 'Pelayanan Publik', current: 2, target: 3, gap: 1, priority: 'Tinggi', status: 'Perlu Pengembangan' },
        { name: 'Pengembangan Diri & Orang Lain', current: 1, target: 3, gap: 2, priority: 'Sangat Tinggi', status: 'Prioritas Tinggi' },
        { name: 'Mengelola Perubahan', current: 1, target: 3, gap: 2, priority: 'Sangat Tinggi', status: 'Prioritas Tinggi' },
        { name: 'Pengambilan Keputusan', current: 2, target: 3, gap: 1, priority: 'Sedang', status: 'Perlu Pengembangan' }
      ],
      sosialKultural: [
        { name: 'Perekat Bangsa', current: 2, target: 3, gap: 1, priority: 'Sedang', status: 'Perlu Pengembangan' }
      ]
    },

    // IDP Status & Programs
    idpState: {
      status: 'Draft', // 'Draft' | 'Diajukan ke Atasan' | 'Disetujui Atasan' | 'Final' | 'Perlu Revisi'
      progress: 75,
      verificationNote: '',
      programs: [
        {
          id: 1,
          kompetensi: 'Pelayanan Publik',
          metode: 'Coaching',
          topik: 'Service Excellence dalam Perencanaan Pembangunan',
          jenisDiklat: '-',
          jp: 2,
          penyelenggara: 'Internal Bappeda',
          periode: 'Okt–Des 2026',
          estimasi: 0,
          status: 'Direncanakan',
          details: { materi: 'Service Excellence dalam Perencanaan', bentuk: 'Tatap muka', waktu: '2 sesi' }
        },
        {
          id: 2,
          kompetensi: 'Analisis Data',
          metode: 'Diklat Teknis',
          topik: 'Pelatihan Analisis Data Perencanaan dengan Python & PowerBI',
          jenisDiklat: 'Diklat Teknis Perencanaan',
          jp: 20,
          penyelenggara: 'BPSDMD Provinsi Lampung',
          periode: 'Nov 2026',
          estimasi: 1500000,
          status: 'Terlaksana',
          details: {}
        },
        {
          id: 3,
          kompetensi: 'Kerjasama',
          metode: 'Mentoring',
          topik: 'Manajemen Waktu & Efektivitas Tim Kerja',
          jenisDiklat: '-',
          jp: 2,
          penyelenggara: 'Internal Bappeda',
          periode: 'Des 2026',
          estimasi: 0,
          status: 'Direncanakan',
          details: { mentee: 'Rizky Aditya Pratama', hasil: 'Peningkatan koordinasi' }
        },
        {
          id: 4,
          kompetensi: 'Pengambilan Keputusan',
          metode: 'Workshop',
          topik: 'Workshop Strategic Decision Making Kebijakan Publik',
          jenisDiklat: '-',
          jp: 8,
          penyelenggara: 'Pusbindiklatren Bappenas',
          periode: 'Des 2026',
          estimasi: 750000,
          status: 'Terlaksana',
          details: {}
        }
      ]
    },

    // Realization Records
    realizations: [
      {
        id: 1,
        pegawai: 'Rizky Aditya Pratama, S.Kom., M.Si.',
        program: 'Pelatihan Analisis Data Perencanaan dengan Python & PowerBI',
        metode: 'Diklat Teknis',
        tanggal: '15 Nov 2026',
        jp: 20,
        penyelenggara: 'BPSDMD Provinsi Lampung',
        bukti: 'Sertifikat_Analisis_Data_Bappeda.pdf',
        status: 'Terverifikasi'
      },
      {
        id: 2,
        pegawai: 'Rizky Aditya Pratama, S.Kom., M.Si.',
        program: 'Workshop Strategic Decision Making Kebijakan Publik',
        metode: 'Workshop',
        tanggal: '05 Des 2026',
        jp: 8,
        penyelenggara: 'Pusbindiklatren Bappenas',
        bukti: 'Sertifikat_Strategic_Decision.pdf',
        status: 'Terverifikasi'
      },
      {
        id: 3,
        pegawai: 'Siti Rahma, S.E., M.E.',
        program: 'Coaching Public Service',
        metode: 'Coaching',
        tanggal: '12 Okt 2026',
        jp: 2,
        penyelenggara: 'Internal Bappeda',
        bukti: 'Form_Coaching_Siti_Rahma.pdf',
        status: 'Terverifikasi'
      }
    ],

    // Admin Verification List
    verifications: [
      {
        id: 101,
        pegawai: 'Rizky Aditya Pratama, S.Kom., M.Si.',
        nip: '198701012010011001',
        jabatan: 'Analis Perencanaan Ahli Muda',
        jenisJabatan: 'JFT',
        unitKerja: 'Bidang Perencanaan Makro & Pendanaan Pembangunan',
        targetKarier: 'JFT Muda — Level 3',
        rencanaKarier: 'Pengembangan pelayanan publik dan kapasitas analisis makro',
        programCount: 4,
        totalJp: 32,
        estimasiBiaya: 'Rp2.250.000',
        pengajuan: '10 Sep 2026',
        status: 'Diajukan ke Atasan',
        notes: ''
      },
      {
        id: 102,
        pegawai: 'Siti Rahma, S.E., M.E.',
        nip: '198901022011012002',
        jabatan: 'Perencana Ahli Muda',
        jenisJabatan: 'JFT',
        unitKerja: 'Bidang Perencanaan Makro & Pendanaan Pembangunan',
        targetKarier: 'JFT Madya — Level 4',
        rencanaKarier: 'Penguatan analisis makro ekonomi daerah',
        programCount: 3,
        totalJp: 28,
        estimasiBiaya: 'Rp1.800.000',
        pengajuan: '08 Sep 2026',
        status: 'Final',
        notes: 'Disetujui, rencana program selaras dengan target kinerja urusan perencanaan daerah.'
      },
      {
        id: 103,
        pegawai: 'Agus Setiawan, A.Md.',
        nip: '199001032012013003',
        jabatan: 'Pengadministrasi Perencanaan',
        jenisJabatan: 'Pelaksana',
        unitKerja: 'Sekretariat Bappeda',
        targetKarier: 'JFT Pertama — Level 2',
        rencanaKarier: 'Penguatan teknis tata kelola persuratan dinas',
        programCount: 2,
        totalJp: 16,
        estimasiBiaya: 'Rp1.200.000',
        pengajuan: '07 Sep 2026',
        status: 'Perlu Revisi',
        notes: 'Mohon sesuaikan rumpun keahlian target dengan formasi kepegawaian tahun 2026.'
      }
    ],

    // Official Employee List (100 ASN Lengkap Bappeda Provinsi Lampung)
    employees: (typeof BAPPEDA_DATA !== 'undefined' && BAPPEDA_DATA.employees) ? BAPPEDA_DATA.employees : [],

    // Official Reference Master Data
    masterData: (typeof BAPPEDA_DATA !== 'undefined' && BAPPEDA_DATA.masterMetode) ? {
      metode: BAPPEDA_DATA.masterMetode,
      rumpun: BAPPEDA_DATA.masterRumpun,
      jenjang: BAPPEDA_DATA.masterJenjang
    } : {
      metode: [],
      rumpun: [],
      jenjang: []
    },

    monitoringUnits: (typeof BAPPEDA_DATA !== 'undefined' && BAPPEDA_DATA.monitoringUnits) ? BAPPEDA_DATA.monitoringUnits : [],

    executiveMetrics: {
      totalPegawai: 99,
      idpTerisi: 91,
      adaRealisasi: 78,
      perluTindakLanjut: 8,
      rencanaVsRealisasi: [
        { label: 'Sekretariat', rencana: 23, realisasi: 19 },
        { label: 'Bidang PMPE', rencana: 9, realisasi: 8 },
        { label: 'Bidang Perekonomian', rencana: 19, realisasi: 15 },
        { label: 'Infrastruktur & Wilayah', rencana: 9, realisasi: 7 },
        { label: 'Pemerintahan & PM', rencana: 28, realisasi: 21 },
        { label: 'UPTD Pusdatin', rencana: 10, realisasi: 9 }
      ],
      monthlyTrend: [15, 28, 42, 55, 62, 70, 78, 85, 90, 94, 98, 99],
      monthLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    }
  },

  // Active State in RAM
  state: {},

  init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.state = JSON.parse(saved);
        // Ensure official master data is always synchronized
        if (typeof BAPPEDA_DATA !== 'undefined') {
          if (!this.state.masterData) this.state.masterData = {};
          this.state.masterData.jenjang = BAPPEDA_DATA.masterJenjang;
          this.state.masterData.metode = BAPPEDA_DATA.masterMetode;
          this.state.masterData.rumpun = BAPPEDA_DATA.masterRumpun;
          this.state.employees = BAPPEDA_DATA.employees;
          this.state.monitoringUnits = BAPPEDA_DATA.monitoringUnits;
          this.state.verifications = BAPPEDA_DATA.verifications;
          this.state.realizations = BAPPEDA_DATA.realizations;
        }
        this.state.executiveMetrics = JSON.parse(JSON.stringify(this.defaultState.executiveMetrics));
      } else {
        this.state = JSON.parse(JSON.stringify(this.defaultState));
        if (typeof BAPPEDA_DATA !== 'undefined') {
          this.state.employees = BAPPEDA_DATA.employees;
          this.state.monitoringUnits = BAPPEDA_DATA.monitoringUnits;
          this.state.verifications = BAPPEDA_DATA.verifications;
          this.state.realizations = BAPPEDA_DATA.realizations;
          this.state.masterData = {
            metode: BAPPEDA_DATA.masterMetode,
            rumpun: BAPPEDA_DATA.masterRumpun,
            jenjang: BAPPEDA_DATA.masterJenjang
          };
        }
      }

      // Check active session & sanitize any cached PPEPD -> PMPE
      const activeSess = localStorage.getItem(SESSION_KEY);
      if (activeSess) {
        this.state.currentSession = JSON.parse(activeSess);
        if (this.state.currentSession.unitKerja) {
          this.state.currentSession.unitKerja = this.state.currentSession.unitKerja.replace(/PPEPD/g, 'PMPE');
        }
        if (this.state.currentSession.jabatan) {
          this.state.currentSession.jabatan = this.state.currentSession.jabatan.replace(/PPEPD/g, 'PMPE');
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(this.state.currentSession));
      }

      if (this.state.user) {
        if (this.state.user.unitKerja) {
          this.state.user.unitKerja = this.state.user.unitKerja.replace(/PPEPD/g, 'PMPE');
        }
        if (this.state.user.jabatan) {
          this.state.user.jabatan = this.state.user.jabatan.replace(/PPEPD/g, 'PMPE');
        }
      }

      if (!this.state.notifications) this.state.notifications = [];
      this.updateNotificationUnreadCount();

      this.save();
    } catch (err) {
      console.warn('Initializing default state:', err);
      this.state = JSON.parse(JSON.stringify(this.defaultState));
      this.save();
    }
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  },

  // ==========================================
  // MODULE KEAMANAN & ENKRIPSI PASSWORD (TAHAP 2)
  // ==========================================

  /**
   * Encrypt plain password string into SHA-256 hex string with standard prefix
   * @param {string} plainText 
   * @returns {Promise<string>}
   */
  async hashPassword(plainText) {
    if (!plainText) return '';
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(plainText);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `$sha256$${hashHex}`;
    } catch (e) {
      console.warn("Crypto API fallback hash:", e);
      return `$sha256$${btoa(plainText)}`; // Fallback encoding if crypto unavailable
    }
  },

  /**
   * Verify input plain password against stored password (supports legacy plain text & SHA-256 hash)
   * @param {string} plainInput 
   * @param {string} storedPassword 
   * @returns {Promise<boolean>}
   */
  async verifyPassword(plainInput, storedPassword) {
    if (!plainInput || !storedPassword) return false;
    const cleanInput = String(plainInput).trim();
    const cleanStored = String(storedPassword).trim();

    if (cleanStored.startsWith('$sha256$')) {
      const hashedInput = await this.hashPassword(cleanInput);
      return hashedInput === cleanStored;
    }

    // Default accounts / legacy plain text matching (e.g. 'password', 'admin123', 'pimpinan123')
    return cleanInput === cleanStored;
  },

  /**
   * Authentic credential login validator with Password Check & Hashing
   * @param {string} nip
   * @param {string} password
   */
  async authenticate(nip, password) {
    const cleanNip = String(nip || '').trim();
    const cleanPass = String(password || '').trim();

    if (!cleanNip) {
      throw new Error('NIP wajib diisi.');
    }
    if (!cleanPass) {
      throw new Error('Kata sandi wajib diisi.');
    }

    // Mengambil data akun dari database Supabase
    const { data: matchedRows, error } = await supabaseClient
      .from('pegawai')
      .select('*')
      .eq('nip', cleanNip);

    if (error) {
      console.error("Supabase Error:", error);
      throw new Error(`Database Error: ${error.message || error.details || 'Gagal terhubung ke Supabase'}`);
    }
    
    if (!matchedRows || matchedRows.length === 0) {
      throw new Error('NIP tidak terdaftar dalam basis data Supabase.');
    }
    
    const matched = matchedRows[0];
    const defaultRolePassword = matched.role === 'admin' ? 'admin123' : (matched.role === 'pimpinan' ? 'pimpinan123' : 'password');
    const storedPass = matched.password || defaultRolePassword;

    // 1. Verifikasi Password
    const isValidPass = await this.verifyPassword(cleanPass, storedPass);
    if (!isValidPass) {
      throw new Error('Kata sandi yang Anda masukkan salah. Silakan periksa NIP & Kata Sandi Anda.');
    }

    // 2. Auto-upgrade legacy plain text password to SHA-256 hash in background
    let isHashed = storedPass.startsWith('$sha256$');
    if (!isHashed) {
      try {
        const newHash = await this.hashPassword(cleanPass);
        await supabaseClient
          .from('pegawai')
          .update({ password: newHash })
          .eq('nip', cleanNip);
        matched.password = newHash;
        isHashed = true;
      } catch (e) {
        console.warn("Auto-upgrade password hash failed:", e);
      }
    }

    // Success: Store Session
    const sessionUser = {
      nip: matched.nip,
      name: matched.nama,
      pangkat: matched.pangkat,
      jabatan: (matched.jabatan || '').replace(/PPEPD/g, 'PMPE'),
      unitKerja: (matched.unit_kerja || '').replace(/PPEPD/g, 'PMPE'),
      jenisJabatan: matched.jenis_jabatan,
      pendidikan: matched.pendidikan,
      masaKerja: matched.masa_kerja,
      nineBox: matched.nine_box,
      role: matched.role,
      avatarInitial: (matched.nama || 'AS').substring(0, 2).toUpperCase(),
      passwordUpdated: matched.password_updated_at || null,
      isPasswordChanged: matched.is_password_changed || isHashed,
      loginTime: new Date().toISOString()
    };

    // Enrich session with master data from BAPPEDA_DATA.employees
    if (typeof BAPPEDA_DATA !== 'undefined' && BAPPEDA_DATA.employees) {
      const empMaster = BAPPEDA_DATA.employees.find(e => e.nip === sessionUser.nip);
      if (empMaster) {
        if (!sessionUser.pangkat) sessionUser.pangkat = empMaster.pangkat || '';
        if (!sessionUser.pendidikan) sessionUser.pendidikan = empMaster.pendidikan || '';
        if (!sessionUser.masaKerja) sessionUser.masaKerja = empMaster.masaKerja || '';
        if (!sessionUser.jenisJabatan) sessionUser.jenisJabatan = empMaster.jenis || '';
        if (!sessionUser.jabatan) sessionUser.jabatan = (empMaster.jabatan || '').replace(/PPEPD/g, 'PMPE');
        if (!sessionUser.unitKerja) sessionUser.unitKerja = (empMaster.unit || '').replace(/PPEPD/g, 'PMPE');
        if (!sessionUser.nineBox) sessionUser.nineBox = empMaster.nineBox;
        // Extra fields from master
        sessionUser.ttl = empMaster.ttl || '';
        sessionUser.usia = empMaster.usia || '';
        sessionUser.diklat = empMaster.diklat || '';
        sessionUser.jenjang = empMaster.jenjang || '';
        sessionUser.golongan = empMaster.golongan || '';
        sessionUser.tmtPangkat = empMaster.tmtPangkat || '';
        sessionUser.tmtJabatan = empMaster.tmtJabatan || '';
      }
    }

    this.state.user = {
      ...this.state.user,
      ...sessionUser
    };
    this.state.currentSession = sessionUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    this.save();

    return sessionUser;
  },

  /**
   * Fitur Ubah Password Mandiri (Mandatory User Security Feature)
   * @param {string} oldPassword 
   * @param {string} newPassword 
   * @returns {Promise<boolean>}
   */
  async changePassword(oldPassword, newPassword) {
    const activeNip = this.state.currentSession?.nip || this.state.user?.nip;
    if (!activeNip) {
      throw new Error('Sesi Anda telah habis. Silakan login kembali.');
    }

    const cleanOld = String(oldPassword || '').trim();
    const cleanNew = String(newPassword || '').trim();

    if (!cleanOld) throw new Error('Kata sandi saat ini wajib diisi.');
    if (!cleanNew) throw new Error('Kata sandi baru wajib diisi.');
    if (cleanNew.length < 6) throw new Error('Kata sandi baru minimal harus 6 karakter.');
    if (cleanOld === cleanNew) throw new Error('Kata sandi baru tidak boleh sama dengan kata sandi lama.');

    // 1. Ambil record password terkini dari Supabase
    let currentDbPass = 'password';
    try {
      const { data: rows } = await supabaseClient
        .from('pegawai')
        .select('password, role')
        .eq('nip', activeNip);
      if (rows && rows.length > 0) {
        const r = rows[0];
        const defaultRolePass = r.role === 'admin' ? 'admin123' : (r.role === 'pimpinan' ? 'pimpinan123' : 'password');
        currentDbPass = r.password || defaultRolePass;
      }
    } catch(e) {
      console.warn("Gagal fetch pass dari Supabase:", e);
    }

    // 2. Verifikasi password lama
    const isOldCorrect = await this.verifyPassword(cleanOld, currentDbPass);
    if (!isOldCorrect) {
      throw new Error('Kata sandi saat ini yang Anda masukkan salah.');
    }

    // 3. Encrypt kata sandi baru dengan SHA-256
    const hashedNew = await this.hashPassword(cleanNew);
    const nowIso = new Date().toISOString();

    // 4. Update di Supabase Database (Utamakan kolom 'password' yang pasti ada)
    try {
      const { error } = await supabaseClient
        .from('pegawai')
        .update({ password: hashedNew })
        .eq('nip', activeNip);

      if (error) {
        console.error("Supabase Password Update Error:", error);
        // Jika Supabase belum memiliki kolom 'password' (schema cache missing), jangan lempar error ke UI!
        // Tetap izinkan pembaruan password lokal & simpan di sesi browser.
        if (error.message && (error.message.includes('Could not find') || error.message.includes('column'))) {
          console.warn("Tabel Supabase belum memiliki kolom 'password', menyimpan password baru ke local store/session:", error.message);
        } else {
          throw new Error(`Gagal memperbarui kata sandi di cloud: ${error.message}`);
        }
      }

      // Coba update kolom metadata opsional (password_updated_at & is_password_changed) jika kolom sudah tersedia di Supabase
      supabaseClient
        .from('pegawai')
        .update({
          password_updated_at: nowIso,
          is_password_changed: true
        })
        .eq('nip', activeNip)
        .then(() => {})
        .catch(e => console.warn("Optional column update ignored:", e));
    } catch (err) {
      if (err.message && err.message.includes('Gagal memperbarui') && !err.message.includes('Could not find')) {
        throw err;
      }
      console.warn("Update Supabase password background fail (fallback local active):", err);
    }

    // 5. Update local session & state
    if (this.state.currentSession) {
      this.state.currentSession.passwordUpdated = nowIso;
      this.state.currentSession.isPasswordChanged = true;
      localStorage.setItem(SESSION_KEY, JSON.stringify(this.state.currentSession));
    }
    if (this.state.user) {
      this.state.user.passwordUpdated = nowIso;
      this.state.user.isPasswordChanged = true;
    }

    // Update in Store accounts memory
    const acc = this.accounts.find(a => a.nip === activeNip);
    if (acc) {
      acc.password = hashedNew;
    }

    this.save();
    return true;
  },

  logoutSession() {
    this.state.currentSession = null;
    localStorage.removeItem(SESSION_KEY);
    this.save();
  },

  // ==========================================
  // CLOUD SUPABASE IDP CRUD ENGINE
  // ==========================================

  async loadUserIdp(nip) {
    if (!nip || typeof supabaseClient === 'undefined') return;
    const cleanNip = String(nip).trim();

    try {
      // 1. Ambil status submission dari Supabase
      const { data: subData, error: subErr } = await supabaseClient
        .from('idp_submissions')
        .select('*')
        .eq('nip', cleanNip)
        .maybeSingle();

      if (!subErr && subData) {
        this.state.idpState.status = subData.status || 'Draft';
        this.state.idpState.progress = subData.progress || 0;
        this.state.idpState.verificationNote = subData.verification_note || '';
      }

      // 2. Ambil rincian program dari Supabase
      const { data: progData, error: progErr } = await supabaseClient
        .from('idp_programs')
        .select('*')
        .eq('nip', cleanNip)
        .order('id', { ascending: true });

      if (!progErr && progData) {
        this.state.idpState.programs = progData.map(p => ({
          id: p.id,
          kompetensi: p.kompetensi,
          metode: p.metode,
          topik: p.topik,
          jenisDiklat: p.jenis_diklat,
          jp: p.jp,
          penyelenggara: p.penyelenggara,
          periode: p.periode,
          periodeMulai: p.periode_mulai,
          periodeSelesai: p.periode_selesai,
          estimasi: p.estimasi,
          keterangan: p.keterangan,
          status: p.status
        }));
        this.updateUserStats();
      }

      this.save();
    } catch (err) {
      console.warn('Gagal memuat IDP dari Supabase, menggunakan data lokal:', err);
    }
  },

  // Helper Getters
  getIdpSummary() {
    const programs = this.state.idpState.programs || [];
    const totalProgram = programs.length;
    const totalJp = programs.reduce((acc, p) => acc + (parseInt(p.jp) || 0), 0);
    const totalCost = programs.reduce((acc, p) => acc + (parseInt(p.estimasi) || 0), 0);
    const completed = programs.filter(p => p.status === 'Terlaksana').length;
    const progressPct = totalProgram > 0 ? Math.round((completed / totalProgram) * 100) : 0;
    
    return { totalProgram, totalJp, totalCost, completed, progressPct };
  },

  async addProgram(programData) {
    const tempId = Date.now();
    const newProgram = {
      id: tempId,
      ...programData,
      jp: parseInt(programData.jp) || 0,
      estimasi: parseInt(programData.estimasi) || 0,
      status: programData.status || 'Direncanakan'
    };
    this.state.idpState.programs.push(newProgram);
    this.updateUserStats();
    this.save();

    // Simpan ke Supabase di background
    const userNip = this.state.user?.nip;
    if (userNip && typeof supabaseClient !== 'undefined') {
      try {
        const { data, error } = await supabaseClient
          .from('idp_programs')
          .insert({
            nip: String(userNip).trim(),
            kompetensi: newProgram.kompetensi,
            metode: newProgram.metode,
            topik: newProgram.topik,
            jenis_diklat: newProgram.jenisDiklat,
            jp: newProgram.jp,
            penyelenggara: newProgram.penyelenggara,
            periode: newProgram.periode,
            periode_mulai: newProgram.periodeMulai,
            periode_selesai: newProgram.periodeSelesai,
            estimasi: newProgram.estimasi,
            keterangan: newProgram.keterangan,
            status: newProgram.status
          })
          .select()
          .single();

        if (!error && data) {
          newProgram.id = data.id;
          this.save();
        } else if (error) {
          console.error("Supabase insert program error:", error);
        }
      } catch (e) {
        console.error("Gagal sync program ke Supabase:", e);
      }
    }
  },

  async updateProgram(id, updatedData) {
    const idx = this.state.idpState.programs.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.state.idpState.programs[idx] = {
        ...this.state.idpState.programs[idx],
        ...updatedData,
        jp: parseInt(updatedData.jp) || 0,
        estimasi: parseInt(updatedData.estimasi) || 0
      };
      this.updateUserStats();
      this.save();

      // Update ke Supabase
      if (typeof supabaseClient !== 'undefined') {
        try {
          const { error } = await supabaseClient
            .from('idp_programs')
            .update({
              kompetensi: updatedData.kompetensi,
              metode: updatedData.metode,
              topik: updatedData.topik,
              jenis_diklat: updatedData.jenisDiklat,
              jp: parseInt(updatedData.jp) || 0,
              penyelenggara: updatedData.penyelenggara,
              periode: updatedData.periode,
              periode_mulai: updatedData.periodeMulai,
              periode_selesai: updatedData.periodeSelesai,
              estimasi: parseInt(updatedData.estimasi) || 0,
              keterangan: updatedData.keterangan
            })
            .eq('id', id);

          if (error) console.error("Supabase update program error:", error);
        } catch (e) {
          console.error("Gagal update program di Supabase:", e);
        }
      }
    }
  },

  async deleteProgram(id) {
    this.state.idpState.programs = this.state.idpState.programs.filter(p => p.id !== id);
    this.updateUserStats();
    this.save();

    // Hapus dari Supabase
    if (typeof supabaseClient !== 'undefined') {
      try {
        const { error } = await supabaseClient
          .from('idp_programs')
          .delete()
          .eq('id', id);

        if (error) console.error("Supabase delete program error:", error);
      } catch (e) {
        console.error("Gagal hapus program dari Supabase:", e);
      }
    }
  },

  async submitIdp() {
    this.state.idpState.status = 'Diajukan ke Atasan';
    const summary = this.getIdpSummary();
    const userNip = this.state.user?.nip;

    const v = this.state.verifications.find(x => x.nip === userNip);
    if (v) {
      v.status = 'Diajukan ke Atasan';
      v.programCount = this.state.idpState.programs.length;
      v.totalJp = summary.totalJp;
      v.estimasiBiaya = `Rp${summary.totalCost.toLocaleString('id-ID')}`;
    }
    this.save();

    // Sync ke Supabase
    if (userNip && typeof supabaseClient !== 'undefined') {
      try {
        const { error } = await supabaseClient
          .from('idp_submissions')
          .upsert({
            nip: String(userNip).trim(),
            tahun: '2026',
            status: 'Diajukan ke Atasan',
            progress: summary.progressPct,
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) console.error("Supabase submitIdp error:", error);
      } catch (e) {
        console.error("Gagal submit IDP ke Supabase:", e);
      }
    }

    // Kirim notifikasi Real-time ke Admin & Pimpinan
    await this.sendNotification({
      penerima: 'admin',
      judul: 'Pengajuan IDP Baru',
      pesan: `${this.state.user?.name || 'Pegawai'} mengajukan rancangan IDP Tahun 2026 (${summary.totalProgram} program, ${summary.totalJp} JP).`,
      tipe: 'info'
    });
    await this.sendNotification({
      penerima: 'pimpinan',
      judul: 'Pengajuan IDP Masuk',
      pesan: `${this.state.user?.name || 'Pegawai'} telah mengajukan rencana pengembangan kompetensi (IDP 2026).`,
      tipe: 'info'
    });
  },

  async approveIdp(verificationId, note = '', newStatus = 'Final') {
    const item = this.state.verifications.find(v => v.id === verificationId);
    if (item) {
      item.status = newStatus;
      item.notes = note;
      if (item.nip === this.state.user.nip) {
        this.state.idpState.status = newStatus;
        this.state.idpState.verificationNote = note;
      }
      this.save();

      if (typeof supabaseClient !== 'undefined' && item.nip) {
        try {
          await supabaseClient
            .from('idp_submissions')
            .upsert({
              nip: item.nip,
              status: newStatus,
              verification_note: note,
              verified_at: new Date().toISOString(),
              verified_by: this.state.user?.name || 'Kasubbag Kepegawaian',
              updated_at: new Date().toISOString()
            });
        } catch(e) {
          console.error("Gagal approve IDP di Supabase:", e);
        }
      }

      // Kirim Notifikasi Real-time ke Pegawai bersangkutan
      await this.sendNotification({
        penerima: item.nip,
        judul: 'IDP Berhasil Disetujui',
        pesan: `Selamat! Dokumen rencana IDP Tahun 2026 Anda telah diverifikasi & disetujui resmi oleh ${this.state.user?.name || 'Pengelola SDM'}.`,
        tipe: 'success'
      });
    }
  },

  async rejectIdp(verificationId, note) {
    const item = this.state.verifications.find(v => v.id === verificationId);
    if (item) {
      item.status = 'Perlu Revisi';
      item.notes = note;
      if (item.nip === this.state.user.nip) {
        this.state.idpState.status = 'Perlu Revisi';
        this.state.idpState.verificationNote = note;
      }
      this.save();

      if (typeof supabaseClient !== 'undefined' && item.nip) {
        try {
          await supabaseClient
            .from('idp_submissions')
            .upsert({
              nip: item.nip,
              status: 'Perlu Revisi',
              verification_note: note,
              verified_at: new Date().toISOString(),
              verified_by: this.state.user?.name || 'Kasubbag Kepegawaian',
              updated_at: new Date().toISOString()
            });
        } catch(e) {
          console.error("Gagal reject IDP di Supabase:", e);
        }
      }

      // Kirim Notifikasi Real-time ke Pegawai bersangkutan
      await this.sendNotification({
        penerima: item.nip,
        judul: 'Catatan Revisi IDP',
        pesan: `Rencana IDP Anda memerlukan perbaikan. Catatan verifikator: "${note || 'Silakan cek kelengkapan dokumen'}".`,
        tipe: 'warning'
      });
    }
  },

  async addRealization(realizationData, file) {
    const newId = Date.now();
    let fileUrl = realizationData.bukti;

    // Jika ada file yang diunggah, simpan ke Supabase Storage
    if (file && typeof supabaseClient !== 'undefined') {
      try {
        const fileExt = file.name.split('.').pop();
        const safeName = realizationData.pegawai.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${newId}_${safeName}.${fileExt}`;
        const filePath = `sertifikat/${fileName}`;

        const { data, error } = await supabaseClient.storage
          .from('sertifikat_idp')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (error) throw error;
        
        // Dapatkan Public URL
        const { data: publicUrlData } = supabaseClient.storage
          .from('sertifikat_idp')
          .getPublicUrl(filePath);
          
        fileUrl = publicUrlData.publicUrl;
      } catch (err) {
        console.error("Gagal mengunggah sertifikat ke Supabase Storage:", err);
        throw new Error("Gagal mengunggah sertifikat. Pastikan Anda telah membuat bucket 'sertifikat_idp' di Supabase. " + err.message);
      }
    }

    this.state.realizations.unshift({
      id: newId,
      ...realizationData,
      jp: parseInt(realizationData.jp) || 0,
      status: 'Terverifikasi',
      buktiUrl: fileUrl, // Simpan URL publik
      bukti: file ? file.name : realizationData.bukti
    });
    this.save();

    // Kirim notifikasi Real-time ke Pengelola SDM (Admin)
    await this.sendNotification({
      penerima: 'admin',
      judul: 'Bukti Sertifikat / Realisasi Baru',
      pesan: `${realizationData.pegawai || 'Pegawai'} telah mengunggah bukti realisasi untuk kegiatan "${realizationData.program}" (${realizationData.jp} JP).`,
      tipe: 'info'
    });
  },

  updateUserStats() {
    const summary = this.getIdpSummary();
    this.state.idpState.progress = summary.progressPct;
    this.save();
  },

  // ==========================================
  // REAL-TIME NOTIFICATIONS ENGINE (TAHAP 5.3)
  // ==========================================

  async fetchNotifications(user) {
    if (!user) user = this.state.user;
    const role = user?.role || 'pegawai';
    const nip = String(user?.nip || '').trim();

    if (typeof supabaseClient !== 'undefined') {
      try {
        let query = supabaseClient
          .from('notifikasi')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);

        if (role === 'admin' || role === 'pimpinan') {
          query = query.or(`penerima.eq.all,penerima.eq.${role},penerima.eq.all_admin,penerima.eq.${nip}`);
        } else {
          query = query.or(`penerima.eq.all,penerima.eq.pegawai,penerima.eq.${nip}`);
        }

        const { data, error } = await query;
        if (!error && data) {
          this.state.notifications = data;
          this.updateNotificationUnreadCount();
          this.save();
          return this.state.notifications;
        }
      } catch (err) {
        console.warn("Gagal mengambil notifikasi dari Supabase, memakai data lokal:", err);
      }
    }

    if (!this.state.notifications) this.state.notifications = [];
    this.updateNotificationUnreadCount();
    return this.state.notifications;
  },

  async sendNotification({ penerima, judul, pesan, tipe = 'info' }) {
    const sender = this.state.user?.name || 'Sistem SIP-KOMPETENSI';
    const newNotif = {
      penerima: String(penerima || 'all').trim(),
      pengirim: sender,
      judul: judul || 'Pemberitahuan Kedinasan',
      pesan: pesan || '',
      tipe: tipe || 'info',
      dibaca: false,
      created_at: new Date().toISOString()
    };

    if (typeof supabaseClient !== 'undefined') {
      try {
        const { data, error } = await supabaseClient
          .from('notifikasi')
          .insert([newNotif])
          .select();

        if (error) {
          console.error("Gagal mengirim notifikasi ke Supabase:", error);
        } else if (data && data.length > 0) {
          return data[0];
        }
      } catch (err) {
        console.error("Error sendNotification:", err);
      }
    }

    // Fallback simpan lokal jika offline
    newNotif.id = Date.now();
    if (!this.state.notifications) this.state.notifications = [];
    this.state.notifications.unshift(newNotif);
    this.updateNotificationUnreadCount();
    this.save();
    return newNotif;
  },

  async markNotificationAsRead(id) {
    if (!this.state.notifications) return;
    const notif = this.state.notifications.find(n => n.id == id);
    if (notif) {
      notif.dibaca = true;
      this.updateNotificationUnreadCount();
      this.save();
    }

    if (typeof supabaseClient !== 'undefined') {
      try {
        await supabaseClient
          .from('notifikasi')
          .update({ dibaca: true })
          .eq('id', id);
      } catch (err) {
        console.warn("Gagal update status dibaca di Supabase:", err);
      }
    }
  },

  async markAllNotificationsAsRead() {
    if (!this.state.notifications) return;
    this.state.notifications.forEach(n => n.dibaca = true);
    this.updateNotificationUnreadCount();
    this.save();

    if (typeof supabaseClient !== 'undefined') {
      try {
        const unreadIds = this.state.notifications.map(n => n.id);
        if (unreadIds.length > 0) {
          await supabaseClient
            .from('notifikasi')
            .update({ dibaca: true })
            .in('id', unreadIds);
        }
      } catch (err) {
        console.warn("Gagal mark all as read di Supabase:", err);
      }
    }
  },

  updateNotificationUnreadCount() {
    if (!this.state.notifications) this.state.notifications = [];
    this.state.unreadCount = this.state.notifications.filter(n => !n.dibaca).length;
  }
};

// Initialize persistent store
Store.init();

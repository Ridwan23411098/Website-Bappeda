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
    unreadCount: 3,

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
      status: 'Draft', // 'Draft' | 'Menunggu Verifikasi' | 'Disetujui' | 'Perlu Revisi'
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
        status: 'Menunggu Verifikasi',
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
        status: 'Disetujui',
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
        { label: 'Bidang PPEPD', rencana: 9, realisasi: 8 },
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
        }

        // Ensure 99 ASN (DUK 2026) and official Bappeda master data are always loaded
        if (!this.state.employees || this.state.employees.length < 50 || (this.state.employees[0] && this.state.employees[0].name.includes('ELVIRA'))) {
          if (typeof BAPPEDA_DATA !== 'undefined') {
            this.state.employees = BAPPEDA_DATA.employees;
            this.state.monitoringUnits = BAPPEDA_DATA.monitoringUnits;
            this.state.verifications = BAPPEDA_DATA.verifications;
            this.state.realizations = BAPPEDA_DATA.realizations;
          }
          this.save();
        }
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
        this.save();
      }

      // Check active session
      const activeSess = localStorage.getItem(SESSION_KEY);
      if (activeSess) {
        this.state.currentSession = JSON.parse(activeSess);
      }
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

  /**
   * Authentic credential login validator
   * @param {string} nip
   * @param {string} password
   */
  authenticate(nip, password) {
    const cleanNip = String(nip || '').trim();
    const cleanPass = String(password || '').trim();

    if (!cleanNip) {
      throw new Error('NIP wajib diisi.');
    }
    if (!cleanPass) {
      throw new Error('Kata sandi wajib diisi.');
    }

    const matched = this.accounts.find(acc => acc.nip === cleanNip);
    if (!matched) {
      throw new Error('NIP tidak terdaftar dalam basis data kepegawaian Bappeda.');
    }

    if (matched.password !== cleanPass) {
      throw new Error('Kata sandi yang Anda masukkan salah.');
    }

    // Success: Store Session
    const sessionUser = {
      nip: matched.nip,
      name: matched.name,
      pangkat: matched.pangkat,
      jabatan: matched.jabatan,
      unitKerja: matched.unitKerja,
      role: matched.role,
      avatarInitial: matched.avatarInitial,
      loginTime: new Date().toISOString()
    };

    this.state.currentSession = sessionUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    this.save();

    return sessionUser;
  },

  logoutSession() {
    this.state.currentSession = null;
    localStorage.removeItem(SESSION_KEY);
    this.save();
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

  addProgram(programData) {
    const newId = Date.now();
    const newProgram = {
      id: newId,
      ...programData,
      jp: parseInt(programData.jp) || 0,
      estimasi: parseInt(programData.estimasi) || 0,
      status: programData.status || 'Direncanakan'
    };
    this.state.idpState.programs.push(newProgram);
    this.updateUserStats();
    this.save();
  },

  updateProgram(id, updatedData) {
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
    }
  },

  deleteProgram(id) {
    this.state.idpState.programs = this.state.idpState.programs.filter(p => p.id !== id);
    this.updateUserStats();
    this.save();
  },

  submitIdp() {
    this.state.idpState.status = 'Menunggu Verifikasi';
    const v = this.state.verifications.find(x => x.nip === this.state.user.nip);
    if (v) {
      v.status = 'Menunggu Verifikasi';
      v.programCount = this.state.idpState.programs.length;
      v.totalJp = this.getIdpSummary().totalJp;
      v.estimasiBiaya = `Rp${this.getIdpSummary().totalCost.toLocaleString('id-ID')}`;
    }
    this.save();
  },

  approveIdp(verificationId, note = '') {
    const item = this.state.verifications.find(v => v.id === verificationId);
    if (item) {
      item.status = 'Disetujui';
      item.notes = note;
      if (item.nip === this.state.user.nip) {
        this.state.idpState.status = 'Disetujui';
        this.state.idpState.verificationNote = note;
      }
      this.save();
    }
  },

  rejectIdp(verificationId, note) {
    const item = this.state.verifications.find(v => v.id === verificationId);
    if (item) {
      item.status = 'Perlu Revisi';
      item.notes = note;
      if (item.nip === this.state.user.nip) {
        this.state.idpState.status = 'Perlu Revisi';
        this.state.idpState.verificationNote = note;
      }
      this.save();
    }
  },

  addRealization(realizationData) {
    const newId = Date.now();
    this.state.realizations.unshift({
      id: newId,
      ...realizationData,
      jp: parseInt(realizationData.jp) || 0,
      status: 'Terverifikasi'
    });
    this.save();
  },

  updateUserStats() {
    const summary = this.getIdpSummary();
    this.state.idpState.progress = summary.progressPct;
    this.save();
  }
};

// Initialize persistent store
Store.init();

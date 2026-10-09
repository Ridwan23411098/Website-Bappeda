/**
 * SIP-KOMPETENSI — BAPPEDA PROVINSI LAMPUNG
 * Persistent Local Database & Official ASN Authentication Engine
 */

const STORAGE_KEY = 'sip_kompetensi_bappeda_db_v4';
const SESSION_KEY = 'sip_kompetensi_active_session';
const USER_REALIZATIONS_KEY = 'sip_user_realizations_v2';

// IndexedDB Helper untuk penyimpanan bukti/sertifikat dan backup data realisasi tanpa batas 5MB localStorage
const IDBHelper = {
  dbPromise: null,
  getDB() {
    if (typeof indexedDB === 'undefined') return Promise.resolve(null);
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve) => {
        try {
          const req = indexedDB.open('sip_kompetensi_files_db', 2);
          req.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('files')) {
              db.createObjectStore('files', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('backup')) {
              db.createObjectStore('backup', { keyPath: 'key' });
            }
          };
          req.onsuccess = e => resolve(e.target.result);
          req.onerror = () => resolve(null);
        } catch(e) {
          resolve(null);
        }
      });
    }
    return this.dbPromise;
  },
  async setFile(id, dataUrl) {
    if (!id || !dataUrl) return false;
    try {
      const db = await this.getDB();
      if (!db) return false;
      return new Promise((resolve) => {
        const tx = db.transaction('files', 'readwrite');
        tx.objectStore('files').put({ id: String(id), data: dataUrl });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch(e) {
      return false;
    }
  },
  async getFile(id) {
    if (!id) return null;
    try {
      const db = await this.getDB();
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction('files', 'readonly');
        const req = tx.objectStore('files').get(String(id));
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => resolve(null);
      });
    } catch(e) {
      return null;
    }
  },
  async setData(key, val) {
    if (!key) return false;
    try {
      const db = await this.getDB();
      if (!db || !db.objectStoreNames.contains('backup')) return false;
      return new Promise((resolve) => {
        const tx = db.transaction('backup', 'readwrite');
        tx.objectStore('backup').put({ key, val });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch(e) {
      return false;
    }
  },
  async getData(key) {
    if (!key) return null;
    try {
      const db = await this.getDB();
      if (!db || !db.objectStoreNames.contains('backup')) return null;
      return new Promise((resolve) => {
        const tx = db.transaction('backup', 'readonly');
        const req = tx.objectStore('backup').get(key);
        req.onsuccess = () => resolve(req.result ? req.result.val : null);
        req.onerror = () => resolve(null);
      });
    } catch(e) {
      return null;
    }
  }
};

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
      let saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // Fallback migrasi jika user sebelumnya punya data di versi key lama
        const oldKeys = ['sip_kompetensi_bappeda_db_v3', 'sip_kompetensi_bappeda_db_v2', 'sip_kompetensi_bappeda_db'];
        for (const k of oldKeys) {
          const prev = localStorage.getItem(k);
          if (prev) {
            saved = prev;
            break;
          }
        }
      }

      if (saved) {
        try {
          this.state = JSON.parse(saved);
        } catch (parseErr) {
          console.error("Gagal parse saved state:", parseErr);
          this.state = JSON.parse(JSON.stringify(this.defaultState));
        }
      } else {
        this.state = JSON.parse(JSON.stringify(this.defaultState));
      }

      // Ensure official master data is always synchronized
      if (typeof BAPPEDA_DATA !== 'undefined') {
        if (!this.state.masterData) this.state.masterData = {};
        this.state.masterData.jenjang = BAPPEDA_DATA.masterJenjang;
        this.state.masterData.metode = BAPPEDA_DATA.masterMetode;
        this.state.masterData.rumpun = BAPPEDA_DATA.masterRumpun;
        this.state.employees = BAPPEDA_DATA.employees;
        this.state.monitoringUnits = BAPPEDA_DATA.monitoringUnits;

        // PERTAHANKAN SEMUA REALISASI YANG SUDAH TERSIMPAN DI STATE (jangan pernah buang data lokal!)
        const currentRealizations = Array.isArray(this.state.realizations) ? this.state.realizations : [];
        const bappedaRealizations = Array.isArray(BAPPEDA_DATA.realizations) ? BAPPEDA_DATA.realizations : [];
        const currentIds = new Set(currentRealizations.map(r => r.id));
        const missingBappeda = bappedaRealizations.filter(r => !currentIds.has(r.id));
        this.state.realizations = [...currentRealizations, ...missingBappeda];

        if (!this.state.verifications || this.state.verifications.length === 0) {
          this.state.verifications = BAPPEDA_DATA.verifications;
        }
        this.state.executiveMetrics = JSON.parse(JSON.stringify(this.defaultState.executiveMetrics));
      }

      // 1. PULIHKAN DARI USER_REALIZATIONS_KEY (Penyimpanan khusus terpisah yang anti-penuh & anti-hilang)
      try {
        const dedicatedSaved = localStorage.getItem(USER_REALIZATIONS_KEY);
        if (dedicatedSaved) {
          const dedicatedList = JSON.parse(dedicatedSaved);
          if (Array.isArray(dedicatedList) && dedicatedList.length > 0) {
            if (!Array.isArray(this.state.realizations)) this.state.realizations = [];
            const existingIds = new Set(this.state.realizations.map(r => r.id));
            dedicatedList.forEach(dr => {
              if (!existingIds.has(dr.id)) {
                this.state.realizations.unshift(dr);
                existingIds.add(dr.id);
              }
            });
          }
        }
      } catch (dedErr) {
        console.warn("Gagal membaca dedicated realization storage:", dedErr);
      }

      // 2. Pulihkan cadangan dari IndexedDB secara asinkron
      if (typeof IDBHelper !== 'undefined') {
        IDBHelper.getData('user_realizations').then(idbList => {
          if (Array.isArray(idbList) && idbList.length > 0) {
            let changed = false;
            if (!Array.isArray(this.state.realizations)) this.state.realizations = [];
            const existingIds = new Set(this.state.realizations.map(r => r.id));
            idbList.forEach(ir => {
              if (!existingIds.has(ir.id)) {
                this.state.realizations.unshift(ir);
                existingIds.add(ir.id);
                changed = true;
              }
            });
            if (changed) {
              this.syncIdpStatusWithRealizations();
              this.save();
              if (typeof App !== 'undefined') {
                if (Store.state.activePage === 'eidp' && App.renderIdpSaya) App.renderIdpSaya();
                if (Store.state.activePage === 'epelaksanaan' && App.renderEmployeeRealization) App.renderEmployeeRealization();
              }
            }
          }
        }).catch(() => {});
      }

      // Pastikan idpState dan programs selalu ada
      if (!this.state.idpState) {
        this.state.idpState = JSON.parse(JSON.stringify(this.defaultState.idpState));
      }
      if (!Array.isArray(this.state.idpState.programs) || this.state.idpState.programs.length === 0) {
        this.state.idpState.programs = JSON.parse(JSON.stringify(this.defaultState.idpState.programs));
      }

      // SINKRONKAN STATUS IDP BERDASARKAN REALISASI SECARA AMAN (Bebas TypeError)
      this.syncIdpStatusWithRealizations();

      // Check active session & sanitize any cached PPEPD -> PMPE
      const activeSess = localStorage.getItem(SESSION_KEY);
      if (activeSess) {
        try {
          this.state.currentSession = JSON.parse(activeSess);
          if (this.state.currentSession.unitKerja) {
            this.state.currentSession.unitKerja = this.state.currentSession.unitKerja.replace(/PPEPD/g, 'PMPE');
          }
          if (this.state.currentSession.jabatan) {
            this.state.currentSession.jabatan = this.state.currentSession.jabatan.replace(/PPEPD/g, 'PMPE');
          }
          localStorage.setItem(SESSION_KEY, JSON.stringify(this.state.currentSession));
        } catch(e) {}
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
      this.updateUserStats();

      this.save();
    } catch (err) {
      console.error('Peringatan di Store.init():', err);
      // JANGAN PERNAH WIPE DATA USER JIKA TERJADI ERROR KECIL!
      if (!this.state || !Array.isArray(this.state.realizations)) {
        this.state = JSON.parse(JSON.stringify(this.defaultState));
        this.save();
      }
    }
  },

  syncIdpStatusWithRealizations() {
    if (!this.state.idpState) {
      this.state.idpState = { status: 'Draft', progress: 0, programs: [] };
    }
    if (!Array.isArray(this.state.idpState.programs)) {
      this.state.idpState.programs = [];
    }

    const allRels = this.state.realizations || [];
    const progList = this.state.idpState.programs;

    progList.forEach(p => {
      const pTopik = String(p.topik || '').toLowerCase();
      const hasRel = allRels.some(r => {
        const rProg = String(r.program || '').toLowerCase();
        if (r.programId && r.programId === p.id) return true;
        if (pTopik && rProg && (pTopik === rProg || pTopik.includes(rProg) || rProg.includes(pTopik))) return true;
        return false;
      });
      if (hasRel) {
        p.status = 'Terlaksana';
      }
    });

    // Tambahkan realisasi user yang belum ada di daftar program IDP
    allRels.forEach(r => {
      if (r.isUserInput && r.program) {
        const rProg = String(r.program || '').toLowerCase();
        const exists = progList.some(p => {
          const pTopik = String(p.topik || '').toLowerCase();
          if (p.id === r.programId) return true;
          if (pTopik && rProg && (pTopik === rProg || pTopik.includes(rProg) || rProg.includes(pTopik))) return true;
          return false;
        });
        if (!exists) {
          progList.unshift({
            id: r.programId || r.id,
            kompetensi: r.kompetensi || 'Pengembangan Kompetensi',
            metode: r.metode || 'Diklat Teknis',
            topik: r.program,
            jenisDiklat: r.metode || 'Diklat Teknis',
            jp: parseInt(r.jp) || 20,
            penyelenggara: r.penyelenggara || 'BPSDMD Provinsi Lampung',
            periode: 'Tahun 2026',
            estimasi: 0,
            status: 'Terlaksana',
            isUserInput: true
          });
        }
      }
    });
  },

  save() {
    // 1. Simpan realisasi user ke dedicated key anti-penuh (hanya data teks ringan)
    try {
      const userRels = (this.state.realizations || []).filter(r => r.isUserInput);
      const cleanUserRels = userRels.map(r => ({
        ...r,
        buktiUrl: (r.buktiUrl && r.buktiUrl.startsWith('http')) ? r.buktiUrl : ''
      }));
      localStorage.setItem(USER_REALIZATIONS_KEY, JSON.stringify(cleanUserRels));
      if (typeof IDBHelper !== 'undefined') {
        IDBHelper.setData('user_realizations', cleanUserRels).catch(() => {});
      }
    } catch (e) {
      console.warn("Gagal menyimpan ke dedicated realization key:", e);
    }

    // 2. Simpan full state ke main STORAGE_KEY dengan pembersihan dataUrl besar
    try {
      if (Array.isArray(this.state.realizations)) {
        this.state.realizations.forEach(r => {
          if (r.buktiUrl && r.buktiUrl.startsWith('data:')) {
            r.buktiUrl = ''; // Sudah aman di IndexedDB
          }
        });
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('localStorage save quota reached, saving sanitized lightweight state:', e);
      try {
        const safeState = JSON.parse(JSON.stringify(this.state, (key, value) => {
          if (key === 'buktiUrl' && typeof value === 'string' && value.startsWith('data:')) {
            return '';
          }
          return value;
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeState));
      } catch (err2) {
        console.error('Critical: Failed to save state to localStorage even after sanitizing:', err2);
      }
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

      if (!progErr && progData && progData.length > 0) {
        const remotePrograms = progData.map(p => ({
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

        // Sinkronkan status Terlaksana berdasarkan realisasi lokal yang ada secara aman
        const realizations = this.state.realizations || [];
        remotePrograms.forEach(p => {
          const pTopik = String(p.topik || '').toLowerCase();
          const hasRealization = realizations.some(r => {
            const rProg = String(r.program || '').toLowerCase();
            return (r.programId && r.programId === p.id) ||
              (pTopik && rProg && (pTopik === rProg || pTopik.includes(rProg) || rProg.includes(pTopik)));
          });
          if (hasRealization) {
            p.status = 'Terlaksana';
          }
        });

        // Pertahankan program buatan user lokal yang belum ada di Supabase
        const existingRemoteTopiks = new Set(remotePrograms.map(p => String(p.topik || '').toLowerCase()));
        const localOnlyPrograms = (this.state.idpState?.programs || []).filter(p => 
          p.isUserInput && !existingRemoteTopiks.has(String(p.topik || '').toLowerCase())
        );

        this.state.idpState.programs = [...localOnlyPrograms, ...remotePrograms];
        this.syncIdpStatusWithRealizations();
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
    const rawNip = this.state.user?.nip;
    const cleanUserNip = String(rawNip || '').replace(/\s+/g, '');

    const v = this.state.verifications.find(x => String(x.nip).replace(/\s+/g, '') === cleanUserNip);
    if (v) {
      v.status = 'Diajukan ke Atasan';
      v.programCount = this.state.idpState.programs.length;
      v.totalJp = summary.totalJp;
      v.estimasiBiaya = `Rp${summary.totalCost.toLocaleString('id-ID')}`;
    }
    this.save();

    // Sync ke Supabase
    if (cleanUserNip && typeof supabaseClient !== 'undefined') {
      try {
        const { error } = await supabaseClient
          .from('idp_submissions')
          .upsert({
            nip: cleanUserNip,
            tahun: '2026',
            status: 'Diajukan ke Atasan',
            progress: summary.progressPct,
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error("Supabase submitIdp error:", error);
          if (typeof App !== 'undefined') App.toast("Error DB: " + error.message, 'error');
        }
      } catch (e) {
        console.error("Gagal submit IDP ke Supabase:", e);
        if (typeof App !== 'undefined') App.toast("Koneksi gagal: " + e.message, 'error');
      }
    }

    // Kirim notifikasi Real-time ke Admin & Pimpinan
    try {
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
    } catch (e) {
      if (typeof App !== 'undefined') App.toast("Error Notif: " + e.message, 'warning');
    }
  },

  async syncVerificationsFromSupabase() {
    if (typeof supabaseClient === 'undefined') return;
    try {
      const { data, error } = await supabaseClient
        .from('idp_submissions')
        .select('*')
        .order('updated_at', { ascending: true }); // Penting: yang terbaru me-replace yang lama (jika ada NIP duplikat spasi)

      if (error) {
        console.error("Gagal select Supabase:", error);
      }

      if (!error && data && data.length > 0) {
        data.forEach(sub => {
          const cleanSubNip = String(sub.nip).replace(/\s+/g, '');
          const v = this.state.verifications.find(x => String(x.nip).replace(/\s+/g, '') === cleanSubNip);
          if (v) {
            v.status = sub.status || v.status;
            if (sub.progress !== undefined) v.progress = sub.progress;
            if (sub.verification_note) v.notes = sub.verification_note;
            if (sub.submitted_at) {
              const d = new Date(sub.submitted_at);
              v.pengajuan = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
            }
          } else {
            const emp = (typeof BAPPEDA_DATA !== 'undefined' && BAPPEDA_DATA.employees) 
              ? BAPPEDA_DATA.employees.find(e => String(e.nip).replace(/\s+/g, '') === cleanSubNip)
              : null;
            if (emp) {
              this.state.verifications.unshift({
                id: Date.now() + Math.floor(Math.random() * 1000),
                pegawai: emp.nama,
                nip: emp.nip,
                jabatan: emp.jabatan,
                jenisJabatan: emp.jenis || 'Struktural',
                targetKarier: 'Pengembangan Kompetensi 2026',
                rencanaKarier: 'Penguatan keahlian perencanaan',
                programCount: 1,
                totalJp: 20,
                estimasiBiaya: 'Rp0',
                pengajuan: 'Hari Ini',
                status: sub.status || 'Diajukan ke Atasan',
                notes: sub.verification_note || ''
              });
            }
          }
        });
        this.save();
      }
    } catch (e) {
      console.warn("Gagal sinkron verifikasi dari Supabase:", e);
    }
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
    let fileUrl = realizationData.bukti || '';
    let uploadedToCloud = false;

    // Jika ada file yang diunggah, coba simpan ke Supabase Storage
    if (file) {
      if (typeof supabaseClient !== 'undefined') {
        try {
          const fileExt = file.name.split('.').pop();
          const safeName = (realizationData.pegawai || 'pegawai').replace(/[^a-zA-Z0-9]/g, '_');
          const fileName = `${newId}_${safeName}.${fileExt}`;
          const filePath = `sertifikat/${fileName}`;

          const { data, error } = await supabaseClient.storage
            .from('sertifikat_idp')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

          if (!error) {
            const { data: publicUrlData } = supabaseClient.storage
              .from('sertifikat_idp')
              .getPublicUrl(filePath);
            if (publicUrlData && publicUrlData.publicUrl) {
              fileUrl = publicUrlData.publicUrl;
              uploadedToCloud = true;
            }
          }
        } catch (err) {
          console.warn("Supabase Storage bucket belum aktif atau gagal upload:", err);
        }
      }

      // Fallback lokal jika bucket cloud belum dibuat
      if (!uploadedToCloud) {
        try {
          fileUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          });
        } catch(e) {}
      }

      // Simpan file ke IndexedDB agar tidak hilang setelah reload dan tidak membebani localStorage quota
      if (fileUrl && fileUrl.startsWith('data:')) {
        try {
          await IDBHelper.setFile(newId, fileUrl);
        } catch(e) {}
      }
    }

    const currentAsn = this.state.user || this.state.currentSession || {};
    const entryNip = realizationData.nip || currentAsn.nip || '';
    const entryPegawai = realizationData.pegawai || currentAsn.name || 'Pegawai Bappeda';

    // PENTING: buktiUrl HANYA simpan URL jika terunggah ke Cloud.
    // Jika base64 lokal, kosongkan di state memori agar localStorage super ringan!
    // File aslinya dibuka via IDBHelper.getFile(id)
    const storedBuktiUrl = uploadedToCloud ? fileUrl : '';

    const newRealizationObj = {
      id: newId,
      ...realizationData,
      nip: entryNip,
      pegawai: entryPegawai,
      jp: parseInt(realizationData.jp) || 0,
      status: 'Terverifikasi',
      isUserInput: true,
      buktiUrl: storedBuktiUrl,
      bukti: file ? file.name : (realizationData.bukti || 'Sertifikat_Kegiatan.pdf')
    };

    if (!Array.isArray(this.state.realizations)) {
      this.state.realizations = [];
    }
    this.state.realizations.unshift(newRealizationObj);

    // Tandai status program IDP yang bersangkutan menjadi 'Terlaksana'
    // ATAU jika belum ada di tabel IDP, otomatis tambahkan ke IDP Saya!
    if (!this.state.idpState) {
      this.state.idpState = { status: 'Draft', progress: 0, programs: [] };
    }
    if (!this.state.idpState.programs) {
      this.state.idpState.programs = [];
    }

    let pMatch = null;
    // Prioritas 1: cocokkan via ID program (paling akurat)
    if (realizationData.programId) {
      pMatch = this.state.idpState.programs.find(p => p.id === realizationData.programId);
    }
    // Fallback: cocokkan via topik string secara aman
    if (!pMatch && realizationData.program) {
      const targetStr = String(realizationData.program || '').toLowerCase();
      pMatch = this.state.idpState.programs.find(p => {
        const pTopik = String(p.topik || '').toLowerCase();
        const pKomp = String(p.kompetensi || '').toLowerCase();
        return pTopik === targetStr || pKomp === targetStr ||
          (pTopik && targetStr.includes(pTopik)) ||
          (pTopik && pTopik.includes(targetStr));
      });
    }

    if (pMatch) {
      pMatch.status = 'Terlaksana';
      pMatch.isRealized = true;
    } else {
      // Otomatis tambahkan program baru ke formulir IDP Saya dengan status Terlaksana!
      const newProg = {
        id: Date.now() + 1,
        kompetensi: realizationData.kompetensi || 'Pengembangan Kompetensi',
        metode: realizationData.metode || 'Diklat Teknis',
        topik: realizationData.program,
        jenisDiklat: realizationData.metode || 'Diklat Teknis',
        jp: parseInt(realizationData.jp) || 20,
        penyelenggara: realizationData.penyelenggara || 'BPSDMD Provinsi Lampung',
        periode: 'Tahun 2026',
        estimasi: 0,
        status: 'Terlaksana',
        isUserInput: true,
        isRealized: true
      };
      this.state.idpState.programs.unshift(newProg);
      pMatch = newProg;
    }

    // Sinkronkan status program ke Supabase Database jika ada koneksi
    if (typeof supabaseClient !== 'undefined') {
      try {
        if (pMatch && pMatch.id && !pMatch.isUserInput) {
          supabaseClient.from('idp_programs').update({ status: 'Terlaksana' }).eq('id', pMatch.id).then();
        } else if (entryNip && pMatch) {
          supabaseClient.from('idp_programs').insert({
            nip: String(entryNip).trim(),
            kompetensi: pMatch.kompetensi,
            metode: pMatch.metode,
            topik: pMatch.topik,
            jenis_diklat: pMatch.jenisDiklat,
            jp: pMatch.jp,
            penyelenggara: pMatch.penyelenggara,
            periode: pMatch.periode,
            estimasi: 0,
            status: 'Terlaksana'
          }).then();
        }
      } catch(e) {}
    }

    this.updateUserStats();
    this.save();

    // Kirim notifikasi Real-time ke Pengelola SDM (Admin)
    try {
      await this.sendNotification({
        penerima: 'admin',
        judul: 'Bukti Sertifikat / Realisasi Baru',
        pesan: `${entryPegawai} telah mengunggah bukti realisasi untuk kegiatan "${realizationData.program}" (${realizationData.jp} JP).`,
        tipe: 'success'
      });
    } catch(e) {}
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

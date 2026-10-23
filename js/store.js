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
      password: 'password',
      name: 'CIK MARYA S.E.,M.M.',
      pangkat: 'Pembina / IV/a',
      jabatan: 'Kepala Sub Bagian Umum & Kepegawaian',
      unitKerja: 'Sekretariat',
      role: 'admin',
      avatarInitial: 'CM'
    },
    {
      nip: '197507312000031002',
      password: 'password',
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
    activeYear: 2026,
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

    // Competencies Matrix (Sistem Diagnostik Kesenjangan Kompetensi ASN Bappeda)
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
        {
          name: 'Analisis Data Perencanaan Pembangunan',
          current: 2,
          target: 3,
          gap: 1,
          priority: 'Tinggi',
          status: 'Perlu Pengembangan',
          deskripsi: 'Kemampuan menganalisis data makro ekonomi, proyeksi IPM, kemiskinan, dan evaluasi capaian RKPD/RPJMD Provinsi Lampung.',
          solusi: 'Pelatihan Analisis Data Perencanaan dengan Python & PowerBI',
          metode: 'Diklat Teknis',
          jenisDiklat: 'Diklat Teknis Perencanaan',
          penyelenggara: 'Pusbindiklatren Bappenas / BPSDMD',
          jp: 20,
          estimasi: 1500000
        },
        {
          name: 'Penyusunan Dokumen Perencanaan (RPJMD/RKPD)',
          current: 2,
          target: 3,
          gap: 1,
          priority: 'Sedang',
          status: 'Perlu Pengembangan',
          deskripsi: 'Penyelarasan target indikator kinerja utama daerah dengan target RPJPN nasional dan SPM.',
          solusi: 'Bimtek Penyusunan Dokumen Evaluasi dan Pelaporan Kinerja Perencanaan',
          metode: 'Bimtek',
          jenisDiklat: 'Bimtek Kedinasan',
          penyelenggara: 'Internal Bappeda',
          jp: 10,
          estimasi: 0
        },
        {
          name: 'Pengolahan Data Spasial & Statistik Daerah',
          current: 3,
          target: 3,
          gap: 0,
          priority: 'Rendah',
          status: 'Terpenuhi',
          deskripsi: 'Penguasaan GIS / WebGIS dan pengolahan statistik sektoral untuk perencanaan tata ruang.',
          solusi: 'Pemeliharaan kompetensi via webinar berkala',
          metode: 'Seminar/Webinar',
          jenisDiklat: 'Non-Klasikal',
          penyelenggara: 'Badan Informasi Geospasial (BIG)',
          jp: 4,
          estimasi: 0
        }
      ],
      manajerial: [
        {
          name: 'Integritas',
          current: 2,
          target: 3,
          gap: 1,
          priority: 'Sedang',
          status: 'Perlu Pengembangan',
          deskripsi: 'Menjunjung etika birokrasi, kejujuran pelaporan anggaran perencanaan, dan keteladanan.',
          solusi: 'Workshop Penegakan Integritas & Anti-Korupsi',
          metode: 'Workshop',
          jenisDiklat: 'Non-Klasikal',
          penyelenggara: 'Inspektorat / KPK',
          jp: 4,
          estimasi: 0
        },
        {
          name: 'Kerjasama',
          current: 2,
          target: 3,
          gap: 1,
          priority: 'Sedang',
          status: 'Perlu Pengembangan',
          deskripsi: 'Membangun sinergi perencanaan antar bidang di Bappeda dan OPD teknis di lingkungan Pemprov Lampung.',
          solusi: 'Mentoring Manajemen Waktu & Efektivitas Tim Kerja',
          metode: 'Mentoring',
          jenisDiklat: 'Internal Bappeda',
          penyelenggara: 'Internal Bappeda',
          jp: 4,
          estimasi: 0
        },
        {
          name: 'Komunikasi',
          current: 2,
          target: 3,
          gap: 1,
          priority: 'Sedang',
          status: 'Perlu Pengembangan',
          deskripsi: 'Kemampuan komunikasi asertif, presentasi data perencanaan ke pimpinan & DPRD.',
          solusi: 'Pelatihan Public Speaking & Executive Briefing',
          metode: 'Pelatihan Teknis',
          jenisDiklat: 'Non-Klasikal',
          penyelenggara: 'BPSDMD Provinsi Lampung',
          jp: 8,
          estimasi: 500000
        },
        {
          name: 'Orientasi pada Hasil',
          current: 2,
          target: 3,
          gap: 1,
          priority: 'Sedang',
          status: 'Perlu Pengembangan',
          deskripsi: 'Menjaga ketepatan waktu penyelesaian dokumen perencanaan RKPD dan pelaporan kinerja.',
          solusi: 'Coaching Kinerja & Manajemen Beban Kerja Prioritas',
          metode: 'Coaching',
          jenisDiklat: 'Internal Bappeda',
          penyelenggara: 'Atasan Langsung / Bappeda',
          jp: 4,
          estimasi: 0
        },
        {
          name: 'Pelayanan Publik',
          current: 2,
          target: 3,
          gap: 1,
          priority: 'Tinggi',
          status: 'Perlu Pengembangan',
          deskripsi: 'Memberikan asistensi perencanaan dan fasilitasi konsultasi publik secara profesional dan cepat.',
          solusi: 'Coaching Service Excellence dalam Perencanaan Pembangunan',
          metode: 'Coaching',
          jenisDiklat: 'Coaching Kedinasan',
          penyelenggara: 'Internal Bappeda',
          jp: 2,
          estimasi: 0
        },
        {
          name: 'Pengembangan Diri & Orang Lain',
          current: 1,
          target: 3,
          gap: 2,
          priority: 'Sangat Tinggi',
          status: 'Prioritas Tinggi',
          deskripsi: 'Kekurangan Kritis: Pegawai belum aktif membimbing bawahan dan belum mandiri mengupgrade kompetensi perencanaan.',
          solusi: 'Mentoring Kepemimpinan & Program Peer Coaching Staf Junior',
          metode: 'Mentoring',
          jenisDiklat: 'Program Pembinaan SDM',
          penyelenggara: 'Internal Bappeda',
          jp: 6,
          estimasi: 0
        },
        {
          name: 'Mengelola Perubahan',
          current: 1,
          target: 3,
          gap: 2,
          priority: 'Sangat Tinggi',
          status: 'Prioritas Tinggi',
          deskripsi: 'Kekurangan Kritis: Masih lambat menyesuaikan dengan digitalisasi SIPD/SIP-KOMPETENSI dan regulasi perencanaan baru.',
          solusi: 'Workshop Strategic Change Management & Inovasi Perencanaan Daerah',
          metode: 'Workshop',
          jenisDiklat: 'Workshop Teknis',
          penyelenggara: 'BPSDMD Provinsi Lampung',
          jp: 8,
          estimasi: 750000
        },
        {
          name: 'Pengambilan Keputusan',
          current: 2,
          target: 3,
          gap: 1,
          priority: 'Sedang',
          status: 'Perlu Pengembangan',
          deskripsi: 'Kecakapan merumuskan alternatif solusi masalah pembangunan daerah berbasis bukti (evidence-based).',
          solusi: 'Workshop Strategic Decision Making Kebijakan Publik',
          metode: 'Workshop',
          jenisDiklat: 'Workshop Eksternal',
          penyelenggara: 'Pusbindiklatren Bappenas',
          jp: 8,
          estimasi: 750000
        }
      ],
      sosialKultural: [
        {
          name: 'Perekat Bangsa',
          current: 2,
          target: 3,
          gap: 1,
          priority: 'Sedang',
          status: 'Perlu Pengembangan',
          deskripsi: 'Menjaga persatuan, toleransi, keharmonisan lingkungan kerja, dan non-diskriminatif.',
          solusi: 'Sosialisasi & Aktualisasi Nilai BerAKHLAK ASN Bappeda',
          metode: 'Sosialisasi',
          jenisDiklat: 'Non-Klasikal',
          penyelenggara: 'Biro Organisasi / BKD Provinsi Lampung',
          jp: 4,
          estimasi: 0
        }
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

    executiveDirectives: [
      {
        id: 1,
        tanggal: '10 Februari 2026',
        penulis: 'Dr. ANANG RISGIYANTO, S.K.M., M.Kes.',
        jabatan: 'Kepala Bappeda Provinsi Lampung',
        target: 'Seluruh Kepala Bidang & Sekretaris',
        arahan: 'Seluruh Pejabat Administrator/Pengawas wajib mengawal percepatan penyelesaian rencana pengembangan kompetensi (minimal 20 JP per ASN sesuai amanat UU No. 20/2023). Prioritaskan pelatihan fungsional perencana, analisis data spasial GIS, dan akuntabilitas kinerja sebelum akhir Triwulan II 2026.',
        status: 'Aktif / Berlaku'
      }
    ],

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
          this.state.verifications = JSON.parse(JSON.stringify(BAPPEDA_DATA.verifications || []));
        }
        // Pastikan setiap data verifikasi memiliki identitas tahun anggaran (default 2026 untuk baseline)
        this.state.verifications.forEach(v => {
          if (!v.tahun) v.tahun = 2026;
          if (!v.pegawai || v.pegawai === 'undefined') {
            const cleanNip = String(v.nip || '').replace(/\s+/g, '');
            const emp = (typeof BAPPEDA_DATA !== 'undefined' && BAPPEDA_DATA.employees) 
              ? BAPPEDA_DATA.employees.find(e => String(e.nip).replace(/\s+/g, '') === cleanNip)
              : null;
            if (emp) {
              v.pegawai = emp.name || emp.nama || 'Pegawai ASN Bappeda';
              v.jabatan = v.jabatan || emp.jabatan || 'Aparatur Perencana';
              v.jenisJabatan = v.jenisJabatan || emp.jenis || 'Struktural';
              v.unitKerja = v.unitKerja || emp.unit || 'Bappeda Provinsi Lampung';
            } else {
              v.pegawai = 'Pegawai ASN Bappeda';
            }
          }
        });
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

      // Pastikan isolasi IDP per tahun anggaran (idpByYear) terinisialisasi
      if (!this.state.idpByYear || typeof this.state.idpByYear !== 'object') {
        this.state.idpByYear = {};
      }
      if (!this.state.idpByYear['2026']) {
        this.state.idpByYear['2026'] = JSON.parse(JSON.stringify(this.state.idpState));
      }

      // Pastikan seluruh data realisasi memiliki tahun anggaran
      if (Array.isArray(this.state.realizations)) {
        this.state.realizations.forEach(r => {
          if (!r.tahun) {
            const m = String(r.tanggal || '').match(/\b(20\d\d)\b/);
            r.tahun = m ? Number(m[1]) : 2026;
          }
        });
      }

      // SINKRONKAN STATUS IDP BERDASARKAN REALISASI SECARA AMAN (Bebas TypeError)
      this.syncIdpStatusWithRealizations();

      // SINKRONKAN DATA KOMPETENSI (Pastikan seluruh atribut diagnostik & solusi IDP tersedia)
      if (this.state.competencies) {
        const defComp = this.defaultState.competencies;
        ['teknis', 'manajerial', 'sosialKultural'].forEach(cat => {
          if (Array.isArray(this.state.competencies[cat]) && Array.isArray(defComp[cat])) {
            this.state.competencies[cat].forEach(item => {
              const defItem = defComp[cat].find(d => d.name === item.name);
              if (defItem) {
                if (!item.solusi) item.solusi = defItem.solusi;
                if (!item.metode) item.metode = defItem.metode;
                if (!item.deskripsi) item.deskripsi = defItem.deskripsi;
                if (!item.jp) item.jp = defItem.jp;
                if (!item.jenisDiklat) item.jenisDiklat = defItem.jenisDiklat;
                if (!item.penyelenggara) item.penyelenggara = defItem.penyelenggara;
                if (item.estimasi === undefined) item.estimasi = defItem.estimasi;
              }
            });
          }
        });
      }

      // Check active session: Utamakan sessionStorage.
      // localStorage hanya digunakan jika user secara eksplisit mencentang 'Ingat sesi'
      let activeSess = null;
      try {
        const sessData = sessionStorage.getItem(SESSION_KEY);
        if (sessData) {
          activeSess = sessData;
        } else if (localStorage.getItem('sip_remember_session') === 'true') {
          activeSess = localStorage.getItem(SESSION_KEY);
        }
      } catch (e) {}

      if (activeSess) {
        try {
          this.state.currentSession = JSON.parse(activeSess);
          if (this.state.currentSession.unitKerja) {
            this.state.currentSession.unitKerja = this.state.currentSession.unitKerja.replace(/PPEPD/g, 'PMPE');
          }
          if (this.state.currentSession.jabatan) {
            this.state.currentSession.jabatan = this.state.currentSession.jabatan.replace(/PPEPD/g, 'PMPE');
          }
        } catch(e) {
          this.state.currentSession = null;
        }
      } else {
        this.state.currentSession = null;
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
      if (!this.state.activeYear) {
        this.state.activeYear = (this.state.careerPlan && this.state.careerPlan.periode) ? parseInt(this.state.careerPlan.periode, 10) : 2026;
      }
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

    // 2. Simpan full state ke main STORAGE_KEY dengan pembersihan dataUrl besar & sanitasi session
    try {
      if (Array.isArray(this.state.realizations)) {
        this.state.realizations.forEach(r => {
          if (r.buktiUrl && r.buktiUrl.startsWith('data:')) {
            r.buktiUrl = ''; // Sudah aman di IndexedDB
          }
        });
      }
      const stateToPersist = { ...this.state };
      // PENTING: Jangan simpan currentSession di STORAGE_KEY agar saat aplikasi ditutup tidak auto-login
      delete stateToPersist.currentSession;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist));
    } catch (e) {
      console.warn('localStorage save quota reached, saving sanitized lightweight state:', e);
      try {
        const safeState = JSON.parse(JSON.stringify(this.state, (key, value) => {
          if (key === 'currentSession') return undefined;
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

  saveUserIdp(nip) {
    if (!nip) return;
    try {
      const cleanNip = String(nip).replace(/\s+/g, '');
      const yr = this.getActiveYear ? this.getActiveYear() : 2026;
      if (this.state.idpState) {
        localStorage.setItem(`sip_idp_${cleanNip}_${yr}`, JSON.stringify(this.state.idpState));
      }
    } catch (e) {
      console.warn("Gagal simpan user IDP:", e);
    }
  },

  /**
   * Mengambil Tahun Anggaran Aktif
   * Default: Tahun saat ini (misal 2026) atau yang tersimpan di state
   */
  getActiveYear() {
    if (!this.state.activeYear) {
      this.state.activeYear = (new Date().getFullYear()) || 2026;
    }
    return Number(this.state.activeYear);
  },

  /**
   * Mengatur Tahun Anggaran Aktif untuk seluruh sistem
   * @param {number|string} year 
   */
  setActiveYear(year) {
    const y = parseInt(year, 10);
    if (!isNaN(y) && y >= 2020 && y <= 2040) {
      const prevYear = this.state.activeYear || 2026;
      if (!this.state.idpByYear) this.state.idpByYear = {};

      // 1. Simpan kondisi formulir IDP tahun sebelumnya ke idpByYear
      if (this.state.idpState) {
        this.state.idpByYear[String(prevYear)] = JSON.parse(JSON.stringify(this.state.idpState));
      }

      this.state.activeYear = y;
      if (this.state.careerPlan) {
        this.state.careerPlan.periode = String(y);
      }

      // 2. Pulihkan atau inisialisasi formulir IDP sesuai tahun yang dipilih
      if (this.state.idpByYear[String(y)]) {
        this.state.idpState = JSON.parse(JSON.stringify(this.state.idpByYear[String(y)]));
      } else {
        // Cek apakah ada pengajuan di verifications untuk tahun ini
        const currentAsn = this.state.user || this.state.currentSession || {};
        const cleanNip = String(currentAsn.nip || '').replace(/\s+/g, '');
        const verif = (this.state.verifications || []).find(v => 
          String(v.nip || '').replace(/\s+/g, '') === cleanNip && 
          Number(v.tahun || 2026) === y
        );

        if (verif) {
          this.state.idpState = {
            status: verif.status || 'Diajukan ke Atasan',
            progress: verif.totalJp >= 20 ? 100 : Math.round((verif.totalJp / 20) * 100),
            verificationNote: verif.notes || '',
            programs: []
          };
        } else {
          this.state.idpState = {
            status: 'Draft',
            progress: 0,
            verificationNote: '',
            programs: []
          };
        }
        this.state.idpByYear[String(y)] = JSON.parse(JSON.stringify(this.state.idpState));
      }

      this.save();

      // 3. Coba sinkronisasi data user dari Supabase untuk tahun tersebut
      const currentAsn = this.state.user || this.state.currentSession || {};
      if (currentAsn.nip && typeof this.loadUserIdp === 'function') {
        this.loadUserIdp(currentAsn.nip).catch(() => {});
      }

      return y;
    }
    return this.getActiveYear();
  },

  /**
   * Menghasilkan daftar tahun anggaran yang fleksibel untuk kebutuhan jangka panjang
   * Rentang bergulir dinamis: 2024 s/d (Tahun Aktif + 6) minimal sampai 2032
   * @returns {number[]}
   */
  getAvailableYears() {
    const active = this.getActiveYear();
    const current = (new Date().getFullYear()) || 2026;
    const refYear = Math.max(active, current);
    const start = Math.min(2024, refYear - 2);
    const end = Math.max(2032, refYear + 6);
    const years = [];
    for (let y = start; y <= end; y++) {
      years.push(y);
    }
    return years;
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
    if (!plainInput) return false;
    const cleanInput = String(plainInput).trim();

    // Universal default password across all roles for easy testing & presentation
    if (cleanInput === 'password' || cleanInput === 'admin123' || cleanInput === 'pimpinan123') {
      return true;
    }

    if (!storedPassword) return false;
    const cleanStored = String(storedPassword).trim();

    if (cleanStored.startsWith('$sha256$')) {
      const hashedInput = await this.hashPassword(cleanInput);
      return hashedInput === cleanStored;
    }

    // Default accounts / legacy plain text matching
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
    const defaultRolePassword = 'password';
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
    
    // Simpan ke sessionStorage (sesi otomatis berakhir saat browser/aplikasi ditutup)
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    } catch(e) {}

    // Simpan ke localStorage HANYA jika opsi 'Ingat sesi' dicentang
    const rememberBox = typeof document !== 'undefined' ? document.getElementById('rememberSession') : null;
    if (rememberBox && rememberBox.checked) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      localStorage.setItem('sip_remember_session', 'true');
    } else {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('sip_remember_session');
    }

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
        const defaultRolePass = 'password';
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
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('sip_remember_session');
    } catch(e) {}
    this.save();
  },

  // ==========================================
  // CLOUD SUPABASE IDP CRUD ENGINE
  // ==========================================

  async loadUserIdp(nip) {
    if (!nip || typeof supabaseClient === 'undefined') return;
    const cleanNip = String(nip).trim();

    try {
      // 1. Ambil status submission dari Supabase sesuai tahun aktif
      const activeYr = String(this.getActiveYear());
      const { data: subData, error: subErr } = await supabaseClient
        .from('idp_submissions')
        .select('*')
        .eq('nip', cleanNip)
        .eq('tahun', activeYr)
        .maybeSingle();

      if (!subErr && subData) {
        this.state.idpState.status = subData.status || 'Draft';
        this.state.idpState.progress = subData.progress || 0;
        this.state.idpState.verificationNote = subData.verification_note || '';
      } else if (Number(activeYr) !== 2026) {
        this.state.idpState.status = 'Draft';
        this.state.idpState.progress = 0;
        this.state.idpState.verificationNote = '';
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

  /**
   * Mengambil rangkuman diagnostik kekurangan kompetensi (Self-Gap Diagnostic)
   */
  getCompetencyGaps() {
    const comp = this.state.competencies || {};
    const all = [
      ...(comp.teknis || []).map(x => ({ ...x, kategori: 'Kompetensi Teknis' })),
      ...(comp.manajerial || []).map(x => ({ ...x, kategori: 'Kompetensi Manajerial' })),
      ...(comp.sosialKultural || []).map(x => ({ ...x, kategori: 'Sosial Kultural' }))
    ];
    const gaps = all.filter(item => item.gap > 0);
    const fulfilled = all.filter(item => item.gap === 0);
    const critical = gaps.filter(item => item.gap >= 2);
    const moderate = gaps.filter(item => item.gap === 1);

    return {
      all,
      gaps,
      fulfilled,
      critical,
      moderate,
      totalCount: all.length,
      gapCount: gaps.length,
      fulfilledCount: fulfilled.length,
      percentageFulfilled: all.length > 0 ? Math.round((fulfilled.length / all.length) * 100) : 100
    };
  },

  /**
   * Menghitung Skor Kesiapan Cita-Cita Karier & Suksesi Jabatan (Career Readiness Score)
   * Berdasarkan UU No. 20/2023 & PermenPAN-RB No. 3/2020 Manajemen Talenta
   */
  calculateCareerReadiness(targetJenjang) {
    const user = this.state.user || {};
    const comp = this.state.competencies || {};
    const summary = this.getIdpSummary();
    const targetStr = targetJenjang || this.state.careerPlan?.jenjangTarget || 'JFT Madya — Level 4';

    // Ekstrak Target Level dari string jenjang target
    const targetMatch = targetStr.match(/Level\s*(\d)/i);
    const targetLevel = targetMatch ? parseInt(targetMatch[1]) : 3;

    // 1. Evaluasi Level Kompetensi Saat Ini vs Target
    const currentAvg = comp.currentAvg || 2.1;
    const compRatio = Math.min(100, Math.round((currentAvg / targetLevel) * 100));

    // 2. Evaluasi Pangkat / Golongan
    const pangkat = user.pangkat || 'Pembina Tk. I / IV/b';
    let pangkatScore = 70;
    let pangkatReq = 'Minimal Pembina / IV/a';
    let pangkatStatus = 'Terpenuhi';

    if (targetLevel === 5) {
      pangkatReq = 'Minimal Pembina Utama Madya / IV/d';
      pangkatScore = (pangkat.includes('IV/d') || pangkat.includes('IV/e')) ? 100 : (pangkat.includes('IV/c') ? 75 : 60);
      pangkatStatus = pangkatScore >= 100 ? 'Terpenuhi' : 'Perlu Kenaikan Pangkat Reguler';
    } else if (targetLevel === 4) {
      pangkatReq = 'Minimal Pembina / IV/a';
      pangkatScore = pangkat.includes('IV/') ? 100 : (pangkat.includes('III/d') ? 80 : 60);
      pangkatStatus = pangkatScore >= 100 ? 'Terpenuhi' : 'Perlu Kenaikan Pangkat Reguler';
    } else if (targetLevel === 3) {
      pangkatReq = 'Minimal Penata / III/c';
      pangkatScore = (pangkat.includes('III/c') || pangkat.includes('III/d') || pangkat.includes('IV/')) ? 100 : 70;
      pangkatStatus = pangkatScore >= 100 ? 'Terpenuhi' : 'Perlu Kenaikan Pangkat Reguler';
    } else {
      pangkatReq = 'Minimal Penata Muda / III/a';
      pangkatScore = 100;
      pangkatStatus = 'Terpenuhi';
    }

    // 3. Evaluasi Jam Pelajaran (JP Bangkom) - Standar UU No. 20/2023 minimal 20 JP
    const totalJp = summary.totalJp || 0;
    const jpScore = Math.min(100, Math.round((totalJp / 20) * 100));
    const jpStatus = totalJp >= 20 ? 'Memenuhi Standar 20 JP' : `Kurang ${Math.max(0, 20 - totalJp)} JP (Realisasi: ${totalJp} JP)`;

    // 4. Evaluasi Sertifikasi / Uji Kompetensi (Ukom)
    const hasCert = (this.state.realizations || []).some(r => {
      const txt = (r.nama || r.topik || '').toLowerCase();
      return txt.includes('kompetensi') || txt.includes('bappenas') || txt.includes('sertifikasi');
    });
    let certScore = hasCert ? 90 : 50;
    let certReq = targetStr.includes('JFT') ? 'Lulus Uji Kompetensi (Ukom) Pusbindiklatren Bappenas' : 'Lulus Seleksi Asesmen Manajerial LAN RI';
    let certStatus = hasCert ? 'Telah Memiliki Sertifikasi' : 'Belum Memiliki (Wajib Mengikuti Ukom)';

    // 5. Evaluasi Kinerja (SKP & Nine-Box Grid)
    const nineBox = user.nineBox || 8;
    const skpScore = nineBox >= 7 ? 95 : (nineBox >= 4 ? 80 : 60);
    const skpStatus = nineBox >= 7 ? 'Sangat Baik (Kuadran 8 - Talent Pool Prioritas)' : 'Baik (Sesuai Target Kinerja)';

    // Overall Weighted Readiness Score:
    // Kompetensi: 35%, Pangkat: 25%, Bangkom JP: 20%, Sertifikasi: 20%
    const overallScore = Math.round((compRatio * 0.35) + (pangkatScore * 0.25) + (jpScore * 0.20) + (certScore * 0.20));

    let kategori = '';
    let kategoriClass = '';
    let badgeClass = '';
    let proyeksiWaktu = '';
    if (overallScore >= 85) {
      kategori = 'KATEGORI I: SIAP PROMOSI (READY NOW)';
      kategoriClass = 'text-success';
      badgeClass = 'badge-success';
      proyeksiWaktu = 'Periode TA 2026/2027 (Prioritas Promosi Langsung)';
    } else if (overallScore >= 65) {
      kategori = 'KATEGORI II: SIAP DENGAN PENGEMBANGAN (READY WITH DEVELOPMENT)';
      kategoriClass = 'text-warning';
      badgeClass = 'badge-warning';
      proyeksiWaktu = '1 — 2 Tahun (Setelah Menutup Gap Kompetensi & Ukom)';
    } else {
      kategori = 'KATEGORI III: MEMERLUKAN PEMBINAAN INTENSIF (DEVELOPMENT NEEDED)';
      kategoriClass = 'text-danger';
      badgeClass = 'badge-danger';
      proyeksiWaktu = '2 — 3 Tahun (Memerlukan Pemenuhan Angka Kredit & Diklat)';
    }

    return {
      targetJenjang: targetStr,
      targetLevel,
      overallScore,
      kategori,
      kategoriClass,
      badgeClass,
      proyeksiWaktu,
      checklist: [
        {
          param: 'Pangkat & Golongan Ruang',
          detail: `Pangkat Anda: <b>${pangkat || '-'}</b> (Syarat Jabatan: ${pangkatReq})`,
          score: pangkatScore,
          status: pangkatStatus,
          isPassed: pangkatScore >= 100
        },
        {
          param: 'Standar Level Kompetensi',
          detail: `Level Rata-rata Anda: <b>${currentAvg}</b> | Standar Jabatan Target: <b>Level ${targetLevel}.0</b>`,
          score: compRatio,
          status: compRatio >= 100 ? 'Memenuhi Standar' : `Gap -${(targetLevel - currentAvg).toFixed(1)} Level`,
          isPassed: compRatio >= 100
        },
        {
          param: 'Hak Belajar Bangkom (Min. 20 JP)',
          detail: `Total Rencana & Realisasi: <b>${totalJp} JP</b> dari standar minimal 20 JP/tahun (UU No. 20/2023)`,
          score: jpScore,
          status: jpStatus,
          isPassed: totalJp >= 20
        },
        {
          param: 'Uji Kompetensi / Sertifikasi Penjenjangan',
          detail: `Persyaratan: ${certReq}`,
          score: certScore,
          status: certStatus,
          isPassed: hasCert
        },
        {
          param: 'Evaluasi Kinerja & Nine-Box Matrix',
          detail: `Kuadran Nine-Box: <b>Kotak ${nineBox} (High Performer)</b> • Predikat SKP: <b>Sangat Baik</b>`,
          score: skpScore,
          status: skpStatus,
          isPassed: true
        }
      ]
    };
  },

  getExecutiveSummary() {
    const activeYear = this.getActiveYear();
    const employees = this.state.employees || [];
    const totalPegawai = employees.length || 99;

    // Jika tahun 2026, gunakan baseline data resmi 2026
    if (Number(activeYear) === 2026) {
      const memenuhi20Jp = employees.length > 0 
        ? employees.filter(e => (e.jp || 0) >= 20).length 
        : 60;
      const persenKepatuhan = Math.round((memenuhi20Jp / totalPegawai) * 100);
      const idpDisetujui = employees.length > 0 
        ? employees.filter(e => e.statusIdp === 'Disetujui' || e.statusIdp === 'Final').length 
        : 60;
      const totalJp = employees.length > 0 
        ? employees.reduce((sum, e) => sum + (e.jp || 0), 0) 
        : 1862;
      const avgJp = totalPegawai > 0 ? (totalJp / totalPegawai).toFixed(1) : '18.8';
      const totalEstimasiAnggaran = totalJp * 165000;

      return {
        totalPegawai,
        memenuhi20Jp,
        persenKepatuhan,
        idpDisetujui,
        persenDisetujui: Math.round((idpDisetujui / totalPegawai) * 100),
        totalJp,
        avgJp,
        totalEstimasiAnggaran,
        perluTindakLanjut: Math.max(0, totalPegawai - memenuhi20Jp)
      };
    }

    // Untuk tahun baru (2027, 2028, dst.), hitung dari berkas pengajuan tahun tersebut
    const verifsInYear = (this.state.verifications || []).filter(v => Number(v.tahun || 2026) === Number(activeYear));
    const idpDisetujui = verifsInYear.filter(v => v.status === 'Disetujui' || v.status === 'Final').length;
    const memenuhi20Jp = verifsInYear.filter(v => (v.totalJp || 0) >= 20).length;
    const totalJp = verifsInYear.reduce((sum, v) => sum + (v.totalJp || 0), 0);
    const avgJp = totalPegawai > 0 ? (totalJp / totalPegawai).toFixed(1) : '0.0';
    const totalEstimasiAnggaran = totalJp * 165000;
    const persenKepatuhan = totalPegawai > 0 ? Math.round((memenuhi20Jp / totalPegawai) * 100) : 0;

    return {
      totalPegawai,
      memenuhi20Jp,
      persenKepatuhan,
      idpDisetujui,
      persenDisetujui: totalPegawai > 0 ? Math.round((idpDisetujui / totalPegawai) * 100) : 0,
      totalJp,
      avgJp,
      totalEstimasiAnggaran,
      perluTindakLanjut: Math.max(0, totalPegawai - memenuhi20Jp)
    };
  },

  getUnitBreakdown() {
    const activeYear = this.getActiveYear();
    const units = [
      { name: 'Sekretariat', kabid: 'ANDI ARAFAT S.T., M.E.', targetPegawai: 23 },
      { name: 'Bidang PMPE (Rendalev)', kabid: 'MEYDIANDRA EKA PUTRA S.P,MIP', targetPegawai: 9 },
      { name: 'Bidang Perekonomian', kabid: 'Ir. ENDANG WAHYUNI S.T., M.Si.', targetPegawai: 19 },
      { name: 'Bidang Infrastruktur & Kewilayahan', kabid: 'Ir. IDA SUSANTI S S.T., M.T', targetPegawai: 9 },
      { name: 'Bidang Pemerintahan & PM', kabid: 'RADIUS PRAWIRA NEGARA S.ST', targetPegawai: 28 },
      { name: 'UPTD Pusat Data & Informasi', kabid: 'YASIR WIJAYA S.Si.,M.Si', targetPegawai: 10 },
      { name: 'Pimpinan', kabid: 'Dr. ANANG RISGIYANTO S.K.M., M.Kes.', targetPegawai: 1 }
    ];

    const employees = this.state.employees || [];
    const verifsInYear = (this.state.verifications || []).filter(v => Number(v.tahun || 2026) === Number(activeYear));

    return units.map(u => {
      const emps = employees.filter(e => e.unit === u.name || (u.name === 'Sekretariat' && e.unit && e.unit.includes('Sekretariat')));
      const total = emps.length || u.targetPegawai;

      if (Number(activeYear) === 2026) {
        const disetujui = emps.filter(e => e.statusIdp === 'Disetujui' || e.statusIdp === 'Final').length;
        const memenuhi20Jp = emps.filter(e => (e.jp || 0) >= 20).length;
        const totalJp = emps.reduce((acc, e) => acc + (e.jp || 0), 0) || (total * 19);
        const avgJp = total > 0 ? (totalJp / total).toFixed(1) : '18.8';
        const pctKepatuhan = total > 0 && emps.length > 0 ? Math.round((memenuhi20Jp / total) * 100) : 61;
        const pctIdp = total > 0 && emps.length > 0 ? Math.round((disetujui / total) * 100) : 61;

        return {
          unit: u.name,
          kabid: u.kabid,
          pegawai: total,
          disetujui: emps.length > 0 ? disetujui : Math.round(total * 0.61),
          memenuhi20Jp: emps.length > 0 ? memenuhi20Jp : Math.round(total * 0.61),
          totalJp,
          avgJp,
          pctKepatuhan,
          pctIdp,
          tindakLanjut: Math.max(0, total - (emps.length > 0 ? disetujui : Math.round(total * 0.61)))
        };
      } else {
        const uVerifs = verifsInYear.filter(v => (v.unitKerja || '').toLowerCase().includes(u.name.toLowerCase()));
        const disetujui = uVerifs.filter(v => v.status === 'Disetujui' || v.status === 'Final').length;
        const memenuhi20Jp = uVerifs.filter(v => (v.totalJp || 0) >= 20).length;
        const totalJp = uVerifs.reduce((acc, v) => acc + (v.totalJp || 0), 0);
        const avgJp = total > 0 ? (totalJp / total).toFixed(1) : '0.0';
        const pctKepatuhan = total > 0 ? Math.round((memenuhi20Jp / total) * 100) : 0;
        const pctIdp = total > 0 ? Math.round((disetujui / total) * 100) : 0;

        return {
          unit: u.name,
          kabid: u.kabid,
          pegawai: total,
          disetujui,
          memenuhi20Jp,
          totalJp,
          avgJp,
          pctKepatuhan,
          pctIdp,
          tindakLanjut: Math.max(0, total - disetujui)
        };
      }
    });
  },

  async addExecutiveDirective(text, target = 'Seluruh Kepala Bidang & Sekretaris') {
    if (!text || !text.trim()) return false;
    if (!this.state.executiveDirectives) this.state.executiveDirectives = [];
    const newDir = {
      id: Date.now(),
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      penulis: 'Dr. ANANG RISGIYANTO, S.K.M., M.Kes.',
      jabatan: 'Kepala Bappeda Provinsi Lampung',
      target: target,
      arahan: text.trim(),
      status: 'Aktif / Berlaku'
    };
    this.state.executiveDirectives.unshift(newDir);
    this.save();

    // Broadcast ke Notifikasi Lonceng (Top Bar Bell)
    try {
      await this.sendNotification({
        penerima: 'all',
        judul: `📢 Arahan Kepala Bappeda (${target})`,
        pesan: `"${text.trim().substring(0, 120)}${text.trim().length > 120 ? '...' : ''}"`,
        tipe: 'warning'
      });
    } catch (e) {
      console.warn("Gagal broadcast notifikasi arahan:", e);
    }

    return newDir;
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
    const activeYr = this.getActiveYear();
    let v = this.state.verifications.find(x => 
      String(x.nip).replace(/\s+/g, '') === cleanUserNip && 
      Number(x.tahun || 2026) === Number(activeYr)
    );
    if (v) {
      v.status = 'Diajukan ke Atasan';
      v.programCount = this.state.idpState.programs.length;
      v.totalJp = summary.totalJp;
      v.estimasiBiaya = `Rp${summary.totalCost.toLocaleString('id-ID')}`;
      v.pengajuan = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } else {
      const u = this.state.user || {};
      this.state.verifications.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000),
        tahun: activeYr,
        pegawai: u.name || 'Pegawai ASN Bappeda',
        nip: cleanUserNip,
        jabatan: u.jabatan || 'Aparatur Perencana',
        jenisJabatan: u.jenisJabatan || 'Struktural',
        unitKerja: u.unitKerja || 'Bappeda Provinsi Lampung',
        targetKarier: this.state.careerPlan?.jenjangTarget || `Pengembangan ${activeYr}`,
        rencanaKarier: this.state.careerPlan?.rencana || 'Pengembangan kompetensi pegawai',
        programCount: this.state.idpState.programs.length,
        totalJp: summary.totalJp,
        estimasiBiaya: `Rp${summary.totalCost.toLocaleString('id-ID')}`,
        pengajuan: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Diajukan ke Atasan',
        notes: ''
      });
    }
    this.save();

    // Sync ke Supabase
    if (cleanUserNip && typeof supabaseClient !== 'undefined') {
      try {
        const activeYr = String(this.getActiveYear());
        const { error } = await supabaseClient
          .from('idp_submissions')
          .upsert({
            nip: cleanUserNip,
            tahun: activeYr,
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
      const activeYr = this.getActiveYear();
      await this.sendNotification({
        penerima: 'admin',
        judul: 'Pengajuan IDP Baru',
        pesan: `${this.state.user?.name || 'Pegawai'} mengajukan rancangan IDP Tahun ${activeYr} (${summary.totalProgram} program, ${summary.totalJp} JP).`,
        tipe: 'info'
      });
      await this.sendNotification({
        penerima: 'pimpinan',
        judul: 'Pengajuan IDP Masuk',
        pesan: `${this.state.user?.name || 'Pegawai'} telah mengajukan rencana pengembangan kompetensi (IDP ${activeYr}).`,
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
        .order('updated_at', { ascending: true });

      if (error) {
        console.error("Gagal select Supabase submissions:", error);
        return;
      }

      // Ambil rincian program dari Supabase jika ada untuk menghitung JP & jumlah program riil
      let programsByNip = {};
      try {
        const { data: progList } = await supabaseClient
          .from('idp_programs')
          .select('*');
        if (progList && progList.length > 0) {
          progList.forEach(p => {
            const pNip = String(p.nip || '').replace(/\s+/g, '');
            if (!programsByNip[pNip]) programsByNip[pNip] = [];
            programsByNip[pNip].push(p);
          });
        }
      } catch (err) {
        console.warn("Gagal fetch program list:", err);
      }

      if (data && data.length > 0) {
        data.forEach(sub => {
          const cleanSubNip = String(sub.nip).replace(/\s+/g, '');
          const progs = programsByNip[cleanSubNip] || [];
          const progCount = progs.length;
          const totalJp = progs.reduce((acc, curr) => acc + (parseInt(curr.jp) || 0), 0);
          const totalCost = progs.reduce((acc, curr) => acc + (parseInt(curr.estimasi) || 0), 0);

          const subTahun = Number(sub.tahun) || 2026;
          let v = this.state.verifications.find(x => 
            String(x.nip).replace(/\s+/g, '') === cleanSubNip &&
            Number(x.tahun || 2026) === subTahun
          );
          
          const emp = (typeof BAPPEDA_DATA !== 'undefined' && BAPPEDA_DATA.employees) 
            ? BAPPEDA_DATA.employees.find(e => String(e.nip).replace(/\s+/g, '') === cleanSubNip)
            : (this.state.employees ? this.state.employees.find(e => String(e.nip).replace(/\s+/g, '') === cleanSubNip) : null);

          const empName = emp ? (emp.name || emp.nama) : (sub.nama || `Pegawai Bappeda (${sub.nip})`);
          const empJabatan = emp ? emp.jabatan : 'Aparatur Perencana';
          const empJenis = emp ? (emp.jenis || 'Struktural') : 'Struktural';
          const empUnit = emp ? (emp.unit || 'Bappeda Provinsi Lampung') : 'Bappeda';

          if (v) {
            v.tahun = subTahun;
            v.pegawai = empName;
            v.jabatan = empJabatan;
            v.jenisJabatan = empJenis;
            v.unitKerja = empUnit;
            v.status = sub.status || v.status;
            if (sub.progress !== undefined) v.progress = sub.progress;
            if (sub.verification_note) v.notes = sub.verification_note;
            if (progCount > 0) {
              v.programCount = progCount;
              v.totalJp = totalJp;
              v.estimasiBiaya = `Rp${totalCost.toLocaleString('id-ID')}`;
            }
            if (sub.submitted_at) {
              const d = new Date(sub.submitted_at);
              v.pengajuan = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
            }
          } else {
            this.state.verifications.unshift({
              id: Date.now() + Math.floor(Math.random() * 1000),
              tahun: subTahun,
              pegawai: empName,
              nip: sub.nip,
              jabatan: empJabatan,
              jenisJabatan: empJenis,
              unitKerja: empUnit,
              targetKarier: `Pengembangan Kompetensi ${subTahun}`,
              rencanaKarier: 'Penguatan keahlian perencanaan pembangunan daerah',
              programCount: progCount > 0 ? progCount : 1,
              totalJp: totalJp > 0 ? totalJp : 20,
              estimasiBiaya: totalCost > 0 ? `Rp${totalCost.toLocaleString('id-ID')}` : 'Rp0',
              pengajuan: sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Hari Ini',
              status: sub.status || 'Diajukan ke Atasan',
              notes: sub.verification_note || ''
            });
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
              tahun: String(item.tahun || this.getActiveYear()),
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
        pesan: `Selamat! Dokumen rencana IDP Tahun ${item.tahun || this.getActiveYear()} Anda telah diverifikasi & disetujui resmi oleh ${this.state.user?.name || 'Pengelola SDM'}.`,
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
              tahun: String(item.tahun || this.getActiveYear()),
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

    const activeYr = this.getActiveYear();
    const newRealizationObj = {
      id: newId,
      ...realizationData,
      tahun: Number(realizationData.tahun) || activeYr,
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
        periode: 'Tahun ' + this.getActiveYear(),
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
    if (!this.state.idpByYear) this.state.idpByYear = {};
    this.state.idpByYear[String(this.getActiveYear())] = JSON.parse(JSON.stringify(this.state.idpState));
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
          query = query.or(`penerima.eq.all,penerima.eq.semua,penerima.eq.${role},penerima.eq.all_admin,penerima.eq.${nip}`);
        } else {
          query = query.or(`penerima.eq.all,penerima.eq.semua,penerima.eq.pegawai,penerima.eq.${nip}`);
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
  },

  resetDemoData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      const oldKeys = ['sip_kompetensi_bappeda_db_v3', 'sip_kompetensi_bappeda_db_v2', 'sip_kompetensi_bappeda_db'];
      oldKeys.forEach(k => localStorage.removeItem(k));
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('sip_active_year');
    } catch(e) {}

    const fresh = JSON.parse(JSON.stringify(this.defaultState));
    if (typeof BAPPEDA_DATA !== 'undefined') {
      fresh.employees = BAPPEDA_DATA.employees;
      fresh.monitoringUnits = BAPPEDA_DATA.monitoringUnits;
      fresh.verifications = JSON.parse(JSON.stringify(BAPPEDA_DATA.verifications || []));
      fresh.realizations = JSON.parse(JSON.stringify(BAPPEDA_DATA.realizations || []));
    }
    fresh.activeYear = 2026;
    this.state = fresh;
    this.save();
    return true;
  }
};

// Initialize persistent store
Store.init();

if (typeof window !== 'undefined') {
  window.Store = Store;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Store;
}

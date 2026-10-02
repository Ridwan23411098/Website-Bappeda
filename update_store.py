import os

store_path = 'js/store.js'
with open(store_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update storage key to v2
text = text.replace(
    "const STORAGE_KEY = 'sip_kompetensi_bappeda_db_v1';",
    "const STORAGE_KEY = 'sip_kompetensi_bappeda_db_v2';"
)

# 2. Update accounts
old_acc = """  // Official ASN Accounts Directory of Bappeda Lampung
  accounts: [
    {
      nip: '198701012010011001',
      password: 'password', // Default official password
      name: 'Rizky Aditya Pratama, S.Kom., M.Si.',
      pangkat: 'Penata / III-c',
      jabatan: 'Analis Perencanaan Ahli Muda',
      unitKerja: 'Bidang Perencanaan Makro & Pendanaan Pembangunan',
      role: 'pegawai',
      avatarInitial: 'RA'
    },
    {
      nip: '198403152008011002',
      password: 'admin123',
      name: 'Budi Santoso, S.STP., M.P.A.',
      pangkat: 'Penata Tk.I / III-d',
      jabatan: 'Pengelola SDM Aparatur Ahli Muda',
      unitKerja: 'Subbagian Umum & Kepegawaian',
      role: 'admin',
      avatarInitial: 'BS'
    },
    {
      nip: '197206181997031003',
      password: 'pimpinan123',
      name: 'Dr. Ir. M. Taufik, M.M.',
      pangkat: 'Pembina Utama Madya / IV-d',
      jabatan: 'Kepala Badan Perencanaan Pembangunan Daerah',
      unitKerja: 'Bappeda Provinsi Lampung',
      role: 'pimpinan',
      avatarInitial: 'MT'
    }
  ],"""

new_acc = """  // Official ASN Accounts Directory of Bappeda Lampung
  accounts: (typeof BAPPEDA_DATA !== 'undefined' && BAPPEDA_DATA.accounts) ? BAPPEDA_DATA.accounts : [
    {
      nip: '197407072002121008',
      password: 'password',
      name: 'ANDI ARAFAT S.T., M.E.',
      pangkat: 'Penata Tk. I / III-d',
      jabatan: 'Perencana Ahli Muda / Subkoordinator Rendalev',
      unitKerja: 'Bidang PMPE (Rendalev)',
      role: 'pegawai',
      avatarInitial: 'AA'
    },
    {
      nip: '197204141997032003',
      password: 'admin123',
      name: 'IRMA NURACHMI S.P., M.EP.',
      pangkat: 'Pembina / IV-a',
      jabatan: 'Kepala Subbagian Umum & Kepegawaian',
      unitKerja: 'Sekretariat',
      role: 'admin',
      avatarInitial: 'IN'
    },
    {
      nip: '197305241997032002',
      password: 'pimpinan123',
      name: 'ELVIRA UMIHANNI, S.P., M.T.',
      pangkat: 'Pembina Utama Madya / IV-d',
      jabatan: 'Kepala Bappeda Provinsi Lampung',
      unitKerja: 'Pimpinan',
      role: 'pimpinan',
      avatarInitial: 'EU'
    }
  ],"""

if old_acc in text:
    text = text.replace(old_acc, new_acc)
    print("Replaced accounts")
else:
    print("WARNING: old_acc not found")

# 3. Update user
old_user = """    // Active ASN Profile
    user: {
      name: 'Rizky Aditya Pratama, S.Kom., M.Si.',
      nip: '198701012010011001',
      pangkat: 'Penata / III-c',
      pendidikan: 'S1 Sistem Informasi • S2 Perencanaan Wilayah',
      masaKerja: '15 Tahun 6 Bulan',
      jabatan: 'Analis Perencanaan Ahli Muda',
      unitKerja: 'Bidang Perencanaan Makro & Pendanaan Pembangunan',
      jenisJabatan: 'JFT',
      status: 'Aktif',
      avatarInitial: 'RA',
      nineBox: 6 // Box 6: High Performance, Medium Potential
    },"""

new_user = """    // Active ASN Profile (Official Pegawai: Andi Arafat, S.T., M.E.)
    user: {
      name: 'ANDI ARAFAT S.T., M.E.',
      nip: '19740707 200212 1 008',
      pangkat: 'Penata Tk. I / III-d',
      pendidikan: 'S1 Teknik Sipil • S2 Magister Ekonomika Pembangunan',
      masaKerja: '23 Tahun 9 Bulan',
      jabatan: 'Perencana Ahli Muda / Subkoordinator Rendalev',
      unitKerja: 'Bidang PMPE (Rendalev)',
      jenisJabatan: 'JFT',
      status: 'Aktif',
      avatarInitial: 'AA',
      nineBox: 7
    },"""

if old_user in text:
    text = text.replace(old_user, new_user)
    print("Replaced user")
else:
    print("WARNING: old_user not found")

# 4. Update careerPlan
old_career = """    // Career Plan
    careerPlan: {
      periode: '2026',
      jenjangTarget: 'JFT Muda — Level 3',
      rencana: 'Mengembangkan kompetensi manajerial dan pelayanan publik untuk mendukung peningkatan kualitas perencanaan pembangunan daerah.',
      rumpunTarget: ['70 — Aparatur Negara / Kepegawaian', '26 — Komunikasi & Informatika']
    },"""

new_career = """    // Career Plan
    careerPlan: {
      periode: '2026',
      jenjangTarget: 'JFT Madya — Level 4',
      rencana: 'Mengembangkan kompetensi evaluasi perencanaan pembangunan daerah, perumusan indikator kinerja utama makro, dan sinergi pendanaan pembangunan Provinsi Lampung.',
      rumpunTarget: ['86 — BAPPENAS', '70 — Aparatur Negara / Kepegawaian', '22 — Statistik']
    },"""

if old_career in text:
    text = text.replace(old_career, new_career)
    print("Replaced careerPlan")

# 5. Update employees, masterData, executiveMetrics
old_block = """    // Official Employee List (100 ASN Total representation)
    employees: [
      { id: 1, name: 'Rizky Aditya Pratama, S.Kom., M.Si.', nip: '198701012010011001', pangkat: 'Penata / III-c', jabatan: 'Analis Perencanaan Ahli Muda', jenis: 'JFT', unit: 'Bidang Perencanaan Makro', statusIdp: 'Disetujui', progress: '2/4 (50%)' },
      { id: 2, name: 'Siti Rahma, S.E., M.E.', nip: '198901022011012002', pangkat: 'Penata / III-c', jabatan: 'Perencana Ahli Muda', jenis: 'JFT', unit: 'Bidang Perencanaan Makro', statusIdp: 'Disetujui', progress: '3/3 (100%)' },
      { id: 3, name: 'Agus Setiawan, A.Md.', nip: '199001032012013003', pangkat: 'Penata Muda / III-a', jabatan: 'Pengadministrasi Perencanaan', jenis: 'Pelaksana', unit: 'Sekretariat', statusIdp: 'Belum', progress: '0/2 (0%)' },
      { id: 4, name: 'Dian Permatasari, S.T., M.M.', nip: '198805122011022001', pangkat: 'Pembina / IV-a', jabatan: 'Kepala Bidang Perencanaan Makro', jenis: 'Struktural', unit: 'Bidang Perencanaan Makro', statusIdp: 'Disetujui', progress: '4/4 (100%)' },
      { id: 5, name: 'Fajar Nugraha, S.Sos., M.Si.', nip: '199203152014031002', pangkat: 'Penata Muda Tk.I / III-b', jabatan: 'Analis Kebijakan Ahli Pertama', jenis: 'JFT', unit: 'Bidang Pemerintahan & PM', statusIdp: 'Menunggu', progress: '1/3 (33%)' },
      { id: 6, name: 'Mega Wulandari, S.E.', nip: '199307202015022003', pangkat: 'Penata Muda / III-a', jabatan: 'Pengolah Data Perencanaan', jenis: 'Pelaksana', unit: 'Bidang Perekonomian & SDA', statusIdp: 'Disetujui', progress: '2/3 (67%)' },
      { id: 7, name: 'Hendra Saputra, S.P., M.Si.', nip: '198611042009011004', pangkat: 'Penata Tk.I / III-d', jabatan: 'Perencana Ahli Madya', jenis: 'JFT', unit: 'Bidang Perekonomian & SDA', statusIdp: 'Disetujui', progress: '3/4 (75%)' },
      { id: 8, name: 'Rina Kusuma, S.Kom.', nip: '199109082013012001', pangkat: 'Penata Muda Tk.I / III-b', jabatan: 'Pranata Komputer Ahli Pertama', jenis: 'JFT', unit: 'Sekretariat', statusIdp: 'Disetujui', progress: '2/2 (100%)' }
    ],

    // Official Reference Master Data
    masterData: {
      metode: [
        { id: 1, name: 'Diklat Struktural Kepemimpinan', kategori: 'Klasikal', deskripsi: 'Pendidikan pelatihan kepemimpinan berjenjang (PKN / PKA / PKP)' },
        { id: 2, name: 'Diklat Fungsional Perencana', kategori: 'Klasikal', deskripsi: 'Pelatihan pengangkatan dan alih jenjang JFT Perencana' },
        { id: 3, name: 'Diklat Teknis Substansi', kategori: 'Klasikal', deskripsi: 'Pelatihan substansi perencanaan pembangunan daerah' },
        { id: 4, name: 'Workshop & Lokakarya', kategori: 'Klasikal', deskripsi: 'Forum pemecahan masalah teknis dan perumusan kebijakan' },
        { id: 5, name: 'Coaching Pegawai', kategori: 'Non Klasikal', deskripsi: 'Pendampingan potensi oleh coach internal bersertifikat' },
        { id: 6, name: 'Mentoring Kedinasan', kategori: 'Non Klasikal', deskripsi: 'Bimbingan terarah oleh pejabat senior / atasan langsung' },
        { id: 7, name: 'E-Learning Terakreditasi', kategori: 'Non Klasikal', deskripsi: 'Pembelajaran mandiri secara daring pada LMS BKN / LAN' },
        { id: 8, name: 'Pelatihan Jarak Jauh (PJJ)', kategori: 'Non Klasikal', deskripsi: 'Pelatihan virtual synchronous tersertifikasi' },
        { id: 9, name: 'Benchmarking / Studi Lapangan', kategori: 'Non Klasikal', deskripsi: 'Studi tiru praktik terbaik perencanaan daerah' },
        { id: 10, name: 'Self Development (Riset Mandiri)', kategori: 'Non Klasikal', deskripsi: 'Pengembangan kapasitas mandiri berbasis literasi ilmiah' }
      ],
      rumpun: [
        { kode: '22', nama: 'Statistik & Pengolahan Data' },
        { kode: '26', nama: 'Komunikasi & Informatika' },
        { kode: '70', nama: 'Aparatur Negara / Kepegawaian' },
        { kode: '73', nama: 'Keuangan & Pengelolaan Aset Daerah' },
        { kode: '86', nama: 'Perencanaan Pembangunan (BAPPENAS)' },
        { kode: '87', nama: 'Informasi Geospasial & Tata Ruang' },
        { kode: '107', nama: 'Penelitian, Pengembangan & Inovasi Daerah' }
      ],
      jenjang: [
        { kode: '01', nama: 'JPT Utama', level: 5 },
        { kode: '02', nama: 'JPT Madya', level: 4 },
        { kode: '03', nama: 'JPT Pratama (Eselon II)', level: 4 },
        { kode: '06', nama: 'Pelaksana', level: 1 },
        { kode: '21', nama: 'JFT Pertama', level: 2 },
        { kode: '22', nama: 'JFT Muda', level: 3 },
        { kode: '23', nama: 'JFT Madya', level: 4 },
        { kode: '24', nama: 'JFT Utama', level: 5 }
      ]
    },

    executiveMetrics: {
      totalPegawai: 100,
      idpTerisi: 89,
      adaRealisasi: 74,
      perluTindakLanjut: 26,
      rencanaVsRealisasi: [
        { label: 'Perencanaan Makro', rencana: 42, realisasi: 32 },
        { label: 'Pemerintahan & PM', rencana: 36, realisasi: 24 },
        { label: 'Perekonomian & SDA', rencana: 38, realisasi: 22 },
        { label: 'Sekretariat Badan', rencana: 34, realisasi: 20 }
      ],
      monthlyTrend: [15, 28, 42, 55, 62, 70, 78, 85, 91, 95, 98, 100],
      monthLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    }"""

new_block = """    // Official Employee List (100 ASN Lengkap Bappeda Provinsi Lampung)
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
      totalPegawai: 100,
      idpTerisi: 90,
      adaRealisasi: 76,
      perluTindakLanjut: 14,
      rencanaVsRealisasi: [
        { label: 'Sekretariat', rencana: 23, realisasi: 18 },
        { label: 'Bidang PMPE', rencana: 11, realisasi: 9 },
        { label: 'Bidang Perekonomian', rencana: 19, realisasi: 14 },
        { label: 'Infrastruktur & Kewilayahan', rencana: 12, realisasi: 9 },
        { label: 'Pemerintahan & PM', rencana: 18, realisasi: 13 },
        { label: 'Riset & Inovasi Daerah', rencana: 16, realisasi: 11 }
      ],
      monthlyTrend: [15, 28, 42, 55, 62, 70, 78, 85, 90, 94, 98, 100],
      monthLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    }"""

if old_block in text:
    text = text.replace(old_block, new_block)
    print("Replaced default employees and masterData block")
else:
    print("WARNING: old_block not found")

# 6. Update Store.init to guarantee 100 employees
old_init = """  init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.state = JSON.parse(saved);
      } else {
        this.state = JSON.parse(JSON.stringify(this.defaultState));
        this.save();
      }"""

new_init = """  init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.state = JSON.parse(saved);
        // Ensure 100 ASN and official Bappeda master data are always loaded
        if (!this.state.employees || this.state.employees.length < 50) {
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
      }"""

if old_init in text:
    text = text.replace(old_init, new_init)
    print("Replaced Store.init")
else:
    print("WARNING: old_init not found")

with open(store_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Successfully updated js/store.js!")

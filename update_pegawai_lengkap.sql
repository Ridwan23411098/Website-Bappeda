-- ============================================
-- UPDATE DATA PEGAWAI LENGKAP BAPPEDA LAMPUNG
-- (Pendidikan, Masa Kerja, Jenis Jabatan, dll)
-- ============================================

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197507312000031002', 'Dr. ANANG RISGIYANTO S.K.M., M.Kes.', 'Pembina Utama Madya / IV/d', 'Kepala Badan Perencanaan Pembangunan Daerah Provinsi Lampung', 'Struktural', 'Pimpinan', 'DOKTOR - ILMU LINGKUNGAN (2023)', '24 Thn 6 Bln', 6, 'pimpinan')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197410092006042005', 'Ir. IDA SUSANTI S S.T., M.T', 'Pembina Utama Muda / IV/c', 'KEPALA BIDANG PERENCANAAN INFRASTRUKTUR DAN KEWILAYAYAHAN', 'Struktural', 'Bidang Infrastruktur & Kewilayahan', 'PASCA SARJANA - TEKNIK (2013)', '22 Thn 0 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197305141998031007', 'MEYDIANDRA EKA PUTRA S.P,MIP', 'Pembina Tk. I / IV/b', 'KEPALA BIDANG PERENCANAAN MAKRO, PENGENDALIAN DAN EVALUASI PEMBANGUNAN', 'Struktural', 'Bidang PMPE (Rendalev)', 'PASCA SARJANA - MANAJEMEN PEMERINTAHAN (2012)', '28 Thn 7 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197506172000032001', 'Ir. ENDANG WAHYUNI S.T., M.Si.', 'Pembina Tk. I / IV/b', 'KEPALA BIDANG PERENCANAAN PEREKONOMIAN', 'Struktural', 'Bidang Perekonomian', 'PASCA SARJANA - MASTER OF PLANNING STUDIES (2006)', '26 Thn 6 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197807101997121001', 'DWI PRASETIO S.STP, M.Si', 'Pembina Tk. I / IV/b', 'PERENCANA AHLI MADYA', 'JFT', 'Bidang Perekonomian', 'PASCA SARJANA - MASTER OF SCIENCE (2003)', '25 Thn 5 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197407072002121008', 'ANDI ARAFAT S.T., M.E.', 'Pembina Tk. I / IV/b', 'Sekretaris Bappeda Provinsi Lampung', 'Struktural', 'Sekretariat', 'EKONOMI PEMBANGUNAN & PERENCANAAN (2007)', '23 Thn 9 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197608122003122001', 'AWLIYANTI S.Si,Apt', 'Pembina Tk. I / IV/b', 'PERENCANA AHLI MADYA', 'JFT', 'Bidang Pemerintahan & PM', 'FARMASI (2002)', '22 Thn 9 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197303232002121011', 'KAIZAN SP.,M.Si', 'Pembina Tk. I / IV/b', 'PERENCANA AHLI MADYA', 'JFT', 'Bidang Infrastruktur & Kewilayahan', 'PASCA SARJANA - MASTER OF SCIENCE (2014)', '21 Thn 5 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197908192005011008', 'DECKY FERDIANSYAH S.Si.Apt., M.S.P', 'Pembina Tk. I / IV/b', 'PERENCANA AHLI MADYA PADA BADAN PERENCANAAN DAN PEMBANGUNAN DAERAH', 'JFT', 'Bidang Perekonomian', 'PASCA SARJANA - MAGISTER STUDI PEMBANGUNAN (2019)', '21 Thn 8 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('196711221989031003', 'MHD YUSUF NASUTION S.Sos, M.Si', 'Pembina Tk. I / IV/b', 'PERENCANA AHLI MADYA', 'JFT', 'Bidang Perekonomian', 'KEBIJAKAN ADMINISTRASI PUBLIK (2004)', '32 Thn 6 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197606081995111001', 'PRAYUDI ARIBOWO SSTP', 'Pembina / IV/a', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang PMPE (Rendalev)', 'DIPLOMA IV - ILMU PEMERINTAHAN (1999)', '26 Thn 11 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198003162002122004', 'MERYLIA S.T., M.T., M.Sc', 'Pembina / IV/a', 'PERENCANA AHLI MADYA', 'JFT', 'Bidang Perekonomian', 'PASCA SARJANA - MASTER OF SCIENCE (2007)', '23 Thn 9 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197606072006041011', 'WAHYU HIDAYAT S.T., M.M.', 'Pembina / IV/a', 'PENELAAH TEKNIS KEBIJAKAN', 'Pelaksana', 'Bidang Perekonomian', 'PASCA SARJANA - MAGISTER MANAJEMEN (2011)', '23 Thn 5 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197509212005011004', 'MUHAMMAD FAUZI , S.T., M.E.', 'Pembina / IV/a', 'PERENCANA AHLI MADYA', 'JFT', 'Bidang PMPE (Rendalev)', 'PASCA SARJANA - EKONOMI (2011)', '24 Thn 3 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197605092006041007', 'CATUR MAKHMUDI S.Hut., M.I.L', 'Pembina / IV/a', 'PERENCANA AHLI MADYA', 'JFT', 'Bidang Pemerintahan & PM', 'PASCA SARJANA - ILMU LINGKUNGAN (2011)', '20 Thn 5 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('196910261992032002', 'CIK MARYA S.E.,M.M.', 'Pembina / IV/a', 'KEPALA SUB BAGIAN UMUM DAN KEPEGAWAIAN Pada Sekretariat', 'Struktural', 'Sekretariat', 'PASCA SARJANA - MAGISTER MANAJEMEN (2022)', '29 Thn 7 Bln', 6, 'admin')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198702012009022004', 'ELIYATI S.Kom,M.M', 'Pembina / IV/a', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang PMPE (Rendalev)', 'PASCA SARJANA - MAGISTER MANAJEMEN (2011)', '17 Thn 9 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198210242010011012', 'MUHAMMAD RIDUWAN PASRA S.E., M.B.A.', 'Pembina / IV/a', 'KEPALA SEKSI DATA GEOSPASIAL Pada UPTD Pusdatin LAMPUNG', 'Struktural', 'UPTD Pusat Data & Informasi', 'PASCA SARJANA - MAGISTER MANAJEMEN (2008)', '17 Thn 1 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197812302009032002', 'YULIYANA S.T., M.M.', 'Pembina / IV/a', 'KEPALA SUB BAGIAN TATA USAHA Pada UPTD Pusdatin LAMPUNG', 'Struktural', 'UPTD Pusat Data & Informasi', 'PASCA SARJANA - MAGISTER MANAJEMEN (2012)', '23 Thn 11 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198405052010031002', 'YASIR WIJAYA S.Si.,M.Si', 'Pembina / IV/a', 'KEPALA UPTD PUSAT DATA DAN INFORMASI PEMBANGUNAN DAERAH', 'Struktural', 'UPTD Pusat Data & Informasi', 'PASCA SARJANA - ILMU LINGKUNGAN (2012)', '16 Thn 6 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198408202010011013', 'ANDRI BUDHI DHARMA S.H', 'Pembina / IV/a', 'PERENCANA AHLI MADYA', 'JFT', 'Bidang Pemerintahan & PM', 'SARJANA - HUKUM (2006)', '17 Thn 8 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('196907131997032001', 'RATNI PUSPA DEWI S.T.', 'Pembina / IV/a', 'PERENCANA AHLI MADYA', 'JFT', 'Bidang Infrastruktur & Kewilayahan', 'SARJANA - TEKHNOLOGI GEOLOGI (1995)', '29 Thn 6 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197704262009022001', 'LOLA AFRYANA SYA`YAN S.E., M.M', 'Pembina / IV/a', 'PERENCANA AHLI MADYA', 'JFT', 'Bidang Pemerintahan & PM', 'PASCA SARJANA - MANAJEMEN (2011)', '20 Thn 1 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197108232002121002', 'AHMAD AMRULLAH S.T.', 'Penata Tk. I / III/d', 'PENELAAH TEKNIS KEBIJAKAN', 'Pelaksana', 'Bidang Infrastruktur & Kewilayahan', 'SARJANA - TEKNIK SIPIL (1999)', '23 Thn 9 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197710142003122005', 'NAOMI SETYAWATI S.E', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Perekonomian', 'SARJANA - EKONOMI (2001)', '22 Thn 9 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197207112006041011', 'AMRULLAH KURNIAWAN S.E.', 'Penata Tk. I / III/d', 'PENGOLAH DATA DAN INFORMASI', 'Pelaksana', 'Bidang Perekonomian', 'SARJANA - EKONOMI (1999)', '24 Thn 5 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198006132005012006', 'YUNITA DEWI S.P', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA PADA BADAN PERENCANAAN PEMBAGUNAN DAERAH', 'JFT', 'Bidang Perekonomian', 'SARJANA - PERTANIAN (2004)', '21 Thn 8 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198801082009022003', 'RAHMIYANITA HAKIM S.H., M.H', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'PASCA SARJANA - HUKUM (2011)', '17 Thn 7 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198511202010011009', 'Ir. YULIUS ARI WIKARTA S.Hut.', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'SARJANA - MANAJEMEN (2008)', '16 Thn 8 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198212292002122002', 'RATIH WIDIYANTI SE, MM', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Perekonomian', 'PASCA SARJANA - MAGISTER MANAJEMEN (2013)', '18 Thn 9 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197911012003122007', 'TITA NOVITA S.K.M., M.K.M.', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA PADA BADAN PRENCANAAN PEMBANGUNAN DAERAH', 'JFT', 'Bidang Pemerintahan & PM', 'PASCA SARJANA - MAGISTER KESEHATAN MASYARAKAT (2013)', '20 Thn 9 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198603292006022002', 'ERA JAYANTI S.STP,MM', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'PASCA SARJANA - MANAJEMEN (2011)', '17 Thn 5 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197805172009022001', 'LOKOSMI SABA OCDITA ST.,M.T', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA PADA BADAN PRENCANAAN PEMBANGUNAN DAERAH', 'JFT', 'Bidang Infrastruktur & Kewilayahan', 'PASCA SARJANA - TEKNIK SIPIL (2022)', '17 Thn 7 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198505272010012007', 'EVA MEFRIDAWATI SE., MM', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'PASCA SARJANA - MANAJEMEN (2010)', '16 Thn 8 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197107222009031001', 'SYAHRIL JAYASAPUTRA S.T.', 'Penata Tk. I / III/d', 'PENELAAH TEKNIS KEBIJAKAN', 'Pelaksana', 'Bidang Infrastruktur & Kewilayahan', 'SARJANA - TEKNIK (2001)', '22 Thn 11 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198809102007012002', 'MIRAYA DARDANILA S.IP., M.T', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'PASCA SARJANA - TEKNIK (2016)', '16 Thn 11 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198411032011012009', 'RATIH AULIA RAHMAYANTI S.Si.,M.Sc', 'Penata Tk. I / III/d', 'SURVEYOR PEMETAAN AHLI MUDA', 'JFT', 'UPTD Pusat Data & Informasi', 'PASCA SARJANA - ILMU LINGKUNGAN (2009)', '15 Thn 8 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198208252010011017', 'SILFA GUSMAN SE., M.M.', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Perekonomian', 'PASCA SARJANA - MANAJEMEN (2024)', '16 Thn 8 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198008092010012012', 'SINTHA AGUSTIANTI S.H., M.H.', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'PASCA SARJANA - HUKUM (2013)', '16 Thn 8 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198106102010012019', 'YENY FITRIANI S.E., M.Si', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Perekonomian', 'PASCA SARJANA - ILMU ADMINISTRASI (2016)', '16 Thn 8 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198208122010011012', 'AUDI KURNIAWAN ST., MM', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Perekonomian', 'PASCA SARJANA - MANAJEMEN (2014)', '16 Thn 8 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198406172010012005', 'RIYA SONETA S.KOM.,MM', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang PMPE (Rendalev)', 'PASCA SARJANA - MAGISTER MANAJEMEN (2022)', '16 Thn 8 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197603072010011007', 'HARYO WICAKSONO SE', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Perekonomian', 'SARJANA - EKONOMI (2003)', '16 Thn 8 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197606262010011010', 'YUDI ASTARI SE', 'Penata Tk. I / III/d', 'PENELAAH TEKNIS KEBIJAKAN', 'Pelaksana', 'Bidang Perekonomian', 'SARJANA - MANAJEMEN (2000)', '16 Thn 8 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197603072010011008', 'ANDRE VICTOR MUCHSIN S.E., M.M', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Perekonomian', 'PASCA SARJANA - MAGISTER MANAJEMEN (2021)', '16 Thn 8 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197806121998032003', 'NORMA YUNITA S.IP, M.M.', 'Penata Tk. I / III/d', 'KEPALA SUB BAGIAN KEUANGAN DAN ASET Pada Sekretariat', 'Struktural', 'Sekretariat', 'SARJANA - ILMU PEMERINTAHAN (2010)', '23 Thn 7 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197511302011011002', 'MUHAMAD AIRLANGGA SE', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'EKONOMI AKUNTANSI (1998)', '15 Thn 11 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198502262011011002', 'Dr. SUPENO S.Pd.Kor.,M.Pd.', 'Penata Tk. I / III/d', 'PENELAAH TEKNIS KEBIJAKAN', 'Pelaksana', 'Bidang Pemerintahan & PM', 'DOKTOR - PENDIDIKAN OLAHRAGA (2016)', '15 Thn 8 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198009272011012002', 'NELLY ASTUTI S.E., M.M', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'PASCA SARJANA - MAGISTER MANAJEMEN (2013)', '15 Thn 8 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198601132011011009', 'M. ROBY SATRIA PRATAMA S.T., M.SI.', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'PASCA SARJANA - ILMU ADMINISTRASI (2022)', '13 Thn 8 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198412302015031001', 'DEDY APRIZAL S.TP.,M.Si', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'PASCA SARJANA - MAGISTER SAINS (2011)', '11 Thn 6 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198112252010011022', 'SYAIFUL RAHMAT S.E., M.I.D.S,.M.E.', 'Penata Tk. I / III/d', 'KEPALA SEKSI DATA STATISTIK Pada UPTD Pusdatin LAMPUNG', 'Struktural', 'UPTD Pusat Data & Informasi', 'PASCA SARJANA - MAGISTER EKONOMI (2017)', '15 Thn 7 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197910252010012018', 'DIAN RACHMAWATY SP., MM.', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'PASCA SARJANA - MAGISTER MANAJEMEN (2021)', '16 Thn 8 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198603292011012007', 'DIELLA DWI SARTIKA ST., MT', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Infrastruktur & Kewilayahan', 'PASCA SARJANA - TEKNIK PEMBANGUNAN WILAYAH DAN KOTA (2016)', '15 Thn 8 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198808092012061001', 'HEFRIZAL GHAZALI S.STP., M.M', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'PASCA SARJANA - MAGISTER MANAJEMEN (2015)', '12 Thn 7 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198206252011012007', 'RIKA YUNIATI S.E, M.M', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'PASCA SARJANA - MAGISTER MANAJEMEN (2015)', '17 Thn 8 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198704282011012011', 'ANDYTIA PRATIWI S.T.M.T', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Infrastruktur & Kewilayahan', 'PASCA SARJANA - TEKNIK (2014)', '15 Thn 8 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197610312012121001', 'ARIESCO OKTAVIAN SE', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'MANAJEMEN (2004)', '21 Thn 8 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197808312005011006', 'RADIUS PRAWIRA NEGARA S.ST', 'Penata Tk. I / III/d', 'KEPALA BIDANG PERENCANAAN PEMERINTAHAN DAN PEMBANGUNAN MANUSIA', 'Struktural', 'Bidang Pemerintahan & PM', 'SARJANA - SAINS (2013)', '19 Thn 8 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198101252008042002', 'KORNELLA RESTIANTI SKM., M.Ling', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'PASCA SARJANA - MAGISTER LINGKUNGAN (2020)', '16 Thn 5 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198310092010011010', 'REVARIO OKTANO S.Si.', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang PMPE (Rendalev)', 'SARJANA - STATISTIK (2006)', '16 Thn 8 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198509192014022001', 'DIAH RAHMAWATI SE', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'SARJANA - AKUNTANSI (2011)', '12 Thn 7 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('199207192015032002', 'RIMA BUDI ARISTA S.E.', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Perekonomian', 'SARJANA - AKUNTANSI (2014)', '11 Thn 7 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198711132011012010', 'RIA LIZA NOVITA TH S.E.', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'SARJANA - AKUNTANSI (2014)', '13 Thn 8 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198907092014022008', 'DESSY ANGGRAHITA SH', 'Penata Tk. I / III/d', 'PENELAAH TEKNIS KEBIJAKAN', 'Pelaksana', 'Bidang Infrastruktur & Kewilayahan', 'SARJANA - HUKUM (2011)', '12 Thn 7 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('199211202014061001', 'PURIATMA NUR UTOMO S.STP.', 'Penata Tk. I / III/d', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'DIPLOMA IV - SEKOLAH TINGGI PEMERINTAHAN DALAM NEGERI (2014)', '12 Thn 7 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197408142001121001', 'AHMAD KOSASIH A.Md.', 'Penata / III/c', 'PENGOLAH DATA DAN INFORMASI', 'Pelaksana', 'Sekretariat', 'DIPLOMA III - AKUNTANSI (1996)', '22 Thn 9 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198407062015032001', 'SITI MASITOH S.E.', 'Penata / III/c', 'ANALIS SUMBER DAYA MANUSIA APARATUR AHLI MUDA', 'JFT', 'Sekretariat', 'SARJANA - MANAJEMEN (2007)', '11 Thn 7 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198706152015032002', 'YULIA FITRI S.Kom.', 'Penata / III/c', 'PRANATA KOMPUTER AHLI MUDA', 'JFT', 'UPTD Pusat Data & Informasi', 'SARJANA - SISTEM INFORMASI (2009)', '11 Thn 6 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198506272011011006', 'FIRZA HANGGARA S. Kom', 'Penata / III/c', 'PENELAAH TEKNIS KEBIJAKAN', 'Pelaksana', 'Sekretariat', 'SARJANA - SISTEM INFORMASI (2014)', '13 Thn 8 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('199409142017011001', 'MUHAMMAD SABIEL ADI PRAKASA S.ST., M.Ec.Dev.', 'Penata / III/c', 'STATISTISI AHLI MUDA', 'JFT', 'UPTD Pusat Data & Informasi', 'PASCA SARJANA - MAGISTER EKONOMI PEMBANGUNAN (2023)', '9 Thn 8 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('199006082015031004', 'RIZKI WINANDA , S.E., M.E.', 'Penata / III/c', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Perekonomian', 'PASCA SARJANA - ILMU EKONOMI (2020)', '11 Thn 6 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('199401272015072001', 'GLADYTHA GUNAWAN S.STP. M.Si.', 'Penata / III/c', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'PASCA SARJANA - ILMU ADMINSTRASI (2017)', '11 Thn 2 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198404092010012019', 'NAFIAH PRATIWI S.IP', 'Penata / III/c', 'PENELAAH TEKNIS KEBIJAKAN', 'Pelaksana', 'Bidang PMPE (Rendalev)', 'SARJANA - ILMU PEMERINTAHAN (2024)', '14 Thn 8 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198508062010012018', 'RIA PRIMADEKA SE', 'Penata Muda Tk. I / III/b', 'PERENCANA AHLI PERTAMA', 'JFT', 'Bidang Perekonomian', 'SARJANA - EKONOMI AKUNTANSI (2014)', '14 Thn 8 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197304302007012007', 'KARTINI S.H', 'Penata Muda Tk. I / III/b', 'PERENCANA AHLI MUDA', 'JFT', 'Bidang Pemerintahan & PM', 'SARJANA - HUKUM (2005)', '22 Thn 5 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('196809171993031003', 'BAMBANG ERY SUGIHONO', 'Penata Muda Tk. I / III/b', 'PENGADMINISTRASI PERKANTORAN', 'Pelaksana', 'Sekretariat', 'SLTA UMUM - SEKOLAH MENENGAH ATAS (2000)', '25 Thn 6 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198110252010012002', 'BERTHA MIRZALIA DJUNAIDI S. Kom., M.M', 'Penata Muda Tk. I / III/b', 'PERENCANA AHLI PERTAMA', 'JFT', 'Bidang Pemerintahan & PM', 'PASCA SARJANA - MANAJEMEN (2024)', '16 Thn 8 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('196905082007011014', 'MALIK SYARIFUDIN S.IP.', 'Penata Muda Tk. I / III/b', 'PENELAAH TEKNIS KEBIJAKAN', 'Pelaksana', 'Sekretariat', 'SARJANA - ILMU PEMERINTAHAN (2017)', '24 Thn 11 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('199202112015032002', 'BELLA RAYENDRA HIPPY S.K.M.,M.M', 'Penata Muda Tk. I / III/b', 'PERENCANA AHLI PERTAMA', 'JFT', 'Bidang PMPE (Rendalev)', 'PASCA SARJANA - MANAJEMEN (2024)', '9 Thn 7 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198109152010012010', 'INTAN SARI AMSYA A.Md.', 'Penata Muda Tk. I / III/b', 'PENGOLAH DATA DAN INFORMASI', 'Pelaksana', 'Sekretariat', 'DIPLOMA III - HUBUNGAN MASYARAKAT (2002)', '15 Thn 5 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('199809212021081002', 'ANDRE NUGRAHA PUTRA S.Tr.IP', 'Penata Muda Tk. I / III/b', 'PENELAAH TEKNIS KEBIJAKAN', 'Pelaksana', 'Sekretariat', 'DIPLOMA IV - KEUANGAN DAERAH (2021)', '5 Thn 1 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('199206132019022005', 'RITA MUSTIKA SARI S.Si', 'Penata Muda Tk. I / III/b', 'PERENCANA AHLI PERTAMA', 'JFT', 'Bidang PMPE (Rendalev)', 'SARJANA - STATISTIK (2014)', '7 Thn 7 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197806282007012015', 'NIA WULAN SARI', 'Penata Muda / III/a', 'PENGADMINISTRASI PERKANTORAN', 'Pelaksana', 'Sekretariat', 'SEKOLAH TEKNIK MENENGAH (1997)', '28 Thn 5 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197407052007011015', 'AKHMAD RODI', 'Penata Muda / III/a', 'PENGADMINISTRASI PERKANTORAN', 'Pelaksana', 'Sekretariat', 'SLTA UMUM - A.3/IPS (1997)', '28 Thn 5 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('200208272024091001', 'M. FAREZA AKBAR S.Tr.I.P', 'Penata Muda / III/a', 'FASILITATOR PEMERINTAHAN', 'Pelaksana', 'Sekretariat', 'DIPLOMA IV - PRAKTIK PERPOLISIAN TATA PAMONG (2024)', '1 Thn 6 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('200209022024092001', 'SARAH NABILA PUTRI S.Tr.I.P.', 'Penata Muda / III/a', 'FASILITATOR PEMERINTAHAN', 'Pelaksana', 'Sekretariat', 'DIPLOMA IV - MANAJEMEN SUMBER DAYA MANUSIA SEKTOR PUBLIK (2024)', '1 Thn 6 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('199212222025041004', 'SATRIA DESTRIAN MAHCMUDDIN S.Kom', 'Penata Muda / III/a', 'PENATA KELOLA SISTEM DAN TEKNOLOGI INFORMASI', 'JFT', 'UPTD Pusat Data & Informasi', 'SARJANA - INFORMATIKA (2017)', '1 Thn 5 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('199511082025042004', 'NOVIA TRIANI PUTRI ST', 'Penata Muda / III/a', 'PENATA KELOLA SISTEM DAN TEKNOLOGI INFORMASI', 'JFT', 'UPTD Pusat Data & Informasi', 'SARJANA - TEKNIK INFORMATIKA (2018)', '1 Thn 5 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('199603092025041003', 'M.GERRY ZADA ALEM S.I.P.', 'Penata Muda / III/a', 'PENATA KELOLA PEMERINTAHAN', 'JFT', 'Sekretariat', 'SARJANA - ILMU PEMERINTAHAN (2019)', '1 Thn 5 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('199705202025041006', 'RIZAL ANDIKA SAPUTRA S.Kom', 'Penata Muda / III/a', 'PENATA KELOLA SISTEM DAN TEKNOLOGI INFORMASI', 'JFT', 'UPTD Pusat Data & Informasi', 'SARJANA - INFORMATIKA (2019)', '1 Thn 5 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197402122009031002', 'NASARUDDIN', 'Penata Muda / III/a', 'PENGADMINISTRASI PERKANTORAN', 'Pelaksana', 'Sekretariat', 'SLTA UMUM - SEKOLAH MENENGAH ATAS (1994)', '21 Thn 8 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198005092010012003', 'HALIJATUS SAKDIYAH S.M.', 'Penata Muda / III/a', 'PENELAAH TEKNIS KEBIJAKAN', 'Pelaksana', 'Sekretariat', 'SARJANA - MANAJEMEN (2005)', '22 Thn 8 Bln', 7, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197206092007011025', 'BURHAN S.IP.', 'Penata Muda / III/a', 'PENELAAH TEKNIS KEBIJAKAN', 'Pelaksana', 'Sekretariat', 'SARJANA - ILMU PEMERINTAHAN (2023)', '23 Thn 11 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197208092007011020', 'SUGIMAN S.A.P.', 'Penata Muda / III/a', 'PENELAAH TEKNIS KEBIJAKAN', 'Pelaksana', 'Sekretariat', 'SARJANA - ADMINISTRASI PUBLIK (2025)', '19 Thn 5 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('198401012012121003', 'LANGGENG BASUKI S.A.P.', 'Penata Muda / III/a', 'PENELAAH TEKNIS KEBIJAKAN', 'Pelaksana', 'Sekretariat', 'SARJANA - ADMINISTRASI PUBLIK (2023)', '21 Thn 8 Bln', 6, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197903262006041004', 'ICHSAN RIZKI SETIAWAN A.Md.', 'Pengatur Tk. I / II/d', 'PENGOLAH DATA DAN INFORMASI', 'Pelaksana', 'Sekretariat', 'DIPLOMA III - KOMUNIKASI (2004)', '23 Thn 5 Bln', 5, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197001232007011006', 'JAUHARI', 'Pengatur / II/c', 'PENGADMINISTRASI PERKANTORAN', 'Pelaksana', 'Sekretariat', 'SLTA UMUM - SLTA UMUM (2012)', '23 Thn 11 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;

INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)
VALUES ('197912042007011003', 'SUHERMAN', 'Pengatur / II/c', 'PENGADMINISTRASI PERKANTORAN', 'Pelaksana', 'Sekretariat', 'SLTA UMUM - SEKOLAH MENENGAH ATAS (2009)', '21 Thn 5 Bln', 8, 'pegawai')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama,
  pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan,
  jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja,
  pendidikan = EXCLUDED.pendidikan,
  masa_kerja = EXCLUDED.masa_kerja,
  nine_box = EXCLUDED.nine_box,
  role = EXCLUDED.role;


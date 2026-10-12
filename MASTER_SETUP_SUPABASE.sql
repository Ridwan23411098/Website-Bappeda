-- ===========================================================
-- MASTER SETUP SCRIPT — SIP IDP BAPPEDA PROVINSI LAMPUNG
-- Jalankan SEKALI di: Supabase Dashboard → SQL Editor → Run
-- ===========================================================

-- ▶ LANGKAH 1: BUAT TABEL PEGAWAI (Akun Login ASN)
CREATE TABLE IF NOT EXISTS public.pegawai (
    nip TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    pangkat TEXT DEFAULT '',
    jabatan TEXT DEFAULT '',
    jenis_jabatan TEXT DEFAULT 'Pelaksana',
    unit_kerja TEXT DEFAULT '',
    role TEXT DEFAULT 'pegawai',
    password TEXT DEFAULT 'password',
    pendidikan TEXT DEFAULT '',
    masa_kerja TEXT DEFAULT '',
    nine_box INT DEFAULT 5,
    is_password_changed BOOLEAN DEFAULT false,
    password_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.pegawai DISABLE ROW LEVEL SECURITY;

-- ▶ LANGKAH 2: BUAT TABEL IDP SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.idp_submissions (
    nip TEXT PRIMARY KEY,
    tahun TEXT DEFAULT '2026',
    status TEXT DEFAULT 'Draft',
    progress INT DEFAULT 0,
    verification_note TEXT DEFAULT '',
    submitted_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    verified_by TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.idp_submissions DISABLE ROW LEVEL SECURITY;

-- ▶ LANGKAH 3: BUAT TABEL IDP PROGRAMS
DROP TABLE IF EXISTS public.idp_programs CASCADE;
CREATE TABLE public.idp_programs (
    id BIGSERIAL PRIMARY KEY,
    nip TEXT NOT NULL,
    kompetensi TEXT,
    metode TEXT,
    topik TEXT,
    jenis_diklat TEXT DEFAULT '-',
    jp INT DEFAULT 0,
    penyelenggara TEXT,
    periode TEXT,
    periode_mulai TEXT,
    periode_selesai TEXT,
    estimasi BIGINT DEFAULT 0,
    keterangan TEXT,
    status TEXT DEFAULT 'Direncanakan',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_idp_programs_nip ON public.idp_programs(nip);
ALTER TABLE public.idp_programs DISABLE ROW LEVEL SECURITY;

-- ▶ LANGKAH 4: BUAT TABEL NOTIFIKASI
DROP TABLE IF EXISTS public.notifikasi CASCADE;
CREATE TABLE public.notifikasi (
    id BIGSERIAL PRIMARY KEY,
    penerima TEXT NOT NULL,
    pengirim TEXT DEFAULT 'Sistem',
    judul TEXT NOT NULL,
    pesan TEXT NOT NULL,
    tipe TEXT DEFAULT 'info',
    dibaca BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.notifikasi DISABLE ROW LEVEL SECURITY;

-- ▶ HAK AKSES & KEAMANAN
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.pegawai TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.idp_submissions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.idp_programs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.notifikasi TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Kebijakan Akses (Fallback jika RLS aktif)
DROP POLICY IF EXISTS "Allow all anon on pegawai" ON public.pegawai;
CREATE POLICY "Allow all anon on pegawai" ON public.pegawai FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all anon on idp_submissions" ON public.idp_submissions;
CREATE POLICY "Allow all anon on idp_submissions" ON public.idp_submissions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all anon on idp_programs" ON public.idp_programs;
CREATE POLICY "Allow all anon on idp_programs" ON public.idp_programs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all anon on notifikasi" ON public.notifikasi;
CREATE POLICY "Allow all anon on notifikasi" ON public.notifikasi FOR ALL USING (true) WITH CHECK (true);

-- ▶ LANGKAH 5: AKTIFKAN REALTIME
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifikasi') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifikasi;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'idp_submissions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.idp_submissions;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Realtime notice: %', SQLERRM;
END $$;

-- ▶ LANGKAH 6: IMPORT 99 PEGAWAI ASN BAPPEDA PROVINSI LAMPUNG
INSERT INTO public.pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, role, password) VALUES
('197407072002121008','ANDI ARAFAT S.T., M.E.','Pembina Tk. I / IV/b','Sekretaris Bappeda Provinsi Lampung','Struktural','Sekretariat','pegawai','password'),
('196910261992032002','CIK MARYA S.E.,M.M.','Pembina / IV/a','Kepala Sub Bagian Umum & Kepegawaian','Struktural','Sekretariat','admin','admin123'),
('197507312000031002','Dr. ANANG RISGIYANTO S.K.M., M.Kes.','Pembina Utama Madya / IV/d','Kepala Badan Perencanaan Pembangunan Daerah','Struktural','Pimpinan','pimpinan','pimpinan123'),
('197410092006042005','Ir. IDA SUSANTI S S.T., M.T','Pembina Utama Muda / IV/c','KEPALA BIDANG PERENCANAAN INFRASTRUKTUR DAN KEWILAYAYAHAN','Struktural','Bidang Infrastruktur & Kewilayahan','pegawai','password'),
('197305141998031007','MEYDIANDRA EKA PUTRA S.P,MIP','Pembina Tk. I / IV/b','KEPALA BIDANG PERENCANAAN MAKRO, PENGENDALIAN DAN EVALUASI PEMBANGUNAN','Struktural','Bidang PMPE (Rendalev)','pegawai','password'),
('197506172000032001','Ir. ENDANG WAHYUNI S.T., M.Si.','Pembina Tk. I / IV/b','KEPALA BIDANG PERENCANAAN PEREKONOMIAN','Struktural','Bidang Perekonomian','pegawai','password'),
('197807101997121001','DWI PRASETIO S.STP, M.Si','Pembina Tk. I / IV/b','PERENCANA AHLI MADYA','JFT','Bidang Perekonomian','pegawai','password'),
('197608122003122001','AWLIYANTI S.Si,Apt','Pembina Tk. I / IV/b','PERENCANA AHLI MADYA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('197303232002121011','KAIZAN SP.,M.Si','Pembina Tk. I / IV/b','PERENCANA AHLI MADYA','JFT','Bidang Infrastruktur & Kewilayahan','pegawai','password'),
('197908192005011008','DECKY FERDIANSYAH S.Si.Apt., M.S.P','Pembina Tk. I / IV/b','PERENCANA AHLI MADYA PADA BADAN PERENCANAAN DAN PEMBANGUNAN DAERAH','JFT','Bidang Perekonomian','pegawai','password'),
('196711221989031003','MHD YUSUF NASUTION S.Sos, M.Si','Pembina Tk. I / IV/b','PERENCANA AHLI MADYA','JFT','Bidang Perekonomian','pegawai','password'),
('197606081995111001','PRAYUDI ARIBOWO SSTP','Pembina / IV/a','PERENCANA AHLI MUDA','JFT','Bidang PMPE (Rendalev)','pegawai','password'),
('198003162002122004','MERYLIA S.T., M.T., M.Sc','Pembina / IV/a','PERENCANA AHLI MADYA','JFT','Bidang Perekonomian','pegawai','password'),
('197606072006041011','WAHYU HIDAYAT S.T., M.M.','Pembina / IV/a','PENELAAH TEKNIS KEBIJAKAN','Pelaksana','Bidang Perekonomian','pegawai','password'),
('197509212005011004','MUHAMMAD FAUZI , S.T., M.E.','Pembina / IV/a','PERENCANA AHLI MADYA','JFT','Bidang PMPE (Rendalev)','pegawai','password'),
('197605092006041007','CATUR MAKHMUDI S.Hut., M.I.L','Pembina / IV/a','PERENCANA AHLI MADYA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('198702012009022004','ELIYATI S.Kom,M.M','Pembina / IV/a','PERENCANA AHLI MUDA','JFT','Bidang PMPE (Rendalev)','pegawai','password'),
('198210242010011012','MUHAMMAD RIDUWAN PASRA S.E., M.B.A.','Pembina / IV/a','KEPALA SEKSI DATA GEOSPASIAL Pada UPTD Pusdatin LAMPUNG','Struktural','UPTD Pusat Data & Informasi','pegawai','password'),
('197812302009032002','YULIYANA S.T., M.M.','Pembina / IV/a','KEPALA SUB BAGIAN TATA USAHA Pada UPTD Pusdatin LAMPUNG','Struktural','UPTD Pusat Data & Informasi','pegawai','password'),
('198405052010031002','YASIR WIJAYA S.Si.,M.Si','Pembina / IV/a','KEPALA UPTD PUSAT DATA DAN INFORMASI PEMBANGUNAN DAERAH','Struktural','UPTD Pusat Data & Informasi','pegawai','password'),
('198408202010011013','ANDRI BUDHI DHARMA S.H','Pembina / IV/a','PERENCANA AHLI MADYA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('196907131997032001','RATNI PUSPA DEWI S.T.','Pembina / IV/a','PERENCANA AHLI MADYA','JFT','Bidang Infrastruktur & Kewilayahan','pegawai','password'),
('197704262009022001','LOLA AFRYANA SYA`YAN S.E., M.M','Pembina / IV/a','PERENCANA AHLI MADYA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('197108232002121002','AHMAD AMRULLAH S.T.','Penata Tk. I / III/d','PENELAAH TEKNIS KEBIJAKAN','Pelaksana','Bidang Infrastruktur & Kewilayahan','pegawai','password'),
('197710142003122005','NAOMI SETYAWATI S.E','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Perekonomian','pegawai','password'),
('197207112006041011','AMRULLAH KURNIAWAN S.E.','Penata Tk. I / III/d','PENGOLAH DATA DAN INFORMASI','Pelaksana','Bidang Perekonomian','pegawai','password'),
('198006132005012006','YUNITA DEWI S.P','Penata Tk. I / III/d','PERENCANA AHLI MUDA PADA BADAN PERENCANAAN PEMBAGUNAN DAERAH','JFT','Bidang Perekonomian','pegawai','password'),
('198801082009022003','RAHMIYANITA HAKIM S.H., M.H','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('198511202010011009','Ir. YULIUS ARI WIKARTA S.Hut.','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('198212292002122002','RATIH WIDIYANTI SE, MM','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Perekonomian','pegawai','password'),
('197911012003122007','TITA NOVITA S.K.M., M.K.M.','Penata Tk. I / III/d','PERENCANA AHLI MUDA PADA BADAN PRENCANAAN PEMBANGUNAN DAERAH','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('198603292006022002','ERA JAYANTI S.STP,MM','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('197805172009022001','LOKOSMI SABA OCDITA ST.,M.T','Penata Tk. I / III/d','PERENCANA AHLI MUDA PADA BADAN PRENCANAAN PEMBANGUNAN DAERAH','JFT','Bidang Infrastruktur & Kewilayahan','pegawai','password'),
('198505272010012007','EVA MEFRIDAWATI SE., MM','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('197107222009031001','SYAHRIL JAYASAPUTRA S.T.','Penata Tk. I / III/d','PENELAAH TEKNIS KEBIJAKAN','Pelaksana','Bidang Infrastruktur & Kewilayahan','pegawai','password'),
('198809102007012002','MIRAYA DARDANILA S.IP., M.T','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('198411032011012009','RATIH AULIA RAHMAWATI S.Si.,M.Sc','Penata Tk. I / III/d','SURVEYOR PEMETAAN AHLI MUDA','JFT','UPTD Pusat Data & Informasi','pegawai','password'),
('198208252010011017','SILFA GUSMAN SE., M.M.','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Perekonomian','pegawai','password'),
('198008092010012012','SINTHA AGUSTIANTI S.H., M.H.','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('198106102010012019','YENY FITRIANI S.E., M.Si','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Perekonomian','pegawai','password'),
('198208122010011012','AUDI KURNIAWAN ST., MM','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Perekonomian','pegawai','password'),
('198406172010012005','RIYA SONETA S.KOM.,MM','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang PMPE (Rendalev)','pegawai','password'),
('197603072010011007','HARYO WICAKSONO SE','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Perekonomian','pegawai','password'),
('197606262010011010','YUDI ASTARI SE','Penata Tk. I / III/d','PENELAAH TEKNIS KEBIJAKAN','Pelaksana','Bidang Perekonomian','pegawai','password'),
('197603072010011008','ANDRE VICTOR MUCHSIN S.E., M.M','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Perekonomian','pegawai','password'),
('197806121998032003','NORMA YUNITA S.IP, M.M.','Penata Tk. I / III/d','KEPALA SUB BAGIAN KEUANGAN DAN ASET Pada Sekretariat','Struktural','Sekretariat','pegawai','password'),
('197511302011011002','MUHAMAD AIRLANGGA SE','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('198502262011011002','Dr. SUPENO S.Pd.Kor.,M.Pd.','Penata Tk. I / III/d','PENELAAH TEKNIS KEBIJAKAN','Pelaksana','Bidang Pemerintahan & PM','pegawai','password'),
('198009272011012002','NELLY ASTUTI S.E., M.M','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('198601132011011009','M. ROBY SATRIA PRATAMA S.T., M.SI.','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('198412302015031001','DEDY APRIZAL S.TP.,M.Si','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('198112252010011022','SYAIFUL RAHMAT S.E., M.I.D.S,.M.E.','Penata Tk. I / III/d','KEPALA SEKSI DATA STATISTIK Pada UPTD Pusdatin LAMPUNG','Struktural','UPTD Pusat Data & Informasi','pegawai','password'),
('197910252010012018','DIAN RACHMAWATY SP., MM.','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('198603292011012007','DIELLA DWI SARTIKA ST., MT','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Infrastruktur & Kewilayahan','pegawai','password'),
('198808092012061001','HEFRIZAL GHAZALI S.STP., M.M','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('198206252011012007','RIKA YUNIATI S.E, M.M','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('198704282011012011','ANDYTIA PRATIWI S.T.M.T','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Infrastruktur & Kewilayahan','pegawai','password'),
('197610312012121001','ARIESCO OKTAVIAN SE','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('197808312005011006','RADIUS PRAWIRA NEGARA S.ST','Penata Tk. I / III/d','KEPALA BIDANG PERENCANAAN PEMERINTAHAN DAN PEMBANGUNAN MANUSIA','Struktural','Bidang Pemerintahan & PM','pegawai','password'),
('198101252008042002','KORNELLA RESTIANTI SKM., M.Ling','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('198310092010011010','REVARIO OKTANO S.Si.','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang PMPE (Rendalev)','pegawai','password'),
('198509192014022001','DIAH RAHMAWATI SE','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('199207192015032002','RIMA BUDI ARISTA S.E.','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Perekonomian','pegawai','password'),
('198711132011012010','RIA LIZA NOVITA TH S.E.','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('198907092014022008','DESSY ANGGRAHITA SH','Penata Tk. I / III/d','PENELAAH TEKNIS KEBIJAKAN','Pelaksana','Bidang Infrastruktur & Kewilayahan','pegawai','password'),
('199211202014061001','PURIATMA NUR UTOMO S.STP.','Penata Tk. I / III/d','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('197408142001121001','AHMAD KOSASIH A.Md.','Penata / III/c','PENGOLAH DATA DAN INFORMASI','Pelaksana','Sekretariat','pegawai','password'),
('198407062015032001','SITI MASITOH S.E.','Penata / III/c','ANALIS SUMBER DAYA MANUSIA APARATUR AHLI MUDA','JFT','Sekretariat','pegawai','password'),
('198706152015032002','YULIA FITRI S.Kom.','Penata / III/c','PRANATA KOMPUTER AHLI MUDA','Pelaksana','UPTD Pusat Data & Informasi','pegawai','password'),
('198506272011011006','FIRZA HANGGARA S. Kom','Penata / III/c','PENELAAH TEKNIS KEBIJAKAN','Pelaksana','Sekretariat','pegawai','password'),
('199409142017011001','MUHAMMAD SABIEL ADI PRAKASA S.ST., M.Ec.Dev.','Penata / III/c','STATISTISI AHLI MUDA','Pelaksana','UPTD Pusat Data & Informasi','pegawai','password'),
('199006082015031004','RIZKI WINANDA , S.E., M.E.','Penata / III/c','PERENCANA AHLI MUDA','JFT','Bidang Perekonomian','pegawai','password'),
('199401272015072001','GLADYTHA GUNAWAN S.STP. M.Si.','Penata / III/c','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('198404092010012019','NAFIAH PRATIWI S.IP','Penata / III/c','PENELAAH TEKNIS KEBIJAKAN','Pelaksana','Bidang PMPE (Rendalev)','pegawai','password'),
('198508062010012018','RIA PRIMADEKA SE','Penata Muda Tk. I / III/b','PERENCANA AHLI PERTAMA','JFT','Bidang Perekonomian','pegawai','password'),
('197304302007012007','KARTINI S.H','Penata Muda Tk. I / III/b','PERENCANA AHLI MUDA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('196809171993031003','BAMBANG ERY SUGIHONO','Penata Muda Tk. I / III/b','PENGADMINISTRASI PERKANTORAN','Pelaksana','Sekretariat','pegawai','password'),
('198110252010012002','BERTHA MIRZALIA DJUNAIDI S. Kom., M.M','Penata Muda Tk. I / III/b','PERENCANA AHLI PERTAMA','JFT','Bidang Pemerintahan & PM','pegawai','password'),
('196905082007011014','MALIK SYARIFUDIN S.IP.','Penata Muda Tk. I / III/b','PENELAAH TEKNIS KEBIJAKAN','Pelaksana','Sekretariat','pegawai','password'),
('199202112015032002','BELLA RAYENDRA HIPPY S.K.M.,M.M','Penata Muda Tk. I / III/b','PERENCANA AHLI PERTAMA','JFT','Bidang PMPE (Rendalev)','pegawai','password'),
('198109152010012010','INTAN SARI AMSYA A.Md.','Penata Muda Tk. I / III/b','PENGOLAH DATA DAN INFORMASI','Pelaksana','Sekretariat','pegawai','password'),
('199809212021081002','ANDRE NUGRAHA PUTRA S.Tr.IP','Penata Muda Tk. I / III/b','PENELAAH TEKNIS KEBIJAKAN','Pelaksana','Sekretariat','pegawai','password'),
('199206132019022005','RITA MUSTIKA SARI S.Si','Penata Muda Tk. I / III/b','PERENCANA AHLI PERTAMA','JFT','Bidang PMPE (Rendalev)','pegawai','password'),
('197806282007012015','NIA WULAN SARI','Penata Muda / III/a','PENGADMINISTRASI PERKANTORAN','Pelaksana','Sekretariat','pegawai','password'),
('197407052007011015','AKHMAD RODI','Penata Muda / III/a','PENGADMINISTRASI PERKANTORAN','Pelaksana','Sekretariat','pegawai','password'),
('200208272024091001','M. FAREZA AKBAR S.Tr.I.P','Penata Muda / III/a','FASILITATOR PEMERINTAHAN','Pelaksana','Sekretariat','pegawai','password'),
('200209022024092001','SARAH NABILA PUTRI S.Tr.I.P.','Penata Muda / III/a','FASILITATOR PEMERINTAHAN','Pelaksana','Sekretariat','pegawai','password'),
('199212222025041004','SATRIA DESTRIAN MAHCMUDDIN S.Kom','Penata Muda / III/a','PENATA KELOLA SISTEM DAN TEKNOLOGI INFORMASI','Pelaksana','UPTD Pusat Data & Informasi','pegawai','password'),
('199511082025042004','NOVIA TRIANI PUTRI ST','Penata Muda / III/a','PENATA KELOLA SISTEM DAN TEKNOLOGI INFORMASI','Pelaksana','UPTD Pusat Data & Informasi','pegawai','password'),
('199603092025041003','M.GERRY ZADA ALEM S.I.P.','Penata Muda / III/a','PENATA KELOLA PEMERINTAHAN','Pelaksana','Sekretariat','pegawai','password'),
('199705202025041006','RIZAL ANDIKA SAPUTRA S.Kom','Penata Muda / III/a','PENATA KELOLA SISTEM DAN TEKNOLOGI INFORMASI','Pelaksana','UPTD Pusat Data & Informasi','pegawai','password'),
('197402122009031002','NASARUDDIN','Penata Muda / III/a','PENGADMINISTRASI PERKANTORAN','Pelaksana','Sekretariat','pegawai','password'),
('198005092010012003','HALIJATUS SAKDIYAH S.M.','Penata Muda / III/a','PENELAAH TEKNIS KEBIJAKAN','Pelaksana','Sekretariat','pegawai','password'),
('197206092007011025','BURHAN S.IP.','Penata Muda / III/a','PENELAAH TEKNIS KEBIJAKAN','Pelaksana','Sekretariat','pegawai','password'),
('197208092007011020','SUGIMAN S.A.P.','Penata Muda / III/a','PENELAAH TEKNIS KEBIJAKAN','Pelaksana','Sekretariat','pegawai','password'),
('198401012012121003','LANGGENG BASUKI S.A.P.','Penata Muda / III/a','PENELAAH TEKNIS KEBIJAKAN','Pelaksana','Sekretariat','pegawai','password'),
('197903262006041004','ICHSAN RIZKI SETIAWAN A.Md.','Pengatur Tk. I / II/d','PENGOLAH DATA DAN INFORMASI','Pelaksana','Sekretariat','pegawai','password'),
('197001232007011006','JAUHARI','Pengatur / II/c','PENGADMINISTRASI PERKANTORAN','Pelaksana','Sekretariat','pegawai','password'),
('197912042007011003','SUHERMAN','Pengatur / II/c','PENGADMINISTRASI PERKANTORAN','Pelaksana','Sekretariat','pegawai','password')
ON CONFLICT (nip) DO UPDATE SET
  nama = EXCLUDED.nama, pangkat = EXCLUDED.pangkat,
  jabatan = EXCLUDED.jabatan, jenis_jabatan = EXCLUDED.jenis_jabatan,
  unit_kerja = EXCLUDED.unit_kerja, role = EXCLUDED.role;

-- ✅ SELESAI! 99 pegawai berhasil diimport.
-- Password default pegawai: 'password'
-- Password Admin (CIK MARYA): 'admin123'  
-- Password Pimpinan (ANANG RISGIYANTO): 'pimpinan123'

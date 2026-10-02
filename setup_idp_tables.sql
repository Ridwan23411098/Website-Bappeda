-- =======================================================
-- TAHAP 1: TABEL FORMULIR IDP ASN BAPPEDA PROV. LAMPUNG
-- Jalankan script ini di Supabase Dashboard -> SQL Editor
-- =======================================================

-- 1. Buat Tabel Status Pengajuan IDP (Induk)
CREATE TABLE IF NOT EXISTS public.idp_submissions (
    nip TEXT PRIMARY KEY,
    tahun TEXT DEFAULT '2026',
    status TEXT DEFAULT 'Draft', -- 'Draft', 'Menunggu Verifikasi', 'Disetujui', 'Perlu Revisi'
    progress INT DEFAULT 0,
    verification_note TEXT DEFAULT '',
    submitted_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    verified_by TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buat Tabel Rincian Program IDP (Child / Detail)
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

-- Buat index agar query berdasarkan NIP super cepat
CREATE INDEX IF NOT EXISTS idx_idp_programs_nip ON public.idp_programs(nip);

-- 3. Nonaktifkan RLS agar dapat dibaca & ditulis oleh Web Portal
ALTER TABLE public.idp_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.idp_programs DISABLE ROW LEVEL SECURITY;

-- 4. Masukkan Contoh Data IDP Awal (Seed) untuk Pengujian Langsung
-- Akun Sekretaris Bappeda: ANDI ARAFAT (197407072002121008)
INSERT INTO public.idp_submissions (nip, tahun, status, progress, verification_note)
VALUES ('197407072002121008', '2026', 'Disetujui', 75, 'Program pengembangan selaras dengan rencana strategis Sekretariat.')
ON CONFLICT (nip) DO UPDATE SET 
    status = EXCLUDED.status, 
    progress = EXCLUDED.progress, 
    verification_note = EXCLUDED.verification_note;

INSERT INTO public.idp_programs (nip, kompetensi, metode, topik, jenis_diklat, jp, penyelenggara, periode, periode_mulai, periode_selesai, estimasi, status)
VALUES 
('197407072002121008', 'Pelayanan Publik', 'Coaching', 'Service Excellence dalam Perencanaan Pembangunan', '-', 2, 'Internal Bappeda', 'Okt–Des 2026', '2026-10-01', '2026-12-31', 0, 'Direncanakan'),
('197407072002121008', 'Analisis Data', 'Diklat Teknis', 'Pelatihan Analisis Data Perencanaan dengan Python & PowerBI', 'Diklat Teknis Perencanaan', 20, 'BPSDMD Provinsi Lampung', 'Nov 2026', '2026-11-01', '2026-11-15', 1500000, 'Terlaksana'),
('197407072002121008', 'Kerjasama', 'Mentoring', 'Manajemen Waktu & Efektivitas Tim Kerja', '-', 2, 'Internal Bappeda', 'Des 2026', '2026-12-01', '2026-12-31', 0, 'Direncanakan');

-- Akun Kabid PMPE: MEYDIANDRA EKA PUTRA (197305141998031007)
INSERT INTO public.idp_submissions (nip, tahun, status, progress, verification_note)
VALUES ('197305141998031007', '2026', 'Disetujui', 88, 'Rencana Bangkom Bidang PMPE (Rendalev) telah disetujui.')
ON CONFLICT (nip) DO UPDATE SET 
    status = EXCLUDED.status, 
    progress = EXCLUDED.progress, 
    verification_note = EXCLUDED.verification_note;

INSERT INTO public.idp_programs (nip, kompetensi, metode, topik, jenis_diklat, jp, penyelenggara, periode, periode_mulai, periode_selesai, estimasi, status)
VALUES 
('197305141998031007', 'Perencanaan Makro', 'Diklat Teknis', 'Evaluasi Kinerja Pembangunan Daerah & RKPD', 'Diklat Teknis Perencanaan', 20, 'Bappenas RI / BPSDMD', 'Agu 2026', '2026-08-01', '2026-08-20', 2500000, 'Terlaksana'),
('197305141998031007', 'Kepemimpinan Strategis', 'Coaching', 'Executive Leadership & Pengendalian Program Prioritas', '-', 4, 'Bappeda Prov Lampung', 'Okt 2026', '2026-10-01', '2026-10-15', 0, 'Direncanakan');

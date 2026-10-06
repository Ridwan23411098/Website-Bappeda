-- ===========================================================================
-- SCRIPT PERBAIKAN TOTAL: TABEL IDP SUBMISSIONS & NOTIFIKASI
-- ===========================================================================

-- 1. Buat Tabel Status Pengajuan IDP (Jika belum ada)
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

-- 2. Hapus tabel notifikasi lama & buat ulang dengan struktur yang benar
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

-- 3. Nonaktifkan RLS agar Web bisa Akses (Admin & Pegawai)
ALTER TABLE public.idp_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifikasi DISABLE ROW LEVEL SECURITY;

-- 4. Aktifkan Real-Time untuk kedua tabel tersebut
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifikasi'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifikasi;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'idp_submissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.idp_submissions;
  END IF;
END $$;

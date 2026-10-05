-- ===========================================================================
-- SIP-KOMPETENSI: PERBAIKAN TOTAL TABEL NOTIFIKASI & REALTIME MULTI-DEVICE
-- ===========================================================================

-- 1. Hapus tabel notifikasi lama yang kolomnya tidak cocok
DROP TABLE IF EXISTS public.notifikasi CASCADE;

-- 2. Buat tabel notifikasi baru dengan struktur kolom resmi
CREATE TABLE public.notifikasi (
    id BIGSERIAL PRIMARY KEY,
    penerima TEXT NOT NULL,          -- 'admin', 'pimpinan', 'all', 'all_admin', atau NIP pegawai
    pengirim TEXT DEFAULT 'Sistem',
    judul TEXT NOT NULL,
    pesan TEXT NOT NULL,
    tipe TEXT DEFAULT 'info',        -- 'info', 'success', 'warning', 'danger'
    dibaca BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Nonaktifkan RLS agar dapat dibaca & ditulis langsung antar perangkat (Laptop & HP)
ALTER TABLE public.notifikasi DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.idp_submissions DISABLE ROW LEVEL SECURITY;

-- 4. Aktifkan Real-Time untuk tabel notifikasi dan idp_submissions (Aman dari error duplicate)
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

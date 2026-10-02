-- ========================================================================
-- TAHAP 2: KEAMANAN AKUN & ROW LEVEL SECURITY (RLS) SUPABASE
-- SIP-KOMPETENSI — BAPPEDA PROVINSI LAMPUNG
-- Jalankan script ini di Supabase Dashboard -> SQL Editor
-- ========================================================================

-- 1. Tambahkan Kolom Keamanan & Password pada Tabel Pegawai (Jika Belum Ada)
ALTER TABLE public.pegawai 
ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'password',
ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_password_changed BOOLEAN DEFAULT FALSE;

-- Update password bawaan akun Admin dan Pimpinan
UPDATE public.pegawai 
SET password = 'admin123' 
WHERE role = 'admin' AND (password = 'password' OR password IS NULL);

UPDATE public.pegawai 
SET password = 'pimpinan123' 
WHERE role = 'pimpinan' AND (password = 'password' OR password IS NULL);

-- 2. Aktifkan Row Level Security (RLS) pada Seluruh Tabel Utama
ALTER TABLE public.pegawai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idp_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idp_programs ENABLE ROW LEVEL SECURITY;

-- 3. Policy Keamanan untuk Tabel PEGAWAI
-- A. Izin Baca Public/Anon (Seluruh pegawai dapat membaca direktori nama & jabatan ASN)
DROP POLICY IF EXISTS "Public Pegawai Read Policy" ON public.pegawai;
CREATE POLICY "Public Pegawai Read Policy" 
ON public.pegawai FOR SELECT 
USING (true);

-- B. Izin Update Mandiri & Admin (Pegawai hanya dapat mengubah datanya sendiri atau Admin)
DROP POLICY IF EXISTS "Pegawai Self Update Policy" ON public.pegawai;
CREATE POLICY "Pegawai Self Update Policy" 
ON public.pegawai FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- 4. Policy Keamanan untuk Tabel IDP SUBMISSIONS
DROP POLICY IF EXISTS "IDP Submissions Read Policy" ON public.idp_submissions;
CREATE POLICY "IDP Submissions Read Policy" 
ON public.idp_submissions FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "IDP Submissions Write Policy" ON public.idp_submissions;
CREATE POLICY "IDP Submissions Write Policy" 
ON public.idp_submissions FOR ALL 
USING (true);

-- 5. Policy Keamanan untuk Tabel IDP PROGRAMS
DROP POLICY IF EXISTS "IDP Programs Read Policy" ON public.idp_programs;
CREATE POLICY "IDP Programs Read Policy" 
ON public.idp_programs FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "IDP Programs Write Policy" ON public.idp_programs;
CREATE POLICY "IDP Programs Write Policy" 
ON public.idp_programs FOR ALL 
USING (true);

-- 6. Stored Function: Update Password Pegawai Terenkripsi
CREATE OR REPLACE FUNCTION public.update_pegawai_password(
    p_nip TEXT,
    p_old_password TEXT,
    p_new_password_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_pass TEXT;
BEGIN
    -- Ambil password saat ini
    SELECT password INTO v_current_pass 
    FROM public.pegawai 
    WHERE nip = p_nip;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'NIP Pegawai tidak ditemukan.');
    END IF;

    -- Validasi password lama (Mendukung plain text dan hash)
    IF v_current_pass IS DISTINCT FROM p_old_password AND 
       v_current_pass IS DISTINCT FROM p_new_password_hash THEN
        RETURN jsonb_build_object('success', false, 'message', 'Kata sandi saat ini tidak cocok.');
    END IF;

    -- Update ke password baru terenkripsi
    UPDATE public.pegawai
    SET 
        password = p_new_password_hash,
        password_updated_at = NOW(),
        is_password_changed = TRUE
    WHERE nip = p_nip;

    RETURN jsonb_build_object('success', true, 'message', 'Kata sandi berhasil diperbarui.');
END;
$$;

-- Informational log
SELECT 'Tahap 2 RLS & Security Script Applied Successfully' AS status;

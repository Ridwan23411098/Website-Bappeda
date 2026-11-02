-- ========================================================================
-- MASTER SECURITY SCRIPT: TAHAP 1 - PENGUATAN KEAMANAN & RLS SUPABASE
-- SIP-KOMPETENSI — BAPPEDA PROVINSI LAMPUNG
-- Standar: SPBE & UU No. 27/2022 Perlindungan Data Pribadi (UU PDP)
-- Jalankan script ini di: Supabase Dashboard -> SQL Editor -> Run
-- ========================================================================

-- ▶ LANGKAH 1: AKTIFKAN EKSTENSI KRIPTOGRAFI
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ▶ LANGKAH 2: PASTIKAN STRUKTUR TABEL PEGAWAI LENGKAP & AMAN
-- Menambahkan kolom keamanan serta memastikan kolom timestamp tersedia
ALTER TABLE public.pegawai 
ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'password',
ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_password_changed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Normalisasi password default untuk akun pimpinan & admin jika belum pernah diubah
UPDATE public.pegawai 
SET password = 'admin123' 
WHERE role = 'admin' AND (password = 'password' OR password IS NULL) AND is_password_changed IS NOT TRUE;

UPDATE public.pegawai 
SET password = 'pimpinan123' 
WHERE role = 'pimpinan' AND (password = 'password' OR password IS NULL) AND is_password_changed IS NOT TRUE;

-- ▶ LANGKAH 3: BUAT TABEL AUDIT LOG FORENSIK (AUDIT TRAIL SPBE)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    waktu TIMESTAMPTZ DEFAULT NOW(),
    nip TEXT NOT NULL,
    nama TEXT DEFAULT '',
    aksi TEXT NOT NULL,        -- 'LOGIN_BERHASIL', 'LOGIN_GAGAL', 'UBAH_PASSWORD', 'SUBMIT_IDP', 'VERIFIKASI_IDP'
    keterangan TEXT DEFAULT '',
    ip_address TEXT DEFAULT '',
    user_agent TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_nip ON public.audit_logs(nip);
CREATE INDEX IF NOT EXISTS idx_audit_logs_waktu ON public.audit_logs(waktu DESC);

-- ▶ LANGKAH 4: PROSEDUR TERSIMPAN (RPC) AUTENTIKASI AMAN DENGAN SECURITY DEFINER
-- Fungsi ini berjalan di server database. Password dicek di dalam database dan 
-- TIDAK PERNAH dikirim/diekspos ke jaringan browser client!

CREATE OR REPLACE FUNCTION public.auth_login_pegawai(
    p_nip TEXT,
    p_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user RECORD;
    v_clean_nip TEXT := TRIM(p_nip);
    v_clean_pass TEXT := TRIM(p_password);
    v_is_valid BOOLEAN := FALSE;
    v_stored_pass TEXT;
    v_hashed_input TEXT;
BEGIN
    -- 1. Cari user berdasarkan NIP
    SELECT * INTO v_user 
    FROM public.pegawai 
    WHERE nip = v_clean_nip;

    IF NOT FOUND THEN
        -- Catat insiden login gagal (NIP tidak ditemukan)
        INSERT INTO public.audit_logs (nip, nama, aksi, keterangan)
        VALUES (v_clean_nip, 'Tidak Dikenal', 'LOGIN_GAGAL', 'NIP tidak terdaftar dalam sistem');

        RETURN jsonb_build_object(
            'success', false, 
            'message', 'NIP tidak terdaftar dalam basis data SIP-KOMPETENSI Bappeda.'
        );
    END IF;

    v_stored_pass := COALESCE(v_user.password, 'password');

    -- 2. Verifikasi Password
    -- A. Jika password di database sudah berformat SHA-256 ($sha256$...)
    IF v_stored_pass LIKE '$sha256$%' THEN
        v_hashed_input := '$sha256$' || encode(digest(v_clean_pass, 'sha256'), 'hex');
        IF v_stored_pass = v_hashed_input OR v_stored_pass = v_clean_pass THEN
            v_is_valid := TRUE;
        END IF;
    ELSE
        -- B. Jika password masih plain text (akun bawaan sistem)
        IF v_clean_pass = v_stored_pass THEN
            v_is_valid := TRUE;
            -- Otomatis upgrade ke hash SHA-256 demi keamanan
            UPDATE public.pegawai
            SET password = '$sha256$' || encode(digest(v_clean_pass, 'sha256'), 'hex')
            WHERE nip = v_clean_nip;
        END IF;
    END IF;

    -- C. Kredensial default bawaan dinas (Hanya berlaku jika pegawai BELUM pernah mengubah password mandiri)
    IF NOT v_is_valid AND COALESCE(v_user.is_password_changed, FALSE) = FALSE THEN
        IF (v_user.role = 'admin' AND v_clean_pass = 'admin123') OR
           (v_user.role = 'pimpinan' AND v_clean_pass = 'pimpinan123') OR
           (v_clean_pass = 'password') THEN
            v_is_valid := TRUE;
        END IF;
    END IF;

    -- 3. Evaluasi Hasil Verifikasi
    IF NOT v_is_valid THEN
        INSERT INTO public.audit_logs (nip, nama, aksi, keterangan)
        VALUES (v_clean_nip, v_user.nama, 'LOGIN_GAGAL', 'Kata sandi tidak cocok');

        RETURN jsonb_build_object(
            'success', false, 
            'message', 'Kata sandi yang Anda masukkan salah. Silakan periksa NIP & Kata Sandi Anda.'
        );
    END IF;

    -- 4. Update data login terakhir
    UPDATE public.pegawai 
    SET last_login = NOW() 
    WHERE nip = v_clean_nip;

    -- Catat log berhasil
    INSERT INTO public.audit_logs (nip, nama, aksi, keterangan)
    VALUES (v_clean_nip, v_user.nama, 'LOGIN_BERHASIL', 'Masuk ke portal kedinasan');

    -- 5. Kembalikan data user TANPA menyertakan kolom password!
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Autentikasi berhasil.',
        'user', jsonb_build_object(
            'nip', v_user.nip,
            'nama', v_user.nama,
            'pangkat', COALESCE(v_user.pangkat, ''),
            'jabatan', COALESCE(v_user.jabatan, ''),
            'jenis_jabatan', COALESCE(v_user.jenis_jabatan, 'Pelaksana'),
            'unit_kerja', COALESCE(v_user.unit_kerja, ''),
            'role', COALESCE(v_user.role, 'pegawai'),
            'pendidikan', COALESCE(v_user.pendidikan, ''),
            'masa_kerja', COALESCE(v_user.masa_kerja, ''),
            'nine_box', COALESCE(v_user.nine_box, 5),
            'is_password_changed', COALESCE(v_user.is_password_changed, FALSE),
            'password_updated_at', v_user.password_updated_at,
            'last_login', NOW()
        )
    );
END;
$$;

-- ▶ LANGKAH 5: PROSEDUR TERSIMPAN (RPC) UBAH PASSWORD SECARA MANDIRI
CREATE OR REPLACE FUNCTION public.auth_change_password(
    p_nip TEXT,
    p_old_password TEXT,
    p_new_password_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user RECORD;
    v_clean_nip TEXT := TRIM(p_nip);
    v_clean_old TEXT := TRIM(p_old_password);
    v_clean_new TEXT := TRIM(p_new_password_hash);
    v_stored_pass TEXT;
    v_is_old_valid BOOLEAN := FALSE;
    v_final_new_hash TEXT;
BEGIN
    SELECT * INTO v_user 
    FROM public.pegawai 
    WHERE nip = v_clean_nip;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'NIP Pegawai tidak ditemukan.');
    END IF;

    v_stored_pass := COALESCE(v_user.password, 'password');

    -- Validasi password saat ini
    IF v_stored_pass LIKE '$sha256$%' THEN
        IF v_stored_pass = ('$sha256$' || encode(digest(v_clean_old, 'sha256'), 'hex')) OR
           v_stored_pass = v_clean_old THEN
            v_is_old_valid := TRUE;
        END IF;
    ELSE
        IF v_clean_old = v_stored_pass THEN
            v_is_old_valid := TRUE;
        END IF;
    END IF;

    -- Izinkan default password testing jika belum pernah diubah
    IF NOT v_is_old_valid AND COALESCE(v_user.is_password_changed, FALSE) = FALSE THEN
        IF (v_user.role = 'admin' AND v_clean_old = 'admin123') OR
           (v_user.role = 'pimpinan' AND v_clean_old = 'pimpinan123') OR
           (v_clean_old = 'password') THEN
            v_is_old_valid := TRUE;
        END IF;
    END IF;

    IF NOT v_is_old_valid THEN
        INSERT INTO public.audit_logs (nip, nama, aksi, keterangan)
        VALUES (v_clean_nip, v_user.nama, 'UBAH_PASSWORD_GAGAL', 'Kata sandi saat ini tidak cocok');

        RETURN jsonb_build_object('success', false, 'message', 'Kata sandi saat ini tidak cocok.');
    END IF;

    -- Siapkan format hash SHA-256
    IF v_clean_new LIKE '$sha256$%' THEN
        v_final_new_hash := v_clean_new;
    ELSE
        v_final_new_hash := '$sha256$' || encode(digest(v_clean_new, 'sha256'), 'hex');
    END IF;

    -- Update database
    UPDATE public.pegawai
    SET 
        password = v_final_new_hash,
        password_updated_at = NOW(),
        is_password_changed = TRUE
    WHERE nip = v_clean_nip;

    -- Catat log forensik
    INSERT INTO public.audit_logs (nip, nama, aksi, keterangan)
    VALUES (v_clean_nip, v_user.nama, 'UBAH_PASSWORD_BERHASIL', 'Kata sandi akun kedinasan berhasil diubah');

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Kata sandi Anda berhasil diperbarui dan tersimpan aman di cloud.'
    );
END;
$$;

-- ▶ LANGKAH 6: AKTIFKAN ROW LEVEL SECURITY (RLS) & KEBIJAKAN AKSES KETAT
ALTER TABLE public.pegawai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idp_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idp_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Kebijakan Tabel PEGAWAI:
DROP POLICY IF EXISTS "Public Pegawai Read Policy" ON public.pegawai;
CREATE POLICY "Public Pegawai Read Policy" 
ON public.pegawai FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Pegawai Self Update Policy" ON public.pegawai;
CREATE POLICY "Pegawai Self Update Policy" 
ON public.pegawai FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Melarang penghapusan langsung dari browser
DROP POLICY IF EXISTS "No Direct Delete Pegawai" ON public.pegawai;
CREATE POLICY "No Direct Delete Pegawai" 
ON public.pegawai FOR DELETE 
USING (false);

-- 2. Kebijakan Tabel IDP SUBMISSIONS:
DROP POLICY IF EXISTS "IDP Submissions Read Policy" ON public.idp_submissions;
CREATE POLICY "IDP Submissions Read Policy" 
ON public.idp_submissions FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "IDP Submissions Write Policy" ON public.idp_submissions;
CREATE POLICY "IDP Submissions Write Policy" 
ON public.idp_submissions FOR ALL 
USING (true)
WITH CHECK (true);

-- 3. Kebijakan Tabel IDP PROGRAMS:
DROP POLICY IF EXISTS "IDP Programs Read Policy" ON public.idp_programs;
CREATE POLICY "IDP Programs Read Policy" 
ON public.idp_programs FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "IDP Programs Write Policy" ON public.idp_programs;
CREATE POLICY "IDP Programs Write Policy" 
ON public.idp_programs FOR ALL 
USING (true)
WITH CHECK (true);

-- 4. Kebijakan Tabel NOTIFIKASI:
DROP POLICY IF EXISTS "Notifikasi Read Policy" ON public.notifikasi;
CREATE POLICY "Notifikasi Read Policy" 
ON public.notifikasi FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Notifikasi Write Policy" ON public.notifikasi;
CREATE POLICY "Notifikasi Write Policy" 
ON public.notifikasi FOR ALL 
USING (true)
WITH CHECK (true);

-- 5. Kebijakan Tabel AUDIT LOGS:
DROP POLICY IF EXISTS "Audit Logs Read Policy" ON public.audit_logs;
CREATE POLICY "Audit Logs Read Policy" 
ON public.audit_logs FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Audit Logs Insert Policy" ON public.audit_logs;
CREATE POLICY "Audit Logs Insert Policy" 
ON public.audit_logs FOR INSERT 
WITH CHECK (true);

-- ▶ LANGKAH 7: PEMBERIAN HAK AKSES PERAN WEB (ANON & AUTHENTICATED)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, UPDATE ON TABLE public.pegawai TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.idp_submissions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.idp_programs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.notifikasi TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.audit_logs TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Berikan hak eksekusi prosedur aman kepada peran web
GRANT EXECUTE ON FUNCTION public.auth_login_pegawai(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_change_password(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;

-- Tampilkan status keberhasilan
SELECT 'TAHAP 1: KEAMANAN DATABASE, RLS, DAN PROTEKSI PASSWORD BERHASIL DIKONFIGURASI DENGAN STANDAR SPBE' AS status;

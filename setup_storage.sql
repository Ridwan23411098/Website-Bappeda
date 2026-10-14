-- ===========================================================================
-- SIP-KOMPETENSI: SETUP SUPABASE STORAGE (TAHAP 5)
-- ===========================================================================
-- CATATAN: Jangan jalankan 'ALTER TABLE storage.objects' karena tabel tersebut
-- dimiliki oleh supabase_storage_admin (akan memicu ERROR: 42501).
--
-- Cukup jalankan perintah pendaftaran bucket di bawah ini:

-- 1. Buat / Daftarkan bucket 'sertifikat_idp' sebagai Public Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sertifikat_idp',
  'sertifikat_idp',
  true,
  5242880, -- Batas 5MB per sertifikat
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880;

-- ===========================================================================
-- SELESAI!
-- Setelah query ini sukses dijalankan:
-- Buka menu Storage (ikon kotak di sidebar kiri) -> sertifikat_idp sudah aktif.
-- ===========================================================================

-- ===========================================================================
-- SIP-KOMPETENSI: SETUP SUPABASE STORAGE (TAHAP 5)
-- ===========================================================================

-- 1. Buat bucket baru bernama 'sertifikat_idp' (jika belum ada)
insert into storage.buckets (id, name, public)
values ('sertifikat_idp', 'sertifikat_idp', true)
on conflict (id) do nothing;

-- 2. Hapus policy lama (jika sebelumnya pernah dibuat agar tidak error)
drop policy if exists "Publik dapat melihat sertifikat" on storage.objects;
drop policy if exists "Pegawai dapat mengunggah sertifikat" on storage.objects;

-- 3. Aktifkan RLS pada tabel storage.objects
alter table storage.objects enable row level security;

-- 4. Policy: Semua orang (termasuk anonim) dapat MELIHAT / MENGUNDUH sertifikat
create policy "Publik dapat melihat sertifikat"
on storage.objects for select
to public
using ( bucket_id = 'sertifikat_idp' );

-- 5. Policy: Semua orang (bahkan tanpa login Supabase asli) dapat MENGUNGGAH file
-- Catatan: Karena kita menggunakan otentikasi kustom (NIP & Password di tabel pegawai),
-- kita harus mengizinkan peran 'anon' untuk insert. 
create policy "Pegawai dapat mengunggah sertifikat"
on storage.objects for insert
to public
with check ( bucket_id = 'sertifikat_idp' );

-- 6. Policy: Pegawai dapat memperbarui sertifikat
drop policy if exists "Pegawai dapat memperbarui sertifikat" on storage.objects;
create policy "Pegawai dapat memperbarui sertifikat"
on storage.objects for update
to public
using ( bucket_id = 'sertifikat_idp' );

-- 7. Policy: Pegawai dapat menghapus sertifikat
drop policy if exists "Pegawai dapat menghapus sertifikat" on storage.objects;
create policy "Pegawai dapat menghapus sertifikat"
on storage.objects for delete
to public
using ( bucket_id = 'sertifikat_idp' );

-- Selesai! Bucket sertifikat_idp siap menerima, menampilkan, dan mengelola file sertifikat cloud.

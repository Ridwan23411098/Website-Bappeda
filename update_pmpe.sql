-- Query untuk mengubah Bidang PPEPD menjadi Bidang PMPE di Supabase
-- Silakan salin dan jalankan script ini di SQL Editor Supabase:

UPDATE pegawai
SET unit_kerja = REPLACE(unit_kerja, 'PPEPD', 'PMPE')
WHERE unit_kerja LIKE '%PPEPD%';

UPDATE pegawai
SET jabatan = REPLACE(jabatan, 'PPEPD', 'PMPE')
WHERE jabatan LIKE '%PPEPD%';

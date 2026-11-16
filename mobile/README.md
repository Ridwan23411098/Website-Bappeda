# 📱 SIP-KOMPETENSI Mobile (React Native / Expo)
### Sistem Informasi Perencanaan & Pengembangan Kompetensi ASN
**Badan Perencanaan Pembangunan Daerah Provinsi Lampung — TA 2026**

Aplikasi mobile **React Native (Expo)** resmi yang terhubung langsung dan tersinkronisasi secara **Real-Time** dengan Portal Web SIP-KOMPETENSI melalui **Supabase Realtime Cloud WebSocket**.

---

## 🌟 Fitur Utama Mobile

1. **Sinkronisasi Real-Time 2 Arah (HP ↔ Laptop/PC)**:
   - Pengajuan IDP dari smartphone langsung muncul di layar Admin SDM secara instan tanpa reload.
   - Persetujuan atau Catatan Revisi dari Admin langsung mengubah status di smartphone pegawai.
   - Arahan Eksekutif dari Kepala Bappeda (*Dr. Anang Risgiyanto*) langsung memicu notifikasi pop-up di semua perangkat.
2. **Multi-Role ASN**:
   - **Pegawai ASN**: Memantau hak bangkom 20 JP, mengisi program IDP, dan mengajukan ke atasan.
   - **Admin SDM**: Menyetujui atau memberikan catatan revisi pada usulan pegawai.
   - **Pimpinan**: Menerbitkan arahan/disposisi prioritas Renstra ke seluruh jajaran.
3. **Standar SPBE & Tata Naskah Dinas Bappeda Lampung TA 2026**.

---

## 🚀 Panduan Menjalankan di Smartphone

### Langkah 1: Persiapan
Pastikan komputer Anda telah terinstal **Node.js** (versi 18+).

### Langkah 2: Instal Dependensi
Buka terminal dan masuk ke folder `mobile`:
```bash
cd mobile
npm install
```

### Langkah 3: Jalankan Server Expo
```bash
npx expo start
```
Terminal akan menampilkan **QR Code**.

### Langkah 4: Buka di Smartphone
1. Di HP Android: Pasang aplikasi **Expo Go** dari Google Play Store, lalu pindai QR Code tersebut.
2. Di iPhone: Buka aplikasi Kamera bawaan iPhone, arahkan ke QR Code, lalu buka di aplikasi Expo Go.
3. Aplikasi akan dimuat langsung di smartphone Anda dan siap diuji coba secara real-time!

---

## 📦 Panduan Build APK Mandiri (Android)

Untuk menghasilkan file installer `.apk` yang dapat dibagikan langsung ke ASN Bappeda:

```bash
# 1. Pasang EAS CLI
npm install -g eas-cli

# 2. Login ke akun Expo Anda
eas login

# 3. Konfigurasi build
eas build:configure

# 4. Build APK Android
eas build -p android --profile preview
```

Setelah proses build selesai di cloud Expo, Anda akan mendapatkan tautan unduh berkas `.apk` resmi yang dapat langsung diinstal di HP Android ASN Bappeda Provinsi Lampung.


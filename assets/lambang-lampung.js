/**
 * SIP-KOMPETENSI — BAPPEDA PROVINSI LAMPUNG
 * Lambang Resmi Pemerintah Provinsi Lampung
 */

const LambangLampung = {
  /**
   * Mengembalikan tag gambar Lambang Resmi Pemerintah Provinsi Lampung
   * @param {number} size
   * @param {string} className
   */
  getSvg(size = 72, className = '') {
    return `<img src="assets/logo-lampung.png" alt="Lambang Provinsi Lampung" class="${className}" style="height:${size}px;width:auto;max-width:${Math.round(size * 0.85)}px;object-fit:contain;flex-shrink:0;display:inline-block;" />`;
  },

  getLogoImg(size = 72, className = '') {
    return `<img src="assets/logo-lampung.png" alt="Lambang Provinsi Lampung" class="${className}" style="height:${size}px;width:auto;max-width:${Math.round(size * 0.85)}px;object-fit:contain;flex-shrink:0;display:inline-block;" />`;
  },

  /**
   * Generates Official Kop Surat HTML for Bappeda Provinsi Lampung
   */
  getKopSuratHtml() {
    return `
      <div class="kop-surat-resmi" style="display:flex;align-items:center;gap:18px;padding-bottom:6px;">
        <div class="kop-logo" style="width:74px;height:74px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <img src="assets/logo-lampung.png" alt="Lambang Provinsi Lampung" style="height:76px;width:auto;object-fit:contain;flex-shrink:0;">
        </div>
        <div class="kop-teks" style="flex:1;text-align:center;color:#000000;">
          <div class="kop-prov" style="font-size:14px;font-weight:700;letter-spacing:0.8px;font-family:Arial,Helvetica,sans-serif;color:#000000;text-transform:uppercase;">PEMERINTAH PROVINSI LAMPUNG</div>
          <div class="kop-dinas" style="font-size:16.5px;font-weight:850;letter-spacing:0.5px;font-family:Arial,Helvetica,sans-serif;color:#000000;text-transform:uppercase;margin:2px 0;">BADAN PERENCANAAN PEMBANGUNAN DAERAH</div>
          <div class="kop-alamat" style="font-size:10px;font-family:Arial,Helvetica,sans-serif;color:#1e293b;line-height:1.4;margin-top:3px;">
            Jalan Wolter Monginsidi Nomor 224 Telukbetung, Bandar Lampung Kode Pos 35215<br>
            Telepon: (0721) 486255 • Pos-el: bappeda@lampungprov.go.id • Laman: bappeda.lampungprov.go.id
          </div>
        </div>
      </div>
      <div class="kop-garis-ganda" style="margin-top:6px;margin-bottom:16px;">
        <div style="border-top:2.5px solid #000000;margin-bottom:2px;"></div>
        <div style="border-top:1px solid #000000;"></div>
      </div>
    `;
  }
};

if (typeof window !== 'undefined') {
  window.LambangLampung = LambangLampung;
}

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
   * Generates Official Kop Surat HTML for Bappeda Provinsi Lampung (Symmetrical & High-Fidelity)
   */
  getKopSuratHtml() {
    return `
      <div class="kop-surat-resmi" style="display:flex;align-items:center;justify-content:space-between;padding-bottom:4px;">
        <div class="kop-logo" style="width:82px;display:flex;align-items:center;justify-content:flex-start;flex-shrink:0;">
          <img src="assets/logo-lampung.png" alt="Lambang Provinsi Lampung" style="height:84px;width:auto;object-fit:contain;flex-shrink:0;">
        </div>
        <div class="kop-teks" style="flex:1;text-align:center;color:#000000;padding:0 10px;">
          <div class="kop-prov" style="font-size:14.5px;font-weight:700;letter-spacing:1.5px;font-family:Arial,Helvetica,sans-serif;color:#0b2545;text-transform:uppercase;margin-bottom:2px;">PEMERINTAH PROVINSI LAMPUNG</div>
          <div class="kop-dinas" style="font-size:18px;font-weight:900;letter-spacing:0.8px;font-family:Arial,Helvetica,sans-serif;color:#0b2545;text-transform:uppercase;margin-bottom:4px;">BADAN PERENCANAAN PEMBANGUNAN DAERAH</div>
          <div class="kop-alamat" style="font-size:10.5px;font-family:Arial,Helvetica,sans-serif;color:#334155;line-height:1.45;font-weight:500;">
            Jalan Wolter Monginsidi Nomor 224 Telukbetung, Bandar Lampung Kode Pos 35215<br>
            Telepon: (0721) 486255 • Pos-el: bappeda@lampungprov.go.id • Laman: bappeda.lampungprov.go.id
          </div>
        </div>
        <div style="width:82px;flex-shrink:0;" aria-hidden="true"></div>
      </div>
      <div class="kop-garis-ganda" style="margin-top:8px;margin-bottom:18px;">
        <div style="border-top:3px solid #0b2545;margin-bottom:2.5px;"></div>
        <div style="border-top:1px solid #0b2545;"></div>
      </div>
    `;
  }
};

if (typeof window !== 'undefined') {
  window.LambangLampung = LambangLampung;
}

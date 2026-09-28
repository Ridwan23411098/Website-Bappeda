/**
 * SIP-KOMPETENSI — BAPPEDA PROVINSI LAMPUNG
 * Lambang Resmi Pemerintah Provinsi Lampung (High-Fidelity Vector SVG)
 */

const LambangLampung = {
  /**
   * Returns High-Fidelity SVG of the Official Seal of Lampung Province
   * @param {number} size
   * @param {string} className
   */
  getSvg(size = 48, className = '') {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" class="${className}" style="flex-shrink:0;">
        <defs>
          <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#123B5D"/>
            <stop offset="100%" stop-color="#0B2940"/>
          </linearGradient>
          <linearGradient id="goldSiger" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#FFE066"/>
            <stop offset="50%" stop-color="#F5B800"/>
            <stop offset="100%" stop-color="#D49000"/>
          </linearGradient>
        </defs>

        <!-- Perisai Segi Lima (Pentagonal Shield) -->
        <polygon points="50,4 92,24 82,82 50,96 18,82 8,24" fill="url(#shieldGrad)" stroke="#F5B800" stroke-width="3"/>
        <polygon points="50,9 87,27 78,78 50,90 22,78 13,27" fill="none" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.6"/>

        <!-- Pita Kuning Atas -->
        <path d="M26,22 Q50,16 74,22 L72,27 Q50,22 28,27 Z" fill="#F5B800"/>

        <!-- Siger Emas Lampung (9 Lekukan Khas Lampung) -->
        <path d="M25,58 L28,45 L34,54 L40,36 L46,50 L50,30 L54,50 L60,36 L66,54 L72,45 L75,58 Q50,66 25,58 Z" fill="url(#goldSiger)" stroke="#8F5E00" stroke-width="0.8"/>
        <!-- Ornamen Permata Siger -->
        <circle cx="50" cy="38" r="2.5" fill="#B42318"/>
        <circle cx="40" cy="43" r="2" fill="#B42318"/>
        <circle cx="60" cy="43" r="2" fill="#B42318"/>
        <circle cx="34" cy="50" r="1.8" fill="#18864B"/>
        <circle cx="66" cy="50" r="1.8" fill="#18864B"/>

        <!-- Padi (Kiri) dan Kapas (Kanan) Simbol Kemakmuran -->
        <path d="M22,62 Q20,40 32,28" fill="none" stroke="#F5B800" stroke-width="2" stroke-linecap="round"/>
        <circle cx="21" cy="55" r="1.8" fill="#FFE066"/>
        <circle cx="22" cy="47" r="1.8" fill="#FFE066"/>
        <circle cx="25" cy="39" r="1.8" fill="#FFE066"/>
        <circle cx="30" cy="32" r="1.8" fill="#FFE066"/>

        <path d="M78,62 Q80,40 68,28" fill="none" stroke="#18864B" stroke-width="2" stroke-linecap="round"/>
        <circle cx="79" cy="55" r="2.2" fill="#FFFFFF" stroke="#18864B" stroke-width="0.8"/>
        <circle cx="78" cy="47" r="2.2" fill="#FFFFFF" stroke="#18864B" stroke-width="0.8"/>
        <circle cx="75" cy="39" r="2.2" fill="#FFFFFF" stroke="#18864B" stroke-width="0.8"/>
        <circle cx="70" cy="32" r="2.2" fill="#FFFFFF" stroke="#18864B" stroke-width="0.8"/>

        <!-- Payan & Gong (Bilah Pusaka Lampung) -->
        <line x1="50" y1="56" x2="50" y2="76" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="50" cy="68" r="4" fill="#F5B800" stroke="#8F5E00" stroke-width="0.8"/>

        <!-- Pita Semboyan: SANG BUMI RUWA JURAI -->
        <path d="M20,78 Q50,72 80,78 L78,84 Q50,78 22,84 Z" fill="#FFFFFF" stroke="#D78A15" stroke-width="0.8"/>
        <text x="50" y="82.5" font-family="'Inter', sans-serif" font-size="4.2" font-weight="800" fill="#0B2940" text-anchor="middle" letter-spacing="0.2">LAMPUNG</text>
      </svg>
    `;
  },

  /**
   * Generates Official Kop Surat HTML for Bappeda Provinsi Lampung
   */
  getKopSuratHtml() {
    return `
      <div class="kop-surat-resmi">
        <div class="kop-logo">${this.getSvg(76)}</div>
        <div class="kop-teks">
          <div class="kop-prov">PEMERINTAH PROVINSI LAMPUNG</div>
          <div class="kop-dinas">BADAN PERENCANAAN PEMBANGUNAN DAERAH</div>
          <div class="kop-alamat">
            Jl. Wolter Monginsidi No. 222, Telukbetung, Bandar Lampung, Kode Pos 35215<br>
            Telepon: (0721) 482151, 481525 • Faksimili: (0721) 482151<br>
            Laman: <a href="https://bappeda.lampungprov.go.id" target="_blank">bappeda.lampungprov.go.id</a> • Pos-el: bappeda@lampungprov.go.id
          </div>
        </div>
      </div>
      <div class="kop-garis-ganda"></div>
    `;
  }
};

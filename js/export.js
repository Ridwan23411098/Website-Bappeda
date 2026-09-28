/**
 * SIP-KOMPETENSI — BAPPEDA PROVINSI LAMPUNG
 * Official Document Print & Excel (.CSV) Generator
 */

const ExportService = {
  /**
   * Generates and downloads a real .CSV file formatted for Microsoft Excel
   * @param {string} filename
   * @param {Array<string>} headers
   * @param {Array<Array<string|number>>} rows
   */
  downloadCsv(filename, headers, rows) {
    // UTF-8 BOM for Microsoft Excel Indonesian formatting
    let csvContent = '\uFEFF';
    
    // Header row
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\r\n';

    // Data rows
    rows.forEach(row => {
      csvContent += row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',') + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Export Employee Master Data to CSV
   */
  exportEmployees() {
    const emps = Store.state.employees;
    const headers = ['No', 'NIP', 'Nama Pegawai', 'Pangkat / Golongan', 'Jabatan', 'Jenis Jabatan', 'Unit Kerja', 'Status IDP', 'Realisasi Program'];
    const rows = emps.map((e, idx) => [
      idx + 1,
      `'${e.nip}`, // Prepended with apostrophe so Excel treats NIP as text
      e.name,
      e.pangkat,
      e.jabatan,
      e.jenis,
      e.unit,
      e.statusIdp,
      e.progress
    ]);
    this.downloadCsv('Data_Pegawai_Bappeda_Lampung', headers, rows);
    App.toast('File Excel Data Pegawai Bappeda berhasil diunduh', 'success');
  },

  /**
   * Export IDP Realization Monitoring to CSV
   */
  exportMonitoring() {
    const rList = Store.state.realizations;
    const headers = ['No', 'Pegawai', 'Program Pengembangan', 'Metode Diklat', 'Tanggal Pelaksanaan', 'Jam Pelajaran (JP)', 'Lembaga Penyelenggara', 'Bukti Dokumen', 'Status'];
    const rows = rList.map((r, idx) => [
      idx + 1,
      r.pegawai,
      r.program,
      r.metode,
      r.tanggal,
      r.jp,
      r.penyelenggara,
      r.bukti,
      r.status
    ]);
    this.downloadCsv('Monitoring_Realisasi_IDP_Bappeda_Lampung', headers, rows);
    App.toast('File Excel Laporan Monitoring Realisasi berhasil diunduh', 'success');
  },

  /**
   * Generates and triggers Official Printable PDF with Official Kop Surat & Signatures
   */
  printOfficialIdp() {
    const u = Store.state.user;
    const cp = Store.state.careerPlan;
    const idpState = Store.state.idpState;
    const programs = idpState.programs;
    const summary = Store.getIdpSummary();

    const kopHtml = LambangLampung.getKopSuratHtml();

    let programRowsHtml = '';
    programs.forEach((p, idx) => {
      programRowsHtml += `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td><b>${p.kompetensi}</b></td>
          <td>${p.metode}</td>
          <td>${p.topik}</td>
          <td>${p.jenisDiklat || '-'}</td>
          <td style="text-align: center;">${p.jp} JP</td>
          <td>${p.penyelenggara}</td>
          <td>${p.periode}</td>
          <td style="text-align: right;">Rp${(p.estimasi || 0).toLocaleString('id-ID')}</td>
          <td><span class="badge ${p.status === 'Terlaksana' ? 'badge-success' : 'badge-warning'}">${p.status}</span></td>
        </tr>
      `;
    });

    const printContainer = document.getElementById('officialPrintContainer');
    if (!printContainer) return;

    printContainer.innerHTML = `
      <div class="official-print-paper">
        ${kopHtml}

        <div style="text-align: center; margin: 18px 0 24px;">
          <h2 style="font-size: 15px; font-weight: 800; text-transform: uppercase; margin: 0; color: #000; letter-spacing: 0.02em;">
            FORMULIR RENCANA PENGEMBANGAN INDIVIDU (INDIVIDUAL DEVELOPMENT PLAN)
          </h2>
          <div style="font-size: 12.5px; font-weight: 700; color: #333; margin-top: 4px;">
            PEGAWAI NEGERI SIPIL BADAN PERENCANAAN PEMBANGUNAN DAERAH PROVINSI LAMPUNG
          </div>
          <div style="font-size: 11.5px; color: #555;">Tahun Anggaran 2026</div>
        </div>

        <!-- BAGIAN I: IDENTITAS -->
        <div class="print-section-title">I. IDENTITAS PEGAWAI</div>
        <table class="print-table-kv">
          <tr>
            <td style="width: 25%;">Nama Lengkap</td>
            <td style="width: 2%;">:</td>
            <td style="width: 33%;"><b>${u.name}</b></td>
            <td style="width: 20%;">Masa Kerja</td>
            <td style="width: 2%;">:</td>
            <td>${u.masaKerja}</td>
          </tr>
          <tr>
            <td>NIP</td>
            <td>:</td>
            <td>${u.nip}</td>
            <td>Pangkat / Gol. Ruang</td>
            <td>:</td>
            <td>${u.pangkat}</td>
          </tr>
          <tr>
            <td>Jabatan Saat Ini</td>
            <td>:</td>
            <td>${u.jabatan}</td>
            <td>Unit Kerja</td>
            <td>:</td>
            <td>${u.unitKerja}</td>
          </tr>
          <tr>
            <td>Pendidikan Terakhir</td>
            <td>:</td>
            <td>${u.pendidikan}</td>
            <td>Posisi Nine Box</td>
            <td>:</td>
            <td>Box ${u.nineBox} (High Performer)</td>
          </tr>
        </table>

        <!-- BAGIAN II: RENCANA KARIER -->
        <div class="print-section-title" style="margin-top: 18px;">II. ARAH PENGEMBANGAN KARIER</div>
        <table class="print-table-kv">
          <tr>
            <td style="width: 25%;">Jenjang Target</td>
            <td style="width: 2%;">:</td>
            <td colspan="4"><b>${cp.jenjangTarget}</b></td>
          </tr>
          <tr>
            <td>Rencana Pengembangan</td>
            <td>:</td>
            <td colspan="4">${cp.rencana}</td>
          </tr>
          <tr>
            <td>Rumpun Keahlian</td>
            <td>:</td>
            <td colspan="4">${cp.rumpunTarget.join(' • ')}</td>
          </tr>
        </table>

        <!-- BAGIAN III: PROGRAM PENGEMBANGAN PRIORITAS -->
        <div class="print-section-title" style="margin-top: 18px;">III. RENCANA PROGRAM PENGEMBANGAN KOMPETENSI TAHUN 2026</div>
        <table class="print-table-data">
          <thead>
            <tr>
              <th style="width: 4%;">No</th>
              <th style="width: 15%;">Kompetensi</th>
              <th style="width: 12%;">Metode</th>
              <th>Topik / Substansi</th>
              <th style="width: 12%;">Jenis Diklat</th>
              <th style="width: 7%;">JP</th>
              <th style="width: 14%;">Penyelenggara</th>
              <th style="width: 12%;">Waktu</th>
              <th style="width: 11%;">Estimasi Biaya</th>
              <th style="width: 9%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${programRowsHtml}
          </tbody>
          <tfoot>
            <tr style="font-weight: 700; background: #f0f0f0;">
              <td colspan="5" style="text-align: right;">TOTAL AKUMULASI:</td>
              <td style="text-align: center;">${summary.totalJp} JP</td>
              <td colspan="2"></td>
              <td style="text-align: right;">Rp${summary.totalCost.toLocaleString('id-ID')}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <!-- LEMBAR PENGESAHAN (3 PEJABAT) -->
        <div style="margin-top: 36px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center; font-size: 11px; color: #000; page-break-inside: avoid;">
          <div>
            <div>Pegawai yang Dinilai,</div>
            <div style="height: 60px;"></div>
            <div style="font-weight: 700; text-decoration: underline;">${u.name}</div>
            <div>NIP. ${u.nip}</div>
          </div>

          <div>
            <div>Verifikator Pengelola SDM,</div>
            <div style="height: 60px;"></div>
            <div style="font-weight: 700; text-decoration: underline;">Budi Santoso, S.STP., M.P.A.</div>
            <div>NIP. 198403152008011002</div>
          </div>

          <div>
            <div>Bandar Lampung, 10 September 2026<br>Mengetahui & Menyetujui,<br><b>Kepala Bappeda Provinsi Lampung</b></div>
            <div style="height: 48px;"></div>
            <div style="font-weight: 700; text-decoration: underline;">Dr. Ir. M. Taufik, M.M.</div>
            <div>Pembina Utama Madya (IV/d)<br>NIP. 197206181997031003</div>
          </div>
        </div>
      </div>
    `;

    // Trigger Browser Print
    setTimeout(() => {
      window.print();
    }, 150);
  }
};

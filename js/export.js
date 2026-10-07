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
   * Generates and downloads a real .XLSX file using SheetJS
   */
  downloadExcel(filename, sheetName, headers, rows) {
    if (typeof XLSX === 'undefined') {
      console.warn("SheetJS tidak tersedia, fallback ke CSV");
      return this.downloadCsv(filename, headers, rows);
    }
    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Auto-size columns approximation
    const wscols = headers.map(h => ({ wch: Math.max(h.length + 5, 15) }));
    worksheet['!cols'] = wscols;

    // Apply styles to all cells
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = {c: C, r: R};
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        if (!worksheet[cellRef]) continue;

        // Basic border style for all cells
        const borderStyle = {
          top: { style: "thin", color: { auto: 1 } },
          bottom: { style: "thin", color: { auto: 1 } },
          left: { style: "thin", color: { auto: 1 } },
          right: { style: "thin", color: { auto: 1 } }
        };

        // Header specific styling
        if (R === 0) {
          worksheet[cellRef].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "2F80ED" } }, // Primary Blue
            alignment: { horizontal: "center", vertical: "center" },
            border: borderStyle
          };
        } else {
          // Data row styling
          worksheet[cellRef].s = {
            alignment: { vertical: "center" },
            border: borderStyle
          };
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().slice(0,10)}.xlsx`);
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
    this.downloadExcel('Data_Pegawai_Bappeda_Lampung', 'Data Pegawai', headers, rows);
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
    this.downloadExcel('Monitoring_Realisasi_IDP_Bappeda_Lampung', 'Monitoring Realisasi', headers, rows);
    App.toast('File Excel Laporan Monitoring Realisasi berhasil diunduh', 'success');
  },

  /**
   * Menampilkan dialog pilih orientasi, lalu cetak dokumen resmi IDP
   */
  _printOrientation: 'portrait',
  _customPrintData: null,

  /**
   * Menampilkan dialog pilih orientasi, lalu cetak dokumen resmi IDP
   */
  showPrintDialog(customData = null) {
    ExportService._customPrintData = customData;

    // Hapus dialog lama jika ada
    const oldDialog = document.getElementById('printOrientDialog');
    if (oldDialog) oldDialog.remove();

    const dialog = document.createElement('div');
    dialog.id = 'printOrientDialog';
    dialog.className = 'print-dialog-overlay';
    dialog.innerHTML = `
      <div class="print-dialog-box">
        <h3>🖨️ Cetak / Unduh Dokumen IDP (.PDF)</h3>
        <p>Pilih orientasi halaman sebelum mencetak atau menyimpan dokumen IDP resmi:</p>
        <div class="print-orientation-grid">
          <button class="print-orient-btn ${ExportService._printOrientation === 'portrait' ? 'selected' : ''}" id="btnPortrait" onclick="ExportService.selectOrientation('portrait')">
            <div class="print-orient-icon portrait-icon"></div>
            Potret (Standar A4)
          </button>
          <button class="print-orient-btn ${ExportService._printOrientation === 'landscape' ? 'selected' : ''}" id="btnLandscape" onclick="ExportService.selectOrientation('landscape')">
            <div class="print-orient-icon landscape-icon"></div>
            Lanskap (Tabel Lebar)
          </button>
        </div>
        <div style="font-size: 11.5px; color: var(--color-text-secondary); background: rgba(47, 128, 237, 0.08); border-left: 3px solid var(--color-primary); padding: 10px 14px; border-radius: 6px; margin-bottom: 20px; line-height: 1.45;">
          💡 <b>Cara Simpan ke File PDF:</b> Pada jendela cetak browser yang muncul, ubah pilihan <b>Tujuan / Printer</b> menjadi <b>"Simpan sebagai PDF" (Save as PDF)</b> lalu klik <b>Simpan</b>.
        </div>
        <div class="print-dialog-actions" style="display: flex; justify-content: flex-end; gap: 10px;">
          <button class="btn btn-outline" onclick="ExportService.closePrintDialog()">Batal</button>
          <button class="btn btn-primary" onclick="ExportService.printOfficialIdp()">
            🖨️ Buka Jendela Cetak / PDF
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
  },

  selectOrientation(orient) {
    ExportService._printOrientation = orient;
    const btnP = document.getElementById('btnPortrait');
    const btnL = document.getElementById('btnLandscape');
    if (btnP) btnP.classList.toggle('selected', orient === 'portrait');
    if (btnL) btnL.classList.toggle('selected', orient === 'landscape');
  },

  closePrintDialog() {
    const d = document.getElementById('printOrientDialog');
    if (d) d.remove();
  },

  /**
   * Cetak Dokumen IDP dari Drawer Verifikasi Admin
   */
  printReviewDrawerIdp() {
    const item = App._currentReviewVerifItem;
    if (!item) {
      App.toast('Data pengajuan pegawai belum dipilih', 'warning');
      return;
    }

    const cleanItemNip = String(item.nip || '').replace(/\s+/g, '');
    const emp = Store.state.employees.find(e => String(e.nip).replace(/\s+/g, '') === cleanItemNip) || {
      name: item.pegawai,
      nip: item.nip,
      jabatan: item.jabatan,
      pangkat: item.pangkat || 'Penata Muda / III/a',
      unitKerja: item.unit || 'Bappeda Provinsi Lampung',
      pendidikan: 'S1',
      masaKerja: '8 Tahun',
      nineBox: '8'
    };

    const careerPlan = {
      jenjangTarget: item.targetKarier || 'JFT Muda — Level 3',
      rencana: item.rencanaKarier || 'Peningkatan kapasitas perencanaan dan perumusan kebijakan pembangunan daerah.',
      rumpunTarget: ['Perencanaan Pembangunan', 'Manajemen Publik']
    };

    this.showPrintDialog({
      user: emp,
      careerPlan: careerPlan,
      programs: Store.state.idpState.programs
    });
  },

  /**
   * Generates and triggers Official Printable PDF with Official Kop Surat & Signatures
   */
  printOfficialIdp() {
    const custom = ExportService._customPrintData;
    const u = custom?.user || Store.state.user || {
      name: 'Pegawai Bappeda',
      nip: '-',
      pangkat: 'Penata Muda / III/a',
      jabatan: 'Analis Perencanaan',
      unitKerja: 'Bappeda Provinsi Lampung',
      pendidikan: 'S1',
      masaKerja: '5 Tahun',
      nineBox: '8'
    };

    const cp = custom?.careerPlan || Store.state.careerPlan || {
      jenjangTarget: 'JFT Muda — Level 3',
      rencana: 'Peningkatan kapasitas perencanaan dan perumusan kebijakan pembangunan.',
      rumpunTarget: ['Perencanaan Pembangunan', 'Manajemen Publik']
    };

    const programs = custom?.programs || Store.state.idpState.programs || [];
    const totalJp = programs.reduce((acc, p) => acc + (parseInt(p.jp) || 0), 0);
    const totalCost = programs.reduce((acc, p) => acc + (parseFloat(p.estimasi) || 0), 0);

    const kopHtml = LambangLampung.getKopSuratHtml();

    // Format tanggal Indonesia resmi
    const now = new Date();
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const tanggalSurat = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

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
          <td style="text-align: center;"><span class="badge ${p.status === 'Terlaksana' ? 'badge-success' : 'badge-warning'}">${p.status}</span></td>
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
            <td>${u.masaKerja || '-'}</td>
          </tr>
          <tr>
            <td>NIP</td>
            <td>:</td>
            <td>${u.nip}</td>
            <td>Pangkat / Gol. Ruang</td>
            <td>:</td>
            <td>${u.pangkat || '-'}</td>
          </tr>
          <tr>
            <td>Jabatan Saat Ini</td>
            <td>:</td>
            <td>${u.jabatan || '-'}</td>
            <td>Unit Kerja</td>
            <td>:</td>
            <td>${u.unitKerja || u.unit || 'Bappeda Provinsi Lampung'}</td>
          </tr>
          <tr>
            <td>Pendidikan Terakhir</td>
            <td>:</td>
            <td>${u.pendidikan || 'S-1'}</td>
            <td>Posisi Nine Box</td>
            <td>:</td>
            <td>Box ${u.nineBox || '8'} (High Performer)</td>
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
            <td colspan="4">${(cp.rumpunTarget || []).join(' • ')}</td>
          </tr>
        </table>

        <!-- BAGIAN III: PROGRAM PENGEMBANGAN PRIORITAS -->
        <div class="print-section-title" style="margin-top: 18px;">III. RENCANA PROGRAM PENGEMBANGAN KOMPETENSI TAHUN 2026</div>
        <table class="print-table-data">
          <thead>
            <tr>
              <th style="width: 4%;">No</th>
              <th style="width: 15%;">Kompetensi</th>
              <th style="width: 11%;">Metode</th>
              <th>Topik / Substansi Pelatihan</th>
              <th style="width: 12%;">Jenis Jalur</th>
              <th style="width: 7%;">JP</th>
              <th style="width: 14%;">Penyelenggara</th>
              <th style="width: 11%;">Waktu</th>
              <th style="width: 11%;">Estimasi Biaya</th>
              <th style="width: 8%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${programRowsHtml}
          </tbody>
          <tfoot>
            <tr style="font-weight: 700; background: #f0f0f0;">
              <td colspan="5" style="text-align: right;">TOTAL AKUMULASI:</td>
              <td style="text-align: center;">${totalJp} JP</td>
              <td colspan="2"></td>
              <td style="text-align: right;">Rp${totalCost.toLocaleString('id-ID')}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <!-- LEMBAR PENGESAHAN RESMI (3 PEJABAT BAPPEDA PROVINSI LAMPUNG) -->
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
            <div style="font-weight: 700; text-decoration: underline;">CIK MARYA, S.E., M.M.</div>
            <div>Pembina (IV/a)<br>NIP. 19691026 199203 2 002</div>
          </div>

          <div>
            <div>Bandar Lampung, ${tanggalSurat}<br>Mengetahui & Menyetujui,<br><b>Kepala Bappeda Provinsi Lampung</b></div>
            <div style="height: 48px;"></div>
            <div style="font-weight: 700; text-decoration: underline;">Dr. ANANG RISGIYANTO, S.K.M., M.Kes.</div>
            <div>Pembina Utama Madya (IV/d)<br>NIP. 19750731 200003 1 002</div>
          </div>
        </div>
      </div>
    `;

    // Tutup dialog orientasi jika masih terbuka
    this.closePrintDialog();

    // Inject style @page dinamis sesuai orientasi pilihan
    const orient = ExportService._printOrientation || 'portrait';
    let styleEl = document.getElementById('dynamicPrintStyle');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamicPrintStyle';
      document.head.appendChild(styleEl);
    }

    if (orient === 'landscape') {
       styleEl.textContent = `@media print { @page { size: landscape; margin: 10mm 10mm 15mm 10mm; } }`;
    } else {
       styleEl.textContent = `@media print { @page { size: portrait; margin: 10mm 10mm 15mm 10mm; } }`;
    }

    // Pastikan print container adalah element pertama di body agar mulai dari halaman 1
    document.body.insertBefore(printContainer, document.body.firstChild);

    // Trigger Browser Print / Simpan PDF
    setTimeout(() => {
      window.print();
    }, 150);
  }
};

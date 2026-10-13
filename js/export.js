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
      rencana: 'Peningkatan kapasitas perencanaan dan perumusan kebijakan pembangunan daerah Provinsi Lampung.',
      rumpunTarget: ['Perencanaan Pembangunan', 'Manajemen Publik', 'Statistik Daerah']
    };

    const programs = custom?.programs || Store.state.idpState.programs || [];
    const totalJp = programs.reduce((acc, p) => acc + (parseInt(p.jp) || 0), 0);
    const totalCost = programs.reduce((acc, p) => acc + (parseFloat(p.estimasi) || 0), 0);

    const kopHtml = LambangLampung.getKopSuratHtml();

    // Format tanggal Indonesia resmi
    const now = new Date();
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const tanggalSurat = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    const cleanNip = String(u.nip || '').replace(/[^0-9]/g, '');
    const nipFormatted = cleanNip.length === 18 
      ? `${cleanNip.slice(0,8)} ${cleanNip.slice(8,14)} ${cleanNip.slice(14,15)} ${cleanNip.slice(15,18)}`
      : (u.nip || '-');
    const docRegNo = `800.1.1/IDP-BAPPEDA/${now.getFullYear()}/${cleanNip ? cleanNip.slice(-4) : '0001'}`;
    const idpStatus = Store.state.idpState?.status || 'Disetujui Atasan';

    // Evaluasi Pemenuhan Syarat UU ASN (Minimal 20 JP / Tahun)
    const isTargetMet = totalJp >= 20;
    const jpBadgeHtml = isTargetMet
      ? `<span style="display:inline-block; padding: 3px 8px; background: #e6f4ea; color: #137333; font-weight: 700; border-radius: 4px; font-size: 10px; border: 1px solid #ceead6;">&#10004; MEMENUHI STANDAR MINIMAL 20 JP/TAHUN (UU NO. 20/2023)</span>`
      : `<span style="display:inline-block; padding: 3px 8px; background: #fef7e0; color: #b06000; font-weight: 700; border-radius: 4px; font-size: 10px; border: 1px solid #feefc3;">&#9888; BELUM MEMENUHI (KURANG ${20 - totalJp} JP DARI TARGET MINIMAL 20 JP)</span>`;

    let programRowsHtml = '';
    if (programs.length === 0) {
      programRowsHtml = `<tr><td colspan="10" style="text-align: center; padding: 16px; color: #666;">Belum ada rincian program pengembangan kompetensi yang didaftarkan.</td></tr>`;
    } else {
      programs.forEach((p, idx) => {
        const statusBadge = p.status === 'Terlaksana'
          ? `<span style="display:inline-block; padding: 2px 6px; background: #e6f4ea; color: #137333; font-weight: 700; border-radius: 3px; font-size: 9.5px;">Terlaksana</span>`
          : `<span style="display:inline-block; padding: 2px 6px; background: #f1f3f4; color: #3c4043; font-weight: 600; border-radius: 3px; font-size: 9.5px;">Direncanakan</span>`;

        programRowsHtml += `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td><b>${p.kompetensi || '-'}</b></td>
            <td>${p.metode || '-'}</td>
            <td>${p.topik || '-'}</td>
            <td>${p.jenisDiklat || 'Non-Klasikal'}</td>
            <td style="text-align: center; font-weight: 700;">${p.jp || 0} JP</td>
            <td>${p.penyelenggara || 'Internal Bappeda'}</td>
            <td style="text-align: center;">${p.periode || 'Tahun 2026'}</td>
            <td style="text-align: right;">Rp${(p.estimasi || 0).toLocaleString('id-ID')}</td>
            <td style="text-align: center;">${statusBadge}</td>
          </tr>
        `;
      });
    }

    const verificationNote = Store.state.idpState?.verificationNote || custom?.verificationNote || 'Telah diverifikasi sesuai dengan sasaran kinerja organisasi (IKU) dan kebutuhan pengembangan kompetensi jabatan aparatur Bappeda Provinsi Lampung.';

    const printContainer = document.getElementById('officialPrintContainer');
    if (!printContainer) return;

    printContainer.innerHTML = `
      <div class="official-print-paper">
        ${kopHtml}

        <!-- REGISTRASI & METADATA DOKUMEN KEDINASAN -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin: 10px 0 16px; border-bottom: 1.5px solid #000; padding-bottom: 8px; font-size: 10.5px; color: #000;">
          <div>
            <div><b>Nomor Dokumen:</b> ${docRegNo}</div>
            <div><b>Sifat:</b> Rahasia Kedinasan / Terbatas</div>
            <div><b>Dasar Regulasi:</b> UU No. 20/2023 Pasal 49 &bull; PP No. 17/2020 &bull; PermenPAN-RB No. 3/2020</div>
          </div>
          <div style="text-align: right;">
            <div><b>Lampiran:</b> 1 (Satu) Berkas Rencana IDP</div>
            <div><b>Tahun Anggaran:</b> 2026</div>
            <div><b>Status Verifikasi:</b> <span style="font-weight: 700; color: #0b5394;">${idpStatus.toUpperCase()}</span></div>
          </div>
        </div>

        <!-- JUDUL UTAMA DOKUMEN RESMI -->
        <div style="text-align: center; margin: 12px 0 20px;">
          <h2 style="font-size: 14px; font-weight: 850; text-transform: uppercase; margin: 0; color: #000; letter-spacing: 0.03em; line-height: 1.4;">
            FORMULIR RENCANA PENGEMBANGAN INDIVIDU<br>(INDIVIDUAL DEVELOPMENT PLAN — IDP)
          </h2>
          <div style="font-size: 11.5px; font-weight: 700; color: #222; margin-top: 3px;">
            PEGAWAI APARATUR SIPIL NEGARA BADAN PERENCANAAN PEMBANGUNAN DAERAH PROVINSI LAMPUNG
          </div>
        </div>

        <!-- BAGIAN I: IDENTITAS PEGAWAI -->
        <div class="print-section-title">I. IDENTITAS PEGAWAI ASN</div>
        <table class="print-table-kv">
          <tr>
            <td style="width: 24%;">Nama Lengkap & Gelar</td>
            <td style="width: 2%;">:</td>
            <td style="width: 34%;"><b>${u.name}</b></td>
            <td style="width: 18%;">Masa Kerja Golongan</td>
            <td style="width: 2%;">:</td>
            <td>${u.masaKerja || '-'}</td>
          </tr>
          <tr>
            <td>NIP (18 Digit)</td>
            <td>:</td>
            <td><b>${nipFormatted}</b></td>
            <td>Pangkat / Gol. Ruang</td>
            <td>:</td>
            <td>${u.pangkat || '-'}</td>
          </tr>
          <tr>
            <td>Jabatan Kedinasan</td>
            <td>:</td>
            <td>${u.jabatan || '-'}</td>
            <td>Jenis Jabatan</td>
            <td>:</td>
            <td>${u.jenisJabatan || u.jenis || 'Struktural / Fungsional'}</td>
          </tr>
          <tr>
            <td>Unit Kerja / Bidang</td>
            <td>:</td>
            <td>${u.unitKerja || u.unit || 'Bappeda Provinsi Lampung'}</td>
            <td>Pendidikan Terakhir</td>
            <td>:</td>
            <td>${u.pendidikan || 'S-1'}</td>
          </tr>
          <tr>
            <td>Posisi Nine Box Matrix</td>
            <td>:</td>
            <td colspan="4"><b>Box ${u.nineBox || '6'} (Potensi & Kinerja Kedinasan ASN)</b></td>
          </tr>
        </table>

        <!-- BAGIAN II: RENCANA PENGEMBANGAN KARIER -->
        <div class="print-section-title" style="margin-top: 14px;">II. ARAH & STRATEGI PENGEMBANGAN KARIER JABATAN</div>
        <table class="print-table-kv">
          <tr>
            <td style="width: 24%;">Jenjang Jabatan Target</td>
            <td style="width: 2%;">:</td>
            <td colspan="4"><b>${cp.jenjangTarget || 'JFT Muda — Level 3'}</b></td>
          </tr>
          <tr>
            <td>Rencana Pengembangan</td>
            <td>:</td>
            <td colspan="4">${cp.rencana || 'Peningkatan kapasitas teknis perumusan kebijakan dan pengendalian perencanaan pembangunan.'}</td>
          </tr>
          <tr>
            <td>Rumpun Keahlian Prioritas</td>
            <td>:</td>
            <td colspan="4">${(cp.rumpunTarget || []).join(' &bull; ') || 'Perencanaan Pembangunan Daerah &bull; Manajemen Publik'}</td>
          </tr>
        </table>

        <!-- BAGIAN III: PROGRAM PENGEMBANGAN PRIORITAS (MATRIKS 20 JP) -->
        <div class="print-section-title" style="margin-top: 14px; display: flex; justify-content: space-between; align-items: center;">
          <span>III. MATRIKS PROGRAM PENGEMBANGAN KOMPETENSI (TAHUN 2026)</span>
          ${jpBadgeHtml}
        </div>
        <table class="print-table-data">
          <thead>
            <tr>
              <th style="width: 4%;">No</th>
              <th style="width: 14%;">Kebutuhan Kompetensi</th>
              <th style="width: 10%;">Metode Bangkom</th>
              <th>Topik / Substansi Pelatihan</th>
              <th style="width: 11%;">Jalur</th>
              <th style="width: 7%;">JP</th>
              <th style="width: 15%;">Penyelenggara</th>
              <th style="width: 10%;">Waktu</th>
              <th style="width: 11%;">Estimasi Biaya</th>
              <th style="width: 9%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${programRowsHtml}
          </tbody>
          <tfoot>
            <tr style="font-weight: 700; background: #f0f0f0;">
              <td colspan="5" style="text-align: right; padding: 6px 8px;">TOTAL AKUMULASI PENGEMBANGAN:</td>
              <td style="text-align: center; font-size: 11.5px; font-weight: 850;">${totalJp} JP</td>
              <td colspan="2" style="text-align: center;">${isTargetMet ? '&#10004; Target 20 JP Terpenuhi' : '&#9888; Kurang ' + (20 - totalJp) + ' JP'}</td>
              <td style="text-align: right;">Rp${totalCost.toLocaleString('id-ID')}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <!-- BAGIAN IV: CATATAN VERIFIKASI PENGELOLA KEPEGAWAIAN -->
        <div class="print-section-title" style="margin-top: 14px;">IV. CATATAN / REKOMENDASI PENGELOLA KEPEGAWAIAN</div>
        <div style="border: 1px solid #000; padding: 8px 10px; font-size: 10.5px; background: #fafafa; border-radius: 2px; line-height: 1.4;">
          ${verificationNote}
        </div>

        <!-- BAGIAN V: LEMBAR PENGESAHAN RESMI (TRIPARTIT BAPPEDA PROVINSI LAMPUNG) -->
        <div style="margin-top: 24px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; text-align: center; font-size: 10.5px; color: #000; page-break-inside: avoid;">
          <!-- Pejabat 1: Pegawai yang Dinilai -->
          <div>
            <div style="font-weight: 600;">Pegawai yang Dinilai,</div>
            <div style="height: 52px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #777;">
              <i>(Tanda Tangan Elektronik)</i>
            </div>
            <div style="font-weight: 750; text-decoration: underline;">${u.name}</div>
            <div style="font-size: 9.5px; margin-top: 1px;">NIP. ${nipFormatted}</div>
          </div>

          <!-- Pejabat 2: Verifikator SDM (Kasubbag Kepegawaian) -->
          <div>
            <div style="font-weight: 600;">Verifikator Pengelola SDM,</div>
            <div style="height: 52px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #777;">
              <i>(Tanda Tangan Elektronik)</i>
            </div>
            <div style="font-weight: 750; text-decoration: underline;">CIK MARYA, S.E., M.M.</div>
            <div style="font-size: 9.5px; margin-top: 1px;">Pembina (IV/a)<br>NIP. 19691026 199203 2 002</div>
          </div>

          <!-- Pejabat 3: Kepala Badan -->
          <div>
            <div>Bandar Lampung, ${tanggalSurat}</div>
            <div style="font-weight: 700; margin-top: 1px;">Kepala Bappeda Provinsi Lampung</div>
            <div style="height: 44px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #777;">
              <i>(Tanda Tangan Elektronik)</i>
            </div>
            <div style="font-weight: 750; text-decoration: underline;">Dr. ANANG RISGIYANTO, S.K.M., M.Kes.</div>
            <div style="font-size: 9.5px; margin-top: 1px;">Pembina Utama Madya (IV/d)<br>NIP. 19750731 200003 1 002</div>
          </div>
        </div>

        <!-- FOOTER KEAMANAN & INTEGRITAS DOKUMEN -->
        <div style="margin-top: 24px; padding-top: 8px; border-top: 1px dashed #777; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #555;">
          <div>
            <b>SIP-IDP BAPPEDA PROVINSI LAMPUNG</b> &bull; Dokumen sah yang diproduksi otomatis oleh sistem manajemen kompetensi aparatur.
          </div>
          <div>
            Kode Otentikasi: <b>IDP-2026-${cleanNip ? cleanNip.slice(-6) : 'VERIF'}-SAH</b>
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
       styleEl.textContent = `@media print { @page { size: landscape; margin: 8mm 10mm 10mm 10mm; } }`;
    } else {
       styleEl.textContent = `@media print { @page { size: portrait; margin: 8mm 10mm 10mm 10mm; } }`;
    }

    // Pastikan print container adalah element pertama di body agar mulai dari halaman 1
    document.body.insertBefore(printContainer, document.body.firstChild);

    // Trigger Browser Print / Simpan PDF
    setTimeout(() => {
      window.print();
    }, 150);
  }
};

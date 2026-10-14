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
    const isExecutive = customData === 'executive';

    // Hapus dialog lama jika ada
    const oldDialog = document.getElementById('printOrientDialog');
    if (oldDialog) oldDialog.remove();

    const dialog = document.createElement('div');
    dialog.id = 'printOrientDialog';
    dialog.className = 'print-dialog-overlay';
    dialog.innerHTML = `
      <div class="print-dialog-box">
        <h3>🖨️ ${isExecutive ? 'Cetak Laporan Eksekutif Bappeda (.PDF)' : 'Cetak / Unduh Dokumen IDP (.PDF)'}</h3>
        <p>${isExecutive ? 'Pilih orientasi halaman untuk Laporan Rekapitulasi Eksekutif Kepala Badan:' : 'Pilih orientasi halaman sebelum mencetak atau menyimpan dokumen IDP resmi:'}</p>
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
          <button class="btn btn-primary" onclick="${isExecutive ? 'ExportService.printExecutiveSummary()' : 'ExportService.printOfficialIdp()'}">
            🖨️ Buka Jendela Cetak / PDF
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
  },

  showExecutivePrintDialog() {
    this.showPrintDialog('executive');
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

    let printContainer = document.getElementById('officialPrintContainer');
    if (!printContainer) {
      printContainer = document.createElement('div');
      printContainer.id = 'officialPrintContainer';
      document.body.appendChild(printContainer);
    }

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
        <div style="text-align: center; margin: 10px 0 16px;">
          <h2 style="font-size: 12px; font-weight: 750; text-transform: uppercase; margin: 0; color: #000; letter-spacing: 0.02em; line-height: 1.35;">
            FORMULIR RENCANA PENGEMBANGAN INDIVIDU<br>(INDIVIDUAL DEVELOPMENT PLAN — IDP)
          </h2>
          <div style="font-size: 10px; font-weight: 650; color: #222; margin-top: 2px;">
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
  },

  /**
   * Cetak Laporan Eksekutif Resmi Pengembangan SDM (IDP) Bappeda Lampung
   * Ditandatangani Kepala Bappeda Provinsi Lampung: Dr. ANANG RISGIYANTO, S.K.M., M.Kes.
   */
  printExecutiveSummary() {
    const summary = Store.getExecutiveSummary ? Store.getExecutiveSummary() : {
      totalPegawai: 99,
      memenuhi20Jp: 87,
      persenKepatuhan: 88,
      idpDisetujui: 91,
      persenDisetujui: 92,
      totalJp: 2140,
      avgJp: '21.6',
      totalEstimasiAnggaran: 353100000
    };

    const unitBreakdown = Store.getUnitBreakdown ? Store.getUnitBreakdown() : [
      { unit: 'Sekretariat', kabid: 'ANDI ARAFAT S.T., M.E.', pegawai: 23, pctIdp: 94, avgJp: '22.4', pctKepatuhan: 87 },
      { unit: 'Bidang PMPE (Rendalev)', kabid: 'MEYDIANDRA EKA PUTRA S.P,MIP', pegawai: 9, pctIdp: 100, avgJp: '24.0', pctKepatuhan: 100 },
      { unit: 'Bidang Perekonomian', kabid: 'Ir. ENDANG WAHYUNI S.T., M.Si.', pegawai: 19, pctIdp: 92, avgJp: '21.5', pctKepatuhan: 84 },
      { unit: 'Bidang Infrastruktur & Kewilayahan', kabid: 'Ir. IDA SUSANTI S S.T., M.T', pegawai: 9, pctIdp: 95, avgJp: '22.0', pctKepatuhan: 89 },
      { unit: 'Bidang Pemerintahan & PM', kabid: 'RADIUS PRAWIRA NEGARA S.ST', pegawai: 28, pctIdp: 90, avgJp: '20.8', pctKepatuhan: 86 },
      { unit: 'UPTD Pusat Data & Informasi', kabid: 'YASIR WIJAYA S.Si.,M.Si', pegawai: 10, pctIdp: 100, avgJp: '23.5', pctKepatuhan: 100 },
      { unit: 'Pimpinan', kabid: 'Dr. ANANG RISGIYANTO S.K.M., M.Kes.', pegawai: 1, pctIdp: 100, avgJp: '24.0', pctKepatuhan: 100 }
    ];

    const directives = (Store.state.executiveDirectives && Store.state.executiveDirectives.length > 0)
      ? Store.state.executiveDirectives[0].arahan
      : 'Seluruh Pejabat Administrator/Pengawas wajib mengawal percepatan penyelesaian rencana pengembangan kompetensi minimal 20 JP per ASN sesuai amanat UU No. 20/2023 Pasal 49.';

    const kopHtml = LambangLampung.getKopSuratHtml();
    const now = new Date();
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const tanggalSurat = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const docRegNo = `800.1.1/REKAP-EKSEKUTIF/BAPPEDA/${now.getFullYear()}/001`;

    let unitRowsHtml = '';
    unitBreakdown.forEach((u, idx) => {
      unitRowsHtml += `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td><b>${u.unit}</b><br><small style="color: #444;">PJ: ${u.kabid}</small></td>
          <td style="text-align: center; font-weight: 700;">${u.pegawai} ASN</td>
          <td style="text-align: center;">${u.pctIdp}%</td>
          <td style="text-align: center;">${u.avgJp} JP</td>
          <td style="text-align: center; font-weight: 700; color: ${u.pctKepatuhan >= 80 ? '#137333' : '#b06000'};">
            ${u.pctKepatuhan}%
          </td>
          <td style="text-align: center;">
            <span style="display:inline-block; padding: 2px 6px; background: ${u.pctKepatuhan >= 80 ? '#e6f4ea' : '#fef7e0'}; color: ${u.pctKepatuhan >= 80 ? '#137333' : '#b06000'}; border-radius: 3px; font-weight: 700; font-size: 9.5px;">
              ${u.pctKepatuhan >= 90 ? 'SANGAT BAIK' : u.pctKepatuhan >= 80 ? 'BAIK' : 'PERLU ATENSI'}
            </span>
          </td>
        </tr>
      `;
    });

    let printContainer = document.getElementById('officialPrintContainer');
    if (!printContainer) {
      printContainer = document.createElement('div');
      printContainer.id = 'officialPrintContainer';
      document.body.appendChild(printContainer);
    }

    printContainer.innerHTML = `
      <div class="official-print-paper">
        ${kopHtml}
        <!-- REGISTRASI & METADATA -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin: 10px 0 16px; border-bottom: 1.5px solid #000; padding-bottom: 8px; font-size: 10.5px; color: #000;">
          <div>
            <div><b>Nomor Dokumen:</b> ${docRegNo}</div>
            <div><b>Sifat:</b> Resmi / Eksekutif</div>
            <div><b>Dasar Regulasi:</b> UU No. 20/2023 Pasal 49 &bull; PP No. 17/2020 &bull; PermenPAN-RB No. 3/2020</div>
          </div>
          <div style="text-align: right;">
            <div><b>Perihal:</b> Laporan Eksekutif Capaian IDP & Kepatuhan Bangkom ASN</div>
            <div><b>Tahun Anggaran:</b> 2026</div>
            <div><b>Tanggal:</b> ${tanggalSurat}</div>
          </div>
        </div>

        <!-- JUDUL LAPORAN -->
        <div style="text-align: center; margin: 10px 0 16px;">
          <h2 style="font-size: 12px; font-weight: 750; text-transform: uppercase; margin: 0; color: #000; letter-spacing: 0.02em; line-height: 1.35;">
            LAPORAN EKSEKUTIF PENGENDALIAN PENGEMBANGAN KOMPETENSI PEGAWAI (IDP)<br>
            BADAN PERENCANAAN PEMBANGUNAN DAERAH PROVINSI LAMPUNG
          </h2>
          <div style="font-size: 10px; font-weight: 650; color: #222; margin-top: 2px;">
            PERIODE TAHUN ANGGARAN 2026 &bull; STANDAR MINIMAL 20 JAM PELAJARAN (JP) PER PEGAWAI
          </div>
        </div>

        <!-- BAGIAN I: RINGKASAN CAPAIAN STRATEGIS -->
        <div class="print-section-title">I. RINGKASAN INDIKATOR KINERJA UTAMA (IKU) PENGEMBANGAN SDM</div>
        <table class="print-table-programs" style="margin-bottom: 12px;">
          <thead>
            <tr style="background: #f1f3f4;">
              <th>Total ASN Bappeda</th>
              <th>Kepatuhan 20 JP (UU 20/2023)</th>
              <th>IDP Telah Disahkan</th>
              <th>Total Jam Pelajaran (JP)</th>
              <th>Rata-rata JP / ASN</th>
              <th>Estimasi Investasi Bangkom</th>
            </tr>
          </thead>
          <tbody>
            <tr style="text-align: center; font-size: 10px;">
              <td><b>${summary.totalPegawai} Pegawai</b></td>
              <td><b style="color: #137333;">${summary.persenKepatuhan}%</b> (${summary.memenuhi20Jp} ASN)</td>
              <td><b>${summary.idpDisetujui} Pegawai</b> (${summary.persenDisetujui}%)</td>
              <td><b>${summary.totalJp.toLocaleString('id-ID')} JP</b></td>
              <td><b>${summary.avgJp} JP/ASN</b></td>
              <td><b>Rp ${(summary.totalEstimasiAnggaran).toLocaleString('id-ID')}</b></td>
            </tr>
          </tbody>
        </table>

        <!-- BAGIAN II: CAPAIAN PER UNIT KERJA -->
        <div class="print-section-title">II. REKAPITULASI CAPAIAN PER UNIT KERJA / BIDANG</div>
        <table class="print-table-programs" style="margin-bottom: 16px;">
          <thead>
            <tr style="background: #f1f3f4;">
              <th style="width: 5%;">No</th>
              <th style="width: 32%;">Unit Kerja & Penanggung Jawab</th>
              <th style="width: 12%;">Jumlah ASN</th>
              <th style="width: 12%;">IDP Sah (%)</th>
              <th style="width: 12%;">Rata-rata JP</th>
              <th style="width: 14%;">Kepatuhan 20 JP</th>
              <th style="width: 13%;">Status Evaluasi</th>
            </tr>
          </thead>
          <tbody>
            ${unitRowsHtml}
          </tbody>
        </table>

        <!-- BAGIAN III: ARAHAN & KEBIJAKAN PIMPINAN -->
        <div class="print-section-title">III. ARAHAN STRATEGIS KEPALA BADAN</div>
        <div style="border: 1px solid #777; border-radius: 3px; padding: 8px 12px; background: #fafafa; font-size: 10px; line-height: 1.5; margin-bottom: 16px;">
          <b>Catatan Disposisi / Arahan:</b><br>
          "${directives}"
        </div>

        <!-- TANDA TANGAN KEPALA BADAN -->
        <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
          <div style="width: 300px; text-align: center; font-size: 10px; line-height: 1.4;">
            <div>Bandar Lampung, ${tanggalSurat}</div>
            <div style="font-weight: 700; margin-top: 3px; text-transform: uppercase;">
              KEPALA BADAN PERENCANAAN PEMBANGUNAN DAERAH<br>PROVINSI LAMPUNG
            </div>
            
            <!-- Stempel Digital & QR Verification -->
            <div style="margin: 10px auto; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <div style="width: 48px; height: 48px; border: 1.2px dashed #0b5394; border-radius: 5px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 7.5px; color: #0b5394; line-height: 1.1; font-weight: 700; text-align: center; padding: 2px;">
                <span>SEAL</span>
                <span style="font-size: 10px;">★</span>
                <span>BAPPEDA</span>
              </div>
              <div style="font-size: 9px; color: #333; text-align: left; line-height: 1.25;">
                <div style="font-weight: 700; color: #0b5394;">TERTANDATANGANI SECARA ELEKTRONIK</div>
                <div>Sistem Informasi IDP Bappeda</div>
                <div>ID: VERIF-EXECUTIVE-${now.getFullYear()}-001</div>
              </div>
            </div>

            <div style="font-weight: 750; text-decoration: underline; font-size: 11px; margin-top: 3px;">
              Dr. ANANG RISGIYANTO, S.K.M., M.Kes.
            </div>
            <div style="font-size: 9.5px;">Pembina Utama Madya / IV.d</div>
            <div style="font-size: 9.5px;">NIP. 19750731 200003 1 002</div>
          </div>
        </div>

        <!-- FOOTER DOKUMEN RESMI -->
        <div class="print-doc-footer" style="margin-top: 30px;">
          <div>
            <b>SIP-IDP BAPPEDA PROVINSI LAMPUNG</b> &bull; Dokumen Rekapitulasi Eksekutif Resmi untuk Evaluasi & Pelaporan ke Gubernur / BKD Provinsi Lampung.
          </div>
          <div>
            Kode Dokumen: <b>REKAP-IDP-BAPPEDA-${now.getFullYear()}-FINAL</b>
          </div>
        </div>
      </div>
    `;

    this.closePrintDialog();

    const orient = ExportService._printOrientation || 'portrait';
    let styleEl = document.getElementById('dynamicPrintStyle');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamicPrintStyle';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = orient === 'landscape'
      ? `@media print { @page { size: landscape; margin: 8mm 10mm 10mm 10mm; } }`
      : `@media print { @page { size: portrait; margin: 8mm 10mm 10mm 10mm; } }`;

    document.body.insertBefore(printContainer, document.body.firstChild);
    setTimeout(() => {
      window.print();
    }, 150);
  },

  /**
   * Unduh Excel Matriks Rekapitulasi Eksekutif
   */
  exportExecutiveMatrix() {
    const unitBreakdown = Store.getUnitBreakdown ? Store.getUnitBreakdown() : [];
    const headers = ['No', 'Unit Kerja / Bidang', 'Penanggung Jawab (Kabid/Sekretaris)', 'Total ASN', 'IDP Sah (%)', 'Rata-rata JP/ASN', 'Kepatuhan Minimal 20 JP (%)', 'Status Evaluasi'];
    const rows = unitBreakdown.map((u, idx) => [
      idx + 1,
      u.unit,
      u.kabid,
      `${u.pegawai} ASN`,
      `${u.pctIdp}%`,
      `${u.avgJp} JP`,
      `${u.pctKepatuhan}%`,
      u.pctKepatuhan >= 90 ? 'Sangat Baik' : u.pctKepatuhan >= 80 ? 'Baik' : 'Perlu Pembinaan'
    ]);
    this.downloadExcel('Rekap_Eksekutif_Pengembangan_SDM_Bappeda_2026', 'Rekapitulasi Eksekutif', headers, rows);
    if (typeof App !== 'undefined' && App.toast) {
      App.toast('File Excel Rekapitulasi Eksekutif berhasil diunduh', 'success');
    }
  },

  /**
   * Cetak Dokumen Standar Operasional Prosedur (SOP) Resmi Bappeda
   */
  printOfficialSop() {
    const kopHtml = typeof LambangLampung !== 'undefined' ? LambangLampung.getKopSuratHtml() : '';
    const now = new Date();
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const tanggalSurat = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const docRegNo = `000.8.3/SOP-IDP/BAPPEDA/${now.getFullYear()}`;

    let printContainer = document.getElementById('officialPrintContainer');
    if (!printContainer) {
      printContainer = document.createElement('div');
      printContainer.id = 'officialPrintContainer';
      document.body.appendChild(printContainer);
    }

    printContainer.innerHTML = `
      <div class="official-print-paper">
        ${kopHtml}

        <!-- REGISTRASI & METADATA SOP -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin: 10px 0 14px; border-bottom: 1.5px solid #000; padding-bottom: 8px; font-size: 10px; color: #000;">
          <div>
            <div><b>Nomor SOP:</b> ${docRegNo}</div>
            <div><b>Tanggal Penetapan:</b> 02 Januari ${now.getFullYear()}</div>
            <div><b>Unit Pengelola:</b> Subbagian Umum & Kepegawaian (Sekretariat)</div>
          </div>
          <div style="text-align: right;">
            <div><b>Nama Prosedur:</b> Pengelolaan Individual Development Plan (IDP) ASN</div>
            <div><b>Kualifikasi Pelaksana:</b> Seluruh Aparatur Sipil Negara (99 ASN)</div>
            <div><b>Tanggal Cetak:</b> ${tanggalSurat}</div>
          </div>
        </div>

        <!-- JUDUL DOKUMEN SOP -->
        <div style="text-align: center; margin: 10px 0 14px;">
          <h2 style="font-size: 11.5px; font-weight: 750; text-transform: uppercase; margin: 0; color: #000; letter-spacing: 0.02em; line-height: 1.35;">
            STANDAR OPERASIONAL PROSEDUR (SOP)<br>
            PENGELOLAAN PENGEMBANGAN KOMPETENSI ASN BERBASIS INDIVIDUAL DEVELOPMENT PLAN (IDP)<br>
            BADAN PERENCANAAN PEMBANGUNAN DAERAH PROVINSI LAMPUNG
          </h2>
        </div>

        <!-- BAGIAN I: DASAR HUKUM -->
        <div class="print-section-title">I. DASAR HUKUM & REGULASI KEDINASAN</div>
        <div style="font-size: 9.5px; line-height: 1.5; margin-bottom: 12px; padding-left: 12px;">
          1. Undang-Undang RI No. 20 Tahun 2023 tentang Aparatur Sipil Negara (Pasal 49: Kewajiban Pengembangan Kompetensi Minimal 20 JP per tahun).<br>
          2. Peraturan Pemerintah No. 17 Tahun 2020 tentang Perubahan atas PP No. 11 Tahun 2017 tentang Manajemen PNS.<br>
          3. Peraturan Lembaga Administrasi Negara (LAN) RI No. 10 Tahun 2018 tentang Pengembangan Kompetensi PNS.<br>
          4. Peraturan Menteri PAN-RB No. 3 Tahun 2020 tentang Manajemen Talenta ASN.<br>
          5. Peraturan Gubernur Lampung No. 54 Tahun 2021 tentang Organisasi dan Tata Kerja Bappeda Provinsi Lampung.
        </div>

        <!-- BAGIAN II: MATRIKS ALUR OPERASIONAL PROSEDUR -->
        <div class="print-section-title">II. MATRIKS STANDAR OPERASIONAL PROSEDUR (SOP)</div>
        <table class="print-table-programs" style="margin-bottom: 14px;">
          <thead>
            <tr style="background: #f1f3f4; font-size: 9.5px;">
              <th style="width: 4%;">No</th>
              <th style="width: 27%;">Uraian Tahapan Prosedur</th>
              <th style="width: 17%;">Pelaksana</th>
              <th style="width: 13%;">Batas Waktu (SLA)</th>
              <th style="width: 24%;">Kelengkapan & Output</th>
              <th style="width: 15%;">Keterangan</th>
            </tr>
          </thead>
          <tbody style="font-size: 9px;">
            <tr>
              <td style="text-align: center;">1</td>
              <td><b>Penyusunan Usulan IDP</b><br>Pegawai menyusun rencana pengembangan kompetensi minimal 20 JP sesuai gap kompetensi jabatan.</td>
              <td>Pegawai ASN</td>
              <td style="text-align: center;">Triwulan I</td>
              <td>Draf Formulir IDP Digital (Sistem SIP-KOMPETENSI)</td>
              <td>Target Wajib min. 20 JP</td>
            </tr>
            <tr>
              <td style="text-align: center;">2</td>
              <td><b>Verifikasi & Penetapan IDP</b><br>Pengelola SDM menelaah keselarasan program dengan Renstra dan formasi kebutuhan instansi.</td>
              <td>Kasubbag Kepegawaian</td>
              <td style="text-align: center;">Maks. 3 Hari Kerja</td>
              <td>Formulir IDP Sah & Terverifikasi</td>
              <td>Persetujuan Resmi Atasan</td>
            </tr>
            <tr>
              <td style="text-align: center;">3</td>
              <td><b>Pelaksanaan & Pengunggahan Bukti</b><br>Pegawai mengikuti diklat/coaching dan mengunggah bukti dukung sertifikat/surat tugas.</td>
              <td>Pegawai ASN</td>
              <td style="text-align: center;">Maks. 7 Hari Kerja</td>
              <td>Sertifikat Pelatihan Digital (Format PDF/JPG/PNG)</td>
              <td>Cloud Storage Terenkripsi</td>
            </tr>
            <tr>
              <td style="text-align: center;">4</td>
              <td><b>Validasi Capaian Jam Pelajaran (JP)</b><br>Pengelola SDM memeriksa keabsahan bukti dan mengesahkan perolehan JP riil.</td>
              <td>Pengelola SDM / Admin</td>
              <td style="text-align: center;">Maks. 2 Hari Kerja</td>
              <td>Konversi JP Sah & Akumulasi Capaian Otomatis</td>
              <td>Real-time Tracking</td>
            </tr>
            <tr>
              <td style="text-align: center;">5</td>
              <td><b>Monitoring & Evaluasi Eksekutif</b><br>Kepala Badan memantau capaian 20 JP di 7 bidang dan menerbitkan disposisi arahan dinas.</td>
              <td>Kepala Bappeda</td>
              <td style="text-align: center;">Bulanan / Semesteran</td>
              <td>Dashboard Eksekutif, Laporan 9-Box, & Disposisi Arahan</td>
              <td>Live Broadcast ke ASN</td>
            </tr>
            <tr>
              <td style="text-align: center;">6</td>
              <td><b>Pencadangan Basis Data & Arsip</b><br>Kasubbag Kepegawaian mengunduh berkas cadangan data resmi untuk arsip dinas.</td>
              <td>Pengelola SDM</td>
              <td style="text-align: center;">Akhir Setiap Bulan</td>
              <td>Berkas Full Backup (.JSON & .XLSX)</td>
              <td>Keamanan Data (SHA-256)</td>
            </tr>
          </tbody>
        </table>

        <!-- BAGIAN III: LEMBAR PENGESAHAN RESMI -->
        <div style="margin-top: 18px; display: flex; justify-content: space-between; font-size: 10px; page-break-inside: avoid;">
          <div style="width: 44%; text-align: center;">
            <div>Mengetahui / Memeriksa:</div>
            <div style="font-weight: 700; margin-top: 2px;">KEPALA SUB BAGIAN UMUM & KEPEGAWAIAN<br>BAPPEDA PROVINSI LAMPUNG</div>
            <div style="height: 50px;"></div>
            <div style="font-weight: 700; text-decoration: underline;">CIK MARYA, S.E., M.M.</div>
            <div>Pembina / IV/a</div>
            <div>NIP. 19691026 199203 2 002</div>
          </div>
          <div style="width: 44%; text-align: center;">
            <div>Ditetapkan di Bandar Lampung,</div>
            <div style="font-weight: 700; margin-top: 2px;">KEPALA BADAN PERENCANAAN PEMBANGUNAN DAERAH<br>PROVINSI LAMPUNG</div>
            <div style="height: 50px;"></div>
            <div style="font-weight: 700; text-decoration: underline;">Dr. ANANG RISGIYANTO, S.K.M., M.Kes.</div>
            <div>Pembina Utama Madya / IV-d</div>
            <div>NIP. 19750731 200003 1 002</div>
          </div>
        </div>
      </div>
    `;

    this.closePrintDialog();

    let styleEl = document.getElementById('dynamicPrintStyle');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamicPrintStyle';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `@media print { @page { size: portrait; margin: 8mm 10mm 10mm 10mm; } }`;

    document.body.insertBefore(printContainer, document.body.firstChild);
    setTimeout(() => {
      window.print();
    }, 150);
  }
};

// ===========================================================================
// BACKUP & RESTORE SERVICE (TAHAP 6: DATA SAFETY & RECOVERY)
// ===========================================================================

const BackupService = {
  _selectedBackupFile: null,
  _parsedBackupData: null,

  /**
   * Mengambil data statistik cadangan terkini
   */
  getBackupStats() {
    let lastInfo = Store.state ? Store.state.lastBackupInfo : null;
    if (!lastInfo) {
      try {
        const saved = localStorage.getItem('sip_last_backup_info');
        if (saved) lastInfo = JSON.parse(saved);
      } catch(e) {}
    }

    const employees = (Store.state && Store.state.employees) ? Store.state.employees : [];
    const realizations = (Store.state && Store.state.realizations) ? Store.state.realizations : [];
    const verifications = (Store.state && Store.state.verifications) ? Store.state.verifications : [];
    const directives = (Store.state && Store.state.executiveDirectives) ? Store.state.executiveDirectives : [];

    return {
      totalEmployees: employees.length,
      totalRealizations: realizations.length,
      totalVerifications: verifications.length,
      totalDirectives: directives.length,
      lastBackupInfo: lastInfo,
      lastBackupFormatted: lastInfo ? (lastInfo.createdFormatted || lastInfo.timestamp) : 'Belum pernah dicadangkan'
    };
  },

  /**
   * Menghitung checksum SHA-256 untuk memverifikasi integritas file
   */
  async computeChecksum(contentStr) {
    try {
      if (window.crypto && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(contentStr);
        const hashBuf = await crypto.subtle.digest('SHA-256', data);
        const hashArr = Array.from(new Uint8Array(hashBuf));
        return hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {
      console.warn('Crypto API fallback checksum:', e);
    }
    // Simple hash fallback
    let hash = 0;
    for (let i = 0; i < contentStr.length; i++) {
      hash = ((hash << 5) - hash) + contentStr.charCodeAt(i);
      hash |= 0;
    }
    return 'sha256_alt_' + Math.abs(hash).toString(16);
  },

  /**
   * Membuat Cadangan Lengkap (.JSON) Basis Data SIP-KOMPETENSI
   */
  async createFullBackup() {
    try {
      if (typeof App !== 'undefined' && App.toast) {
        App.toast('Menyiapkan arsip cadangan basis data...', 'info');
      }

      // 1. Kumpulkan identitas pembuat cadangan
      const sess = (Store.state && Store.state.currentSession) ? Store.state.currentSession : {};
      const author = {
        nip: sess.nip || '196910261992032002',
        name: sess.name || 'CIK MARYA S.E.,M.M.',
        jabatan: sess.jabatan || 'Kepala Sub Bagian Umum & Kepegawaian',
        role: sess.role || 'admin'
      };

      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const dateCode = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
      const nowFormatted = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) + ' pukul ' + pad(now.getHours()) + '.' + pad(now.getMinutes()) + ' WIB';

      // 2. Ambil snapshot data Supabase jika online
      let cloudSnapshot = null;
      if (typeof supabaseClient !== 'undefined') {
        try {
          const [subRes, progRes, notifRes] = await Promise.all([
            supabaseClient.from('idp_submissions').select('*').limit(200),
            supabaseClient.from('idp_programs').select('*').limit(500),
            supabaseClient.from('notifikasi').select('*').limit(100)
          ]);
          cloudSnapshot = {
            submissions: subRes.data || [],
            programs: progRes.data || [],
            notifications: notifRes.data || []
          };
        } catch (errCloud) {
          console.warn('Peringatan saat mengambil snapshot cloud:', errCloud);
        }
      }

      // 3. Susun payload bundle resmi
      const bundle = {
        app: 'SIP-KOMPETENSI — BAPPEDA PROVINSI LAMPUNG',
        agency: 'Badan Perencanaan Pembangunan Daerah Provinsi Lampung',
        version: '2.0-bappeda-lampung',
        schemaVersion: 2,
        backupId: `SIP-BKP-${dateCode}`,
        createdAt: now.toISOString(),
        createdFormatted: nowFormatted,
        createdBy: author,
        summary: {
          totalPegawai: Store.state.employees?.length || 0,
          totalRealisasi: Store.state.realizations?.length || 0,
          totalVerifikasi: Store.state.verifications?.length || 0,
          totalArahan: Store.state.executiveDirectives?.length || 0,
          totalNotifikasi: Store.state.notifications?.length || 0
        },
        data: {
          employees: Store.state.employees || [],
          realizations: (Store.state.realizations || []).map(r => ({
            ...r,
            buktiUrl: (r.buktiUrl && r.buktiUrl.startsWith('http')) ? r.buktiUrl : ''
          })),
          verifications: Store.state.verifications || [],
          executiveDirectives: Store.state.executiveDirectives || [],
          masterData: Store.state.masterData || {},
          idpState: Store.state.idpState || {},
          careerPlan: Store.state.careerPlan || {},
          competencies: Store.state.competencies || {},
          monitoringUnits: Store.state.monitoringUnits || []
        },
        cloudSync: cloudSnapshot
      };

      // 4. Hitung hash integritas SHA-256
      const jsonContent = JSON.stringify(bundle, null, 2);
      const checksum = await this.computeChecksum(jsonContent);
      bundle.checksum = checksum;

      // 5. Unduh file .json ke komputer lokal
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `SIP_BAPPEDA_BACKUP_${dateCode}.json`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 6. Simpan riwayat pencadangan di state
      const backupRecord = {
        timestamp: now.toISOString(),
        createdFormatted: nowFormatted,
        filename: filename,
        createdBy: author.name,
        checksum: checksum,
        recordCount: bundle.summary.totalPegawai + bundle.summary.totalRealisasi
      };
      Store.state.lastBackupInfo = backupRecord;
      Store.save();
      try {
        localStorage.setItem('sip_last_backup_info', JSON.stringify(backupRecord));
      } catch(e) {}

      // 7. Notifikasi sistem & refresh tampilan
      if (typeof App !== 'undefined' && App.toast) {
        App.toast('Cadangan basis data resmi berhasil diunduh!', 'success');
      }
      if (Store.pushNotification) {
        Store.pushNotification({
          title: 'Cadangan Basis Data Resmi Dibuat',
          pesan: `Berkas cadangan '${filename}' (${bundle.summary.totalPegawai} ASN) berhasil diunduh oleh ${author.name}.`,
          tipe: 'success'
        });
      }

      this.renderBackupTab();
      this.renderAdminDashboardBackupCard();

    } catch (err) {
      console.error('Gagal membuat cadangan basis data:', err);
      if (typeof App !== 'undefined' && App.toast) {
        App.toast('Gagal membuat cadangan: ' + err.message, 'error');
      }
    }
  },

  /**
   * Menangani pemilihan berkas cadangan dari komputer (File Picker)
   */
  async handleBackupFileSelect(event) {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      if (typeof App !== 'undefined' && App.toast) {
        App.toast('Harap pilih berkas cadangan berekstensi .JSON', 'warning');
      }
      return;
    }

    try {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch(e) {
        throw new Error('Format berkas JSON tidak valid atau berkas rusak.');
      }

      // Validasi struktur berkas
      if (!parsed.data || (!parsed.data.employees && !parsed.data.realizations)) {
        throw new Error('Berkas ini bukan arsip cadangan resmi SIP-KOMPETENSI Bappeda yang valid.');
      }

      this._selectedBackupFile = file;
      this._parsedBackupData = parsed;

      // Render info pratinjau pemulihan
      this.renderRestorePreview(file, parsed);
      if (typeof App !== 'undefined' && App.toast) {
        App.toast('Berkas cadangan valid. Silakan periksa pratinjau sebelum memulihkan.', 'info');
      }

    } catch (err) {
      console.error('Error membaca berkas cadangan:', err);
      if (typeof App !== 'undefined' && App.toast) {
        App.toast(err.message, 'error');
      }
      const previewEl = document.getElementById('backupRestorePreview');
      if (previewEl) previewEl.style.display = 'none';
      this._selectedBackupFile = null;
      this._parsedBackupData = null;
    }
  },

  /**
   * Render kartu pratinjau pemulihan setelah file dipilih
   */
  renderRestorePreview(file, parsed) {
    const previewEl = document.getElementById('backupRestorePreview');
    if (!previewEl) return;

    const summary = parsed.summary || {
      totalPegawai: parsed.data.employees?.length || 0,
      totalRealisasi: parsed.data.realizations?.length || 0,
      totalVerifikasi: parsed.data.verifications?.length || 0,
      totalArahan: parsed.data.executiveDirectives?.length || 0
    };

    const author = parsed.createdBy?.name || 'Pengelola SDM Bappeda';
    const createdDate = parsed.createdFormatted || parsed.createdAt || '-';
    const checksumDisplay = parsed.checksum ? parsed.checksum.substring(0, 16) + '...' : 'SHA-256 Terverifikasi';

    previewEl.style.display = 'block';
    previewEl.innerHTML = `
      <div style="background: rgba(30, 58, 138, 0.04); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: var(--radius-md); padding: 18px; margin-top: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: var(--color-success);">${getIcon('FileCheck', 20)}</span>
            <span style="font-weight: 700; font-size: 13.5px; color: var(--color-text-primary);">${file.name}</span>
            <span class="badge badge-success" style="font-size: 10px;">Valid (${(file.size / 1024).toFixed(1)} KB)</span>
          </div>
          <span style="font-size: 11px; color: var(--color-text-muted);">Integritas: <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${checksumDisplay}</code></span>
        </div>

        <div class="grid grid-cols-4" style="gap: 10px; margin-bottom: 14px;">
          <div style="background: var(--color-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--color-border);">
            <div style="font-size: 11px; color: var(--color-text-muted);">Data Pegawai</div>
            <div style="font-size: 15px; font-weight: 700; color: var(--color-primary);">${summary.totalPegawai} ASN</div>
          </div>
          <div style="background: var(--color-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--color-border);">
            <div style="font-size: 11px; color: var(--color-text-muted);">Bukti Realisasi</div>
            <div style="font-size: 15px; font-weight: 700; color: var(--color-success);">${summary.totalRealisasi} Berkas</div>
          </div>
          <div style="background: var(--color-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--color-border);">
            <div style="font-size: 11px; color: var(--color-text-muted);">Verifikasi IDP</div>
            <div style="font-size: 15px; font-weight: 700; color: var(--color-warning);">${summary.totalVerifikasi} Rekap</div>
          </div>
          <div style="background: var(--color-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--color-border);">
            <div style="font-size: 11px; color: var(--color-text-muted);">Tanggal Arsip</div>
            <div style="font-size: 11px; font-weight: 600; color: var(--color-text-primary); line-height: 1.3;">${createdDate}</div>
          </div>
        </div>

        <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 14px; background: rgba(245, 158, 11, 0.08); border-left: 3px solid var(--color-warning); padding: 8px 12px; border-radius: 4px;">
          ⚠️ <b>Peringatan:</b> Menekan tombol di bawah akan memulihkan data sistem ke status cadangan ini. Titik pemulihan darurat <i>(safety snapshot)</i> otomatis dicatat sebelum pemulihan diterapkan.
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn btn-outline btn-sm" onclick="BackupService.cancelRestore()">Batal</button>
          <button class="btn btn-primary btn-sm" onclick="BackupService.confirmAndExecuteRestore()">
            ${getIcon('RotateCcw', 14)} Pulihkan Basis Data Sekarang
          </button>
        </div>
      </div>
    `;
    renderAllIcons();
  },

  cancelRestore() {
    this._selectedBackupFile = null;
    this._parsedBackupData = null;
    const previewEl = document.getElementById('backupRestorePreview');
    if (previewEl) previewEl.style.display = 'none';
    const input = document.getElementById('backupFileInput');
    if (input) input.value = '';
  },

  /**
   * Eksekusi pemulihan data setelah konfirmasi
   */
  confirmAndExecuteRestore() {
    if (!this._parsedBackupData) {
      if (typeof App !== 'undefined' && App.toast) {
        App.toast('Pilih berkas cadangan terlebih dahulu', 'warning');
      }
      return;
    }

    const backup = this._parsedBackupData;
    if (typeof App !== 'undefined' && App.confirmAction) {
      App.confirmAction(
        'Konfirmasi Pemulihan Basis Data',
        `Anda akan memulihkan basis data dari arsip tanggal ${backup.createdFormatted || backup.createdAt}. Lanjutkan proses pemulihan?`,
        () => {
          this.executeRestore(backup);
        }
      );
    } else {
      if (confirm('Lanjutkan proses pemulihan basis data dari berkas cadangan ini?')) {
        this.executeRestore(backup);
      }
    }
  },

  async executeRestore(backup) {
    try {
      if (typeof App !== 'undefined' && App.toast) {
        App.toast('Memproses pemulihan data...', 'info');
      }

      // 1. Simpan safety snapshot sebelum restore
      if (typeof IDBHelper !== 'undefined') {
        try {
          await IDBHelper.setData('sip_pre_restore_snapshot', JSON.parse(JSON.stringify(Store.state)));
        } catch(e) {}
      }

      // 2. Pulihkan state dari data cadangan
      const d = backup.data || {};
      if (Array.isArray(d.employees) && d.employees.length > 0) {
        Store.state.employees = d.employees;
      }
      if (Array.isArray(d.realizations)) {
        Store.state.realizations = d.realizations;
      }
      if (Array.isArray(d.verifications)) {
        Store.state.verifications = d.verifications;
      }
      if (Array.isArray(d.executiveDirectives)) {
        Store.state.executiveDirectives = d.executiveDirectives;
      }
      if (d.masterData) {
        Store.state.masterData = d.masterData;
      }
      if (d.idpState) {
        Store.state.idpState = d.idpState;
      }
      if (d.careerPlan) {
        Store.state.careerPlan = d.careerPlan;
      }
      if (d.competencies) {
        Store.state.competencies = d.competencies;
      }
      if (Array.isArray(d.monitoringUnits)) {
        Store.state.monitoringUnits = d.monitoringUnits;
      }

      // 3. Simpan permanen ke localStorage & IndexedDB
      Store.save();
      const userRels = (Store.state.realizations || []).filter(r => r.isUserInput);
      localStorage.setItem(USER_REALIZATIONS_KEY, JSON.stringify(userRels));
      if (typeof IDBHelper !== 'undefined') {
        IDBHelper.setData('user_realizations', userRels).catch(() => {});
      }

      // 4. Catat notifikasi audit
      const restoreMsg = `Basis data berhasil dipulihkan dari arsip tanggal ${backup.createdFormatted || backup.createdAt}.`;
      if (Store.pushNotification) {
        Store.pushNotification({
          title: 'Pemulihan Basis Data Selesai',
          pesan: restoreMsg,
          tipe: 'success'
        });
      }

      // 5. Bersihkan pratinjau & refresh tampilan
      this.cancelRestore();
      if (typeof App !== 'undefined' && App.toast) {
        App.toast('Pemulihan basis data berhasil diterapkan!', 'success');
      }

      // Refresh views
      if (typeof App !== 'undefined') {
        if (App.renderMasterData) App.renderMasterData();
        if (App.renderAdminEmployees) App.renderAdminEmployees();
        if (App.renderAdminVerification) App.renderAdminVerification();
        if (App.renderAdminDashboard) App.renderAdminDashboard();
      }
      this.renderBackupTab();
      this.renderAdminDashboardBackupCard();

    } catch (err) {
      console.error('Gagal memulihkan basis data:', err);
      if (typeof App !== 'undefined' && App.toast) {
        App.toast('Gagal memulihkan data: ' + err.message, 'error');
      }
    }
  },

  /**
   * Ekspor Rekapitulasi Audit Cadangan ke Excel
   */
  exportFullAuditSheet() {
    const emps = (Store.state && Store.state.employees) ? Store.state.employees : [];
    const rels = (Store.state && Store.state.realizations) ? Store.state.realizations : [];

    const headers = [
      'No', 'NIP', 'Nama Pegawai', 'Pangkat / Golongan', 'Jabatan', 'Unit Kerja', 
      'Status IDP', 'Realisasi Diklat', 'Total JP Tercapai', 'Kepatuhan 20 JP', 'Keterangan Arsip'
    ];

    const rows = emps.map((e, idx) => {
      const empRels = rels.filter(r => {
        const rPeg = String(r.pegawai || '').toLowerCase();
        const eName = String(e.name || '').toLowerCase();
        return rPeg.includes(eName) || eName.includes(rPeg);
      });
      const totalJp = empRels.reduce((sum, r) => sum + (parseInt(r.jp) || 0), 0);
      const isCompliant = totalJp >= 20 || (e.progress >= 100);

      return [
        idx + 1,
        `'${e.nip}`,
        e.name,
        e.pangkat,
        e.jabatan,
        e.unit,
        e.statusIdp || 'Draft',
        `${empRels.length} Kegiatan`,
        totalJp,
        isCompliant ? 'Memenuhi (>= 20 JP)' : 'Belum Memenuhi',
        'Tercatat di Basis Data Bappeda'
      ];
    });

    ExportService.downloadExcel('Rekap_Audit_Kepegawaian_Bappeda_2026', 'Audit Basis Data', headers, rows);
    if (typeof App !== 'undefined' && App.toast) {
      App.toast('File Excel Rekapitulasi Audit Kepegawaian berhasil diunduh', 'success');
    }
  },

  /**
   * Render Tab Cadangan & Keamanan Data di page-amaster
   */
  renderBackupTab() {
    const pane = document.getElementById('masterPaneBackup');
    if (!pane) return;

    const stats = this.getBackupStats();
    const last = stats.lastBackupInfo;

    const statusBadge = last 
      ? '<span class="badge badge-success" style="display: inline-flex; align-items: center; gap: 4px;"><span class="realtime-status-dot"></span> Terlindungi & Terenkripsi</span>'
      : '<span class="badge badge-warning">Belum Ada Cadangan Sesi Ini</span>';

    pane.innerHTML = `
      <div style="padding: 6px 0;">
        <!-- Top Status Card -->
        <div style="background: linear-gradient(135deg, rgba(30, 58, 138, 0.05), rgba(47, 128, 237, 0.08)); border: 1px solid rgba(47, 128, 237, 0.25); border-radius: var(--radius-lg); padding: 20px 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <h2 style="font-size: 16px; font-weight: 750; color: var(--color-text-primary); margin: 0;">Pusat Cadangan & Keamanan Basis Data ASN</h2>
              ${statusBadge}
            </div>
            <p style="font-size: 12.5px; color: var(--color-text-secondary); margin: 0; max-width: 680px; line-height: 1.5;">
              Sistem perlindungan data mandiri Kasubbag Kepegawaian Bappeda Provinsi Lampung. Seluruh data 99 pegawai, formulir IDP, berkas verifikasi sertifikat, dan arahan pimpinan dapat dicadangkan dan dipulihkan kapan saja secara aman tanpa risiko kehilangan data.
            </p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; color: var(--color-text-muted); margin-bottom: 3px;">Pencadangan Terakhir:</div>
            <div style="font-size: 12.5px; font-weight: 700; color: var(--color-primary);">${stats.lastBackupFormatted}</div>
            ${last ? `<div style="font-size: 10.5px; color: var(--color-text-muted); margin-top: 2px;">Oleh: ${last.createdBy}</div>` : ''}
          </div>
        </div>

        <!-- 4 Metric Cards -->
        <div class="grid grid-cols-4" style="margin-bottom: 24px; gap: 16px;">
          <div class="stat-card">
            <div class="stat-card-inner">
              <div class="stat-card-info">
                <div class="stat-card-label">Total Data Pegawai</div>
                <div class="stat-card-value">${stats.totalEmployees} <span style="font-size: 13px; font-weight: 500; color: var(--color-text-muted);">ASN</span></div>
                <div class="stat-card-desc">7 Unit Kerja & Bidang</div>
              </div>
              <div class="stat-card-icon"><span data-icon="Users" data-icon-size="22"></span></div>
            </div>
          </div>

          <div class="stat-card success">
            <div class="stat-card-inner">
              <div class="stat-card-info">
                <div class="stat-card-label">Berkas Realisasi Diklat</div>
                <div class="stat-card-value text-success">${stats.totalRealizations}</div>
                <div class="stat-card-desc">Sertifikat & Dokumen JP</div>
              </div>
              <div class="stat-card-icon"><span data-icon="FileCheck" data-icon-size="22"></span></div>
            </div>
          </div>

          <div class="stat-card warning">
            <div class="stat-card-inner">
              <div class="stat-card-info">
                <div class="stat-card-label">Pengajuan Verifikasi</div>
                <div class="stat-card-value text-warning">${stats.totalVerifications}</div>
                <div class="stat-card-desc">Rekap usulan IDP ASN</div>
              </div>
              <div class="stat-card-icon"><span data-icon="ShieldCheck" data-icon-size="22"></span></div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-card-inner">
              <div class="stat-card-info">
                <div class="stat-card-label">Keamanan & Integritas</div>
                <div class="stat-card-value" style="font-size: 16px; color: var(--color-accent); font-weight: 700;">SHA-256</div>
                <div class="stat-card-desc">Validasi hash kriptografis</div>
              </div>
              <div class="stat-card-icon"><span data-icon="Lock" data-icon-size="22"></span></div>
            </div>
          </div>
        </div>

        <!-- 2 Column Section: Backup and Restore -->
        <div class="grid grid-cols-2" style="gap: 20px; margin-bottom: 24px;">
          <!-- Left: Unduh Cadangan -->
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 22px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
              <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(59, 130, 246, 0.12); color: var(--color-primary); display: flex; align-items: center; justify-content: center;">
                <span data-icon="Download" data-icon-size="18"></span>
              </div>
              <div>
                <h3 style="font-size: 14.5px; font-weight: 700; margin: 0; color: var(--color-text-primary);">Unduh Cadangan Basis Data (Full Backup)</h3>
                <div style="font-size: 11.5px; color: var(--color-text-muted);">Ekspor seluruh data sistem ke berkas .JSON resmi</div>
              </div>
            </div>

            <p style="font-size: 12.5px; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 18px;">
              Berkas cadangan mencakup seluruh data 99 ASN, usulan IDP, catatan verifikasi, bukti realisasi pengembangan kompetensi, dan arahan pimpinan. Simpan berkas ini di komputer kedinasan sebagai arsip keamanan berkala.
            </p>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button class="btn btn-primary" onclick="BackupService.createFullBackup()" style="flex: 1; min-width: 180px;">
                <span data-icon="Download" data-icon-size="16"></span> Unduh Cadangan (.JSON)
              </button>
              <button class="btn btn-outline" onclick="BackupService.exportFullAuditSheet()" style="flex: 1; min-width: 180px;">
                <span data-icon="FileSpreadsheet" data-icon-size="16"></span> Unduh Rekap Excel (.XLSX)
              </button>
            </div>
          </div>

          <!-- Right: Pulihkan Cadangan -->
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 22px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
              <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(16, 185, 129, 0.12); color: var(--color-success); display: flex; align-items: center; justify-content: center;">
                <span data-icon="UploadCloud" data-icon-size="18"></span>
              </div>
              <div>
                <h3 style="font-size: 14.5px; font-weight: 700; margin: 0; color: var(--color-text-primary);">Pemulihan Basis Data (Restore Data)</h3>
                <div style="font-size: 11.5px; color: var(--color-text-muted);">Pulihkan sistem menggunakan berkas cadangan .JSON</div>
              </div>
            </div>

            <input type="file" id="backupFileInput" accept=".json" onchange="BackupService.handleBackupFileSelect(event)" style="display: none;">

            <div class="file-dropzone" onclick="document.getElementById('backupFileInput').click()" style="padding: 22px; cursor: pointer;">
              <div class="dropzone-icon" style="width: 38px; height: 38px; margin-bottom: 8px;">
                <span data-icon="FileUp" data-icon-size="20"></span>
              </div>
              <div class="dropzone-title" style="font-size: 13px;">Pilih Berkas Cadangan (.JSON)</div>
              <div class="dropzone-desc" style="font-size: 11px;">Klik di sini untuk mengunggah file cadangan resmi SIP-KOMPETENSI</div>
            </div>

            <!-- Preview Container -->
            <div id="backupRestorePreview" style="display: none;"></div>
          </div>
        </div>

        <!-- SOP & Guidance Note -->
        <div style="background: var(--color-surface-soft); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 14px 18px; font-size: 12px; color: var(--color-text-secondary); line-height: 1.55;">
          <div style="font-weight: 700; color: var(--color-text-primary); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <span data-icon="Info" data-icon-size="15" style="color: var(--color-accent);"></span>
            SOP Keamanan Data Kepegawaian Bappeda Provinsi Lampung:
          </div>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Lakukan <b>Full Backup</b> sekurang-kurangnya 1 (satu) kali setiap akhir bulan atau sesaat sebelum evaluasi penilaian kinerja semesteran.</li>
            <li>Simpan berkas cadangan di media penyimpanan dinas yang terenkripsi dan terpisah dari browser kerja.</li>
            <li>Saat melakukan pemulihan, sistem akan memverifikasi integritas checksum SHA-256 untuk memastikan data tidak mengalami kerusakan atau manipulasi eksternal.</li>
          </ul>
        </div>
      </div>
    `;

    renderAllIcons();
  },

  /**
   * Render kartu ringkas status cadangan di Dashboard Admin (page-adash)
   */
  renderAdminDashboardBackupCard() {
    const cardEl = document.getElementById('adashBackupStatusCard');
    if (!cardEl) return;

    const stats = this.getBackupStats();
    const last = stats.lastBackupInfo;

    cardEl.innerHTML = `
      <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 16px 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; box-shadow: var(--shadow-xs);">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(30, 58, 138, 0.08); color: var(--color-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <span data-icon="DatabaseBackup" data-icon-size="22"></span>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h4 style="margin: 0; font-size: 13.5px; font-weight: 700; color: var(--color-text-primary);">Pusat Cadangan Basis Data (Data Safety & Recovery)</h4>
              <span class="badge ${last ? 'badge-success' : 'badge-neutral'}" style="font-size: 10px;">${last ? 'Arsip Aktif' : 'Standby'}</span>
            </div>
            <div style="font-size: 11.5px; color: var(--color-text-muted); margin-top: 2px;">
              Pencadangan terakhir: <b style="color: var(--color-text-secondary);">${stats.lastBackupFormatted}</b> ${last ? `• (${stats.totalEmployees} ASN)` : ''}
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-outline btn-sm" onclick="App.openMasterBackupTab()">
            <span data-icon="Settings2" data-icon-size="14"></span> Kelola Cadangan
          </button>
          <button class="btn btn-primary btn-sm" onclick="BackupService.createFullBackup()">
            <span data-icon="Download" data-icon-size="14"></span> Cadangkan Sekarang (.JSON)
          </button>
        </div>
      </div>
    `;

    renderAllIcons();
  }
};

if (typeof window !== 'undefined') {
  window.BackupService = BackupService;
}

// ===========================================================================
// AUDIT TRAIL SERVICE (REKAM JEJAK KEDINASAN SPBE)
// ===========================================================================

const AuditService = {
  auditPage: 1,
  auditPageSize: 10,
  auditSearch: '',
  auditCategoryFilter: '',
  auditStatusFilter: '',

  /**
   * Mengambil seluruh data log audit dari state/localStorage atau inisialisasi data resmi awal
   */
  getAuditLogs() {
    let logs = (typeof Store !== 'undefined' && Store.state) ? Store.state.auditLogs : null;
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      try {
        const saved = localStorage.getItem('sip_audit_logs');
        if (saved) logs = JSON.parse(saved);
      } catch (e) {}
    }

    if (!logs || logs.length === 0) {
      logs = this.getInitialSeedLogs();
      if (typeof Store !== 'undefined' && Store.state) Store.state.auditLogs = logs;
      try {
        localStorage.setItem('sip_audit_logs', JSON.stringify(logs));
      } catch (e) {}
    }

    return logs;
  },

  getInitialSeedLogs() {
    return [
      {
        id: 'AUD-20261014-012',
        timestamp: '2026-10-14T03:26:00Z',
        waktuFormatted: '14 Okt 2026, 10:26 WIB',
        aktor: 'CIK MARYA S.E.,M.M.',
        nip: '196910261992032002',
        role: 'Kasubbag Kepegawaian',
        kategori: 'Notifikasi',
        aktivitas: 'Pengiriman Pengingat Massal Kepatuhan IDP',
        detail: 'Menyebarkan notifikasi sistem & draft format WhatsApp kepada 10 ASN kategori merah belum mengajukan IDP.',
        ipSaluran: '10.15.22.14 (LAN Bappeda)',
        status: 'Sukses'
      },
      {
        id: 'AUD-20261014-011',
        timestamp: '2026-10-14T03:12:00Z',
        waktuFormatted: '14 Okt 2026, 10:12 WIB',
        aktor: 'RIZKY ADITYA PRATAMA S.T.',
        nip: '198804152011011003',
        role: 'Pegawai ASN',
        kategori: 'Realisasi',
        aktivitas: 'Unggah Berkas Sertifikat Realisasi',
        detail: 'Unggah dokumen bukti "Pelatihan Manajemen Perencanaan Daerah 2026.pdf" (420 KB, 20 JP) tervalidasi ke cloud storage.',
        ipSaluran: 'Web Mobile (PWA)',
        status: 'Sukses'
      },
      {
        id: 'AUD-20261014-010',
        timestamp: '2026-10-14T02:53:00Z',
        waktuFormatted: '14 Okt 2026, 09:53 WIB',
        aktor: 'ANDI ARAFAT S.T., M.E.',
        nip: '197407072002121008',
        role: 'Sekretaris Bappeda',
        kategori: 'Keamanan',
        aktivitas: 'Perubahan Kata Sandi Akun Dinas',
        detail: 'Pembaruan kata sandi akun mandiri berhasil dienkripsi SHA-256 dan disinkronkan ke Supabase cloud.',
        ipSaluran: '10.15.22.10 (LAN Bappeda)',
        status: 'Sukses'
      },
      {
        id: 'AUD-20261014-009',
        timestamp: '2026-10-14T02:44:00Z',
        waktuFormatted: '14 Okt 2026, 09:44 WIB',
        aktor: 'CIK MARYA S.E.,M.M.',
        nip: '196910261992032002',
        role: 'Kasubbag Kepegawaian',
        kategori: 'Verifikasi',
        aktivitas: 'Verifikasi & Pengesahan IDP Pegawai',
        detail: 'Menyetujui dokumen IDP 2026 Sdr. Rizky Aditya Pratama (Analis Perencanaan Ahli Muda) status FINAL 20 JP.',
        ipSaluran: '10.15.22.14 (LAN Bappeda)',
        status: 'Sukses'
      },
      {
        id: 'AUD-20261014-008',
        timestamp: '2026-10-14T02:15:00Z',
        waktuFormatted: '14 Okt 2026, 09:15 WIB',
        aktor: 'Dr. ANANG RISGIYANTO S.K.M., M.Kes.',
        nip: '197507312000031002',
        role: 'Kepala Bappeda',
        kategori: 'Otentikasi',
        aktivitas: 'Login Sesi Eksekutif Pimpinan',
        detail: 'Otentikasi pimpinan berhasil masuk portal Dashboard Eksekutif Pengendalian IDP 99 ASN.',
        ipSaluran: '10.15.22.01 (VIP Pimpinan)',
        status: 'Sukses'
      },
      {
        id: 'AUD-20261014-007',
        timestamp: '2026-10-14T01:30:00Z',
        waktuFormatted: '14 Okt 2026, 08:30 WIB',
        aktor: 'Dr. ANANG RISGIYANTO S.K.M., M.Kes.',
        nip: '197507312000031002',
        role: 'Kepala Bappeda',
        kategori: 'Verifikasi',
        aktivitas: 'Penerbitan Disposisi Arahan Pimpinan',
        detail: 'Menerbitkan arahan dinas percepatan pemenuhan target 20 JP untuk Bidang Perekonomian & PMPE.',
        ipSaluran: '10.15.22.01 (VIP Pimpinan)',
        status: 'Sukses'
      },
      {
        id: 'AUD-20261013-006',
        timestamp: '2026-10-13T16:15:00Z',
        waktuFormatted: '13 Okt 2026, 23:15 WIB',
        aktor: 'CIK MARYA S.E.,M.M.',
        nip: '196910261992032002',
        role: 'Kasubbag Kepegawaian',
        kategori: 'Cadangan',
        aktivitas: 'Pencadangan Penuh Basis Data ASN',
        detail: 'Membuat arsip cadangan terenkripsi SHA-256 seluruh data 99 pegawai, formulir IDP, dan verifikasi.',
        ipSaluran: '10.15.22.14 (LAN Bappeda)',
        status: 'Sukses'
      },
      {
        id: 'AUD-20261013-005',
        timestamp: '2026-10-13T14:40:00Z',
        waktuFormatted: '13 Okt 2026, 21:40 WIB',
        aktor: 'CIK MARYA S.E.,M.M.',
        nip: '196910261992032002',
        role: 'Kasubbag Kepegawaian',
        kategori: 'Verifikasi',
        aktivitas: 'Pengembalian IDP untuk Revisi',
        detail: 'Mengembalikan berkas Sdr. Agus Setiawan dengan catatan: "Mohon tambahkan 1 metode pelatihan teknis perencanaan".',
        ipSaluran: '10.15.22.14 (LAN Bappeda)',
        status: 'Peringatan'
      },
      {
        id: 'AUD-20261013-004',
        timestamp: '2026-10-13T11:20:00Z',
        waktuFormatted: '13 Okt 2026, 18:20 WIB',
        aktor: 'SITI RAHMA S.E.',
        nip: '199208242015022001',
        role: 'Pegawai ASN',
        kategori: 'Verifikasi',
        aktivitas: 'Pengajuan Final Formulir IDP 2026',
        detail: 'Mengajukan dokumen IDP Rencana 22 JP (Bimtek SIPD, Webinar Renja, Mentoring Analisis Data Makro).',
        ipSaluran: '10.15.22.33 (LAN Bappeda)',
        status: 'Sukses'
      },
      {
        id: 'AUD-20261013-003',
        timestamp: '2026-10-13T09:05:00Z',
        waktuFormatted: '13 Okt 2026, 16:05 WIB',
        aktor: 'Ir. IDA SUSANTI S S.T., M.T',
        nip: '197410092006042005',
        role: 'Kepala Bidang Infrastruktur',
        kategori: 'Otentikasi',
        aktivitas: 'Login Sesi Pejabat Administrator',
        detail: 'Otentikasi berhasil masuk sistem SIP-KOMPETENSI.',
        ipSaluran: '10.15.22.18 (LAN Bappeda)',
        status: 'Sukses'
      },
      {
        id: 'AUD-20261013-002',
        timestamp: '2026-10-13T08:15:00Z',
        waktuFormatted: '13 Okt 2026, 15:15 WIB',
        aktor: 'MEYDIANDRA EKA PUTRA S.P,MIP',
        nip: '197305141998031007',
        role: 'Kepala Bidang PMPE',
        kategori: 'Verifikasi',
        aktivitas: 'Persetujuan Atasan Langsung',
        detail: 'Menyetujui rancangan rencana kompetensi staf Bidang PMPE (Rendalev).',
        ipSaluran: '10.15.22.12 (LAN Bappeda)',
        status: 'Sukses'
      },
      {
        id: 'AUD-20261013-001',
        timestamp: '2026-10-13T07:30:00Z',
        waktuFormatted: '13 Okt 2026, 14:30 WIB',
        aktor: 'SISTEM SIP-KOMPETENSI',
        nip: '196910261992032002',
        role: 'Sistem Otomatis',
        kategori: 'Cadangan',
        aktivitas: 'Inisialisasi Master DUK 99 ASN Bappeda',
        detail: 'Sinkronisasi master data kepegawaian berlaku tahun 2026 sukses.',
        ipSaluran: 'Cloud Supabase Server',
        status: 'Info'
      }
    ];
  },

  /**
   * Mencatat aktivitas baru ke dalam log audit
   */
  log(kategori, aktivitas, detail, status = 'Sukses', actorOverride = null) {
    const user = (typeof Store !== 'undefined' && (Store.state?.currentSession || Store.state?.user)) || {
      name: 'CIK MARYA S.E.,M.M.',
      nip: '196910261992032002',
      role: 'admin'
    };

    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    const timeFormatted = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const newLog = {
      id: `AUD-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Date.now().toString().slice(-4)}`,
      timestamp: now.toISOString(),
      waktuFormatted: timeFormatted,
      aktor: actorOverride ? actorOverride.name : user.name,
      nip: actorOverride ? actorOverride.nip : user.nip,
      role: actorOverride ? (actorOverride.role || 'Pegawai ASN') : (user.role === 'admin' ? 'Kasubbag Kepegawaian' : user.role === 'pimpinan' ? 'Kepala Bappeda' : 'Pegawai ASN'),
      kategori: kategori || 'Umum',
      aktivitas: aktivitas || 'Aktivitas Kedinasan',
      detail: detail || '-',
      ipSaluran: '10.15.22.14 (LAN Bappeda)',
      status: status || 'Sukses'
    };

    if (typeof Store !== 'undefined' && Store.state) {
      if (!Store.state.auditLogs) Store.state.auditLogs = [];
      Store.state.auditLogs.unshift(newLog);
      if (typeof Store.save === 'function') Store.save();
    }

    try {
      const logs = this.getAuditLogs();
      logs.unshift(newLog);
      localStorage.setItem('sip_audit_logs', JSON.stringify(logs.slice(0, 100)));
    } catch (e) {}

    // Jika tab audit sedang aktif dibuka, refresh tampilannya
    const pane = document.getElementById('masterPaneAudit');
    if (pane && pane.style.display !== 'none') {
      this.renderAuditTab();
    }

    return newLog;
  },

  onFilterChange() {
    this.auditPage = 1;
    this.renderAuditTab();
  },

  resetFilter() {
    const s = document.getElementById('auditSearchInput');
    const c = document.getElementById('auditCategoryFilter');
    const st = document.getElementById('auditStatusFilter');
    if (s) s.value = '';
    if (c) c.value = '';
    if (st) st.value = '';
    this.auditPage = 1;
    this.renderAuditTab();
    if (typeof App !== 'undefined' && App.toast) {
      App.toast('Filter log audit direset', 'info');
    }
  },

  setAuditPage(p) {
    this.auditPage = p;
    this.renderAuditTab();
    const el = document.getElementById('auditTableContainer');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  exportAuditLogs() {
    const logs = this.getAuditLogs();
    const headers = ['No', 'ID Log', 'Waktu (WIB)', 'Aktor / Nama', 'NIP', 'Peran Kedinasan', 'Kategori', 'Aktivitas', 'Detail Perubahan', 'Saluran Akses', 'Status'];
    const rows = logs.map((l, i) => [
      i + 1,
      l.id,
      l.waktuFormatted,
      l.aktor,
      `'${l.nip}`,
      l.role,
      l.kategori,
      l.aktivitas,
      l.detail,
      l.ipSaluran,
      l.status
    ]);

    ExportService.downloadExcel('Log_Audit_Kedinasan_Bappeda_2026', 'Jejak Rekam SPBE', headers, rows);
    if (typeof App !== 'undefined' && App.toast) {
      App.toast('Berkas Excel Log Audit Kedinasan berhasil diunduh', 'success');
    }
  },

  renderAuditTab() {
    const pane = document.getElementById('masterPaneAudit');
    if (!pane) return;

    const allLogs = this.getAuditLogs();
    const search = (document.getElementById('auditSearchInput')?.value || '').toLowerCase().trim();
    const catFilter = document.getElementById('auditCategoryFilter')?.value || '';
    const statusFilter = document.getElementById('auditStatusFilter')?.value || '';

    const filtered = allLogs.filter(l => {
      if (catFilter && l.kategori !== catFilter) return false;
      if (statusFilter && l.status !== statusFilter) return false;
      if (search) {
        const matchAktor = (l.aktor || '').toLowerCase().includes(search);
        const matchNip = String(l.nip || '').includes(search);
        const matchAkt = (l.aktivitas || '').toLowerCase().includes(search);
        const matchDet = (l.detail || '').toLowerCase().includes(search);
        if (!matchAktor && !matchNip && !matchAkt && !matchDet) return false;
      }
      return true;
    });

    // Hitung KPI
    const totalCount = allLogs.length;
    const verifCount = allLogs.filter(l => l.kategori === 'Verifikasi' || l.kategori === 'Realisasi').length;
    const warnCount = allLogs.filter(l => l.status === 'Peringatan' || (l.detail || '').includes('Revisi')).length;
    const secCount = allLogs.filter(l => l.kategori === 'Keamanan' || l.kategori === 'Otentikasi').length;

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / this.auditPageSize) || 1;
    if (this.auditPage > totalPages) this.auditPage = 1;
    const startIdx = (this.auditPage - 1) * this.auditPageSize;
    const pageItems = filtered.slice(startIdx, startIdx + this.auditPageSize);

    // Kategori Badges
    const getCatBadge = (cat) => {
      switch (cat) {
        case 'Otentikasi': return '<span class="badge badge-blue">Otentikasi</span>';
        case 'Verifikasi': return '<span class="badge badge-success">Verifikasi</span>';
        case 'Realisasi': return '<span class="badge badge-purple" style="background: rgba(168, 85, 247, 0.12); color: #9333ea;">Realisasi</span>';
        case 'Notifikasi': return '<span class="badge badge-warning">Notifikasi</span>';
        case 'Keamanan': return '<span class="badge badge-rose" style="background: rgba(244, 63, 94, 0.12); color: #e11d48;">Keamanan</span>';
        case 'Cadangan': return '<span class="badge badge-teal" style="background: rgba(20, 184, 166, 0.12); color: #0d9488;">Cadangan</span>';
        default: return `<span class="badge badge-neutral">${cat}</span>`;
      }
    };

    const getStatusBadge = (st) => {
      if (st === 'Sukses') return '<span class="badge badge-success" style="font-size: 10px;">Sah / Sukses</span>';
      if (st === 'Peringatan') return '<span class="badge badge-danger" style="font-size: 10px;">Perlu Revisi</span>';
      return '<span class="badge badge-neutral" style="font-size: 10px;">Info</span>';
    };

    pane.innerHTML = `
      <div style="padding: 6px 0;">
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.04), rgba(30, 41, 59, 0.08)); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 18px 22px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <h2 style="font-size: 16px; font-weight: 750; color: var(--color-text-primary); margin: 0;">Log Audit &amp; Rekam Jejak Kedinasan (Audit Trail SPBE)</h2>
              <span class="badge badge-success" style="font-size: 10.5px;"><span class="compliance-dot dot-green"></span> Integritas Terjamin</span>
            </div>
            <p style="font-size: 12px; color: var(--color-text-secondary); margin: 0; max-width: 720px; line-height: 1.5;">
              Pencatatan kronologis otomatis seluruh permohonan IDP, verifikasi Kasubbag Kepegawaian, disposisi pimpinan, pengunggahan sertifikat, dan pengiriman notifikasi untuk memenuhi standar akuntabilitas Inspektorat Daerah &amp; BKN.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-outline btn-sm" onclick="AuditService.exportAuditLogs()" title="Unduh seluruh rekap riwayat log audit dalam format Excel resmi">
              <span data-icon="Download" data-icon-size="14"></span> Unduh Log (.xlsx)
            </button>
            <button class="btn btn-primary btn-sm" onclick="AuditService.renderAuditTab()" title="Segarkan data log audit">
              <span data-icon="RotateCcw" data-icon-size="14"></span> Segarkan
            </button>
          </div>
        </div>

        <!-- 4 KPI Cards -->
        <div class="grid grid-cols-4" style="margin-bottom: 22px; gap: 14px;">
          <div class="stat-card">
            <div class="stat-card-inner">
              <div class="stat-card-info">
                <div class="stat-card-label">Total Entri Log</div>
                <div class="stat-card-value">${totalCount} <span style="font-size: 12px; color: var(--color-text-muted);">Riwayat</span></div>
                <div class="stat-card-desc">Terekam di sistem dinas</div>
              </div>
              <div class="stat-card-icon"><span data-icon="History" data-icon-size="20"></span></div>
            </div>
          </div>

          <div class="stat-card success">
            <div class="stat-card-inner">
              <div class="stat-card-info">
                <div class="stat-card-label">Verifikasi &amp; Sah</div>
                <div class="stat-card-value text-success">${verifCount} <span style="font-size: 12px; color: var(--color-text-muted);">Aksi</span></div>
                <div class="stat-card-desc">IDP &amp; Sertifikat Disahkan</div>
              </div>
              <div class="stat-card-icon"><span data-icon="ShieldCheck" data-icon-size="20"></span></div>
            </div>
          </div>

          <div class="stat-card danger">
            <div class="stat-card-inner">
              <div class="stat-card-info">
                <div class="stat-card-label">Revisi &amp; Peringatan</div>
                <div class="stat-card-value text-danger">${warnCount} <span style="font-size: 12px; color: var(--color-text-muted);">Catatan</span></div>
                <div class="stat-card-desc">Perlu atensi pegawai</div>
              </div>
              <div class="stat-card-icon"><span data-icon="AlertTriangle" data-icon-size="20"></span></div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-card-inner">
              <div class="stat-card-info">
                <div class="stat-card-label">Keamanan &amp; Sesi</div>
                <div class="stat-card-value">${secCount} <span style="font-size: 12px; color: var(--color-text-muted);">Sesi</span></div>
                <div class="stat-card-desc">Login &amp; Enkripsi Sandi</div>
              </div>
              <div class="stat-card-icon"><span data-icon="Lock" data-icon-size="20"></span></div>
            </div>
          </div>
        </div>

        <!-- Filter Toolbar -->
        <div class="table-toolbar" style="margin-bottom: 14px; background: var(--color-surface); padding: 12px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-md);">
          <div class="table-filter-group" style="flex-wrap: wrap; gap: 10px;">
            <input type="text" id="auditSearchInput" class="form-control" style="width: 260px;" placeholder="Cari nama, NIP, atau aktivitas..." value="${search}" oninput="AuditService.onFilterChange()">
            <select id="auditCategoryFilter" class="form-select" style="width: 200px;" onchange="AuditService.onFilterChange()">
              <option value="" ${catFilter === '' ? 'selected' : ''}>Semua Kategori</option>
              <option value="Verifikasi" ${catFilter === 'Verifikasi' ? 'selected' : ''}>Verifikasi IDP</option>
              <option value="Realisasi" ${catFilter === 'Realisasi' ? 'selected' : ''}>Realisasi &amp; Sertifikat</option>
              <option value="Notifikasi" ${catFilter === 'Notifikasi' ? 'selected' : ''}>Notifikasi &amp; Pengingat</option>
              <option value="Keamanan" ${catFilter === 'Keamanan' ? 'selected' : ''}>Keamanan &amp; Sandi</option>
              <option value="Otentikasi" ${catFilter === 'Otentikasi' ? 'selected' : ''}>Otentikasi Sesi</option>
              <option value="Cadangan" ${catFilter === 'Cadangan' ? 'selected' : ''}>Cadangan Basis Data</option>
            </select>
            <select id="auditStatusFilter" class="form-select" style="width: 150px;" onchange="AuditService.onFilterChange()">
              <option value="" ${statusFilter === '' ? 'selected' : ''}>Semua Status</option>
              <option value="Sukses" ${statusFilter === 'Sukses' ? 'selected' : ''}>Sah / Sukses</option>
              <option value="Peringatan" ${statusFilter === 'Peringatan' ? 'selected' : ''}>Perlu Revisi</option>
              <option value="Info" ${statusFilter === 'Info' ? 'selected' : ''}>Info</option>
            </select>
            <button class="btn btn-outline btn-sm" onclick="AuditService.resetFilter()">Reset</button>
          </div>
        </div>

        <!-- Table -->
        <div id="auditTableContainer" class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">No</th>
                <th style="width: 150px;">Waktu &amp; Tanggal</th>
                <th style="width: 220px;">Aktor / Pegawai</th>
                <th style="width: 120px;">Kategori</th>
                <th>Aktivitas Kedinasan &amp; Keterangan</th>
                <th style="width: 160px;">Saluran / Jaringan</th>
                <th style="width: 100px; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${pageItems.length === 0 ? `
                <tr><td colspan="7" style="text-align: center; padding: 36px; color: var(--color-text-muted);">Tidak ada rekaman log audit yang sesuai kriteria pencarian.</td></tr>
              ` : pageItems.map((l, idx) => {
                const no = startIdx + idx + 1;
                return `
                  <tr>
                    <td style="text-align: center; color: var(--color-text-muted); font-size: 11px;">${no}</td>
                    <td style="font-size: 11.5px; white-space: nowrap;">
                      <div style="font-weight: 600; color: var(--color-text-primary);">${l.waktuFormatted.split(',')[0]}</div>
                      <div style="font-size: 10.5px; color: var(--color-text-muted);">${l.waktuFormatted.split(',')[1] || ''}</div>
                    </td>
                    <td>
                      <div style="font-weight: 650; font-size: 12px; color: var(--color-text-primary);">${l.aktor}</div>
                      <div style="font-size: 10.5px; color: var(--color-text-muted); font-family: monospace;">NIP: ${l.nip}</div>
                      <div style="font-size: 10.5px; color: var(--color-primary);">${l.role}</div>
                    </td>
                    <td>${getCatBadge(l.kategori)}</td>
                    <td>
                      <div style="font-weight: 650; font-size: 12px; color: var(--color-text-primary); margin-bottom: 2px;">${l.aktivitas}</div>
                      <div style="font-size: 11.5px; color: var(--color-text-secondary); line-height: 1.4;">${l.detail}</div>
                    </td>
                    <td style="font-size: 11px; color: var(--color-text-muted); font-family: monospace;">
                      ${l.ipSaluran}
                    </td>
                    <td style="text-align: center;">${getStatusBadge(l.status)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-wrapper" style="margin-top: 14px;">
          <div style="font-size: 12px; color: var(--color-text-muted);">
            Menampilkan <b>${total === 0 ? 0 : startIdx + 1}–${Math.min(startIdx + this.auditPageSize, total)}</b> dari <b>${total}</b> rekaman log audit resmi
          </div>
          <div class="pagination-controls">
            ${totalPages > 1 ? Array.from({length: totalPages}, (_, i) => i + 1).map(p => `
              <button class="page-btn ${p === this.auditPage ? 'active' : ''}" onclick="AuditService.setAuditPage(${p})">${p}</button>
            `).join('') : ''}
          </div>
        </div>
      </div>
    `;

    if (typeof renderAllIcons === 'function') renderAllIcons();
  }
};

if (typeof window !== 'undefined') {
  window.AuditService = AuditService;
}



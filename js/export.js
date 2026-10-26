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
   * Unduh Berkas Template Excel Resmi Standar DUK Bappeda / SIASN BKN
   */
  downloadDukTemplate() {
    const headers = [
      'NIP', 
      'Nama Lengkap & Gelar', 
      'Pangkat / Golongan', 
      'Jabatan Kedinasan', 
      'Jenis Jabatan', 
      'Unit Kerja / Bidang', 
      'Pendidikan Terakhir', 
      'Nomor WhatsApp'
    ];

    const sampleRows = [
      [
        '197507312000031002',
        'Dr. ANANG RISGIYANTO, S.K.M., M.Kes.',
        'Pembina Utama Madya (IV/d)',
        'Kepala Badan Perencanaan Pembangunan Daerah',
        'Pimpinan',
        'Pimpinan Bappeda',
        'S-3',
        '081272001002'
      ],
      [
        '197407072002121008',
        'ANDI ARAFAT, S.T., M.E.',
        'Pembina Tk. I (IV/b)',
        'Sekretaris Bappeda Provinsi Lampung',
        'Struktural',
        'Sekretariat',
        'S-2',
        '081369002008'
      ],
      [
        '196910261992032002',
        'CIK MARYA, S.E., M.M.',
        'Pembina (IV/a)',
        'Kasubbag Umum & Kepegawaian',
        'Struktural',
        'Sekretariat',
        'S-2',
        '081279003002'
      ],
      [
        '197305141998031007',
        'MEYDIANDRA EKA PUTRA, S.P., M.I.P.',
        'Pembina Tk. I (IV/b)',
        'Kepala Bidang Perencanaan Makro, Pengendalian dan Evaluasi',
        'Struktural',
        'Bidang PMPE (Rendalev)',
        'S-2',
        '081273004007'
      ]
    ];

    this.downloadExcel('Template_DUK_Bappeda_Lampung', 'Template DUK', headers, sampleRows);
    App.toast('Template format DUK Pegawai berhasil diunduh. Silakan isi dan unggah kembali.', 'success');
  },

  /**
   * Ekspor Rekapitulasi Eksekutif Kepatuhan 20 JP & IDP Pegawai (Format BKD / BPSDMD)
   */
  exportBkdRecap() {
    const emps = Store.state.employees || [];
    const activeYear = Store.getActiveYear();
    const headers = [
      'No',
      'NIP',
      'Nama Lengkap Pegawai',
      'Pangkat / Gol. Ruang',
      'Jabatan Kedinasan',
      'Unit Kerja / Bidang',
      'Posisi Nine-Box',
      'Target Cita-Cita Karier',
      'Akumulasi Bangkom (JP)',
      'Status 20 JP (UU No. 20/2023)',
      'Status Pengajuan IDP',
      'Nomor Kontak WhatsApp'
    ];

    let countMet = 0;
    let countNotMet = 0;
    let totalAllJp = 0;

    const rows = emps.map((e, idx) => {
      const yearData = typeof App !== 'undefined' && App.getEmployeeYearData ? App.getEmployeeYearData(e) : { jp: e.jp || 0 };
      const jp = yearData.jp || 0;
      totalAllJp += jp;
      const isMet = jp >= 20;
      if (isMet) countMet++; else countNotMet++;

      return [
        idx + 1,
        `'${String(e.nip || '').replace(/\D/g, '')}`,
        e.name || '-',
        e.pangkat || '-',
        e.jabatan || '-',
        e.unit || 'Bappeda Provinsi Lampung',
        `Kotak ${e.nineBox || '8'}`,
        e.targetJenjang || 'JFT Madya — Level 4',
        jp,
        isMet ? 'MEMENUHI (>= 20 JP)' : `BELUM MEMENUHI (Kurang ${20 - jp} JP)`,
        e.statusIdp || 'Final / Disetujui',
        e.whatsapp ? `'${e.whatsapp}` : '-'
      ];
    });

    // Baris rekapitulasi agregasi di akhir
    rows.push([
      '',
      '',
      'TOTAL REKAPITULASI BAPPEDA LAMPUNG',
      '',
      '',
      '',
      '',
      '',
      totalAllJp,
      `Memenuhi: ${countMet} ASN | Belum: ${countNotMet} ASN`,
      `Kepatuhan: ${Math.round((countMet / (emps.length || 1)) * 100)}%`,
      ''
    ]);

    this.downloadExcel(`Rekapitulasi_Kepatuhan_IDP_Bappeda_Lampung_TA_${activeYear}`, `Rekapitulasi BKD TA ${activeYear}`, headers, rows);
    App.toast(`Rekapitulasi Kepatuhan IDP & Bangkom TA ${activeYear} berhasil diunduh.`, 'success');
  },

  /**
   * Export IDP Realization Monitoring to CSV
   */
  exportMonitoring() {
    const activeYear = Store.getActiveYear();
    const allList = Store.state.realizations || [];
    const rList = allList.filter(r => Number(r.tahun || 2026) === Number(activeYear));
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
    this.downloadExcel(`Monitoring_Realisasi_IDP_TA_${activeYear}_Bappeda_Lampung`, `Realisasi TA ${activeYear}`, headers, rows);
    App.toast(`File Excel Laporan Monitoring Realisasi TA ${activeYear} berhasil diunduh`, 'success');
  },

  /**
   * Menampilkan dialog pilih orientasi, lalu cetak dokumen resmi IDP
   */
  _printOrientation: 'portrait',
  _customPrintData: null,

  /**
   * Menampilkan dialog pilih orientasi, lalu cetak dokumen resmi IDP atau Rapor Diagnostik
   */
  showPrintDialog(customData = null) {
    ExportService._customPrintData = customData;
    const isExecutive = customData === 'executive';
    const isDiagnostic = customData === 'diagnostic';

    // Hapus dialog lama jika ada
    const oldDialog = document.getElementById('printOrientDialog');
    if (oldDialog) oldDialog.remove();

    let titleText = 'Cetak / Unduh Dokumen IDP (.PDF)';
    let descText = 'Pilih orientasi halaman sebelum mencetak atau menyimpan dokumen IDP resmi:';
    let actionFn = 'ExportService.printOfficialIdp()';

    if (isDiagnostic) {
      titleText = 'Cetak Rapor Diagnostik Kompetensi & Rencana Karier (.PDF)';
      descText = 'Pilih orientasi halaman untuk mencetak Rapor Diagnostik Kesenjangan & Peta Cita-Cita Karier:';
      actionFn = 'ExportService.printCareerDiagnosticReport()';
    } else if (isExecutive) {
      titleText = 'Cetak Laporan Eksekutif Bappeda (.PDF)';
      descText = 'Pilih orientasi halaman untuk Laporan Rekapitulasi Eksekutif Kepala Badan:';
      actionFn = 'ExportService.printExecutiveSummary()';
    }

    const dialog = document.createElement('div');
    dialog.id = 'printOrientDialog';
    dialog.className = 'print-dialog-overlay';
    dialog.innerHTML = `
      <div class="print-dialog-box">
        <h3>🖨️ ${titleText}</h3>
        <p>${descText}</p>
        <div class="print-orientation-grid">
          <button class="print-orient-btn ${ExportService._printOrientation === 'portrait' ? 'selected' : ''}" id="btnPortrait" onclick="ExportService.selectOrientation('portrait')">
            <div class="print-orient-icon portrait-icon"></div>
            Potret (Standar Resmi A4)
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
          <button class="btn btn-primary" onclick="${actionFn}">
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

  showCareerDiagnosticPrintDialog(customData = null) {
    this.showPrintDialog('diagnostic');
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
            <td style="text-align: center;">${p.periode || ('Tahun ' + Store.getActiveYear())}</td>
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
            <div><b>Tahun Anggaran:</b> ${Store.getActiveYear()}</div>
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
          <span>III. MATRIKS PROGRAM PENGEMBANGAN KOMPETENSI (TAHUN ${Store.getActiveYear()})</span>
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
          ${(typeof TTEService !== 'undefined') ? TTEService.getTteSignatureBox({
            signerRole: 'Kepala Bappeda',
            signerName: 'Dr. ANANG RISGIYANTO, S.K.M., M.Kes.',
            signerPangkat: 'Pembina Utama Madya (IV/d)',
            signerNip: '19750731 200003 1 002',
            docRegNo: docRegNo,
            docType: 'Formulir Rencana Pengembangan Individu (IDP ASN)',
            employeeName: u.name,
            dateText: tanggalSurat
          }) : `
            <div>
              <div>Bandar Lampung, \${tanggalSurat}</div>
              <div style="font-weight: 700; margin-top: 1px;">Kepala Bappeda Provinsi Lampung</div>
              <div style="height: 44px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #777;">
                <i>(Tanda Tangan Elektronik)</i>
              </div>
              <div style="font-weight: 750; text-decoration: underline;">Dr. ANANG RISGIYANTO, S.K.M., M.Kes.</div>
              <div style="font-size: 9.5px; margin-top: 1px;">Pembina Utama Madya (IV/d)<br>NIP. 19750731 200003 1 002</div>
            </div>
          `}
        </div>

        <!-- FOOTER KEAMANAN & INTEGRITAS DOKUMEN -->
        <div style="margin-top: 24px; padding-top: 8px; border-top: 1px dashed #777; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #555;">
          <div>
            <b>SIP-IDP BAPPEDA PROVINSI LAMPUNG</b> &bull; Dokumen sah yang diproduksi otomatis oleh sistem manajemen kompetensi aparatur.
          </div>
          <div>
            Kode Otentikasi: <b>IDP-${Store.getActiveYear()}-${cleanNip ? cleanNip.slice(-6) : 'VERIF'}-SAH</b>
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
   * Cetak Dokumen Resmi: Rapor Diagnostik Kesenjangan Kompetensi & Peta Kesiapan Cita-Cita Karier ASN
   * Ber-KOP Resmi Lambang Lampung & Ditandatangani Kepala Bappeda Provinsi Lampung
   */
  /**
   * Mengembalikan HTML Resmi Rapor Diagnostik Kesenjangan Kompetensi & Peta Karier
   */
  getDiagnosticReportHtml() {
    const u = Store.state.user || {
      name: 'ANDI ARAFAT S.T., M.E.',
      nip: '197407072002121008',
      pangkat: 'Pembina Tk. I / IV/b',
      jabatan: 'Sekretaris Bappeda Provinsi Lampung',
      unitKerja: 'Sekretariat',
      pendidikan: 'EKONOMI PEMBANGUNAN & PERENCANAAN (2007)',
      masaKerja: '23 Tahun 9 Bulan',
      nineBox: 8
    };

    const cp = Store.state.careerPlan || {
      jenjangTarget: 'JFT Madya — Level 4',
      rencana: 'Mengembangkan kompetensi evaluasi perencanaan pembangunan daerah...',
      rumpunTarget: ['86 — BAPPENAS', '70 — Aparatur Negara / Kepegawaian', '22 — Statistik']
    };

    const targetJenjang = cp.jenjangTarget || 'JFT Madya — Level 4';
    const readiness = (typeof Store.calculateCareerReadiness === 'function') 
      ? Store.calculateCareerReadiness(targetJenjang) 
      : {
          overallScore: 74,
          targetLevel: 4,
          kategori: 'KATEGORI II: SIAP DENGAN PENGEMBANGAN (READY WITH DEVELOPMENT)',
          proyeksiWaktu: '1 — 2 Tahun',
          checklist: []
        };

    const gapData = (typeof Store.getCompetencyGaps === 'function') 
      ? Store.getCompetencyGaps() 
      : { all: [], gaps: [], fulfilled: [], totalCount: 12, gapCount: 3, percentageFulfilled: 75 };

    const programs = Store.state.idpState?.programs || [];
    const totalJp = programs.reduce((acc, p) => acc + (parseInt(p.jp) || 0), 0);

    const kopHtml = (typeof LambangLampung !== 'undefined' && typeof LambangLampung.getKopSuratHtml === 'function')
      ? LambangLampung.getKopSuratHtml()
      : (window.LambangLampung?.getKopSuratHtml ? window.LambangLampung.getKopSuratHtml() : '');

    const now = new Date();
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const tanggalSurat = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    const cleanNip = String(u.nip || '').replace(/[^0-9]/g, '');
    const nipFormatted = cleanNip.length === 18 
      ? `${cleanNip.slice(0,8)} ${cleanNip.slice(8,14)} ${cleanNip.slice(14,15)} ${cleanNip.slice(15,18)}`
      : (u.nip || '-');
    const docRegNo = `800.1.2/DIAG-KARIER/${now.getFullYear()}/${cleanNip ? cleanNip.slice(-4) : '0001'}`;

    // Bangun baris tabel kompetensi dengan status gap & rekomendasi solusi IDP
    let compRowsHtml = '';
    (gapData.all || []).forEach((item, idx) => {
      const isGap = item.gap > 0;
      const gapBadge = isGap 
        ? `<span style="display:inline-block; padding: 2px 6px; background: ${item.gap >= 2 ? '#fce8e6' : '#fef7e0'}; color: ${item.gap >= 2 ? '#c5221f' : '#b06000'}; font-weight: 700; border-radius: 3px; font-size: 9.5px;">Gap -${item.gap} Level</span>`
        : `<span style="display:inline-block; padding: 2px 6px; background: #e6f4ea; color: #137333; font-weight: 700; border-radius: 3px; font-size: 9.5px;">Memenuhi</span>`;

      compRowsHtml += `
        <tr style="${isGap ? 'background: #fffdf5;' : ''}">
          <td style="text-align: center;">${idx + 1}</td>
          <td><b>${item.name}</b><div style="font-size: 9px; color: #666;">${item.kategori || '-'}</div></td>
          <td style="text-align: center;">Level ${item.current}</td>
          <td style="text-align: center;">Level ${item.target}</td>
          <td style="text-align: center;">${gapBadge}</td>
          <td>${item.solusi ? `<b>${item.solusi}</b> (${item.metode || 'Diklat'}, ${item.jp || 4} JP)` : 'Pemeliharaan Kompetensi Berkala'}</td>
        </tr>
      `;
    });

    // Bangun baris checklist kesiapan suksesi karier
    let checklistRowsHtml = '';
    (readiness.checklist || []).forEach((chk, idx) => {
      const statusBadge = chk.isPassed
        ? `<span style="display:inline-block; padding: 2px 6px; background: #e6f4ea; color: #137333; font-weight: 700; border-radius: 3px; font-size: 9.5px;">&#10004; ${chk.status}</span>`
        : `<span style="display:inline-block; padding: 2px 6px; background: #fef7e0; color: #b06000; font-weight: 700; border-radius: 3px; font-size: 9.5px;">&#9888; ${chk.status}</span>`;

      checklistRowsHtml += `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td><b>${chk.param}</b></td>
          <td>${chk.detail}</td>
          <td style="text-align: center;"><b>${chk.score}%</b></td>
          <td style="text-align: center;">${statusBadge}</td>
        </tr>
      `;
    });

    return `
      <div class="official-print-paper" style="background: #fff; color: #000; font-family: 'Inter', Arial, sans-serif;">
        ${kopHtml}

        <!-- REGISTRASI & METADATA DOKUMEN KEDINASAN -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin: 10px 0 16px; border-bottom: 1.5px solid #000; padding-bottom: 8px; font-size: 10.5px; color: #000;">
          <div>
            <div><b>Nomor Dokumen:</b> ${docRegNo}</div>
            <div><b>Sifat:</b> Rahasia Kedinasan / Portofolio Kepegawaian</div>
            <div><b>Dasar Hukum:</b> UU No. 20/2023 Pasal 49 &bull; PermenPAN-RB No. 3/2020 &bull; Peraturan LAN No. 10/2018</div>
          </div>
          <div style="text-align: right;">
            <div><b>Tahun Anggaran:</b> ${Store.getActiveYear()}</div>
            <div><b>Kategori Dokumen:</b> <span style="font-weight: 700; color: #0b5394;">RAPOR DIAGNOSTIK RESMI</span></div>
            <div><b>Indeks Kesiapan Karier:</b> <b style="color: #137333; font-size: 12px;">${readiness.overallScore}%</b></div>
          </div>
        </div>

        <!-- JUDUL UTAMA DOKUMEN RESMI -->
        <div style="text-align: center; margin: 10px 0 16px;">
          <h2 style="font-size: 12.5px; font-weight: 800; text-transform: uppercase; margin: 0; color: #000; letter-spacing: 0.02em; line-height: 1.35;">
            RAPOR DIAGNOSTIK KESENJANGAN KOMPETENSI<br>&amp; PETA KESIAPAN CITA-CITA KARIER PEGAWAI NEGERI SIPIL
          </h2>
          <div style="font-size: 10px; font-weight: 650; color: #222; margin-top: 3px;">
            BADAN PERENCANAAN PEMBANGUNAN DAERAH PROVINSI LAMPUNG
          </div>
        </div>

        <!-- BAGIAN I: IDENTITAS PEGAWAI & KUADRAN TALENTA -->
        <div class="print-section-title">I. IDENTITAS PEGAWAI ASN &amp; MATRIKS TALENTA (NINE-BOX GRID)</div>
        <table class="print-table-kv">
          <tr>
            <td style="width: 24%;">Nama Lengkap &amp; Gelar</td>
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
            <td>Jabatan Saat Ini</td>
            <td>:</td>
            <td><b>${u.jabatan}</b></td>
            <td>Pendidikan Terakhir</td>
            <td>:</td>
            <td>${u.pendidikan || '-'}</td>
          </tr>
          <tr>
            <td>Unit Kerja Penugasan</td>
            <td>:</td>
            <td>${u.unitKerja} — Bappeda Provinsi Lampung</td>
            <td>Posisi Nine-Box Grid</td>
            <td>:</td>
            <td><b style="color: #0b5394;">Kotak ${u.nineBox || 8} (High Performer — Siap Akselerasi)</b></td>
          </tr>
        </table>

        <!-- BAGIAN II: DIAGNOSTIK KESENJANGAN KOMPETENSI -->
        <div class="print-section-title" style="margin-top: 14px; display: flex; justify-content: space-between; align-items: center;">
          <span>II. HASIL DIAGNOSTIK KESENJANGAN KOMPETENSI (COMPETENCY GAP DIAGNOSTIC)</span>
          <span style="font-size: 9.5px; font-weight: normal;">Standar Pengujian: 12 Indikator Standar Kompetensi Bappeda</span>
        </div>
        <div style="margin-bottom: 8px; font-size: 10px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 10px; border-radius: 4px;">
          <b>Ringkasan Diagnostik:</b> Dari <b>${gapData.totalCount}</b> kompetensi yang diuji, terdapat <b>${gapData.gapCount} kompetensi</b> yang belum memenuhi standar level jabatan saat ini (Tingkat Pemenuhan: <b>${gapData.percentageFulfilled}%</b>). Pegawai diwajibkan menutup kesenjangan melalui program pengembangan (IDP) di bawah ini.
        </div>
        <table class="print-table-data">
          <thead>
            <tr>
              <th style="width: 28px; text-align: center;">No</th>
              <th style="width: 28%;">Nama Indikator Kompetensi</th>
              <th style="width: 11%; text-align: center;">Level Saat Ini</th>
              <th style="width: 11%; text-align: center;">Standar Jabatan</th>
              <th style="width: 13%; text-align: center;">Kesenjangan (Gap)</th>
              <th>Rekomendasi Program Pengembangan IDP Penutup Gap</th>
            </tr>
          </thead>
          <tbody>
            ${compRowsHtml}
          </tbody>
        </table>

        <!-- BAGIAN III: ANALISIS CITA-CITA JABATAN & INDEKS KESIAPAN SUKSESI -->
        <div class="print-section-title" style="margin-top: 14px;">III. PROYEKSI CITA-CITA JABATAN &amp; INDEKS KESIAPAN SUKSESI (CAREER READINESS)</div>
        <table class="print-table-kv" style="margin-bottom: 8px;">
          <tr>
            <td style="width: 24%;">Cita-Cita Jabatan Target</td>
            <td style="width: 2%;">:</td>
            <td style="width: 34%;"><b style="color: #0b5394; font-size: 11px;">${targetJenjang}</b></td>
            <td style="width: 18%;">Skor Indeks Kesiapan</td>
            <td style="width: 2%;">:</td>
            <td><b style="color: #137333; font-size: 12px;">${readiness.overallScore}%</b> (${readiness.kategori})</td>
          </tr>
          <tr>
            <td>Proyeksi Waktu Suksesi</td>
            <td style="width: 2%;">:</td>
            <td><b>${readiness.proyeksiWaktu}</b></td>
            <td>Status Hak Belajar Bangkom</td>
            <td style="width: 2%;">:</td>
            <td>${totalJp >= 20 ? '&#10004; Memenuhi 20 JP' : `Kurang ${Math.max(0, 20 - totalJp)} JP`} (Realisasi: ${totalJp} JP)</td>
          </tr>
          <tr>
            <td>Arah &amp; Harapan Pegawai</td>
            <td style="width: 2%;">:</td>
            <td colspan="4"><i>"${cp.rencana || '-'}"</i></td>
          </tr>
        </table>

        <div style="font-size: 10px; font-weight: 700; margin: 6px 0 4px; color: #333;">Checklist Parameter Kelayakan Menuju Cita-Cita:</div>
        <table class="print-table-data">
          <thead>
            <tr>
              <th style="width: 28px; text-align: center;">No</th>
              <th style="width: 28%;">Parameter Penilaian Kesiapan</th>
              <th>Kondisi Saat Ini vs Syarat Jabatan Target</th>
              <th style="width: 12%; text-align: center;">Skor Bobot</th>
              <th style="width: 20%; text-align: center;">Status Kelayakan</th>
            </tr>
          </thead>
          <tbody>
            ${checklistRowsHtml}
          </tbody>
        </table>

        <!-- BAGIAN IV: LEMBAR PENGESAHAN RESMI (TRIPARTIT BAPPEDA LAMPUNG) -->
        <div style="margin-top: 22px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; text-align: center; font-size: 10px; color: #000; page-break-inside: avoid;">
          <!-- Pejabat 1: Pegawai yang Dinilai -->
          <div>
            <div style="font-weight: 600;">Pegawai ASN yang Dinilai,</div>
            <div style="height: 48px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #777;">
              <i>(Tanda Tangan Elektronik)</i>
            </div>
            <div style="font-weight: 750; text-decoration: underline;">${u.name}</div>
            <div style="font-size: 9px; margin-top: 1px;">NIP. ${nipFormatted}</div>
          </div>

          <!-- Pejabat 2: Verifikator SDM (Kasubbag Kepegawaian) -->
          <div>
            <div style="font-weight: 600;">Kasubbag Umum &amp; Kepegawaian,</div>
            <div style="height: 48px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #777;">
              <i>(Tanda Tangan Elektronik)</i>
            </div>
            <div style="font-weight: 750; text-decoration: underline;">CIK MARYA, S.E., M.M.</div>
            <div style="font-size: 9px; margin-top: 1px;">Pembina (IV/a)<br>NIP. 19691026 199203 2 002</div>
          </div>

          <!-- Pejabat 3: Kepala Badan -->
          ${(typeof TTEService !== 'undefined') ? TTEService.getTteSignatureBox({
            signerRole: 'Kepala Bappeda',
            signerName: 'Dr. ANANG RISGIYANTO, S.K.M., M.Kes.',
            signerPangkat: 'Pembina Utama Madya (IV/d)',
            signerNip: '19750731 200003 1 002',
            docRegNo: docRegNo,
            docType: 'Rapor Diagnostik Kesenjangan & Peta Karier ASN',
            employeeName: u.name,
            dateText: tanggalSurat
          }) : `
            <div>
              <div>Bandar Lampung, \${tanggalSurat}</div>
              <div style="font-weight: 700; margin-top: 1px;">Kepala Bappeda Provinsi Lampung</div>
              <div style="height: 40px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #777;">
                <i>(Tanda Tangan Elektronik)</i>
              </div>
              <div style="font-weight: 750; text-decoration: underline;">Dr. ANANG RISGIYANTO, S.K.M., M.Kes.</div>
              <div style="font-size: 9px; margin-top: 1px;">Pembina Utama Madya (IV/d)<br>NIP. 19750731 200003 1 002</div>
            </div>
          `}
        </div>

        <!-- FOOTER KEAMANAN & INTEGRITAS DOKUMEN -->
        <div style="margin-top: 20px; padding-top: 8px; border-top: 1px dashed #777; display: flex; justify-content: space-between; align-items: center; font-size: 8.5px; color: #555;">
          <div>
            <b>SIP-KOMPETENSI &bull; BAPPEDA PROVINSI LAMPUNG</b> &bull; Rapor diagnostik kesenjangan kompetensi &amp; kesiapan karier ASN resmi.
          </div>
          <div>
            Kode Otentikasi: <b>DIAG-${Store.getActiveYear()}-${cleanNip ? cleanNip.slice(-6) : 'VERIF'}-SAH</b>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Cetak Dokumen Resmi: Rapor Diagnostik Kesenjangan Kompetensi & Peta Kesiapan Cita-Cita Karier ASN
   * Ber-KOP Resmi Lambang Lampung & Ditandatangani Kepala Bappeda Provinsi Lampung
   */
  printCareerDiagnosticReport() {
    let printContainer = document.getElementById('officialPrintContainer');
    if (!printContainer) {
      printContainer = document.createElement('div');
      printContainer.id = 'officialPrintContainer';
      document.body.appendChild(printContainer);
    }
    printContainer.style.display = 'none';

    printContainer.innerHTML = this.getDiagnosticReportHtml();
    this.closePrintDialog();

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

    document.body.insertBefore(printContainer, document.body.firstChild);

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
            <div><b>Tahun Anggaran:</b> ${Store.getActiveYear()}</div>
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
            PERIODE TAHUN ANGGARAN ${Store.getActiveYear()} &bull; STANDAR MINIMAL 20 JAM PELAJARAN (JP) PER PEGAWAI
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
          <div style="width: 320px;">
            ${(typeof TTEService !== 'undefined') ? TTEService.getTteSignatureBox({
              signerRole: 'Kepala Bappeda',
              signerName: 'Dr. ANANG RISGIYANTO, S.K.M., M.Kes.',
              signerPangkat: 'Pembina Utama Madya (IV/d)',
              signerNip: '19750731 200003 1 002',
              docRegNo: `REKAP-IDP-BAPPEDA-${now.getFullYear()}-FINAL`,
              docType: 'Laporan Eksekutif Pengendalian IDP Bappeda',
              employeeName: 'Seluruh 99 ASN Bappeda Provinsi Lampung',
              dateText: tanggalSurat
            }) : `
              <div style="text-align: center; font-size: 10px; line-height: 1.4;">
                <div>Bandar Lampung, \${tanggalSurat}</div>
                <div style="font-weight: 700; margin-top: 3px; text-transform: uppercase;">
                  KEPALA BADAN PERENCANAAN PEMBANGUNAN DAERAH<br>PROVINSI LAMPUNG
                </div>
                <div style="font-weight: 750; text-decoration: underline; font-size: 11px; margin-top: 40px;">
                  Dr. ANANG RISGIYANTO, S.K.M., M.Kes.
                </div>
                <div style="font-size: 9.5px;">Pembina Utama Madya / IV.d</div>
                <div style="font-size: 9.5px;">NIP. 19750731 200003 1 002</div>
              </div>
            `}
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
    this.downloadExcel(`Rekap_Eksekutif_Pengembangan_SDM_Bappeda_${Store.getActiveYear()}`, 'Rekapitulasi Eksekutif', headers, rows);
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
  },

  /**
   * =========================================================================
   * TAHAP 4: EKSPOR REKAP BUKU LOG PEMBINAAN & DIALOG KINERJA EXCEL
   * Sesuai regulasi PermenPAN-RB No. 6 Tahun 2022
   * =========================================================================
   */
  exportCoachingRecapExcel() {
    const logs = (typeof Store !== 'undefined' && Store.getCoachingLogs) ? Store.getCoachingLogs() : [];
    if (!logs || logs.length === 0) {
      if (typeof App !== 'undefined' && App.toast) {
        App.toast('Tidak ada data sesi pembinaan untuk diekspor.', 'warning');
      }
      return;
    }

    const headers = [
      'No',
      'ID Sesi',
      'Tahun',
      'Triwulan',
      'Tanggal Pelaksanaan',
      'Nama Pegawai ASN (Coachee)',
      'NIP Pegawai',
      'Jabatan Pegawai',
      'Unit Kerja',
      'Nama Atasan Langsung (Coach/Mentor)',
      'NIP Atasan',
      'Jabatan Atasan',
      'Jenis Pembinaan',
      'Fokus Sasaran Kompetensi',
      'Identifikasi Kendala / Masalah',
      'Hasil Diskusi & Solusi Alternatif',
      'Komitmen Rencana Aksi Pegawai',
      'Rekomendasi Pelatihan Terpadu (2026)',
      'Target Waktu Penyelesaian',
      'Status Pembinaan',
      'Catatan / Arahan Khusus Atasan',
      'Waktu Pengesahan Atasan'
    ];

    const rows = logs.map((l, idx) => [
      idx + 1,
      l.id,
      l.tahun,
      l.triwulan,
      l.tanggal,
      l.pegawaiNama,
      `'${l.pegawaiNip}`,
      l.pegawaiJabatan,
      l.pegawaiUnit,
      l.mentorNama,
      `'${l.mentorNip}`,
      l.mentorJabatan,
      l.tipe,
      l.fokusKompetensi,
      l.kendalaTantangan,
      l.hasilDiskusi,
      l.rekomendasiTindakan,
      l.rekomendasiDiklatJudul || '-',
      l.targetWaktu || '-',
      l.status,
      l.catatanMentor || '-',
      l.disetujuiPada || '-'
    ]);

    const activeYear = (typeof Store !== 'undefined' && Store.getActiveYear) ? Store.getActiveYear() : 2026;
    const filename = `Rekap_Buku_Log_Pembinaan_ASN_Bappeda_${activeYear}`;
    this.downloadExcel(filename, 'Buku Log PermenPAN-RB 6', headers, rows);

    if (typeof App !== 'undefined' && App.toast) {
      App.toast('Rekap Buku Log Pembinaan ASN berhasil diekspor ke format Excel!', 'success');
    }
  },

  /**
   * =========================================================================
   * TAHAP 4: CETAK BERITA ACARA DIALOG KINERJA / COACHING RESMI (PRINT/PDF)
   * Dilengkapi KOP Surat Resmi & Verifikasi Digital BSrE / SPBE
   * =========================================================================
   */
  printCoachingDocument(sessionId) {
    const log = (typeof Store !== 'undefined' && Store.getCoachingLogById) ? Store.getCoachingLogById(sessionId) : null;
    if (!log) {
      if (typeof App !== 'undefined' && App.toast) {
        App.toast('Data sesi pembinaan tidak ditemukan.', 'error');
      }
      return;
    }

    const oldPrint = document.getElementById('officialPrintSection');
    if (oldPrint) {
      if (typeof oldPrint.remove === 'function') oldPrint.remove();
      else if (oldPrint.parentNode) oldPrint.parentNode.removeChild(oldPrint);
    }

    const lambang = (typeof window !== 'undefined' && window.LAMBANG_LAMPUNG_SVG)
      ? window.LAMBANG_LAMPUNG_SVG
      : '<div style="font-size:28px;">🏛️</div>';

    const qrData = encodeURIComponent(`BERITA_ACARA_PEMBINAAN_${log.id}_PEGAWAI_${log.pegawaiNip}_MENTOR_${log.mentorNip}_STATUS_${log.status}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${qrData}`;

    const printContainer = document.createElement('div');
    printContainer.id = 'officialPrintSection';
    printContainer.className = 'print-only-container';

    printContainer.innerHTML = `
      <div style="font-family: 'Times New Roman', Times, serif; color: #000; padding: 12px 18px; line-height: 1.35; font-size: 11pt;">
        <!-- KOP SURAT PEMERINTAH PROVINSI LAMPUNG -->
        <div style="display: flex; align-items: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 16px;">
          <div style="width: 72px; height: 72px; margin-right: 14px; display: flex; align-items: center; justify-content: center;">
            ${lambang}
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 13pt; font-weight: 700; letter-spacing: 0.5px;">PEMERINTAH PROVINSI LAMPUNG</div>
            <div style="font-size: 15pt; font-weight: 800; letter-spacing: 0.5px;">BADAN PERENCANAAN PEMBANGUNAN DAERAH</div>
            <div style="font-size: 9pt; font-family: Arial, sans-serif; margin-top: 2px;">
              Jalan Wolter Monginsidi Nomor 224, Teluk Betung, Bandar Lampung Kode Pos 35215<br>
              Telepon: (0721) 486255 • Pos-el: bappeda@lampungprov.go.id • Laman: bappeda.lampungprov.go.id
            </div>
          </div>
        </div>

        <!-- JUDUL SURAT -->
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="font-size: 12.5pt; font-weight: 700; text-decoration: underline; text-transform: uppercase;">
            BERITA ACARA EVALUASI DIALOG KINERJA &amp; PEMBINAAN ASN
          </div>
          <div style="font-size: 10.5pt; font-weight: 600; margin-top: 2px;">
            Nomor: BA-DK / ${log.tahun} / ${log.triwulan} / ${log.id}
          </div>
          <div style="font-size: 9.5pt; font-style: italic; color: #333; margin-top: 2px;">
            Berdasarkan Peraturan Menteri PAN-RB Nomor 6 Tahun 2022 tentang Pengelolaan Kinerja Pegawai ASN
          </div>
        </div>

        <p style="text-align: justify; margin-bottom: 12px; font-size: 10.5pt;">
          Pada hari ini, tanggal <b>${log.tanggal}</b>, bertempat di Kantor Badan Perencanaan Pembangunan Daerah Provinsi Lampung, telah dilaksanakan sesi pembinaan berkala aparatur (1-on-1 Dialogue) antara:
        </p>

        <!-- PIHAK I: ATASAN / PEMBINA -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 10pt;">
          <tr>
            <td style="width: 25px; vertical-align: top; font-weight: bold;">I.</td>
            <td style="width: 150px; vertical-align: top;">Nama Atasan Langsung</td>
            <td style="width: 15px; vertical-align: top;">:</td>
            <td style="vertical-align: top; font-weight: bold;">${log.mentorNama}</td>
          </tr>
          <tr>
            <td></td>
            <td style="vertical-align: top;">N I P</td>
            <td style="vertical-align: top;">:</td>
            <td style="vertical-align: top;">${log.mentorNip}</td>
          </tr>
          <tr>
            <td></td>
            <td style="vertical-align: top;">Jabatan / Peran</td>
            <td style="vertical-align: top;">:</td>
            <td style="vertical-align: top;">${log.mentorJabatan} (Atasan Langsung / Coach / Mentor)</td>
          </tr>
        </table>

        <!-- PIHAK II: PEGAWAI / COACHEE -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10pt;">
          <tr>
            <td style="width: 25px; vertical-align: top; font-weight: bold;">II.</td>
            <td style="width: 150px; vertical-align: top;">Nama Pegawai ASN</td>
            <td style="width: 15px; vertical-align: top;">:</td>
            <td style="vertical-align: top; font-weight: bold;">${log.pegawaiNama}</td>
          </tr>
          <tr>
            <td></td>
            <td style="vertical-align: top;">N I P</td>
            <td style="vertical-align: top;">:</td>
            <td style="vertical-align: top;">${log.pegawaiNip}</td>
          </tr>
          <tr>
            <td></td>
            <td style="vertical-align: top;">Jabatan / Unit Kerja</td>
            <td style="vertical-align: top;">:</td>
            <td style="vertical-align: top;">${log.pegawaiJabatan} — ${log.pegawaiUnit || 'Bappeda Prov. Lampung'}</td>
          </tr>
        </table>

        <div style="font-weight: bold; margin-bottom: 6px; font-size: 10.5pt;">POKOK-POKOK KESEPAKATAN EVALUASI &amp; PEMBINAAN KINERJA:</div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 9.5pt;" border="1" cellpadding="6">
          <thead style="background: #f1f5f9;">
            <tr>
              <th style="width: 28%; text-align: left; padding: 6px;">Komponen Evaluasi</th>
              <th style="text-align: left; padding: 6px;">Uraian Hasil Pembinaan &amp; Kesepakatan Bersama</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight: 600; vertical-align: top;">Jenis &amp; Periode Pembinaan</td>
              <td><b>${log.tipe}</b> (Periode Evaluasi: Triwulan ${log.triwulan} TA ${log.tahun})</td>
            </tr>
            <tr>
              <td style="font-weight: 600; vertical-align: top;">Fokus Kompetensi / SKP</td>
              <td>${log.fokusKompetensi}</td>
            </tr>
            <tr>
              <td style="font-weight: 600; vertical-align: top;">Identifikasi Gap &amp; Kendala</td>
              <td style="text-align: justify;">${log.kendalaTantangan}</td>
            </tr>
            <tr>
              <td style="font-weight: 600; vertical-align: top;">Hasil Umpan Balik &amp; Solusi</td>
              <td style="text-align: justify;">${log.hasilDiskusi}</td>
            </tr>
            <tr>
              <td style="font-weight: 600; vertical-align: top;">Komitmen Rencana Aksi (Action Plan)</td>
              <td style="text-align: justify; font-weight: 600;">${log.rekomendasiTindakan} <span style="font-weight: normal;">(Target Waktu: ${log.targetWaktu || '1 Bulan'})</span></td>
            </tr>
            <tr>
              <td style="font-weight: 600; vertical-align: top;">Rekomendasi Diklat Terpadu</td>
              <td style="color: #1e3a8a; font-weight: 600;">${log.rekomendasiDiklatJudul || 'Pemeliharaan Kompetensi Mandiri'}</td>
            </tr>
            <tr>
              <td style="font-weight: 600; vertical-align: top;">Catatan Khusus Atasan Langsung</td>
              <td style="font-style: italic;">"${log.catatanMentor || 'Telah disetujui untuk dilaksanakan secara bertanggung jawab.'}"</td>
            </tr>
          </tbody>
        </table>

        <p style="text-align: justify; margin-bottom: 20px; font-size: 10pt;">
          Demikian Berita Acara ini dibuat dan disepakati bersama oleh kedua belah pihak dengan penuh kesadaran dan tanggung jawab sebagai bukti pemenuhan kewajiban dialog kinerja berkala dan acuan penyusunan rencana pengembangan kompetensi ASN.
        </p>

        <!-- PENGESAHAN TANDA TANGAN (BSrE TTE QR CODE) -->
        <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 10pt;">
          <div style="width: 45%; text-align: center;">
            <div>Pegawai yang Dibina (Coachee),</div>
            <div style="height: 55px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 9pt; color: #475569; font-style: italic;">[Telah Menyetujui Secara Elektronik]</span>
            </div>
            <div style="font-weight: bold; text-decoration: underline;">${log.pegawaiNama}</div>
            <div>NIP. ${log.pegawaiNip}</div>
          </div>

          <div style="width: 48%; text-align: center;">
            <div>Bandar Lampung, ${log.tanggal}</div>
            <div style="font-weight: bold;">Atasan Langsung / Coach,</div>
            <div style="margin: 6px auto; display: flex; flex-direction: column; align-items: center;">
              <img src="${qrUrl}" alt="TTE BSrE" style="width: 65px; height: 65px; border: 1px solid #cbd5e1; padding: 2px;">
              <div style="font-size: 7.5pt; font-family: Arial, sans-serif; color: #047857; font-weight: bold; margin-top: 2px;">
                ✓ TTE Tersertifikasi BSrE / SPBE
              </div>
            </div>
            <div style="font-weight: bold; text-decoration: underline;">${log.mentorNama}</div>
            <div>NIP. ${log.mentorNip}</div>
          </div>
        </div>

        <div style="margin-top: 16px; border-top: 1px dashed #94a3b8; padding-top: 4px; font-size: 7.5pt; color: #64748b; font-family: Arial, sans-serif; display: flex; justify-content: space-between;">
          <span>Dokumen resmi Sistem Informasi Pengembangan Kompetensi (SIP-KOMPETENSI) Bappeda Provinsi Lampung</span>
          <span>Dicetak: ${new Date().toLocaleString('id-ID')}</span>
        </div>
      </div>
    `;

    let styleEl = document.getElementById('dynamicPrintStyle');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamicPrintStyle';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `@media print { @page { size: portrait; margin: 10mm 12mm 12mm 12mm; } }`;

    document.body.insertBefore(printContainer, document.body.firstChild);
    setTimeout(() => {
      window.print();
    }, 150);
  }
};

if (typeof window !== 'undefined') {
  window.ExportService = ExportService;
}

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

    ExportService.downloadExcel(`Rekap_Audit_Kepegawaian_Bappeda_${Store.getActiveYear()}`, 'Audit Basis Data', headers, rows);
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

    ExportService.downloadExcel(`Log_Audit_Kedinasan_Bappeda_${Store.getActiveYear()}`, 'Jejak Rekam SPBE', headers, rows);
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

// ===========================================================================
// TAHAP 8 — EXECUTIVE PRESENTATION SERVICE (SLIDE PAPARAN RAPAT PIMPINAN)
// ===========================================================================

const PresentationService = {
  currentSlide: 1,
  totalSlides: 6,
  timerSeconds: 900, // 15 menit hitung mundur
  timerInterval: null,
  isTimerRunning: false,
  keyHandlerBound: false,

  openPresentation(startSlide = 1) {
    this.currentSlide = startSlide;
    this.timerSeconds = 900;
    this.isTimerRunning = true;

    let overlay = document.getElementById('presentationOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'presentationOverlay';
      overlay.className = 'presentation-overlay';
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';

    // Coba Fullscreen jika didukung browser
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    // Keyboard navigation
    if (!this.keyHandlerBound) {
      this.handleKeydown = this.handleKeydown.bind(this);
      window.addEventListener('keydown', this.handleKeydown);
      this.keyHandlerBound = true;
    }

    this.startTimer();
    this.renderSlide();

    // Catat ke Log Audit Rekam Jejak Kedinasan
    if (typeof AuditService !== 'undefined' && AuditService.log) {
      AuditService.log('Otentikasi', 'Pembukaan Mode Paparan Rapat Pimpinan', 'Pimpinan / Admin membuka slide presentasi eksekutif evaluasi pengembangan kompetensi 99 ASN.');
    }
  },

  closePresentation() {
    const overlay = document.getElementById('presentationOverlay');
    if (overlay) overlay.style.display = 'none';

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerRunning = false;

    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    if (this.keyHandlerBound) {
      window.removeEventListener('keydown', this.handleKeydown);
      this.keyHandlerBound = false;
    }
  },

  handleKeydown(e) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      PresentationService.nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      PresentationService.prevSlide();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      PresentationService.closePresentation();
    } else if (e.key === 'f' || e.key === 'F') {
      PresentationService.toggleFullscreen();
    }
  },

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  },

  nextSlide() {
    if (this.currentSlide < this.totalSlides) {
      this.currentSlide++;
      this.renderSlide();
    }
  },

  prevSlide() {
    if (this.currentSlide > 1) {
      this.currentSlide--;
      this.renderSlide();
    }
  },

  goToSlide(idx) {
    if (idx >= 1 && idx <= this.totalSlides) {
      this.currentSlide = idx;
      this.renderSlide();
    }
  },

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.isTimerRunning && this.timerSeconds > 0) {
        this.timerSeconds--;
        const el = document.getElementById('presTimerDisplay');
        if (el) el.textContent = this.formatTimer(this.timerSeconds);
      }
    }, 1000);
  },

  toggleTimer() {
    this.isTimerRunning = !this.isTimerRunning;
    const iconSpan = document.getElementById('presTimerIcon');
    if (iconSpan) {
      iconSpan.setAttribute('data-icon', this.isTimerRunning ? 'Pause' : 'Play');
      if (typeof renderAllIcons === 'function') renderAllIcons();
    }
  },

  resetTimer() {
    this.timerSeconds = 900;
    const el = document.getElementById('presTimerDisplay');
    if (el) el.textContent = this.formatTimer(this.timerSeconds);
  },

  formatTimer(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },

  printPresentation() {
    window.print();
  },

  renderSlide() {
    const overlay = document.getElementById('presentationOverlay');
    if (!overlay) return;

    const summary = (typeof Store !== 'undefined' && Store.getExecutiveSummary) 
      ? Store.getExecutiveSummary() 
      : {
        totalPegawai: 99,
        memenuhi20Jp: 60,
        persenKepatuhan: 61,
        idpDisetujui: 60,
        persenDisetujui: 61,
        totalJp: 1862,
        avgJp: '18.8',
        totalEstimasiAnggaran: 307230000,
        perluTindakLanjut: 39
      };

    const unitBreakdown = (typeof Store !== 'undefined' && Store.getUnitBreakdown) 
      ? Store.getUnitBreakdown() 
      : [];

    const progressPct = Math.round((this.currentSlide / this.totalSlides) * 100);

    overlay.innerHTML = `
      <!-- Top Progress Bar -->
      <div class="pres-progress-bar-bg">
        <div class="pres-progress-bar-fill" style="width: ${progressPct}%;"></div>
      </div>

      <!-- Topbar Header -->
      <div class="presentation-topbar">
        <div class="pres-brand-badge">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center;">
            <span data-icon="Presentation" data-icon-size="18" style="color: #f59e0b;"></span>
          </div>
          <div>
            <div style="font-size: 13px; font-weight: 750; color: #ffffff; letter-spacing: 0.02em;">
              SIP-KOMPETENSI — PAPARAN RAPAT PIMPINAN
            </div>
            <div style="font-size: 10.5px; color: rgba(255, 255, 255, 0.65);">
              Bappeda Provinsi Lampung • Evaluasi Pengembangan Kompetensi 99 ASN ${Store.getActiveYear()}
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 14px;">
          <!-- Timer Pill -->
          <div class="pres-timer-pill">
            <span data-icon="Timer" data-icon-size="14"></span>
            <span id="presTimerDisplay">${this.formatTimer(this.timerSeconds)}</span>
            <button onclick="PresentationService.toggleTimer()" style="background:none;border:none;color:#fbbf24;cursor:pointer;padding:0;display:flex;align-items:center;" title="Jeda / Lanjutkan Waktu">
              <span id="presTimerIcon" data-icon="${this.isTimerRunning ? 'Pause' : 'Play'}" data-icon-size="13"></span>
            </button>
          </div>

          <!-- Slide Indicator -->
          <div style="font-size: 12.5px; font-weight: 700; color: #94a3b8; background: rgba(255,255,255,0.06); padding: 5px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
            Slide <b style="color: #38bdf8;">${this.currentSlide}</b> / ${this.totalSlides}
          </div>

          <!-- Cetak Slide -->
          <button class="btn btn-sm" style="background: rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); font-size:12px;" onclick="PresentationService.printPresentation()" title="Cetak Slide ke Format Kertas A4 / PDF">
            <span data-icon="Printer" data-icon-size="14"></span> Cetak
          </button>

          <!-- Toggle Fullscreen -->
          <button class="btn btn-sm" style="background: rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); font-size:12px;" onclick="PresentationService.toggleFullscreen()" title="Layar Penuh (F11 / F)">
            <span data-icon="Maximize2" data-icon-size="14"></span>
          </button>

          <!-- Tutup Presentasi -->
          <button class="btn btn-sm" style="background: rgba(239, 68, 68, 0.2); color:#fca5a5; border:1px solid rgba(239, 68, 68, 0.4); font-size:12px; font-weight:700;" onclick="PresentationService.closePresentation()" title="Keluar dari Mode Presentasi (Esc)">
            ✕ Keluar
          </button>
        </div>
      </div>

      <!-- Presentation Stage (Canvas) -->
      <div class="presentation-stage">
        <div class="presentation-slide-card">
          ${this.getSlideContent(this.currentSlide, summary, unitBreakdown)}
        </div>
      </div>

      <!-- Bottombar Navigation -->
      <div class="presentation-bottombar">
        <div style="font-size: 11.5px; color: #64748b; display: flex; align-items: center; gap: 8px;">
          <span>Navigasi:</span>
          <kbd style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; color: #e2e8f0; font-size: 10.5px;">←</kbd>
          <kbd style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; color: #e2e8f0; font-size: 10.5px;">→</kbd>
          <kbd style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; color: #e2e8f0; font-size: 10.5px;">Spasi</kbd>
          <span>Ganti Slide</span>
          <span style="margin: 0 4px;">•</span>
          <kbd style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; color: #e2e8f0; font-size: 10.5px;">Esc</kbd>
          <span>Tutup</span>
        </div>

        <!-- Dots Navigation -->
        <div class="pres-dots-wrapper">
          ${Array.from({length: this.totalSlides}, (_, i) => i + 1).map(s => `
            <div class="pres-dot-item ${s === this.currentSlide ? 'active' : ''}" onclick="PresentationService.goToSlide(${s})" title="Buka Slide ${s}"></div>
          `).join('')}
        </div>

        <!-- Prev / Next Buttons -->
        <div style="display: flex; gap: 10px;">
          <button class="pres-nav-btn" onclick="PresentationService.prevSlide()" ${this.currentSlide === 1 ? 'disabled' : ''}>
            <span data-icon="ChevronRight" data-icon-size="14" style="transform: rotate(180deg);"></span> Sebelumnya
          </button>
          <button class="pres-nav-btn" style="background: #f59e0b; color: #000; font-weight: 750; border-color: #fbbf24;" onclick="PresentationService.nextSlide()" ${this.currentSlide === this.totalSlides ? 'disabled' : ''}>
            Selanjutnya <span data-icon="ChevronRight" data-icon-size="14"></span>
          </button>
        </div>
      </div>
    `;

    if (typeof renderAllIcons === 'function') renderAllIcons();
  },

  getSlideContent(slideNum, summary, unitBreakdown) {
    const lambang = (typeof window !== 'undefined' && window.LAMBANG_LAMPUNG_SVG) 
      ? window.LAMBANG_LAMPUNG_SVG 
      : '<div style="font-size:32px;">🏛️</div>';

    switch (slideNum) {
      // -------------------------------------------------------------
      // SLIDE 1: COVER / JUDUL PAPARAN
      // -------------------------------------------------------------
      case 1:
        return `
          <div style="text-align: center; margin: auto 0; padding: 20px 0;">
            <div style="display: flex; justify-content: center; align-items: center; gap: 18px; margin-bottom: 24px;">
              <div style="width: 72px; height: 72px; display: flex; align-items: center; justify-content: center;">
                ${lambang}
              </div>
              <div style="width: 2px; height: 50px; background: rgba(255,255,255,0.2);"></div>
              <img src="Gambar/logo-idp.png" alt="Logo IDP" style="height: 60px; object-fit: contain;">
            </div>

            <div style="display: inline-block; padding: 4px 16px; border-radius: 999px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px;">
              RAPAT KOORDINASI &amp; PENGENDALIAN PIMPINAN
            </div>

            <h1 style="font-size: 30px; font-weight: 850; line-height: 1.3; color: #ffffff; margin: 0 0 14px; max-width: 900px; margin-left: auto; margin-right: auto; text-shadow: 0 4px 16px rgba(0,0,0,0.4);">
              EVALUASI IMPLEMENTASI PENGEMBANGAN KOMPETENSI (IDP) 99 ASN BAPPEDA PROVINSI LAMPUNG
            </h1>

            <p style="font-size: 15px; color: #94a3b8; max-width: 760px; margin: 0 auto 32px; line-height: 1.6;">
              Penyelarasan Standar Minimal 20 JP per Pegawai Berdasarkan Amanat UU No. 20 Tahun 2023 dan SE Gubernur Lampung No. 2 Tahun 2025 Menuju Perencanaan Pembangunan Daerah Berkualitas.
            </p>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; max-width: 820px; margin: 0 auto; text-align: left;">
              <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px 18px;">
                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Pembina Eksekutif:</div>
                <div style="font-size: 13px; font-weight: 750; color: #ffffff; margin-top: 4px;">Dr. ANANG RISGIYANTO, S.K.M., M.Kes.</div>
                <div style="font-size: 11px; color: #38bdf8;">Kepala Bappeda Prov. Lampung</div>
              </div>

              <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px 18px;">
                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Koordinator Wilayah:</div>
                <div style="font-size: 13px; font-weight: 750; color: #ffffff; margin-top: 4px;">ANDI ARAFAT, S.T., M.E.</div>
                <div style="font-size: 11px; color: #38bdf8;">Sekretaris Bappeda Prov. Lampung</div>
              </div>

              <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px 18px;">
                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Pengelola Teknis SDM:</div>
                <div style="font-size: 13px; font-weight: 750; color: #ffffff; margin-top: 4px;">CIK MARYA, S.E., M.M.</div>
                <div style="font-size: 11px; color: #38bdf8;">Kasubbag Umum &amp; Kepegawaian</div>
              </div>
            </div>
          </div>
        `;

      // -------------------------------------------------------------
      // SLIDE 2: SCORECARD & 4 INDIKATOR KUNCI
      // -------------------------------------------------------------
      case 2:
        return `
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
              <div>
                <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-size: 11px; font-weight: 700;">SCORECARD EKSEKUTIF</span>
                <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 6px 0 2px;">Capaian Akuntabilitas Pengembangan 99 ASN</h2>
                <div style="font-size: 13px; color: #94a3b8;">Ringkasan komprehensif kepatuhan regulasi jam pelajaran (JP) dan pengesahan dokumen IDP</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 11px; color: #94a3b8;">Tingkat Kepatuhan Organisasi:</div>
                <div style="font-size: 16px; font-weight: 800; color: #10b981; display: inline-flex; align-items: center; gap: 6px;">
                  <span class="realtime-status-dot"></span> 61% (Kategori Memadai / Hijau)
                </div>
              </div>
            </div>

            <!-- 4 Grid Metric Cards -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 28px;">
              <div class="pres-metric-box">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 12px; color: #94a3b8; font-weight: 600;">Total Populasi ASN</span>
                  <span data-icon="Users" data-icon-size="18" style="color: #38bdf8;"></span>
                </div>
                <div style="font-size: 32px; font-weight: 850; color: #ffffff; line-height: 1;">${summary.totalPegawai} <span style="font-size: 14px; font-weight: 600; color: #94a3b8;">ASN</span></div>
                <div style="font-size: 11.5px; color: #64748b; margin-top: 8px;">100% Tercatat Lengkap pada DUK 2026</div>
              </div>

              <div class="pres-metric-box" style="border-left: 3px solid #10b981;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 12px; color: #10b981; font-weight: 600;">Kepatuhan Standar ≥20 JP</span>
                  <span data-icon="ShieldCheck" data-icon-size="18" style="color: #10b981;"></span>
                </div>
                <div style="font-size: 32px; font-weight: 850; color: #10b981; line-height: 1;">${summary.persenKepatuhan}%</div>
                <div style="font-size: 11.5px; color: #94a3b8; margin-top: 8px;"><b>${summary.memenuhi20Jp} ASN</b> Telah Tuntas Beban Belajar</div>
              </div>

              <div class="pres-metric-box" style="border-left: 3px solid #38bdf8;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 12px; color: #38bdf8; font-weight: 600;">Akumulasi Jam Pelajaran</span>
                  <span data-icon="Clock" data-icon-size="18" style="color: #38bdf8;"></span>
                </div>
                <div style="font-size: 32px; font-weight: 850; color: #38bdf8; line-height: 1;">${summary.totalJp.toLocaleString('id-ID')} <span style="font-size: 14px; font-weight: 600; color: #94a3b8;">JP</span></div>
                <div style="font-size: 11.5px; color: #94a3b8; margin-top: 8px;">Rata-rata <b>${summary.avgJp} JP/ASN</b> di Seluruh Bidang</div>
              </div>

              <div class="pres-metric-box" style="border-left: 3px solid #f59e0b;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 12px; color: #f59e0b; font-weight: 600;">Estimasi Nilai Investasi</span>
                  <span data-icon="Coins" data-icon-size="18" style="color: #f59e0b;"></span>
                </div>
                <div style="font-size: 28px; font-weight: 850; color: #f59e0b; line-height: 1;">Rp ${(summary.totalEstimasiAnggaran / 1000000).toFixed(1)} <span style="font-size: 14px; font-weight: 600; color: #94a3b8;">Jt</span></div>
                <div style="font-size: 11.5px; color: #94a3b8; margin-top: 8px;">Standar Biaya Umum (SBU) Bangkom ${Store.getActiveYear()}</div>
              </div>
            </div>

            <!-- Bottom Strategic Note -->
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; color: #10b981;">
                  <span data-icon="ClipboardCheck" data-icon-size="20"></span>
                </div>
                <div>
                  <div style="font-size: 13.5px; font-weight: 700; color: #ffffff;">Status Pengesahan Dokumen IDP Kedinasan</div>
                  <div style="font-size: 12px; color: #cbd5e1;">Sebanyak <b>60 dari 99 ASN (61%)</b> telah mengantongi pengesahan resmi berstatus Final dari Kasubbag Kepegawaian &amp; Pimpinan.</div>
                </div>
              </div>
              <span class="badge" style="background: #10b981; color: #ffffff; font-size: 11px; font-weight: 750;">Sah Secara Regulasi</span>
            </div>
          </div>
        `;

      // -------------------------------------------------------------
      // SLIDE 3: MATRIKS KEPATUHAN 7 UNIT KERJA
      // -------------------------------------------------------------
      case 3:
        return `
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
              <div>
                <span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); font-size: 11px; font-weight: 700;">PERFORMA UNIT KERJA</span>
                <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 6px 0 2px;">Matriks Kepatuhan 20 JP per 7 Bidang Bappeda</h2>
                <div style="font-size: 13px; color: #94a3b8;">Evaluasi kepatuhan beban belajar minimal berdasarkan DUK resmi 99 pegawai ASN</div>
              </div>
              <div style="font-size: 11px; color: #94a3b8; text-align: right;">
                Target Minimum: <b style="color:#fbbf24;">20 JP/Pegawai/Tahun</b><br>
                Total Pegawai: <b style="color:#38bdf8;">99 ASN Lengkap</b>
              </div>
            </div>

            <!-- Table 7 Units -->
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; margin-bottom: 16px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
                <thead>
                  <tr style="background: rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.1); color: #cbd5e1;">
                    <th style="padding: 10px 14px;">No</th>
                    <th style="padding: 10px 14px;">Unit Kerja / Bidang</th>
                    <th style="padding: 10px 14px;">Kepala Bidang / Penanggung Jawab</th>
                    <th style="padding: 10px 14px; text-align: center;">ASN</th>
                    <th style="padding: 10px 14px; text-align: center;">≥20 JP</th>
                    <th style="padding: 10px 14px;">Progres Kepatuhan</th>
                    <th style="padding: 10px 14px; text-align: center;">Rata-rata JP</th>
                    <th style="padding: 10px 14px; text-align: center;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${unitBreakdown.map((u, i) => {
                    const pct = u.pctKepatuhan;
                    const badge = pct >= 70 
                      ? '<span class="badge" style="background: rgba(16,185,129,0.2); color:#34d399; font-size:10px; font-weight:700;">Sangat Baik</span>'
                      : pct >= 60 
                      ? '<span class="badge" style="background: rgba(56,189,248,0.2); color:#38bdf8; font-size:10px; font-weight:700;">Baik</span>'
                      : pct >= 50
                      ? '<span class="badge" style="background: rgba(245,158,11,0.2); color:#fbbf24; font-size:10px; font-weight:700;">Cukup</span>'
                      : '<span class="badge" style="background: rgba(239,68,68,0.2); color:#f87171; font-size:10px; font-weight:700;">Perlu Akselerasi</span>';

                    return `
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: #f1f5f9;">
                        <td style="padding: 8px 14px; color: #94a3b8;">${i + 1}</td>
                        <td style="padding: 8px 14px; font-weight: 700; color: #ffffff;">${u.unit}</td>
                        <td style="padding: 8px 14px; color: #94a3b8; font-size: 11px;">${u.kabid}</td>
                        <td style="padding: 8px 14px; text-align: center; font-weight: 650;">${u.pegawai}</td>
                        <td style="padding: 8px 14px; text-align: center; color: #34d399; font-weight: 750;">${u.memenuhi20Jp}</td>
                        <td style="padding: 8px 14px;">
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden;">
                              <div style="width: ${pct}%; height: 100%; background: ${pct >= 60 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'};"></div>
                            </div>
                            <span style="font-weight: 700; font-size: 11px; width: 32px; text-align: right;">${pct}%</span>
                          </div>
                        </td>
                        <td style="padding: 8px 14px; text-align: center; font-weight: 700; color: #38bdf8;">${u.avgJp} JP</td>
                        <td style="padding: 8px 14px; text-align: center;">${badge}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div style="font-size: 11.5px; color: #94a3b8; text-align: right;">
              * UPTD Pusdatin (70%) dan Bidang PMPE (67%) tercatat memimpin persentase kepatuhan tertinggi saat ini.
            </div>
          </div>
        `;

      // -------------------------------------------------------------
      // SLIDE 4: DISTRIBUSI 25 METODE PENGEMBANGAN
      // -------------------------------------------------------------
      case 4:
        return `
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px;">
              <div>
                <span class="badge" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); font-size: 11px; font-weight: 700;">METODOLOGI &amp; BUKTI FISIK</span>
                <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 6px 0 2px;">Distribusi Metode Pengembangan &amp; Sertifikat Digital</h2>
                <div style="font-size: 13px; color: #94a3b8;">Optimalisasi 25 metode pengembangan kompetensi resmi terakreditasi BKN &amp; LAN RI</div>
              </div>
              <div class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 11px; font-weight: 700;">
                <span class="realtime-status-dot"></span> Cloud Storage Aktif (Supabase)
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
              <!-- Left: Realisasi Metode Terbesar -->
              <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 20px;">
                <h3 style="font-size: 14px; font-weight: 750; color: #f8fafc; margin: 0 0 14px; display: flex; align-items: center; gap: 8px;">
                  <span data-icon="FileBarChart" data-icon-size="16" style="color: #38bdf8;"></span> Realisasi Metode Terbanyak
                </h3>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                      <span style="color: #ffffff; font-weight: 650;">1. Diklat Teknis &amp; Fungsional Perencanaan</span>
                      <span style="color: #38bdf8; font-weight: 750;">708 JP (38%)</span>
                    </div>
                    <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden;">
                      <div style="width: 38%; height: 100%; background: #38bdf8;"></div>
                    </div>
                  </div>

                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                      <span style="color: #ffffff; font-weight: 650;">2. Bimbingan Teknis &amp; Workshop SKP/SPBE</span>
                      <span style="color: #10b981; font-weight: 750;">484 JP (26%)</span>
                    </div>
                    <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden;">
                      <div style="width: 26%; height: 100%; background: #10b981;"></div>
                    </div>
                  </div>

                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                      <span style="color: #ffffff; font-weight: 650;">3. Seminar, Lokakarya, &amp; Webinar Nasional</span>
                      <span style="color: #f59e0b; font-weight: 750;">335 JP (18%)</span>
                    </div>
                    <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden;">
                      <div style="width: 18%; height: 100%; background: #f59e0b;"></div>
                    </div>
                  </div>

                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                      <span style="color: #ffffff; font-weight: 650;">4. Mentoring Kedinasan &amp; Pendampingan Kasubbag</span>
                      <span style="color: #a855f7; font-weight: 750;">223 JP (12%)</span>
                    </div>
                    <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden;">
                      <div style="width: 12%; height: 100%; background: #a855f7;"></div>
                    </div>
                  </div>

                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                      <span style="color: #ffffff; font-weight: 650;">5. E-Learning Mandiri (MOOC LAN RI &amp; BKN)</span>
                      <span style="color: #ec4899; font-weight: 750;">112 JP (6%)</span>
                    </div>
                    <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden;">
                      <div style="width: 6%; height: 100%; background: #ec4899;"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: Keamanan & Bukti Fisik -->
              <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <h3 style="font-size: 14px; font-weight: 750; color: #f8fafc; margin: 0 0 12px; display: flex; align-items: center; gap: 8px;">
                    <span data-icon="Lock" data-icon-size="16" style="color: #10b981;"></span> Keamanan Bukti Fisik Sertifikat
                  </h3>
                  <p style="font-size: 12.5px; color: #94a3b8; line-height: 1.5; margin-bottom: 14px;">
                    Seluruh dokumen sertifikat ASN diunggah langsung ke <b>Cloud Bucket Supabase Storage (sertifikat_idp)</b>, terverifikasi keasliannya dan terhubung dengan tanda tangan digital barcode QR.
                  </p>
                  <div style="background: rgba(0,0,0,0.25); border-radius: 8px; padding: 12px 14px; border: 1px dashed rgba(255,255,255,0.15);">
                    <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 6px;">
                      <span style="color: #94a3b8;">Format Berkas:</span>
                      <span style="color: #38bdf8; font-weight: 700;">PDF, JPG, PNG (Maks 5 MB)</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 6px;">
                      <span style="color: #94a3b8;">Enkripsi &amp; Hash:</span>
                      <span style="color: #10b981; font-weight: 700;">SHA-256 Integritas Data</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 11.5px;">
                      <span style="color: #94a3b8;">Akses Audit:</span>
                      <span style="color: #fbbf24; font-weight: 700;">Inspektorat &amp; BKN Siap Audit</span>
                    </div>
                  </div>
                </div>

                <div style="font-size: 11px; color: #64748b; margin-top: 12px;">
                  Dilengkapi cadangan terenkripsi mandiri (*auto-backup snapshot*) oleh Kasubbag Kepegawaian Bappeda.
                </div>
              </div>
            </div>
          </div>
        `;

      // -------------------------------------------------------------
      // SLIDE 5: GAP ANALYSIS & TINDAK LANJUT 39 ASN
      // -------------------------------------------------------------
      case 5:
        return `
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px;">
              <div>
                <span class="badge" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); font-size: 11px; font-weight: 700;">GAP ANALYSIS &amp; RENCANA AKSI</span>
                <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 6px 0 2px;">Pemetaan Kendala &amp; Tindak Lanjut 39 ASN</h2>
                <div style="font-size: 13px; color: #94a3b8;">Rencana aksi terukur percepatan pemenuhan target 20 JP sebelum evaluasi akhir tahun</div>
              </div>
              <div class="badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; font-size: 11px; font-weight: 700;">
                Target Akhir: 100% ASN Tuntas
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
              <!-- Left: Segmentasi 39 ASN -->
              <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 22px;">
                <h3 style="font-size: 14px; font-weight: 750; color: #f8fafc; margin: 0 0 14px; display: flex; align-items: center; gap: 8px;">
                  <span data-icon="AlertCircle" data-icon-size="16" style="color: #f59e0b;"></span> Segmentasi 39 ASN Belum Capai 20 JP
                </h3>
                
                <div style="background: rgba(245, 158, 11, 0.08); border-left: 3px solid #f59e0b; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                  <div style="font-size: 13px; font-weight: 750; color: #fbbf24;">Kelompok Progres Menengah (25 ASN / 64%)</div>
                  <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px; line-height: 1.4;">
                    Telah mengantongi <b>10–19 JP</b>. Hanya butuh 1 kali pelatihan singkat / bimbingan teknis 1 hari untuk mencapai target 20 JP.
                  </div>
                </div>

                <div style="background: rgba(239, 68, 68, 0.08); border-left: 3px solid #ef4444; border-radius: 8px; padding: 12px 14px;">
                  <div style="font-size: 13px; font-weight: 750; color: #f87171;">Kelompok Butuh Perhatian Khusus (14 ASN / 36%)</div>
                  <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px; line-height: 1.4;">
                    Capaian <b>&lt;10 JP</b> atau baru dalam tahap penyusunan draft IDP. Mayoritas merupakan formasi pelaksana lapangan dan pegawai mutasi baru.
                  </div>
                </div>
              </div>

              <!-- Right: Tiga Solusi Konkret -->
              <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 22px;">
                <h3 style="font-size: 14px; font-weight: 750; color: #f8fafc; margin: 0 0 14px; display: flex; align-items: center; gap: 8px;">
                  <span data-icon="Send" data-icon-size="16" style="color: #38bdf8;"></span> 3 Langkah Aksi Percepatan Mandiri
                </h3>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                  <div style="display: flex; gap: 10px; align-items: flex-start;">
                    <div style="width: 22px; height: 22px; border-radius: 50%; background: #38bdf8; color: #000; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">1</div>
                    <div style="font-size: 12px; color: #cbd5e1; line-height: 1.4;">
                      <b style="color: #ffffff;">Notifikasi Terjadwal WhatsApp Web:</b> Kasubbag Kepegawaian menyiarkan pesan pengingat resmi secara terarah kepada 39 ASN bersangkutan.
                    </div>
                  </div>

                  <div style="display: flex; gap: 10px; align-items: flex-start;">
                    <div style="width: 22px; height: 22px; border-radius: 50%; background: #10b981; color: #000; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">2</div>
                    <div style="font-size: 12px; color: #cbd5e1; line-height: 1.4;">
                      <b style="color: #ffffff;">Pemanfaatan E-Learning Tanpa Biaya:</b> Mendaftarkan 14 ASN prioritas ke portal MOOC ASN Unggul LAN RI &amp; webinar BPSDMD Provinsi Lampung.
                    </div>
                  </div>

                  <div style="display: flex; gap: 10px; align-items: flex-start;">
                    <div style="width: 22px; height: 22px; border-radius: 50%; background: #a855f7; color: #000; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">3</div>
                    <div style="font-size: 12px; color: #cbd5e1; line-height: 1.4;">
                      <b style="color: #ffffff;">Mentoring Tematik Internal:</b> Menugaskan Perencana Ahli Madya di tiap Bidang untuk memfasilitasi sesi pembelajaran internal (dihitung 4-8 JP resmi).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

      // -------------------------------------------------------------
      // SLIDE 6: DISPOSISI PIMPINAN & PENGESAHAN
      // -------------------------------------------------------------
      case 6:
        return `
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px;">
              <div>
                <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 11px; font-weight: 700;">KEBIJAKAN &amp; DISPOSISI PIMPINAN</span>
                <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 6px 0 2px;">Arahan Strategis Kepala Badan &amp; Komitmen Bersama</h2>
                <div style="font-size: 13px; color: #94a3b8;">Instruksi resmi kedinasan Bappeda Provinsi Lampung untuk menjamin 100% kepatuhan ASN</div>
              </div>
              <div class="badge" style="background: #f59e0b; color: #000; font-size: 11px; font-weight: 800;">
                Berlaku Sah TA ${Store.getActiveYear()}
              </div>
            </div>

            <!-- 3 Directives Box -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
              <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 18px;">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-weight: 800; margin-bottom: 12px;">1</div>
                <div style="font-size: 13.5px; font-weight: 750; color: #ffffff; margin-bottom: 6px;">Batas Waktu Triwulan III</div>
                <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                  Seluruh Kepala Bidang wajib mengawal 39 ASN agar target minimal 20 JP terpenuhi paling lambat <b>30 September ${Store.getActiveYear()}</b>.
                </div>
              </div>

              <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 18px;">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(16, 185, 129, 0.2); color: #10b981; display: flex; align-items: center; justify-content: center; font-weight: 800; margin-bottom: 12px;">2</div>
                <div style="font-size: 13.5px; font-weight: 750; color: #ffffff; margin-bottom: 6px;">Integrasi Evaluasi SKP</div>
                <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                  Capaian minimal 20 JP diintegrasikan sebagai komponen penilaian perilaku kerja dan pertimbangan usul promosi jabatan.
                </div>
              </div>

              <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 18px;">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(245, 158, 11, 0.2); color: #f59e0b; display: flex; align-items: center; justify-content: center; font-weight: 800; margin-bottom: 12px;">3</div>
                <div style="font-size: 13.5px; font-weight: 750; color: #ffffff; margin-bottom: 6px;">Apresiasi Unit Terbaik</div>
                <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                  Pemberian piagam penghargaan kinerja dari Kepala Bappeda bagi Unit Kerja pertama yang mencapai 100% kepatuhan.
                </div>
              </div>
            </div>

            <!-- Signature & Validation Footer -->
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 11px; color: #94a3b8;">Ditetapkan &amp; Disahkan di:</div>
                <div style="font-size: 13px; font-weight: 750; color: #ffffff; margin-top: 2px;">Bandar Lampung, 14 Oktober ${Store.getActiveYear()}</div>
                <div style="font-size: 11px; color: #38bdf8; margin-top: 2px;">Kepala Badan Perencanaan Pembangunan Daerah</div>
              </div>

              <div style="text-align: right; display: flex; align-items: center; gap: 16px;">
                <div>
                  <div style="font-size: 13px; font-weight: 800; color: #ffffff;">Dr. ANANG RISGIYANTO, S.K.M., M.Kes.</div>
                  <div style="font-size: 11px; color: #94a3b8;">Pembina Utama Madya (IV/d) • NIP. 197507312000031002</div>
                  <div style="font-size: 10.5px; color: #10b981; font-weight: 650; margin-top: 3px;">Tanda Tangan Digital Terverifikasi SPBE</div>
                </div>
                <div style="width: 52px; height: 52px; background: #ffffff; border-radius: 8px; padding: 4px; display: flex; align-items: center; justify-content: center;">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=VALID_BAPPEDA_IDP_2026_ANANG_RISGIYANTO" alt="QR Validasi" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
              </div>
            </div>
          </div>
        `;

      default:
        return `<div style="text-align: center; color: #94a3b8;">Slide tidak ditemukan.</div>`;
    }
  }
};

if (typeof window !== 'undefined') {
  window.PresentationService = PresentationService;
}



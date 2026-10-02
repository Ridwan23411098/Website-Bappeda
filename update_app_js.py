with open('js/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace renderAdminEmployees block
old_render_employees = """  renderAdminEmployees() {
    const emps = Store.state.employees;
    const tbody = document.getElementById('adminEmployeeTableBody');
    tbody.innerHTML = emps.map(e => `
      <tr>
        <td>
          <div class="table-user-cell">
            <div class="table-user-avatar">${e.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
            <div class="table-user-info">
              <div class="name">${e.name}</div>
              <div class="sub">${e.nip}</div>
            </div>
          </div>
        </td>
        <td>${e.pangkat}</td>
        <td>${e.jabatan}</td>
        <td>${e.unit}</td>
        <td><span class="badge ${e.statusIdp === 'Disetujui' ? 'badge-success' : e.statusIdp === 'Belum' ? 'badge-danger' : 'badge-warning'}">${e.statusIdp}</span></td>
        <td><b>${e.progress}</b></td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="App.toast('Membuka rekam jejak pegawai ${e.name}', 'info')">Detail</button>
        </td>
      </tr>
    `).join('');
  },"""

new_render_employees = """  empPage: 1,
  empPageSize: 15,

  onEmployeeFilterChange() {
    this.empPage = 1;
    this.renderAdminEmployees();
  },

  resetEmployeeFilter() {
    const s = document.getElementById('empSearchInput');
    const u = document.getElementById('empUnitFilter');
    const st = document.getElementById('empStatusFilter');
    if (s) s.value = '';
    if (u) u.value = '';
    if (st) st.value = '';
    this.empPage = 1;
    this.renderAdminEmployees();
    App.toast('Filter data pegawai direset', 'info');
  },

  setEmpPage(p) {
    this.empPage = p;
    this.renderAdminEmployees();
    const tbl = document.getElementById('adminEmployeeTableBody');
    if (tbl) tbl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  showEmployeeDetail(id) {
    const e = (Store.state.employees || []).find(x => x.id === id);
    if (!e) return;
    document.getElementById('modalEmpName').textContent = e.name;
    document.getElementById('modalEmpNip').textContent = `NIP: ${e.nipFormatted || e.nip}`;
    document.getElementById('modalEmpUnit').textContent = e.unit;
    document.getElementById('modalEmpJabatan').textContent = e.jabatan;
    document.getElementById('modalEmpPangkat').textContent = e.pangkat;
    document.getElementById('modalEmpJenis').textContent = e.jenis;
    
    const badgeCls = e.statusIdp === 'Disetujui' ? 'badge-success' : e.statusIdp === 'Belum' ? 'badge-danger' : 'badge-warning';
    document.getElementById('modalEmpStatusIdp').innerHTML = `<span class="badge ${badgeCls}">${e.statusIdp}</span>`;
    document.getElementById('modalEmpProgress').textContent = e.progress;

    this.openModal('empDetailModal');
  },

  renderAdminEmployees() {
    const emps = Store.state.employees || [];
    const search = (document.getElementById('empSearchInput')?.value || '').toLowerCase().trim();
    const unitFilter = document.getElementById('empUnitFilter')?.value || '';
    const statusFilter = document.getElementById('empStatusFilter')?.value || '';

    const filtered = emps.filter(e => {
      if (unitFilter && e.unit !== unitFilter) return false;
      if (statusFilter && e.statusIdp !== statusFilter) return false;
      if (search) {
        const matchName = (e.name || '').toLowerCase().includes(search);
        const matchNip = (e.nip || '').toLowerCase().includes(search) || (e.nipFormatted || '').toLowerCase().includes(search);
        const matchJab = (e.jabatan || '').toLowerCase().includes(search);
        if (!matchName && !matchNip && !matchJab) return false;
      }
      return true;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / this.empPageSize) || 1;
    if (this.empPage > totalPages) this.empPage = 1;
    const startIdx = (this.empPage - 1) * this.empPageSize;
    const pageItems = filtered.slice(startIdx, startIdx + this.empPageSize);

    const tbody = document.getElementById('adminEmployeeTableBody');
    if (!tbody) return;

    if (pageItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 36px; color: var(--color-text-muted);">Tidak ada data pegawai yang sesuai filter.</td></tr>`;
    } else {
      tbody.innerHTML = pageItems.map((e, idx) => {
        const globalNo = startIdx + idx + 1;
        const badgeCls = e.statusIdp === 'Disetujui' ? 'badge-success' : e.statusIdp === 'Belum' ? 'badge-danger' : 'badge-warning';
        
        let unitBadgeCls = 'badge-neutral';
        if (e.unit.includes('Pimpinan')) unitBadgeCls = 'badge-success';
        else if (e.unit.includes('Sekretariat')) unitBadgeCls = 'badge-neutral';
        else if (e.unit.includes('PMPE')) unitBadgeCls = 'badge-blue';
        else if (e.unit.includes('Perekonomian')) unitBadgeCls = 'badge-warning';
        else if (e.unit.includes('Infrastruktur')) unitBadgeCls = 'badge-purple';
        else if (e.unit.includes('Pemerintahan')) unitBadgeCls = 'badge-rose';
        else if (e.unit.includes('Riset')) unitBadgeCls = 'badge-teal';

        return `
          <tr>
            <td style="text-align: center; color: var(--color-text-muted); font-size: 11px;">${globalNo}</td>
            <td>
              <div class="table-user-cell">
                <div class="table-user-avatar">${e.avatarInitial || 'AS'}</div>
                <div class="table-user-info">
                  <div class="name" style="font-weight: 650;">${e.name}</div>
                  <div class="sub" style="font-family: monospace; font-size: 11px; color: var(--color-text-muted);">${e.nipFormatted || e.nip}</div>
                </div>
              </div>
            </td>
            <td style="font-size: 12px;">${e.pangkat}</td>
            <td style="font-size: 12px;">${e.jabatan}</td>
            <td><span class="badge ${unitBadgeCls}" style="font-size: 11px;">${e.unit}</span></td>
            <td><span class="badge ${badgeCls}">${e.statusIdp}</span></td>
            <td><b>${e.progress}</b></td>
            <td>
              <button class="btn btn-outline btn-sm" onclick="App.showEmployeeDetail(${e.id})">Detail</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    const pageText = document.getElementById('empPaginationText');
    if (pageText) {
      pageText.innerHTML = `Menampilkan <b>${total === 0 ? 0 : startIdx + 1}–${Math.min(startIdx + this.empPageSize, total)}</b> dari <b>${total}</b> pegawai aktif (Total Basis Data: ${Store.state.employees.length} ASN Bappeda)`;
    }

    const pageCtrls = document.getElementById('empPaginationControls');
    if (pageCtrls) {
      let btns = '';
      if (totalPages > 1) {
        for (let p = 1; p <= totalPages; p++) {
          btns += `<button class="page-btn ${p === this.empPage ? 'active' : ''}" onclick="App.setEmpPage(${p})">${p}</button>`;
        }
      }
      pageCtrls.innerHTML = btns;
    }
  },"""

if old_render_employees in text:
    text = text.replace(old_render_employees, new_render_employees)
    print("Replaced renderAdminEmployees successfully")
else:
    print("WARNING: old_render_employees not found")

# Replace renderMonitoring & openMonitoringDetailDrawer
old_monitoring = """  renderMonitoring() {
    const units = [
      { unit: 'Bidang Perencanaan Makro & Pendanaan', pegawai: 35, terisi: '94%', realisasi: '71%', tindakLanjut: 6 },
      { unit: 'Bidang Pemerintahan & Pembangunan Manusia', pegawai: 25, terisi: '88%', realisasi: '64%', tindakLanjut: 7 },
      { unit: 'Bidang Perekonomian & Sumber Daya Alam', pegawai: 20, terisi: '85%', realisasi: '61%', tindakLanjut: 7 },
      { unit: 'Sekretariat Bappeda Provinsi Lampung', pegawai: 20, terisi: '90%', realisasi: '60%', tindakLanjut: 6 }
    ];

    document.getElementById('monitoringTableBody').innerHTML = units.map((u, i) => `
      <tr onclick="App.openMonitoringDetailDrawer('${u.unit}')" style="cursor: pointer;">
        <td>${i + 1}</td>
        <td class="font-semibold text-primary">${u.unit}</td>
        <td>${u.pegawai} ASN</td>
        <td><b>${u.terisi}</b></td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>${u.realisasi}</span>
            <div class="progress-track" style="width: 80px; height: 6px;"><div class="progress-fill success" style="width: ${u.realisasi}"></div></div>
          </div>
        </td>
        <td><span class="badge badge-warning">${u.tindakLanjut} Pegawai</span></td>
      </tr>
    `).join('');
  },

  openMonitoringDetailDrawer(unitName) {
    document.getElementById('monDrawerTitle').textContent = `Dokumen Pengendalian: ${unitName}`;
    this.openDrawer('monitoringDetailDrawer');
  },"""

new_monitoring = """  renderMonitoring() {
    const units = Store.state.monitoringUnits && Store.state.monitoringUnits.length > 0
      ? Store.state.monitoringUnits
      : [
        { unit: 'Sekretariat', pegawai: 23, terisi: '91%', realisasi: '78%', tindakLanjut: 2, kabid: 'Ir. ANDRYA YUNILA HASTUTI, M.Si' },
        { unit: 'Bidang PMPE (Rendalev)', pegawai: 11, terisi: '100%', realisasi: '82%', tindakLanjut: 1, kabid: 'ENDANG WAHYUNI, S.T, M.Si' },
        { unit: 'Bidang Perekonomian', pegawai: 19, terisi: '89%', realisasi: '74%', tindakLanjut: 3, kabid: 'MUHAMMAD AZIZ SATRIYA JAYA SE, M.Si' },
        { unit: 'Bidang Infrastruktur & Kewilayahan', pegawai: 12, terisi: '92%', realisasi: '75%', tindakLanjut: 2, kabid: 'RIDWAN SAIFUDDIN S.E., M.Si' },
        { unit: 'Bidang Pemerintahan & PM', pegawai: 18, terisi: '89%', realisasi: '72%', tindakLanjut: 3, kabid: 'VIKA VITRI INDRA B, S.T., M.Sc' },
        { unit: 'Bidang Riset & Inovasi Daerah', pegawai: 16, terisi: '88%', realisasi: '69%', tindakLanjut: 3, kabid: 'MHD YUSUF NASUTION S.Sos, M.Si' },
        { unit: 'Pimpinan', pegawai: 1, terisi: '100%', realisasi: '100%', tindakLanjut: 0, kabid: 'ELVIRA UMIHANNI, S.P., M.T.' }
      ];

    const filterUnit = document.getElementById('monUnitFilter')?.value || '';
    const displayedUnits = filterUnit ? units.filter(u => u.unit === filterUnit) : units;

    const tbody = document.getElementById('monitoringTableBody');
    if (!tbody) return;

    tbody.innerHTML = displayedUnits.map((u, i) => `
      <tr onclick="App.openMonitoringDetailDrawer('${u.unit}')" style="cursor: pointer;">
        <td>${i + 1}</td>
        <td class="font-semibold text-primary">
          <div style="font-size: 13.5px; font-weight: 700;">${u.unit}</div>
          ${u.kabid ? `<div style="font-size: 11px; color: var(--color-text-muted); margin-top: 2px;">Penanggung Jawab: ${u.kabid}</div>` : ''}
        </td>
        <td><span class="badge badge-blue"><b>${u.pegawai}</b> ASN</span></td>
        <td><b>${u.terisi}</b></td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>${u.realisasi}</span>
            <div class="progress-track" style="width: 80px; height: 6px;"><div class="progress-fill success" style="width: ${u.realisasi}"></div></div>
          </div>
        </td>
        <td><span class="badge badge-warning">${u.tindakLanjut} Pegawai</span></td>
      </tr>
    `).join('');
  },

  filterMonitoring() {
    this.renderMonitoring();
  },

  openMonitoringDetailDrawer(unitName) {
    document.getElementById('monDrawerTitle').textContent = `Dokumen Pengendalian: ${unitName}`;
    const members = (Store.state.employees || []).filter(e => e.unit === unitName);
    const tbody = document.getElementById('monitoringDrawerTableBody');
    if (tbody) {
      if (members.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--color-text-muted);">Tidak ada data pegawai pada unit ini.</td></tr>`;
      } else {
        tbody.innerHTML = members.map(m => {
          const isFull = m.statusIdp === 'Disetujui';
          const badgeCls = isFull ? 'badge-success' : m.statusIdp === 'Belum' ? 'badge-danger' : 'badge-warning';
          return `
            <tr>
              <td>
                <div style="font-weight: 650; font-size: 12.5px;">${m.name}</div>
                <div style="font-size: 10.5px; color: var(--color-text-muted); font-family: monospace;">NIP: ${m.nipFormatted || m.nip}</div>
              </td>
              <td style="font-size: 12px;">${m.jabatan}</td>
              <td style="text-align: center;"><b>20 JP</b></td>
              <td style="text-align: center;"><b>${m.jp} JP</b></td>
              <td><span class="badge ${badgeCls}">${m.statusIdp} (${m.progress.split(' ')[1] || ''})</span></td>
            </tr>
          `;
        }).join('');
      }
    }
    this.openDrawer('monitoringDetailDrawer');
  },"""

if old_monitoring in text:
    text = text.replace(old_monitoring, new_monitoring)
    print("Replaced renderMonitoring & openMonitoringDetailDrawer successfully")
else:
    print("WARNING: old_monitoring not found")

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated js/app.js successfully!")

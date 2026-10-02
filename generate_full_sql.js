const fs = require('fs');

try {
    let content = fs.readFileSync('c:/website Bappeda/js/bappeda_data.js', 'utf8');
    content = content.replace('const BAPPEDA_DATA =', 'const BAPPEDA_DATA ='); 
    content += '\nmodule.exports = BAPPEDA_DATA;';
    
    fs.writeFileSync('c:/website Bappeda/temp_data.js', content);
    const data = require('c:/website Bappeda/temp_data.js');
    
    let sql = `-- ============================================\n`;
    sql += `-- UPDATE DATA PEGAWAI LENGKAP BAPPEDA LAMPUNG\n`;
    sql += `-- (Pendidikan, Masa Kerja, Jenis Jabatan, dll)\n`;
    sql += `-- ============================================\n\n`;
    
    data.employees.forEach(emp => {
        const escape = (str) => str ? String(str).replace(/'/g, "''") : '';
        
        const acc = data.accounts.find(a => a.nip === emp.nip);
        const role = acc ? acc.role : 'pegawai';
        const nineBox = Math.floor(Math.random() * 4) + 5; // Random 5-9
    
        sql += `INSERT INTO pegawai (nip, nama, pangkat, jabatan, jenis_jabatan, unit_kerja, pendidikan, masa_kerja, nine_box, role)\n`;
        sql += `VALUES ('${emp.nip}', '${escape(emp.name)}', '${escape(emp.pangkat)}', '${escape(emp.jabatan)}', '${escape(emp.jenis)}', '${escape(emp.unit)}', '${escape(emp.pendidikan)}', '${escape(emp.masaKerja)}', ${nineBox}, '${role}')\n`;
        sql += `ON CONFLICT (nip) DO UPDATE SET\n`;
        sql += `  nama = EXCLUDED.nama,\n`;
        sql += `  pangkat = EXCLUDED.pangkat,\n`;
        sql += `  jabatan = EXCLUDED.jabatan,\n`;
        sql += `  jenis_jabatan = EXCLUDED.jenis_jabatan,\n`;
        sql += `  unit_kerja = EXCLUDED.unit_kerja,\n`;
        sql += `  pendidikan = EXCLUDED.pendidikan,\n`;
        sql += `  masa_kerja = EXCLUDED.masa_kerja,\n`;
        sql += `  nine_box = EXCLUDED.nine_box,\n`;
        sql += `  role = EXCLUDED.role;\n\n`;
    });
    
    fs.writeFileSync('c:/website Bappeda/update_pegawai_lengkap.sql', sql);
    console.log('Success! Generated ' + data.employees.length + ' records.');
} catch (e) {
    console.error(e);
}

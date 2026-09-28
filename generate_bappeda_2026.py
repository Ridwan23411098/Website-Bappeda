import json, re

with open('duk_2026_raw.json', 'r', encoding='utf-8') as f:
    raw_duk = json.load(f)

# Helper function for initials
def get_initials(name):
    # Remove titles
    clean = re.sub(r'\b(Dr\.|Ir\.|S\.K\.M\.|M\.Kes\.|S\.T\.|M\.T\.|S\.P\.|MIP|M\.Si\.|S\.STP|M\.E\.|S\.Si\.|Apt|M\.S\.P|S\.Sos|SSTP|M\.Sc|S\.Hut\.|M\.I\.L|S\.E\.|M\.M\.|S\.Kom|M\.B\.A\.|S\.H\.|M\.H\.|S\.Pd\.Kor\.|M\.Pd\.|M\.I\.D\.S\.|S\.Tr\.IP|S\.Tr\.I\.P|A\.Md\.|S\.M\.|S\.A\.P\.|S\.IP)\b', '', name)
    clean = re.sub(r'[^a-zA-Z\s]', '', clean).strip()
    parts = [p for p in clean.split() if p]
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    elif len(parts) == 1:
        return parts[0][:2].upper()
    return "AS"

# Unit assignment mapping based on exact official positions
def determine_unit(no, jabatan):
    jab_upper = jabatan.upper()
    if no == 1 or 'KEPALA BADAN' in jab_upper:
        return 'Pimpinan'
    if 'UPTD PUSAT DATA DAN INFORMASI' in jab_upper:
        return 'UPTD Pusat Data & Informasi'
    if 'INFRASTRUKTUR' in jab_upper:
        return 'Bidang Infrastruktur & Kewilayahan'
    if 'MAKRO' in jab_upper or 'RENDALEV' in jab_upper or 'EVALUASI PEMBANGUNAN' in jab_upper:
        return 'Bidang PPEPD (Rendalev)'
    if 'PEREKONOMIAN' in jab_upper:
        return 'Bidang Perekonomian'
    if 'PEMERINTAHAN DAN PEMBANGUNAN MANUSIA' in jab_upper:
        return 'Bidang Pemerintahan & PM'
    if 'SEKRETARIS' in jab_upper or 'SEKRETARIAT' in jab_upper:
        return 'Sekretariat'
    
    # Specific assignments based on known bidang portfolios & names:
    # UPTD Pusdatin staff: IT, Geospasial, Statistik
    if no in [69, 71, 88, 89, 91, 37]: # Yulia Fitri (Pranata Komputer), Sabiel (Statistisi), Satria, Novia, Rizal (Sistem & TI), Ratih Aulia (Surveyor Pemetaan)
        return 'UPTD Pusat Data & Informasi'
        
    # Bidang Infrastruktur & Kewilayahan
    if no in [8, 22, 24, 33, 35, 54, 57, 65]:
        return 'Bidang Infrastruktur & Kewilayahan'
        
    # Bidang PPEPD (Makro & Evaluasi)
    if no in [11, 14, 17, 42, 61, 74, 80, 83]:
        return 'Bidang PPEPD (Rendalev)'
        
    # Bidang Perekonomian
    if no in [5, 9, 10, 12, 13, 25, 26, 27, 30, 38, 40, 41, 43, 44, 45, 63, 72, 75]:
        return 'Bidang Perekonomian'
        
    # Sekretariat (SDM, Keuangan, Pengadministrasi, Staf Umum)
    if no in [6, 16, 46, 67, 68, 70, 77, 79, 81, 82, 84, 85, 86, 87, 90, 92, 93, 94, 95, 96, 97, 98, 99]:
        return 'Sekretariat'
        
    # Bidang Pemerintahan & PM
    return 'Bidang Pemerintahan & PM'

# Determine Jenis Jabatan
def determine_jenis(jabatan):
    jab_upper = jabatan.upper()
    if any(k in jab_upper for k in ['KEPALA BADAN', 'KEPALA BIDANG', 'SEKRETARIS', 'KEPALA SUB BAGIAN', 'KEPALA UPTD', 'KEPALA SEKSI']):
        return 'Struktural'
    if any(k in jab_upper for k in ['AHLI MADYA', 'AHLI MUDA', 'AHLI PERTAMA', 'AHLI UTAMA', 'PRANATA KOMPUTER', 'STATISTISI', 'SURVEYOR', 'PENATA KELOLA']):
        return 'JFT'
    return 'Pelaksana'

# Format cleaner jabatan title
def clean_jabatan(jab):
    jab = jab.strip()
    # Replace overly verbose repeating phrases
    jab = re.sub(r'\s+PADA\s+BADAN\s+PERENCANAAN\s+PEMBANGUNAN\s+DAERAH(\s+PROVINSI\s+LAMPUNG)?', '', jab, flags=re.I)
    jab = re.sub(r'\s+PADA\s+SEKRETARIAT\s+BADAN\s+PERENCANAAN\s+PEMBANGUNAN\s+DAERAH(\s+PROVINSI\s+LAMPUNG)?', ' Pada Sekretariat', jab, flags=re.I)
    jab = re.sub(r'\s+PADA\s+UPTD\s+PUSAT\s+DATA\s+DAN\s+INFORMASI\s+PEMBANGUNAN\s+DAERAH(\s+BADAN\s+PERENCANAAN\s+PEMBANGUNAN\s+DAERAH\s+PROVINSI)?', ' Pada UPTD Pusdatin', jab, flags=re.I)
    jab = re.sub(r'\s+PROVINSI\s+LAMPUNG', '', jab, flags=re.I)
    return jab.strip()

employees = []
unit_counts = {}

# Distribution of IDP statuses for realism
status_pool = [
    ("Disetujui", "24/20 JP (100%)", 24),
    ("Disetujui", "20/20 JP (100%)", 20),
    ("Disetujui", "22/20 JP (100%)", 22),
    ("Menunggu Verifikasi", "18/20 JP (90%)", 18),
    ("Menunggu Verifikasi", "16/20 JP (80%)", 16),
    ("Disetujui", "20/20 JP (100%)", 20),
    ("Perlu Revisi", "12/20 JP (60%)", 12),
    ("Draft", "8/20 JP (40%)", 8),
    ("Disetujui", "26/20 JP (100%)", 26),
    ("Disetujui", "20/20 JP (100%)", 20)
]

for idx, item in enumerate(raw_duk):
    no = item['no']
    nama = item['nama']
    nip_raw = item['nip_raw']
    nip = re.sub(r'[^0-9]', '', nip_raw)
    
    pangkat = f"{item['pangkat_gol'].title()} / {item['gol']}"
    # Standardize casing for pangkat
    pangkat = pangkat.replace("Tk. I", "Tk. I").replace("Madya", "Madya").replace("Muda", "Muda")
    
    jab_full = item['jabatan']
    unit = determine_unit(no, jab_full)
    unit_counts[unit] = unit_counts.get(unit, 0) + 1
    
    jenis = determine_jenis(jab_full)
    display_jabatan = clean_jabatan(jab_full)
    if no == 1:
        display_jabatan = "Kepala Badan Perencanaan Pembangunan Daerah Provinsi Lampung"
    elif no == 6:
        display_jabatan = "Sekretaris Bappeda Provinsi Lampung"
    
    diklat_text = item['diklat']
    if diklat_text != '-' and item['tgl_diklat'] != '-':
        diklat_str = f"{diklat_text} ({item['tgl_diklat']}, {item['jam_diklat']} Jam)"
    else:
        diklat_str = "-"
        
    pend_str = f"{item['pendidikan']} ({item['tahun_lulus']})"
    
    stat_idx = idx % len(status_pool)
    statusIdp, progress, jp = status_pool[stat_idx]
    if no in [1, 2, 3, 4, 6, 16, 20, 59]: # Pimpinan & Kabid
        statusIdp = "Disetujui"
        progress = "24/20 JP (100%)"
        jp = 24
        
    emp = {
        "id": no,
        "no": no,
        "name": nama,
        "nip": nip,
        "nipFormatted": nip_raw,
        "ttl": item['ttl'],
        "pangkat": pangkat,
        "golongan": item['gol'],
        "tmtPangkat": item['tmt_pangkat'],
        "jabatan": display_jabatan,
        "jabatanLengkap": jab_full,
        "tmtJabatan": item['tmt_jabatan'],
        "diklat": diklat_str,
        "pendidikan": pend_str,
        "jenjang": item['jenjang'],
        "tahunLulus": item['tahun_lulus'],
        "usia": item['usia'].replace("THN", "Thn").replace("BLN", "Bln"),
        "masaKerja": item['masa_kerja'].replace("THN", "Thn").replace("BLN", "Bln"),
        "jenis": jenis,
        "unit": unit,
        "statusIdp": statusIdp,
        "progress": progress,
        "jp": jp,
        "avatarInitial": get_initials(nama)
    }
    employees.append(emp)

print("Unit distribution:")
for u, c in sorted(unit_counts.items()):
    print(f"  {u}: {c} ASN")

# Build accounts
accounts = [
    {
        "nip": "197407072002121008",
        "password": "password",
        "name": "ANDI ARAFAT S.T., M.E.",
        "pangkat": "Pembina Tk. I / IV/b",
        "jabatan": "Sekretaris Bappeda Provinsi Lampung",
        "unitKerja": "Sekretariat",
        "role": "pegawai",
        "avatarInitial": "AA"
    },
    {
        "nip": "196910261992032002",
        "password": "admin123",
        "name": "CIK MARYA S.E.,M.M.",
        "pangkat": "Pembina / IV/a",
        "jabatan": "Kepala Sub Bagian Umum & Kepegawaian",
        "unitKerja": "Sekretariat",
        "role": "admin",
        "avatarInitial": "CM"
    },
    {
        "nip": "197507312000031002",
        "password": "pimpinan123",
        "name": "Dr. ANANG RISGIYANTO S.K.M., M.Kes.",
        "pangkat": "Pembina Utama Madya / IV/d",
        "jabatan": "Kepala Badan Perencanaan Pembangunan Daerah",
        "unitKerja": "Pimpinan",
        "role": "pimpinan",
        "avatarInitial": "AR"
    }
]

# Add all 99 employees into accounts directory so all can login!
existing_nips = {a['nip'] for a in accounts}
for e in employees:
    if e['nip'] not in existing_nips:
        accounts.append({
            "nip": e['nip'],
            "password": "password",
            "name": e['name'],
            "pangkat": e['pangkat'],
            "jabatan": e['jabatan'],
            "unitKerja": e['unit'],
            "role": "pegawai",
            "avatarInitial": e['avatarInitial']
        })
        existing_nips.add(e['nip'])

# Monitoring Units Data
monitoring_units = [
    {
        "unit": "Sekretariat",
        "pegawai": unit_counts.get("Sekretariat", 0),
        "terisi": "94%",
        "realisasi": "82%",
        "tindakLanjut": 2,
        "kabid": "ANDI ARAFAT S.T., M.E."
    },
    {
        "unit": "Bidang PPEPD (Rendalev)",
        "pegawai": unit_counts.get("Bidang PPEPD (Rendalev)", 0),
        "terisi": "100%",
        "realisasi": "88%",
        "tindakLanjut": 1,
        "kabid": "MEYDIANDRA EKA PUTRA S.P,MIP"
    },
    {
        "unit": "Bidang Perekonomian",
        "pegawai": unit_counts.get("Bidang Perekonomian", 0),
        "terisi": "92%",
        "realisasi": "79%",
        "tindakLanjut": 2,
        "kabid": "Ir. ENDANG WAHYUNI S.T., M.Si."
    },
    {
        "unit": "Bidang Infrastruktur & Kewilayahan",
        "pegawai": unit_counts.get("Bidang Infrastruktur & Kewilayahan", 0),
        "terisi": "95%",
        "realisasi": "80%",
        "tindakLanjut": 1,
        "kabid": "Ir. IDA SUSANTI S S.T., M.T"
    },
    {
        "unit": "Bidang Pemerintahan & PM",
        "pegawai": unit_counts.get("Bidang Pemerintahan & PM", 0),
        "terisi": "90%",
        "realisasi": "76%",
        "tindakLanjut": 3,
        "kabid": "RADIUS PRAWIRA NEGARA S.ST"
    },
    {
        "unit": "UPTD Pusat Data & Informasi",
        "pegawai": unit_counts.get("UPTD Pusat Data & Informasi", 0),
        "terisi": "100%",
        "realisasi": "90%",
        "tindakLanjut": 0,
        "kabid": "YASIR WIJAYA S.Si.,M.Si"
    },
    {
        "unit": "Pimpinan",
        "pegawai": 1,
        "terisi": "100%",
        "realisasi": "100%",
        "tindakLanjut": 0,
        "kabid": "Dr. ANANG RISGIYANTO S.K.M., M.Kes."
    }
]

# Verifications sample
verifications = [
    {
        "id": 101,
        "pegawai": "ANDI ARAFAT S.T., M.E.",
        "nip": "19740707 200212 1 008",
        "jabatan": "Sekretaris Bappeda",
        "jenisJabatan": "Struktural",
        "unitKerja": "Sekretariat",
        "targetKarier": "JPT Pratama — Level 5",
        "rencanaKarier": "Pengembangan kepemimpinan strategis dan tata kelola akuntabilitas kinerja instansi pemerintah",
        "programCount": 4,
        "totalJp": 32,
        "estimasiBiaya": "Rp2.500.000",
        "pengajuan": "18 Sep 2026",
        "status": "Menunggu Verifikasi",
        "notes": ""
    },
    {
        "id": 102,
        "pegawai": "DWI PRASETIO S.STP, M.Si",
        "nip": "19780710 199712 1 001",
        "jabatan": "Perencana Ahli Madya",
        "jenisJabatan": "JFT",
        "unitKerja": "Bidang Perekonomian",
        "targetKarier": "JFT Utama — Level 5",
        "rencanaKarier": "Penguatan pemodelan ekonometrika regional dan analisis kebijakan inflasi daerah",
        "programCount": 3,
        "totalJp": 28,
        "estimasiBiaya": "Rp1.800.000",
        "pengajuan": "17 Sep 2026",
        "status": "Disetujui",
        "notes": "Program sangat selaras dengan prioritas pengendalian inflasi dan ketahanan pangan Lampung."
    },
    {
        "id": 103,
        "pegawai": "KAIZAN SP.,M.Si",
        "nip": "19730323 200212 1 011",
        "jabatan": "Perencana Ahli Madya",
        "jenisJabatan": "JFT",
        "unitKerja": "Bidang Infrastruktur & Kewilayahan",
        "targetKarier": "JFT Utama — Level 5",
        "rencanaKarier": "Pengembangan kompetensi penataan ruang wilayah terintegrasi dan konektivitas antarmoda",
        "programCount": 4,
        "totalJp": 36,
        "estimasiBiaya": "Rp2.500.000",
        "pengajuan": "16 Sep 2026",
        "status": "Menunggu Verifikasi",
        "notes": ""
    },
    {
        "id": 104,
        "pegawai": "ERA JAYANTI S.STP,MM",
        "nip": "19860329 200602 2 002",
        "jabatan": "Perencana Ahli Muda",
        "jenisJabatan": "JFT",
        "unitKerja": "Bidang Pemerintahan & PM",
        "targetKarier": "JFT Madya — Level 4",
        "rencanaKarier": "Penguatan koordinasi program penanggulangan kemiskinan ekstrem dan percepatan penurunan stunting",
        "programCount": 3,
        "totalJp": 24,
        "estimasiBiaya": "Rp1.200.000",
        "pengajuan": "15 Sep 2026",
        "status": "Disetujui",
        "notes": "Disetujui, rekomendasi riset dapat dimasukkan dalam RKPD tahun 2027."
    },
    {
        "id": 105,
        "pegawai": "SATRIA DESTRIAN MAHCMUDDIN S.Kom",
        "nip": "19921222 202504 1 004",
        "jabatan": "Penata Kelola Sistem & TI",
        "jenisJabatan": "JFT",
        "unitKerja": "UPTD Pusat Data & Informasi",
        "targetKarier": "JFT Ahli Muda — Level 3",
        "rencanaKarier": "Sertifikasi Keamanan Siber & Tata Kelola SPBE Pemerintah Daerah",
        "programCount": 3,
        "totalJp": 25,
        "estimasiBiaya": "Rp2.100.000",
        "pengajuan": "14 Sep 2026",
        "status": "Menunggu Verifikasi",
        "notes": ""
    },
    {
        "id": 106,
        "pegawai": "CIK MARYA S.E.,M.M.",
        "nip": "19691026 199203 2 002",
        "jabatan": "Kasubbag Umum & Kepegawaian",
        "jenisJabatan": "Struktural",
        "unitKerja": "Sekretariat",
        "targetKarier": "Administrator — Level 4",
        "rencanaKarier": "Pengelolaan Manajemen Talenta ASN dan Digitalisasi Sistem Penilaian Kinerja Bangkom",
        "programCount": 2,
        "totalJp": 20,
        "estimasiBiaya": "Rp1.000.000",
        "pengajuan": "12 Sep 2026",
        "status": "Disetujui",
        "notes": "Disetujui oleh Kepala Badan."
    }
]

# Read existing masterData from js/bappeda_data.js
with open('js/bappeda_data.js', 'r', encoding='utf-8') as f:
    orig_bappeda = f.read()

# Extract masterMetode, masterRumpun, masterJenjang, realizations
def extract_js_array(content, key):
    m = re.search(r'\b' + key + r':\s*(\[[\s\S]*?\])\s*,\s*\n\s*[a-zA-Z]', content)
    if not m:
        m = re.search(r'\b' + key + r':\s*(\[[\s\S]*?\])\s*\}', content)
    if m:
        return m.group(1)
    return "[]"

master_metode_str = extract_js_array(orig_bappeda, 'masterMetode')
master_rumpun_str = extract_js_array(orig_bappeda, 'masterRumpun')
master_jenjang_str = extract_js_array(orig_bappeda, 'masterJenjang')
realizations_str = extract_js_array(orig_bappeda, 'realizations')

# Assemble output js
bappeda_data_content = f"""/**
 * SIP-KOMPETENSI — DATA RESMI BAPPEDA PROVINSI LAMPUNG
 * Sumber Data:
 * 1. DAFTAR URUT KEPANGKATAN PNS BADAN PERENCANAAN PEMBANGUNAN DAERAH BERLAKU UNTUK TAHUN 2026 (99 ASN Lengkap)
 * 2. SE Pelaksanaan Pengembangan Kompetensi ASN Prov Lampung No. 2 Tahun 2025
 * 3. Formulir IDP Resmi Bappeda Provinsi Lampung (25 Metode, Rumpun, Jenjang)
 * 4. Lampiran Form Bangkom & Mentoring
 */

const BAPPEDA_DATA = {{
  accounts: {json.dumps(accounts, indent=2, ensure_ascii=False)},
  employees: {json.dumps(employees, indent=2, ensure_ascii=False)},
  masterMetode: {master_metode_str},
  masterRumpun: {master_rumpun_str},
  masterJenjang: {master_jenjang_str},
  monitoringUnits: {json.dumps(monitoring_units, indent=2, ensure_ascii=False)},
  verifications: {json.dumps(verifications, indent=2, ensure_ascii=False)},
  realizations: {realizations_str}
}};

if (typeof module !== 'undefined' && module.exports) {{
  module.exports = BAPPEDA_DATA;
}}
"""

with open('js/bappeda_data.js', 'w', encoding='utf-8') as f:
    f.write(bappeda_data_content)

print(f"Generated js/bappeda_data.js successfully! Total employees: {len(employees)}, Accounts: {len(accounts)}")

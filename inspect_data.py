import zipfile
import xml.etree.ElementTree as ET
import os

def check_excel_details():
    with zipfile.ZipFile('Data Bappeda/Form Rekapitulasi Dokumen Pengendali Bangkom.xlsx') as z:
        ss = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                t = ''.join([node.text for node in si.iter() if node.text])
                ss.append(t)
        
        tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        rows = []
        for row in tree.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
            row_vals = {}
            for c in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                r = c.attrib.get('r')
                col = ''.join([ch for ch in r if ch.isalpha()])
                v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                t = c.attrib.get('t')
                val = ''
                if v is not None and v.text is not None:
                    val = v.text
                    if t == 's':
                        val = ss[int(val)] if int(val) < len(ss) else val
                row_vals[col] = val
            if any(row_vals.values()):
                rows.append(row_vals)
        
        print("Excel has columns across rows:")
        for idx, r in enumerate(rows[3:], 1):
            extra = {k: v for k, v in r.items() if k not in ('A', 'B', 'C')}
            if extra:
                print(f"Row {idx} ({r.get('B')}): {extra}")

check_excel_details()


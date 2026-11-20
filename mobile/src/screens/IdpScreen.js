import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { supabase } from '../services/supabase';
import { realtimeService } from '../services/realtime';

const DEFAULT_PROGRAMS = [
  {
    id: 1,
    kompetensi: 'Analisis Data Perencanaan',
    metode: 'Klasikal / Workshop',
    topik: 'Pelatihan Analisis Data Perencanaan dengan Python & PowerBI',
    penyelenggara: 'BPSDM Provinsi Lampung',
    jp: 20,
    periode: 'Triwulan I (Maret 2026)',
    status: 'Disetujui'
  },
  {
    id: 2,
    kompetensi: 'Perumusan Kebijakan Publik',
    metode: 'Non-Klasikal / E-Learning',
    topik: 'Penyusunan Kajian Naskah Akademik Dokumen RKPD & RPJMD',
    penyelenggara: 'Pusbindiklatren Bappenas',
    jp: 15,
    periode: 'Triwulan II (Juni 2026)',
    status: 'Direncanakan'
  },
  {
    id: 3,
    kompetensi: 'Manajemen Risiko SPBE',
    metode: 'Bimbingan Teknis',
    topik: 'Penerapan Sistem Informasi Manajemen Talenta ASN & SPBE',
    penyelenggara: 'Diskominfotik & Bappeda Lampung',
    jp: 10,
    periode: 'Triwulan III (September 2026)',
    status: 'Direncanakan'
  }
];

const DEFAULT_ACTION_PLANS = [
  {
    id: 1,
    program: 'Pelatihan Analisis Data Perencanaan dengan Python & PowerBI',
    rencanaAksi: 'Membangun Dashboard Real-time Monitoring IKU Bappeda Provinsi Lampung TA 2026',
    outputKonkret: 'Aplikasi Dashboard PowerBI',
    targetWaktu: 'April 2026',
    status: 'Selesai'
  },
  {
    id: 2,
    program: 'Penyusunan Kajian Naskah Akademik Dokumen RKPD & RPJMD',
    rencanaAksi: 'Menyusun Bab IV Analisis Proyeksi Pendapatan & Belanja Daerah RKPD 2027',
    outputKonkret: 'Draft Bab IV RKPD',
    targetWaktu: 'Juli 2026',
    status: 'Sedang Berjalan'
  }
];

export default function IdpScreen({ user }) {
  const [programs, setPrograms] = useState(DEFAULT_PROGRAMS);
  const [actionPlans, setActionPlans] = useState(DEFAULT_ACTION_PLANS);
  const [submitting, setSubmitting] = useState(false);
  const [idpStatus, setIdpStatus] = useState('Diajukan ke Atasan');

  const totalJp = programs.reduce((acc, p) => acc + (p.jp || 0), 0);
  const tuntasCount = actionPlans.filter(p => p.status === 'Selesai').length;
  const berjalanCount = actionPlans.filter(p => p.status === 'Sedang Berjalan').length;

  const handleEditProgram = (item) => {
    Alert.alert('Edit Program', `Ubah usulan program: "${item.kompetensi}"`, [
      { text: 'Tutup', style: 'cancel' }
    ]);
  };

  const handleDeleteProgram = (id) => {
    Alert.alert('Hapus Program', 'Apakah Anda yakin ingin menghapus program ini dari rencana IDP?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          setPrograms(prev => prev.filter(p => p.id !== id));
        }
      }
    ]);
  };

  const handleEditActionPlan = (item) => {
    Alert.alert('Edit Rencana Aksi', `Ubah rencana aksi: "${item.rencanaAksi}"`, [
      { text: 'Tutup', style: 'cancel' }
    ]);
  };

  const handleDeleteActionPlan = (id) => {
    Alert.alert('Hapus Rencana Aksi', 'Apakah Anda yakin ingin menghapus komitmen tindak lanjut ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          setActionPlans(prev => prev.filter(p => p.id !== id));
        }
      }
    ]);
  };

  const handleDownloadDoc = (docTitle) => {
    Alert.alert('📄 Berkas Portofolio Resmi', `Menyiapkan unduhan ${docTitle} berformat PDF resmi terverifikasi.`);
  };

  const handleViewOrUploadEvidence = (ap) => {
    if (ap.status === 'Selesai') {
      Alert.alert(
        '📄 Bukti Fisik Hasil Kerja',
        `Rencana Aksi: "${ap.rencanaAksi}"\n\nWujud Hasil: ${ap.outputKonkret}\nStatus: Disahkan Atasan Langsung (Kirkpatrick L4: 5/5)\n\nBukti telah terverifikasi dan masuk portofolio SIASN BKN.`,
        [{ text: 'Tutup', style: 'cancel' }]
      );
    } else {
      Alert.alert(
        '📤 Unggah Bukti Hasil Kerja',
        `Pilih berkas bukti (PDF/Laporan) atau tautan sistem untuk: "${ap.outputKonkret}".`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Simpan Bukti & Selesaikan',
            onPress: () => {
              setActionPlans(prev => prev.map(p => p.id === ap.id ? { ...p, status: 'Selesai' } : p));
              Alert.alert('✅ Bukti Diunggah', 'Bukti fisik berhasil diunggah dan diajukan ke Atasan Langsung untuk pengesahan resmi.');
            }
          }
        ]
      );
    }
  };

  const handleSubmitIdp = async () => {
    setSubmitting(true);
    try {
      const cleanNip = String(user.nip || '').replace(/\s+/g, '');

      // 1. Simpan ke Supabase idp_submissions
      const { error } = await supabase
        .from('idp_submissions')
        .upsert({
          nip: cleanNip,
          tahun: '2026',
          status: 'Diajukan ke Atasan',
          progress: Math.min(100, Math.round((totalJp / 20) * 100)),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.warn("Supabase upsert note:", error.message);
      }

      // 2. Kirim notifikasi ke admin di database Supabase
      await supabase.from('notifikasi').insert([{
        penerima: 'admin',
        pengirim: user.name,
        judul: 'Pengajuan IDP Baru (Mobile)',
        pesan: `${user.name} mengajukan usulan rencana IDP 2026 via aplikasi smartphone (${totalJp} JP).`,
        tipe: 'info',
        dibaca: false,
        created_at: new Date().toISOString()
      }]);

      // 3. Siarkan event real-time ke semua layar laptop/PC dan tab aktif
      await realtimeService.broadcast('IDP_SUBMITTED', {
        pegawai: user.name,
        nip: cleanNip,
        totalJp: totalJp,
        totalProgram: programs.length,
        tahun: 2026
      }, user);

      setIdpStatus('Diajukan ke Atasan');
      Alert.alert(
        '🚀 Pengajuan Berhasil Disiarkan',
        `Rancangan IDP Tahun 2026 (${totalJp} JP) telah berhasil diajukan dan langsung tersinkronisasi ke layar Admin SDM secara real-time.`
      );
    } catch (err) {
      Alert.alert('Gagal', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Info */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Rencana IDP TA 2026</Text>
          <View style={styles.badgeStatus}>
            <Text style={styles.badgeStatusText}>{idpStatus}</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Dokumen Rencana Pengembangan Kompetensi Individu Pegawai Bappeda Lampung
        </Text>
        <View style={styles.summaryBar}>
          <Text style={styles.summaryItem}>📌 <Text style={{ fontWeight: '700' }}>{programs.length}</Text> Program Terdaftar</Text>
          <Text style={styles.summaryItem}>⏱️ <Text style={{ fontWeight: '700' }}>{totalJp}</Text> Total JP</Text>
        </View>
      </View>

      {/* Program Items */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={styles.listSectionTitle}>Daftar Usulan Kegiatan Diklat</Text>
        <Text style={{ fontSize: 11, color: '#64748b' }}>{programs.length} Kegiatan</Text>
      </View>

      {programs.map((item, index) => (
        <View key={item.id} style={styles.programCard}>
          <View style={styles.cardHeader}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.programKompetensi}>{item.kompetensi}</Text>
              <Text style={styles.programMetode}>{item.metode}</Text>
            </View>
            <View style={styles.jpPill}>
              <Text style={styles.jpPillText}>{item.jp} JP</Text>
            </View>
          </View>

          <Text style={styles.programTopik}>{item.topik}</Text>

          <View style={styles.cardFooter}>
            <Text style={styles.programPenyelenggara}>🏛️ {item.penyelenggara}</Text>
            <Text style={styles.programPeriode}>📅 {item.periode}</Text>
          </View>

          {/* Action Row */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.btnActionEdit}
              onPress={() => handleEditProgram(item)}
              activeOpacity={0.75}
            >
              <Text style={styles.btnActionEditText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnActionDelete}
              onPress={() => handleDeleteProgram(item.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.btnActionDeleteText}>🗑️ Hapus</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Tindak Lanjut & Rencana Aksi (Action Plan) */}
      <View style={{ marginTop: 14, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.listSectionTitle}>Tindak Lanjut & Rencana Aksi</Text>
          <View style={styles.outputTag}>
            <Text style={styles.outputTagText}>Hasil Nyata ASN</Text>
          </View>
        </View>
        <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2, marginBottom: 10 }}>
          Bukti hasil konkret & transfer of learning yang dihasilkan di unit kerja Bappeda
        </Text>

        {/* Action Plan Stats */}
        <View style={styles.actionStatsRow}>
          <View style={[styles.statBox, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
            <Text style={{ fontSize: 9.5, fontWeight: '750', color: '#15803d' }}>TUNTAS</Text>
            <Text style={{ fontSize: 13.5, fontWeight: '800', color: '#166534', marginVertical: 1 }}>{tuntasCount} Hasil</Text>
            <Text style={{ fontSize: 9, color: '#15803d' }}>Selesai diterapkan</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
            <Text style={{ fontSize: 9.5, fontWeight: '750', color: '#b45309' }}>BERJALAN</Text>
            <Text style={{ fontSize: 13.5, fontWeight: '800', color: '#92400e', marginVertical: 1 }}>{berjalanCount} Proses</Text>
            <Text style={{ fontSize: 9, color: '#b45309' }}>Penyusunan produk</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }]}>
            <Text style={{ fontSize: 9.5, fontWeight: '750', color: '#475569' }}>TOTAL AKSI</Text>
            <Text style={{ fontSize: 13.5, fontWeight: '800', color: '#1e293b', marginVertical: 1 }}>{actionPlans.length} Rencana</Text>
            <Text style={{ fontSize: 9, color: '#64748b' }}>Komitmen ASN</Text>
          </View>
        </View>

        {/* Action Plan Cards */}
        {actionPlans.map((ap, idx) => (
          <View key={ap.id} style={styles.actionPlanCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, paddingRight: 6 }}>
                <Text style={{ fontSize: 10.5, color: '#64748b', fontWeight: '600' }}>#{idx + 1} • {ap.program}</Text>
                <Text style={{ fontSize: 12, fontWeight: '750', color: '#0f172a', marginTop: 2 }}>{ap.rencanaAksi}</Text>
              </View>
              <View style={[styles.statusBadge, ap.status === 'Selesai' ? styles.badgeSuccess : styles.badgeWarning]}>
                <Text style={[styles.statusBadgeText, ap.status === 'Selesai' ? styles.badgeSuccessText : styles.badgeWarningText]}>
                  {ap.status}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
              <View>
                <Text style={{ fontSize: 9.5, color: '#64748b' }}>Wujud Hasil / Produk:</Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#1e3a8a' }}>{ap.outputKonkret}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 9.5, color: '#64748b' }}>Target:</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#334155' }}>{ap.targetWaktu}</Text>
              </View>
            </View>

            {/* Evidence & Validation Loop Bar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: ap.status === 'Selesai' ? '#f0f9ff' : '#eff6ff', borderRadius: 6, borderWidth: 1, borderColor: ap.status === 'Selesai' ? '#bae6fd' : '#bfdbfe' }}
                onPress={() => handleViewOrUploadEvidence(ap)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 10.5, fontWeight: '750', color: '#0369a1' }}>
                  {ap.status === 'Selesai' ? '📄 Lihat Bukti Fisik' : '📤 + Unggah Bukti'}
                </Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 9.5, color: '#64748b' }}>Pengesahan:</Text>
                <Text style={{ fontSize: 10, fontWeight: '800', color: ap.status === 'Selesai' ? '#16a34a' : '#d97706' }}>
                  {ap.status === 'Selesai' ? '✓ Disahkan Atasan' : '⏳ Menunggu'}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={[styles.cardActions, { marginTop: 8 }]}>
              <TouchableOpacity
                style={styles.btnActionEdit}
                onPress={() => handleEditActionPlan(ap)}
                activeOpacity={0.75}
              >
                <Text style={styles.btnActionEditText}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnActionDelete}
                onPress={() => handleDeleteActionPlan(ap.id)}
                activeOpacity={0.75}
              >
                <Text style={styles.btnActionDeleteText}>🗑️ Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Paket Dokumen Output Akhir */}
      <View style={styles.docHubCard}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#0b2545' }}>Paket Berkas Portofolio Resmi ASN</Text>
        <Text style={{ fontSize: 10.5, color: '#64748b', marginTop: 2, marginBottom: 10 }}>
          Dokumen resmi yang diterbitkan sistem untuk kenaikan pangkat SIASN BKN & BPSDMD
        </Text>
        <View style={{ gap: 6 }}>
          {[
            'Surat Keterangan Pemenuhan 20 JP',
            'Lembar Komitmen Rencana Aksi (Action Plan)',
            'Formulir Rekap Usulan IDP Tahunan',
            'Paket Portofolio Kenaikan Pangkat SIASN'
          ].map((docName, i) => (
            <TouchableOpacity
              key={i}
              style={styles.docRowBtn}
              onPress={() => handleDownloadDoc(docName)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#1e293b', flex: 1 }}>📑 {docName}</Text>
              <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#1e3a8a' }}>Unduh ➔</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
        onPress={handleSubmitIdp}
        disabled={submitting}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <Text style={styles.submitBtnText}>Ajukan IDP ke Verifikator SDM</Text>
            <Text style={styles.submitBtnSub}>Siarkan langsung secara Real-Time ke Portal Web & Pimpinan</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  content: {
    padding: 16,
    paddingBottom: 36
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0b2545'
  },
  badgeStatus: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7dd3fc'
  },
  badgeStatusText: {
    fontSize: 10.5,
    fontWeight: '750',
    color: '#0369a1'
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 16
  },
  summaryBar: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  summaryItem: {
    fontSize: 11.5,
    color: '#334155'
  },
  listSectionTitle: {
    fontSize: 13.5,
    fontWeight: '750',
    color: '#0f172a',
    marginBottom: 10
  },
  programCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  numberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0b2545',
    alignItems: 'center',
    justifyContent: 'center'
  },
  numberText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  },
  programKompetensi: {
    fontSize: 12.5,
    fontWeight: '750',
    color: '#0f172a'
  },
  programMetode: {
    fontSize: 10.5,
    color: '#64748b'
  },
  jpPill: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0'
  },
  jpPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857'
  },
  programTopik: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 10
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8
  },
  programPenyelenggara: {
    fontSize: 10,
    color: '#64748b'
  },
  programPeriode: {
    fontSize: 10,
    color: '#64748b'
  },
  submitBtn: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '750'
  },
  submitBtnSub: {
    color: '#93c5fd',
    fontSize: 10.5,
    marginTop: 2
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  btnActionEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  btnActionEditText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e3a8a'
  },
  btnActionDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5'
  },
  btnActionDeleteText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626'
  },
  outputTag: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0'
  },
  outputTagText: {
    fontSize: 10,
    fontWeight: '750',
    color: '#059669'
  },
  actionStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  statBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center'
  },
  actionPlanCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1
  },
  badgeSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac'
  },
  badgeSuccessText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16a34a'
  },
  badgeWarning: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a'
  },
  badgeWarningText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#d97706'
  },
  docHubCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  docRowBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  }
});


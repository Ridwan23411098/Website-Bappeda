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

export default function IdpScreen({ user }) {
  const [programs, setPrograms] = useState(DEFAULT_PROGRAMS);
  const [submitting, setSubmitting] = useState(false);
  const [idpStatus, setIdpStatus] = useState('Diajukan ke Atasan');

  const totalJp = programs.reduce((acc, p) => acc + (p.jp || 0), 0);

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
          <Text style={styles.summaryItem}>📌 <b>{programs.length}</b> Program Terdaftar</Text>
          <Text style={styles.summaryItem}>⏱️ <b>{totalJp}</b> Total JP</Text>
        </View>
      </View>

      {/* Program Items */}
      <Text style={styles.listSectionTitle}>Daftar Usulan Kegiatan Diklat</Text>

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
        </View>
      ))}

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
            <Text style={styles.submitBtnSub}>Siarkan langsung secara Real-Time ke Portal Web</Text>
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
  }
});


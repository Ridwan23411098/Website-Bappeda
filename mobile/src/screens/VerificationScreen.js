import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { supabase } from '../services/supabase';
import { realtimeService } from '../services/realtime';

const MOCK_SUBMISSIONS = [
  {
    id: 1,
    nip: '198503152010011015',
    nama: 'Andi Arafat, S.T., M.T.',
    jabatan: 'Analis Perencanaan Ahli Muda',
    unit: 'Bidang PMPE Bappeda',
    jp: 20,
    status: 'Diajukan ke Atasan'
  },
  {
    id: 2,
    nip: '199008242015031002',
    nama: 'Budi Santoso, S.E., M.Si.',
    jabatan: 'Perencana Ahli Muda',
    unit: 'Bidang Perekonomian',
    jp: 24,
    status: 'Disetujui'
  },
  {
    id: 3,
    nip: '199204172016022001',
    nama: 'Siti Rahmawati, S.P., M.P.',
    jabatan: 'Analis Kebijakan Pertama',
    unit: 'Bidang Infrastruktur & Kewilayahan',
    jp: 18,
    status: 'Diajukan ke Atasan'
  }
];

export default function VerificationScreen({ user }) {
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubmissions = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('idp_submissions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (data && data.length > 0) {
        // Merge with existing list
        setSubmissions(prev => {
          const map = new Map(prev.map(p => [p.nip, p]));
          data.forEach(d => {
            const existing = map.get(d.nip) || {
              id: d.id,
              nip: d.nip,
              nama: 'Pegawai ASN ' + d.nip.slice(-4),
              jabatan: 'Staf Bappeda',
              unit: 'Bappeda Lampung',
              jp: 20
            };
            existing.status = d.status || existing.status;
            map.set(d.nip, existing);
          });
          return Array.from(map.values());
        });
      }
    } catch (e) {
      console.warn("Fetch submissions error:", e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();

    const unsubscribe = realtimeService.subscribe((event) => {
      if (event.type === 'IDP_SUBMITTED') {
        Alert.alert('📝 Pengajuan IDP Masuk', `${event.payload?.pegawai} baru saja mengajukan IDP.`);
        fetchSubmissions();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (sub) => {
    try {
      // 1. Update Supabase
      await supabase
        .from('idp_submissions')
        .upsert({
          nip: sub.nip,
          status: 'Disetujui',
          updated_at: new Date().toISOString()
        });

      // 2. Broadcast ke pegawai
      await realtimeService.broadcast('IDP_VERIFIED', {
        nip: sub.nip,
        status: 'Disetujui',
        notes: 'Disetujui resmi oleh Tim Pengelola SDM via aplikasi smartphone.'
      }, user);

      setSubmissions(prev => prev.map(s => s.nip === sub.nip ? { ...s, status: 'Disetujui' } : s));
      Alert.alert('✅ Berhasil Disetujui', `Rencana IDP ${sub.nama} telah disahkan dan langsung tersinkronisasi ke layar pegawai.`);
    } catch (e) {
      Alert.alert('Gagal', e.message);
    }
  };

  const handleRequestRevision = async (sub) => {
    try {
      await supabase
        .from('idp_submissions')
        .upsert({
          nip: sub.nip,
          status: 'Perlu Revisi',
          updated_at: new Date().toISOString()
        });

      await realtimeService.broadcast('IDP_VERIFIED', {
        nip: sub.nip,
        status: 'Perlu Revisi',
        notes: 'Mohon sesuaikan proporsi JP dengan target Renstra Bappeda.'
      }, user);

      setSubmissions(prev => prev.map(s => s.nip === sub.nip ? { ...s, status: 'Perlu Revisi' } : s));
      Alert.alert('⚠️ Catatan Dikirim', `Permintaan revisi untuk ${sub.nama} telah dikirim ke perangkat pegawai.`);
    } catch (e) {
      Alert.alert('Gagal', e.message);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchSubmissions} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Pusat Verifikasi IDP ASN</Text>
        <Text style={styles.subtitle}>
          Kelola persetujuan rencana kompetensi pegawai Bappeda Provinsi Lampung secara real-time.
        </Text>
      </View>

      {submissions.map((item) => {
        const isApproved = item.status === 'Disetujui' || item.status === 'Final';
        const isRevision = item.status === 'Perlu Revisi';

        return (
          <View key={item.nip} style={styles.subCard}>
            <View style={styles.subCardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subNama}>{item.nama}</Text>
                <Text style={styles.subJabatan}>{item.jabatan}</Text>
                <Text style={styles.subNip}>NIP. {item.nip}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                isApproved ? styles.badgeGreen : isRevision ? styles.badgeYellow : styles.badgeBlue
              ]}>
                <Text style={[
                  styles.statusText,
                  isApproved ? styles.textGreen : isRevision ? styles.textYellow : styles.textBlue
                ]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>🏛️ Unit: {item.unit}</Text>
              <Text style={styles.jpBadge}>{item.jp} JP</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.btnAction, styles.btnApprove]}
                onPress={() => handleApprove(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.btnApproveText}>✓ Sahkan / Setujui</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnAction, styles.btnRevise]}
                onPress={() => handleRequestRevision(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.btnReviseText}>Catatan Revisi</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
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
  header: {
    marginBottom: 16
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0b2545'
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16
  },
  subCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
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
  subCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  subNama: {
    fontSize: 13,
    fontWeight: '750',
    color: '#0f172a'
  },
  subJabatan: {
    fontSize: 11,
    color: '#334155',
    marginTop: 1
  },
  subNip: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  badgeGreen: { backgroundColor: '#dcfce7' },
  badgeYellow: { backgroundColor: '#fef3c7' },
  badgeBlue: { backgroundColor: '#e0f2fe' },
  statusText: { fontSize: 10, fontWeight: '750' },
  textGreen: { color: '#15803d' },
  textYellow: { color: '#b45309' },
  textBlue: { color: '#0369a1' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 10
  },
  infoText: {
    fontSize: 11,
    color: '#475569'
  },
  jpBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e3a8a'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8
  },
  btnAction: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnApprove: {
    backgroundColor: '#16a34a'
  },
  btnApproveText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '700'
  },
  btnRevise: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  btnReviseText: {
    color: '#475569',
    fontSize: 11.5,
    fontWeight: '600'
  }
});


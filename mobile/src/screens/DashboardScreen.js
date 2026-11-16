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

export default function DashboardScreen({ user, navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(true);
  const [jpTotal, setJpTotal] = useState(20);
  const [jpAchieved, setJpAchieved] = useState(12);
  const [idpStatus, setIdpStatus] = useState('Disetujui');
  const [latestDirective, setLatestDirective] = useState({
    penulis: 'Dr. ANANG RISGIYANTO, S.K.M., M.Kes.',
    tanggal: '16 November 2026',
    arahan: 'Tingkatkan kompetensi digital, analitika data perencanaan, dan implementasi SPBE terintegrasi menuju Lampung Maju.'
  });

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // 1. Ambil status pengajuan IDP dari Supabase
      if (user && user.nip) {
        const { data, error } = await supabase
          .from('idp_submissions')
          .select('*')
          .eq('nip', user.nip.replace(/\s+/g, ''))
          .maybeSingle();

        if (data) {
          setIdpStatus(data.status || 'Diajukan ke Atasan');
          if (data.progress) setJpAchieved(Math.round((data.progress / 100) * 20));
        }
      }

      // 2. Ambil arahan pimpinan terbaru dari Supabase notifikasi
      const { data: notifs } = await supabase
        .from('notifikasi')
        .select('*')
        .ilike('judul', '%Arahan Kepala Bappeda%')
        .order('created_at', { ascending: false })
        .limit(1);

      if (notifs && notifs.length > 0) {
        setLatestDirective({
          penulis: 'Dr. ANANG RISGIYANTO, S.K.M., M.Kes.',
          tanggal: 'Terkini',
          arahan: notifs[0].pesan.replace(/^"|"$/g, '')
        });
      }
    } catch (e) {
      console.warn("Fetch dashboard error:", e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe ke event realtime Supabase
    const unsubscribe = realtimeService.subscribe((event) => {
      if (event.type === 'NEW_EXECUTIVE_DIRECTIVE') {
        setLatestDirective({
          penulis: event.sender?.name || 'Dr. ANANG RISGIYANTO, S.K.M., M.Kes.',
          tanggal: 'Baru saja',
          arahan: event.payload?.arahan || 'Arahan baru pimpinan.'
        });
        Alert.alert('📢 Arahan Pimpinan Baru', event.payload?.arahan);
      } else if (event.type === 'IDP_VERIFIED') {
        if (event.payload?.nip === user.nip) {
          setIdpStatus(event.payload?.status || 'Disetujui');
          Alert.alert('✅ Status IDP Terkini', `IDP Anda telah berstatus: ${event.payload?.status}`);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleSendPing = async () => {
    await realtimeService.broadcast('PING_TEST', { sender: user.name }, user);
    Alert.alert('⚡ Sinyal Real-Time Dikirim', 'Sinyal telah disiarkan ke seluruh laptop dan HP yang sedang membuka aplikasi.');
  };

  const progressPct = Math.min(100, Math.round((jpAchieved / jpTotal) * 100));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
    >
      {/* Top Profile Strip */}
      <View style={styles.topProfile}>
        <View>
          <Text style={styles.welcomeText}>Selamat Datang,</Text>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userRole}>{user.jabatan}</Text>
        </View>
        <View style={styles.realtimeBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.realtimeText}>Real-Time</Text>
        </View>
      </View>

      {/* Target Bangkom Card */}
      <View style={styles.cardPrimary}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitleWhite}>Capaian Hak Bangkom 2026</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{idpStatus}</Text>
          </View>
        </View>

        <Text style={styles.cardSubtitleWhite}>
          Standar Minimal PermenPAN-RB No. 6/2022: 20 Jam Pelajaran (JP) / Tahun
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
          </View>
          <View style={styles.progressInfoRow}>
            <Text style={styles.progressInfoWhite}>{jpAchieved} dari {jpTotal} JP Terpenuhi</Text>
            <Text style={styles.progressPctWhite}>{progressPct}%</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooterStats}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>12 JP</Text>
            <Text style={styles.statLabel}>Terlaksana</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>8 JP</Text>
            <Text style={styles.statLabel}>Direncanakan</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>100%</Text>
            <Text style={styles.statLabel}>Relevansi Renstra</Text>
          </View>
        </View>
      </View>

      {/* Latest Directive Banner */}
      <View style={styles.directiveCard}>
        <View style={styles.directiveHeader}>
          <Text style={styles.directiveBadge}>📢 ARAHAN KEPALA BAPPEDA</Text>
          <Text style={styles.directiveDate}>{latestDirective.tanggal}</Text>
        </View>
        <Text style={styles.directiveText}>"{latestDirective.arahan}"</Text>
        <Text style={styles.directiveAuthor}>{latestDirective.penulis}</Text>
      </View>

      {/* Quick Action Buttons */}
      <Text style={styles.sectionHeader}>Aksi Cepat Mobile</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('IDP')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>📝</Text>
          <Text style={styles.actionTitle}>Formulir IDP</Text>
          <Text style={styles.actionDesc}>Rencana Kompetensi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleSendPing}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>⚡</Text>
          <Text style={styles.actionTitle}>Uji Sinyal</Text>
          <Text style={styles.actionDesc}>Ping Sinkronisasi</Text>
        </TouchableOpacity>
      </View>

      {user.role === 'pimpinan' && (
        <TouchableOpacity
          style={styles.pimpinanSpecialBtn}
          onPress={() => navigation.navigate('Arahan')}
          activeOpacity={0.85}
        >
          <Text style={styles.pimpinanBtnIcon}>✍️</Text>
          <View>
            <Text style={styles.pimpinanBtnTitle}>Terbitkan Arahan Pimpinan Baru</Text>
            <Text style={styles.pimpinanBtnSub}>Kirim langsung ke seluruh layar pegawai ASN</Text>
          </View>
        </TouchableOpacity>
      )}

      {user.role === 'admin' && (
        <TouchableOpacity
          style={styles.adminSpecialBtn}
          onPress={() => navigation.navigate('Verifikasi')}
          activeOpacity={0.85}
        >
          <Text style={styles.pimpinanBtnIcon}>🛡️</Text>
          <View>
            <Text style={styles.pimpinanBtnTitle}>Pusat Verifikasi IDP Pegawai</Text>
            <Text style={styles.pimpinanBtnSub}>Setujui usulan bangkom secara real-time</Text>
          </View>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9'
  },
  content: {
    padding: 16,
    paddingBottom: 30
  },
  topProfile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  welcomeText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600'
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 1
  },
  userRole: {
    fontSize: 11,
    color: '#475569',
    marginTop: 1
  },
  realtimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86efac'
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
    marginRight: 5
  },
  realtimeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d'
  },
  cardPrimary: {
    backgroundColor: '#0b2545',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#0b2545',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitleWhite: {
    fontSize: 14.5,
    fontWeight: '750',
    color: '#ffffff'
  },
  statusPill: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#22c55e'
  },
  statusPillText: {
    color: '#4ade80',
    fontSize: 10,
    fontWeight: '750'
  },
  cardSubtitleWhite: {
    fontSize: 10.5,
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 14
  },
  progressContainer: {
    marginBottom: 14
  },
  progressBarBg: {
    height: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 5,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 5
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6
  },
  progressInfoWhite: {
    fontSize: 11,
    color: '#cbd5e1'
  },
  progressPctWhite: {
    fontSize: 11.5,
    fontWeight: '750',
    color: '#38bdf8'
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 12
  },
  cardFooterStats: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statCol: {
    alignItems: 'center',
    flex: 1
  },
  statNum: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#ffffff'
  },
  statLabel: {
    fontSize: 9.5,
    color: '#94a3b8',
    marginTop: 2
  },
  directiveCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 16
  },
  directiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  directiveBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309'
  },
  directiveDate: {
    fontSize: 10,
    color: '#78350f'
  },
  directiveText: {
    fontSize: 12,
    color: '#78350f',
    fontStyle: 'italic',
    lineHeight: 18
  },
  directiveAuthor: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#92400e',
    marginTop: 6,
    textAlign: 'right'
  },
  sectionHeader: {
    fontSize: 13.5,
    fontWeight: '750',
    color: '#0f172a',
    marginBottom: 10
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center'
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 6
  },
  actionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0f172a'
  },
  actionDesc: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2
  },
  pimpinanSpecialBtn: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14
  },
  adminSpecialBtn: {
    backgroundColor: '#15803d',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14
  },
  pimpinanBtnIcon: {
    fontSize: 26
  },
  pimpinanBtnTitle: {
    fontSize: 13,
    fontWeight: '750',
    color: '#ffffff'
  },
  pimpinanBtnSub: {
    fontSize: 10.5,
    color: '#cbd5e1',
    marginTop: 1
  }
});


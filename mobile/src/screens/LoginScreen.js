import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';

const ROLES = [
  {
    role: 'pegawai',
    title: 'Pegawai ASN',
    name: 'Andi Arafat, S.T., M.T.',
    nip: '198503152010011015',
    jabatan: 'Analis Perencanaan Ahli Muda',
    badge: 'ASN',
    color: '#0284c7'
  },
  {
    role: 'admin',
    title: 'Admin SDM',
    name: 'Cik Marya, S.Sos., M.M.',
    nip: '197805122005012008',
    jabatan: 'Kasubbag Kepegawaian & Umum',
    badge: 'SDM',
    color: '#16a34a'
  },
  {
    role: 'pimpinan',
    title: 'Pimpinan',
    name: 'Dr. ANANG RISGIYANTO, S.K.M., M.Kes.',
    nip: '197507312000031002',
    jabatan: 'Kepala Bappeda Provinsi Lampung',
    badge: 'Kaban',
    color: '#d97706'
  }
];

export default function LoginScreen({ onLogin }) {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');

  const handleQuickLogin = (account) => {
    onLogin({
      role: account.role,
      name: account.name,
      nip: account.nip,
      jabatan: account.jabatan
    });
  };

  const handleCustomLogin = () => {
    if (!nip.trim()) {
      Alert.alert('Perhatian', 'Silakan masukkan NIP ASN Anda.');
      return;
    }
    const matched = ROLES.find(r => r.nip.replace(/\s+/g, '') === nip.replace(/\s+/g, ''));
    if (matched) {
      handleQuickLogin(matched);
    } else {
      onLogin({
        role: 'pegawai',
        name: 'Pegawai ASN Bappeda',
        nip: nip.trim(),
        jabatan: 'Staf Perencana'
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Header Branding */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.govTitle}>PEMERINTAH PROVINSI LAMPUNG</Text>
            <Text style={styles.appTitle}>SIP-KOMPETENSI</Text>
            <Text style={styles.appSubtitle}>
              Sistem Informasi Perencanaan &amp; Pengembangan Kompetensi ASN
            </Text>
            <View style={styles.yearTag}>
              <Text style={styles.yearText}>TAHUN ANGGARAN 2026</Text>
            </View>
          </View>

          {/* Quick Login Role Cards */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Pilih Akses Cepat Simulasi</Text>
            <Text style={styles.sectionSubtitle}>
              Masuk langsung sesuai peran kedinasan untuk menguji sinkronisasi real-time:
            </Text>

            {ROLES.map((acc) => (
              <TouchableOpacity
                key={acc.role}
                style={[styles.roleCard, { borderLeftColor: acc.color }]}
                onPress={() => handleQuickLogin(acc)}
                activeOpacity={0.8}
              >
                <View style={styles.roleCardLeft}>
                  <View style={[styles.badge, { backgroundColor: acc.color }]}>
                    <Text style={styles.badgeText}>{acc.badge}</Text>
                  </View>
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleTitle}>{acc.title}</Text>
                    <Text style={styles.roleName} numberOfLines={1}>{acc.name}</Text>
                    <Text style={styles.roleNip}>NIP. {acc.nip}</Text>
                  </View>
                </View>
                <Text style={styles.roleArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* NIP Login Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Masuk dengan NIP Resmi</Text>
            <TextInput
              style={styles.input}
              placeholder="18 Digit NIP Pegawai..."
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={nip}
              onChangeText={setNip}
            />
            <TextInput
              style={styles.input}
              placeholder="Kata Sandi Akun..."
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleCustomLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>Masuk ke Sistem</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            Badan Perencanaan Pembangunan Daerah Provinsi Lampung{'\n'}
            Jl. Wolter Monginsidi Nomor 224 Telukbetung, Bandar Lampung
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b2545'
  },
  keyboardView: {
    flex: 1
  },
  scroll: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  logoWrap: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  logo: {
    width: 48,
    height: 48
  },
  govTitle: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#93c5fd',
    fontWeight: '700',
    marginBottom: 2
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5
  },
  appSubtitle: {
    fontSize: 11.5,
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 290
  },
  yearTag: {
    marginTop: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)'
  },
  yearText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38bdf8'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0f172a'
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 14
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  roleCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 10
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff'
  },
  roleInfo: {
    flex: 1
  },
  roleTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0f172a'
  },
  roleName: {
    fontSize: 11.5,
    color: '#334155',
    marginTop: 1
  },
  roleNip: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1
  },
  roleArrow: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: 'bold',
    marginLeft: 6
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18
  },
  formTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 10
  },
  loginBtn: {
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
    padding: 13,
    alignItems: 'center',
    marginTop: 4
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700'
  },
  footer: {
    fontSize: 10.5,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16
  }
});


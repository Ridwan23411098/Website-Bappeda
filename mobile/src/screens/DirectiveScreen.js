import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { supabase } from '../services/supabase';
import { realtimeService } from '../services/realtime';

export default function DirectiveScreen({ user }) {
  const [target, setTarget] = useState('Seluruh Kepala Bidang & ASN Bappeda');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendDirective = async () => {
    if (!text.trim()) {
      Alert.alert('Perhatian', 'Silakan ketik isi instruksi/arahan pimpinan terlebih dahulu.');
      return;
    }

    setSending(true);
    try {
      const directiveObj = {
        id: Date.now(),
        tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        penulis: user.name || 'Dr. ANANG RISGIYANTO, S.K.M., M.Kes.',
        jabatan: 'Kepala Bappeda Provinsi Lampung',
        target: target,
        arahan: text.trim(),
        status: 'Aktif / Berlaku'
      };

      // 1. Simpan ke notifikasi di Supabase
      await supabase.from('notifikasi').insert([{
        penerima: 'all',
        pengirim: user.name,
        judul: `📢 Arahan Kepala Bappeda (${target})`,
        pesan: `"${text.trim()}"`,
        tipe: 'warning',
        dibaca: false,
        created_at: new Date().toISOString()
      }]);

      // 2. Broadcast ke seluruh web dan HP
      await realtimeService.broadcast('NEW_EXECUTIVE_DIRECTIVE', directiveObj, user);

      setText('');
      Alert.alert(
        '📢 Arahan Berhasil Disiarkan',
        'Arahan Kepala Bappeda telah disiarkan secara instan ke seluruh pegawai ASN Bappeda Provinsi Lampung.'
      );
    } catch (e) {
      Alert.alert('Gagal', e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <Text style={styles.bannerBadge}>DISPOSISI &amp; ARAHAN EKSEKUTIF</Text>
        <Text style={styles.bannerTitle}>Kepala Bappeda Provinsi Lampung</Text>
        <Text style={styles.bannerAuthor}>{user.name}</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Target Penerima Arahan:</Text>
        <TextInput
          style={styles.input}
          value={target}
          onChangeText={setTarget}
          placeholder="Target penerima arahan..."
        />

        <Text style={styles.label}>Isi Arahan / Instruksi Prioritas:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={5}
          value={text}
          onChangeText={setText}
          placeholder="Tuliskan arahan pimpinan, arahan Renstra, atau percepatan capaian JP bagi pegawai..."
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity
          style={[styles.sendBtn, sending && { opacity: 0.7 }]}
          onPress={handleSendDirective}
          disabled={sending}
          activeOpacity={0.85}
        >
          {sending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text style={styles.sendBtnText}>📢 Siarkan Arahan ke Seluruh Layar ASN</Text>
              <Text style={styles.sendBtnSub}>Terkirim seketika via Supabase WebSocket Real-Time</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  banner: {
    backgroundColor: '#0b2545',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16
  },
  bannerBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 1
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '750',
    color: '#ffffff',
    marginTop: 2
  },
  bannerAuthor: {
    fontSize: 11,
    color: '#cbd5e1',
    marginTop: 2
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 14
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top'
  },
  sendBtn: {
    backgroundColor: '#d97706',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#d97706',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4
  },
  sendBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '750'
  },
  sendBtnSub: {
    color: '#fef3c7',
    fontSize: 10,
    marginTop: 2
  }
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { supabase } from '../services/supabase';
import { realtimeService } from '../services/realtime';

export default function NotificationScreen({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('notifikasi')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25);

      if (data) {
        setNotifications(data);
      }
    } catch (e) {
      console.warn("Fetch notif error:", e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const unsubscribe = realtimeService.subscribe((event) => {
      if (event.type === 'NEW_NOTIFICATION') {
        setNotifications(prev => [event.payload, ...prev]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Notifikasi Kedinasan</Text>
        <Text style={styles.subtitle}>Pemberitahuan resmi dan arahan dari pimpinan / admin.</Text>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyTitle}>Belum Ada Notifikasi Baru</Text>
          <Text style={styles.emptyDesc}>Pemberitahuan resmi terkait usulan bangkom akan tampil di sini.</Text>
        </View>
      ) : (
        notifications.map((n) => {
          const isWarning = n.tipe === 'warning';
          const isSuccess = n.tipe === 'success';

          return (
            <View key={n.id} style={[
              styles.notifCard,
              isWarning && styles.cardBorderYellow,
              isSuccess && styles.cardBorderGreen
            ]}>
              <View style={styles.notifTop}>
                <Text style={styles.notifBadge}>
                  {isWarning ? '📢 ARAHAN' : isSuccess ? '✅ INFORMASI' : 'ℹ️ PEMBERITAHUAN'}
                </Text>
                <Text style={styles.notifTime}>
                  {n.created_at ? new Date(n.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Hari ini'}
                </Text>
              </View>

              <Text style={styles.notifJudul}>{n.judul}</Text>
              <Text style={styles.notifPesan}>{n.pesan}</Text>

              {n.pengirim && (
                <Text style={styles.notifSender}>Dari: {n.pengirim}</Text>
              )}
            </View>
          );
        })
      )}
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
    marginTop: 2
  },
  emptyWrap: {
    alignItems: 'center',
    padding: 40
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155'
  },
  emptyDesc: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4
  },
  notifCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  cardBorderYellow: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b'
  },
  cardBorderGreen: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981'
  },
  notifTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  notifBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748b'
  },
  notifTime: {
    fontSize: 10,
    color: '#94a3b8'
  },
  notifJudul: {
    fontSize: 13,
    fontWeight: '750',
    color: '#0f172a',
    marginBottom: 4
  },
  notifPesan: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 17
  },
  notifSender: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 6,
    fontStyle: 'italic'
  }
});

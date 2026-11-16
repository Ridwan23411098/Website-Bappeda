/**
 * SIP-KOMPETENSI — BAPPEDA PROVINSI LAMPUNG
 * Main Mobile Application Entry (React Native)
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { realtimeService } from './src/services/realtime';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import IdpScreen from './src/screens/IdpScreen';
import VerificationScreen from './src/screens/VerificationScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import DirectiveScreen from './src/screens/DirectiveScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [realtimeActive, setRealtimeActive] = useState(false);

  useEffect(() => {
    // Inisialisasi Realtime engine
    realtimeService.init((connected) => {
      setRealtimeActive(connected);
    });
  }, []);

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0b2545" />
        <LoginScreen onLogin={setUser} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0b2545" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0b2545',
              elevation: 0,
              shadowOpacity: 0
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: '800',
              fontSize: 15
            },
            headerRight: () => (
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.logoutText}>Keluar</Text>
              </TouchableOpacity>
            ),
            tabBarStyle: {
              height: 60,
              paddingBottom: 8,
              paddingTop: 6,
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#e2e8f0'
            },
            tabBarActiveTintColor: '#1e3a8a',
            tabBarInactiveTintColor: '#64748b',
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '700'
            }
          }}
        >
          {/* Tab 1: Beranda */}
          <Tab.Screen
            name="Beranda"
            options={{
              title: 'SIP-KOMPETENSI',
              tabBarLabel: 'Beranda',
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text>
            }}
          >
            {(props) => <DashboardScreen {...props} user={user} />}
          </Tab.Screen>

          {/* Tab 2: IDP (Pegawai) */}
          {user.role === 'pegawai' && (
            <Tab.Screen
              name="IDP"
              options={{
                title: 'Rencana IDP 2026',
                tabBarLabel: 'IDP Saya',
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📋</Text>
              }}
            >
              {(props) => <IdpScreen {...props} user={user} />}
            </Tab.Screen>
          )}

          {/* Tab 2: Verifikasi (Admin & Pimpinan) */}
          {(user.role === 'admin' || user.role === 'pimpinan') && (
            <Tab.Screen
              name="Verifikasi"
              options={{
                title: 'Verifikasi IDP ASN',
                tabBarLabel: 'Verifikasi',
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🛡️</Text>
              }}
            >
              {(props) => <VerificationScreen {...props} user={user} />}
            </Tab.Screen>
          )}

          {/* Tab Khusus Pimpinan: Arahan Eksekutif */}
          {user.role === 'pimpinan' && (
            <Tab.Screen
              name="Arahan"
              options={{
                title: 'Arahan Kepala Bappeda',
                tabBarLabel: 'Arahan',
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📢</Text>
              }}
            >
              {(props) => <DirectiveScreen {...props} user={user} />}
            </Tab.Screen>
          )}

          {/* Tab Terakhir: Notifikasi */}
          <Tab.Screen
            name="Notifikasi"
            options={{
              title: 'Notifikasi Kedinasan',
              tabBarLabel: 'Notifikasi',
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🔔</Text>
            }}
          >
            {(props) => <NotificationScreen {...props} user={user} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  logoutBtn: {
    marginRight: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)'
  },
  logoutText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '750'
  }
});

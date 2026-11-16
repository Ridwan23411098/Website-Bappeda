/**
 * SIP-KOMPETENSI — BAPPEDA PROVINSI LAMPUNG
 * Realtime Synchronization Engine for React Native Mobile
 */

import { supabase } from './supabase';

class MobileRealtimeService {
  constructor() {
    this.channel = null;
    this.listeners = new Set();
    this.isConnected = false;
  }

  init(onStatusChange) {
    try {
      this.channel = supabase
        .channel('public:sip_realtime_channel', {
          config: { broadcast: { self: false } }
        })
        .on('broadcast', { event: 'sip_broadcast' }, ({ payload }) => {
          this.notifyListeners(payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'idp_submissions' }, (payload) => {
          this.notifyListeners({ type: 'IDP_SUBMISSION_CHANGED', payload });
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifikasi' }, (payload) => {
          this.notifyListeners({ type: 'NEW_NOTIFICATION', payload: payload.new });
        })
        .subscribe((status) => {
          this.isConnected = status === 'SUBSCRIBED';
          if (onStatusChange) onStatusChange(this.isConnected);
        });
    } catch (e) {
      console.warn("Mobile Realtime init error:", e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(event) {
    this.listeners.forEach((fn) => {
      try { fn(event); } catch (e) {}
    });
  }

  /**
   * Mengirim event dari HP ke seluruh komputer / browser web
   */
  async broadcast(eventType, payload, user = null) {
    if (!this.channel) return;
    const packet = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      type: eventType,
      payload: payload,
      sender: user ? { nip: user.nip, name: user.name, role: user.role } : { role: 'mobile_app' },
      timestamp: new Date().toISOString()
    };

    try {
      await this.channel.send({
        type: 'broadcast',
        event: 'sip_broadcast',
        payload: packet
      });
    } catch (err) {
      console.warn("Mobile broadcast error:", err);
    }
  }
}

export const realtimeService = new MobileRealtimeService();
export default realtimeService;

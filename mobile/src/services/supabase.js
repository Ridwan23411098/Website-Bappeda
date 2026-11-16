/**
 * SIP-KOMPETENSI — BAPPEDA PROVINSI LAMPUNG
 * Supabase Client Service for React Native
 */

import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://sgzpoxeoqicrxbrenrjk.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_QcYPV_Qiwk6BIA2IbOg9Qg_jHl0XsiQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export default supabase;

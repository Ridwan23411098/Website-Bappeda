/**
 * SIP-KOMPETENSI — BAPPEDA PROVINSI LAMPUNG
 * Koneksi ke Database Supabase
 */

// Gunakan URL project Supabase Anda di sini
const SUPABASE_URL = 'https://sgzpoxeoqicrxbrenrjk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QcYPV_Qiwk6BIA2IbOg9Qg_jHl0XsiQ';

// Inisialisasi koneksi
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Supabase Client Initialized");

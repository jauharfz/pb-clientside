/**
 * src/lib/supabase.js
 * ───────────────────
 * Supabase JS client untuk Gate Frontend.
 * Digunakan HANYA untuk Realtime subscription (tabel kunjungan).
 * Semua operasi data tetap lewat Gate Backend API (axios/api.js).
 *
 * ENV vars yang diperlukan (tambahkan ke .env / Vercel environment):
 *   VITE_SUPABASE_URL      = https://kyaxslefkmgfknesiawy.supabase.co
 *   VITE_SUPABASE_ANON_KEY = <anon key dari Supabase Dashboard → Project Settings → API>
 *
 * PENTING: Gunakan ANON KEY (bukan service_role key) di frontend.
 * Anon key aman untuk disertakan di client-side code.
 *
 * SETUP REALTIME di Supabase (wajib sekali, jalankan di SQL Editor):
 *   ALTER PUBLICATION supabase_realtime ADD TABLE kunjungan;
 * Atau aktifkan di Dashboard → Database → Replication → kunjungan.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || '';
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * supabaseRealtime — client Supabase untuk subscription saja.
 * null jika env vars belum dikonfigurasi (fallback ke polling).
 */
export const supabaseRealtime = (supabaseUrl && supabaseAnon)
    ? createClient(supabaseUrl, supabaseAnon, {
        realtime: {
            params: { eventsPerSecond: 10 },
        },
    })
    : null;

/**
 * isRealtimeReady — helper untuk cek apakah Realtime bisa dipakai.
 */
export const isRealtimeReady = () => Boolean(supabaseRealtime);
/**
 * Monitor.jsx — Halaman Monitor NFC Gate
 * ──────────────────────────────────────────────────────────────────
 * LETAKKAN FILE INI DI: gate-frontend/src/pages/Monitor.jsx
 *
 * DEPENDENCIES yang dibutuhkan di gate-frontend:
 *   npm install @supabase/supabase-js
 *
 * ENV VARS yang dibutuhkan (.env gate-frontend):
 *   VITE_API_URL=https://jauharfz-pb-serverside.hf.space/api
 *   VITE_SUPABASE_URL=https://jrbvrvsuyulckhwlunqs.supabase.co
 *   VITE_SUPABASE_ANON_KEY=<anon key dari Supabase Dashboard>
 *   VITE_GATE_TOKEN=<JWT token admin Gate, atau hapus jika monitor tidak perlu auth>
 *
 * NFC HARDWARE: R20C-USB (keyboard emulator mode)
 *   - Scan kartu → reader mengetik UID string (contoh: "0103656316")
 *     lalu otomatis kirim Enter
 *   - Page ini menangkap input tersebut via hidden input yang selalu focused
 *   - On Enter → POST /api/tap → tampilkan hasil
 *
 * REALTIME: Supabase Realtime subscription ke tabel `kunjungan`
 *   - Setiap INSERT atau UPDATE langsung muncul di live feed
 *   - Aktifkan dulu di Supabase Dashboard → Database → Replication:
 *     ALTER PUBLICATION supabase_realtime ADD TABLE kunjungan;
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client (anon key — hanya untuk realtime, RLS berlaku) ─────────
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || "";
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase      = SUPABASE_URL && SUPABASE_ANON
    ? createClient(SUPABASE_URL, SUPABASE_ANON)
    : null;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const TOKEN   = import.meta.env.VITE_GATE_TOKEN || "";

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtTime(iso) {
    if (!iso) return "—";
    return new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(new Date(iso));
}

function fmtDate(iso) {
    if (!iso) return "";
    return new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(iso));
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#0f1117;color:#e2e8f0;font-family:'DM Sans',sans-serif}
.mon-root{min-height:100vh;display:grid;grid-template-rows:auto 1fr;background:#0f1117}
.mon-header{background:#161b27;border-bottom:1px solid rgba(255,255,255,.07);padding:0 24px}
.mon-header-inner{max-width:1400px;margin:0 auto;height:60px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.mon-brand{display:flex;align-items:center;gap:10px}
.mon-brand-mark{width:34px;height:34px;background:linear-gradient(135deg,#2f855a,#48bb78);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px}
.mon-brand-name{font-family:'Lora',serif;font-size:16px;font-weight:700;color:#f0fdf4}
.mon-brand-badge{font-size:11px;font-weight:600;background:rgba(47,133,90,.2);color:#6ee7b7;padding:3px 10px;border-radius:999px;letter-spacing:.04em}
.mon-status-pill{display:flex;align-items:center;gap:6px;font-size:13px}
.mon-dot{width:8px;height:8px;border-radius:50%}
.mon-dot.connected{background:#10b981;box-shadow:0 0 8px #10b981}
.mon-dot.disconnected{background:#ef4444}
.mon-body{max-width:1400px;margin:0 auto;padding:24px;display:grid;grid-template-columns:1fr 380px;gap:24px;width:100%}
@media(max-width:900px){.mon-body{grid-template-columns:1fr}}
.mon-col{display:flex;flex-direction:column;gap:20px}

/* Tap Zone */
.mon-tap-zone{background:#161b27;border-radius:16px;padding:32px;text-align:center;border:2px solid transparent;transition:border-color .3s,background .3s;position:relative;overflow:hidden;cursor:pointer}
.mon-tap-zone.idle{border-color:rgba(255,255,255,.06)}
.mon-tap-zone.scanning{border-color:rgba(248,197,23,.5);background:rgba(248,197,23,.04);animation:pulse-yellow 1.5s infinite}
.mon-tap-zone.success-masuk{border-color:rgba(16,185,129,.5);background:rgba(16,185,129,.04);animation:pulse-green .5s ease}
.mon-tap-zone.success-keluar{border-color:rgba(99,102,241,.5);background:rgba(99,102,241,.04);animation:pulse-indigo .5s ease}
.mon-tap-zone.error{border-color:rgba(239,68,68,.5);background:rgba(239,68,68,.04);animation:shake .4s ease}
@keyframes pulse-yellow{0%,100%{box-shadow:0 0 0 0 rgba(248,197,23,.0)}50%{box-shadow:0 0 0 12px rgba(248,197,23,.1)}}
@keyframes pulse-green{0%{box-shadow:0 0 0 0 rgba(16,185,129,.4)}100%{box-shadow:0 0 0 20px rgba(16,185,129,.0)}}
@keyframes pulse-indigo{0%{box-shadow:0 0 0 0 rgba(99,102,241,.4)}100%{box-shadow:0 0 0 20px rgba(99,102,241,.0)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
.mon-tap-nfc-icon{font-size:64px;margin-bottom:16px;display:block;line-height:1}
.mon-tap-uid{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:500;color:#f1f5f9;letter-spacing:.08em;min-height:40px;margin-bottom:8px}
.mon-tap-status{font-size:14px;color:#94a3b8;min-height:22px}
.mon-tap-hint{font-size:12px;color:#475569;margin-top:12px}

/* Result card */
.mon-result{background:#161b27;border-radius:16px;padding:24px;border:1.5px solid rgba(255,255,255,.06)}
.mon-result-inner{display:flex;align-items:center;gap:16px}
.mon-result-avatar{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
.mon-result-name{font-family:'Lora',serif;font-size:20px;font-weight:700;color:#f1f5f9}
.mon-result-meta{font-size:13px;color:#64748b;margin-top:3px}
.mon-result-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:.04em;margin-top:6px}

/* Stats */
.mon-stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.mon-stat{background:#161b27;border-radius:14px;padding:16px 18px;border:1px solid rgba(255,255,255,.05)}
.mon-stat-val{font-family:'Lora',serif;font-size:28px;font-weight:700;line-height:1}
.mon-stat-label{font-size:12px;color:#64748b;margin-top:4px}

/* Live feed */
.mon-feed{background:#161b27;border-radius:16px;border:1px solid rgba(255,255,255,.05);overflow:hidden;flex:1}
.mon-feed-header{padding:14px 20px;border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;justify-content:space-between}
.mon-feed-title{font-size:14px;font-weight:600;color:#94a3b8}
.mon-feed-count{font-size:12px;background:rgba(47,133,90,.15);color:#6ee7b7;padding:2px 10px;border-radius:999px}
.mon-feed-list{max-height:460px;overflow-y:auto}
.mon-feed-row{display:grid;grid-template-columns:70px 1fr 80px 70px;gap:8px;align-items:center;padding:12px 20px;border-bottom:1px solid rgba(255,255,255,.03);font-size:13px;transition:background .15s}
.mon-feed-row:hover{background:rgba(255,255,255,.02)}
.mon-feed-row.new{background:rgba(47,133,90,.08);animation:highlight .8s ease}
@keyframes highlight{0%{background:rgba(47,133,90,.25)}100%{background:rgba(47,133,90,.08)}}
.mon-feed-time{font-family:'JetBrains Mono',monospace;font-size:12px;color:#64748b}
.mon-feed-name{font-weight:500;color:#e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mon-feed-name.biasa{color:#94a3b8}
.mon-feed-tipe{font-size:11px;padding:2px 8px;border-radius:999px;text-align:center}
.mon-feed-tipe.member{background:rgba(16,185,129,.15);color:#6ee7b7}
.mon-feed-tipe.biasa{background:rgba(100,116,139,.15);color:#94a3b8}
.mon-feed-status{font-size:11px;padding:2px 8px;border-radius:999px;text-align:center}
.mon-feed-status.di_dalam{background:rgba(16,185,129,.15);color:#6ee7b7}
.mon-feed-status.keluar{background:rgba(99,102,241,.15);color:#a5b4fc}
.mon-feed-empty{padding:40px;text-align:center;color:#475569;font-size:14px}

/* Hidden NFC input */
.mon-nfc-input{position:absolute;opacity:0;width:1px;height:1px;pointer-events:none}
`;

const INITIAL_STATS = { di_dalam: 0, masuk: 0, keluar: 0 };

export default function Monitor() {
    const [uid, setUid]           = useState(""); // current NFC input buffer
    const [tapState, setTapState] = useState("idle"); // idle|scanning|success-masuk|success-keluar|error
    const [lastResult, setLastResult] = useState(null);
    const [feed, setFeed]         = useState([]);
    const [stats, setStats]       = useState(INITIAL_STATS);
    const [rtConnected, setRtConnected] = useState(false);
    const nfcInputRef = useRef(null);
    const newRowIds   = useRef(new Set());

    // ── Keep NFC input focused ──────────────────────────────────────────────
    useEffect(() => {
        const refocus = () => nfcInputRef.current?.focus();
        refocus();
        document.addEventListener("click", refocus);
        document.addEventListener("keydown", refocus);
        return () => {
            document.removeEventListener("click", refocus);
            document.removeEventListener("keydown", refocus);
        };
    }, []);

    // ── Fetch initial feed & stats ──────────────────────────────────────────
    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            const headers = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};
            const res  = await fetch(`${API_URL}/visitors?status=&tipe_pengunjung=`, { headers });
            const data = await res.json();
            if (data.data) {
                const rows = data.data.slice(0, 60);
                setFeed(rows);
                calcStats(rows);
            }
        } catch { /* silently fail */ }
    };

    const calcStats = (rows) => {
        const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
        const todayRows = rows.filter(r => r.waktu_masuk?.slice(0, 10) === today);
        setStats({
            di_dalam: todayRows.filter(r => r.status === "di_dalam").length,
            masuk:    todayRows.length,
            keluar:   todayRows.filter(r => r.status === "keluar").length,
        });
    };

    // ── Supabase Realtime subscription ─────────────────────────────────────
    useEffect(() => {
        if (!supabase) return;
        const channel = supabase
            .channel("monitor-kunjungan")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "kunjungan" },
                (payload) => {
                    setRtConnected(true);
                    const row = payload.new;
                    if (!row) return;

                    if (payload.eventType === "INSERT") {
                        newRowIds.current.add(row.id);
                        setTimeout(() => newRowIds.current.delete(row.id), 2000);
                        setFeed(prev => [row, ...prev.slice(0, 59)]);
                        setStats(prev => ({
                            ...prev,
                            di_dalam: prev.di_dalam + 1,
                            masuk:    prev.masuk + 1,
                        }));
                    } else if (payload.eventType === "UPDATE") {
                        setFeed(prev => prev.map(r => r.id === row.id ? { ...r, ...row } : r));
                        if (row.status === "keluar") {
                            setStats(prev => ({
                                ...prev,
                                di_dalam: Math.max(0, prev.di_dalam - 1),
                                keluar:   prev.keluar + 1,
                            }));
                        }
                    }
                }
            )
            .subscribe((status) => {
                setRtConnected(status === "SUBSCRIBED");
            });

        return () => { supabase.removeChannel(channel); };
    }, []);

    // ── NFC keyboard emulator input handler ────────────────────────────────
    const handleNfcKeydown = useCallback(async (e) => {
        if (e.key === "Enter") {
            const scannedUid = uid.trim();
            setUid("");
            if (!scannedUid) return;
            await processTap(scannedUid);
        }
    }, [uid]);

    const handleNfcChange = useCallback((e) => {
        setUid(e.target.value);
        if (e.target.value.trim()) setTapState("scanning");
    }, []);

    const processTap = async (scannedUid) => {
        setTapState("scanning");
        const ts = new Date().toISOString();
        try {
            const res  = await fetch(`${API_URL}/tap`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: scannedUid, timestamp: ts }),
            });
            const data = await res.json();

            if (res.ok && data.status === "success") {
                const aksi = data.data.aksi; // "masuk" | "keluar"
                setTapState(aksi === "masuk" ? "success-masuk" : "success-keluar");
                setLastResult({ ok: true, ...data.data });
                // Stats akan di-update via Realtime, tapi fallback manual juga:
                if (!supabase) {
                    setStats(prev => aksi === "masuk"
                        ? { ...prev, di_dalam: prev.di_dalam + 1, masuk: prev.masuk + 1 }
                        : { ...prev, di_dalam: Math.max(0, prev.di_dalam - 1), keluar: prev.keluar + 1 }
                    );
                }
            } else {
                const msg = data.detail?.message || data.message || "UID tidak terdaftar";
                setTapState("error");
                setLastResult({ ok: false, message: msg, uid: scannedUid });
            }
        } catch {
            setTapState("error");
            setLastResult({ ok: false, message: "Gagal terhubung ke server", uid: scannedUid });
        }

        setTimeout(() => setTapState("idle"), 3500);
    };

    // ── Render ──────────────────────────────────────────────────────────────
    const tapIcons = {
        idle:           "📡",
        scanning:       "🔍",
        "success-masuk":"✅",
        "success-keluar":"🚪",
        error:          "❌",
    };
    const tapMessages = {
        idle:           "Tempelkan kartu NFC ke reader...",
        scanning:       `Memproses UID: ${uid || "—"}`,
        "success-masuk":"Tap MASUK berhasil dicatat",
        "success-keluar":"Tap KELUAR berhasil dicatat",
        error:          lastResult?.message || "UID tidak dikenali",
    };

    return (
        <>
            <style>{CSS}</style>
            <div className="mon-root">

                {/* Hidden input always focused for NFC keyboard emulator */}
                <input
                    ref={nfcInputRef}
                    className="mon-nfc-input"
                    value={uid}
                    onChange={handleNfcChange}
                    onKeyDown={handleNfcKeydown}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                />

                {/* Header */}
                <header className="mon-header">
                    <div className="mon-header-inner">
                        <div className="mon-brand">
                            <div className="mon-brand-mark">🎪</div>
                            <span className="mon-brand-name">Gate Monitor</span>
                            <span className="mon-brand-badge">LIVE</span>
                        </div>
                        <div className="mon-status-pill">
                            <div className={`mon-dot ${rtConnected ? "connected" : "disconnected"}`} />
                            <span style={{ color: "#94a3b8", fontSize: 13 }}>
                                {rtConnected ? "Realtime terhubung" : supabase ? "Menghubungkan..." : "Realtime tidak dikonfigurasi"}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Body */}
                <div className="mon-body">

                    {/* Left column */}
                    <div className="mon-col">

                        {/* Stats */}
                        <div className="mon-stats-grid">
                            {[
                                { val: stats.di_dalam, label: "Di Dalam Sekarang", color: "#6ee7b7" },
                                { val: stats.masuk,    label: "Total Masuk Hari Ini", color: "#93c5fd" },
                                { val: stats.keluar,   label: "Total Keluar Hari Ini", color: "#c4b5fd" },
                            ].map(({ val, label, color }) => (
                                <div className="mon-stat" key={label}>
                                    <div className="mon-stat-val" style={{ color }}>{val}</div>
                                    <div className="mon-stat-label">{label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Tap Zone */}
                        <div className={`mon-tap-zone ${tapState}`}
                             onClick={() => nfcInputRef.current?.focus()}>
                            <span className="mon-tap-nfc-icon">{tapIcons[tapState]}</span>
                            <div className="mon-tap-uid">
                                {tapState === "scanning" && uid ? uid : tapState !== "idle" ? lastResult?.uid || "" : ""}
                            </div>
                            <div className="mon-tap-status" style={{
                                color: tapState === "error" ? "#f87171" :
                                    tapState.startsWith("success") ? "#6ee7b7" :
                                        tapState === "scanning" ? "#fbbf24" : "#64748b"
                            }}>
                                {tapMessages[tapState]}
                            </div>
                            <div className="mon-tap-hint">
                                {tapState === "idle" ? "Klik area ini jika reader tidak merespons" : ""}
                            </div>
                        </div>

                        {/* Last result card */}
                        {lastResult && (
                            <div className="mon-result">
                                <div className="mon-result-inner">
                                    <div className="mon-result-avatar" style={{
                                        background: lastResult.ok
                                            ? lastResult.aksi === "masuk" ? "rgba(16,185,129,.15)" : "rgba(99,102,241,.15)"
                                            : "rgba(239,68,68,.15)"
                                    }}>
                                        {lastResult.ok
                                            ? lastResult.aksi === "masuk" ? "✅" : "🚪"
                                            : "❌"
                                        }
                                    </div>
                                    <div>
                                        <div className="mon-result-name">
                                            {lastResult.ok
                                                ? (lastResult.nama_member || "Pengunjung")
                                                : "Kartu Tidak Dikenali"
                                            }
                                        </div>
                                        <div className="mon-result-meta">
                                            {lastResult.ok
                                                ? `${fmtDate(lastResult.waktu_masuk || lastResult.waktu_keluar)} · ${fmtTime(lastResult.waktu_masuk || lastResult.waktu_keluar)}`
                                                : lastResult.uid
                                            }
                                        </div>
                                        {lastResult.ok && (
                                            <div className="mon-result-badge" style={{
                                                background: lastResult.aksi === "masuk" ? "rgba(16,185,129,.15)" : "rgba(99,102,241,.15)",
                                                color:      lastResult.aksi === "masuk" ? "#6ee7b7"               : "#a5b4fc",
                                            }}>
                                                {lastResult.aksi === "masuk" ? "🟢 MASUK" : "🔵 KELUAR"}
                                            </div>
                                        )}
                                        {!lastResult.ok && (
                                            <div className="mon-result-badge" style={{ background: "rgba(239,68,68,.15)", color: "#f87171" }}>
                                                ⛔ {lastResult.message}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column — Live feed */}
                    <div className="mon-col">
                        <div className="mon-feed">
                            <div className="mon-feed-header">
                                <span className="mon-feed-title">Live Feed Kunjungan</span>
                                <span className="mon-feed-count">{feed.length} entri</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 80px 70px", padding: "8px 20px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                                {["Waktu", "Nama", "Tipe", "Status"].map(h => (
                                    <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: ".05em" }}>{h}</span>
                                ))}
                            </div>
                            <div className="mon-feed-list">
                                {feed.length === 0 ? (
                                    <div className="mon-feed-empty">📭 Belum ada kunjungan hari ini</div>
                                ) : (
                                    feed.map(row => (
                                        <div
                                            key={row.id}
                                            className={`mon-feed-row ${newRowIds.current.has(row.id) ? "new" : ""}`}
                                        >
                                            <span className="mon-feed-time">{fmtTime(row.waktu_masuk)}</span>
                                            <span className={`mon-feed-name ${row.tipe_pengunjung}`}>
                                                {row.member?.nama || "Pengunjung Biasa"}
                                            </span>
                                            <span className={`mon-feed-tipe ${row.tipe_pengunjung}`}>
                                                {row.tipe_pengunjung === "member" ? "Member" : "Biasa"}
                                            </span>
                                            <span className={`mon-feed-status ${row.status}`}>
                                                {row.status === "di_dalam" ? "Dalam" : "Keluar"}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
// src/pages/Monitor.jsx
// AUTO THEME: Siang (06:00–17:30) → light | Sore (17:30–19:00) → warm | Malam (19:00–06:00) → dark
// AUTH: GET /dashboard/stats memerlukan JWT — buka dari browser dengan sesi admin aktif.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import logoImg from '../assets/logo.png';
import { Link } from 'react-router-dom';
import { Users, LogIn, LogOut, CalendarCheck, RefreshCw, Wifi, WifiOff, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { supabaseRealtime } from '../lib/supabase';

const REFRESH_INTERVAL = 10;

/* ─── Theme Resolver ───────────────────────────────────────────────── */
const getThemeByHour = (date) => {
    const h = date.getHours() + date.getMinutes() / 60;
    if (h >= 6 && h < 17.5) return 'day';
    if (h >= 17.5 && h < 19) return 'dusk';
    return 'night';
};

const THEMES = {
    day: {
        name:         'Siang',
        root:         { background: '#f0fdf4' },
        bgDot:        { backgroundImage: 'radial-gradient(circle, #2f6f4e 1px, transparent 1px)', opacity: 0.06 },
        bgGlow1:      { background: 'radial-gradient(ellipse, #bbf7d0 0%, transparent 70%)', opacity: 0.8 },
        bgGlow2:      { background: 'radial-gradient(ellipse, #d1fae5 0%, transparent 70%)', opacity: 0.6 },
        header:       { borderBottomColor: 'rgba(0,0,0,0.08)', background: 'rgba(240,253,244,0.85)' },
        logo:         { background: 'linear-gradient(135deg, #2f6f4e, #245840)', boxShadow: '0 0 20px rgba(22,163,74,0.3)' },
        brandName:    { color: '#1a3a2a' },
        eventName:    { color: '#2f6f4e' },
        clockTime:    { color: '#1a3a2a', textShadow: 'none' },
        clockDate:    { color: '#6b7280' },
        heroCard:     { background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(22,163,74,0.25)', boxShadow: '0 8px 40px rgba(22,163,74,0.1)' },
        heroGlow:     { background: 'radial-gradient(ellipse at 50% 110%, rgba(22,163,74,0.1) 0%, transparent 65%)' },
        liveBadge:    { background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)' },
        liveDot:      { background: '#2f855a', boxShadow: '0 0 8px rgba(22,163,74,0.9)' },
        liveText:     { color: '#2f6f4e' },
        heroIconWrap: { background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)' },
        heroNumber:   { color: '#2f6f4e', textShadow: '0 2px 20px rgba(22,163,74,0.2)' },
        heroLabel:    { color: 'rgba(20,83,45,0.55)' },
        heroDivider:  { background: 'linear-gradient(90deg, transparent, rgba(22,163,74,0.3), transparent)' },
        secCard:      { background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
        secLabel:     { color: 'rgba(20,83,45,0.45)' },
        secAccents:   ['#2f6f4e', '#2f855a', '#4a9b6e'],
        // [FIX 1] footer pakai borderTop shorthand (bukan hanya borderTopColor) agar garis separator tampil
        footer:       { borderTop: '1px solid rgba(0,0,0,0.06)', background: 'rgba(240,253,244,0.85)' },
        footerText:   { color: '#9ca3af' },
        progressBar:  { background: 'rgba(0,0,0,0.08)' },
        progressFill: { background: 'linear-gradient(90deg, #2f6f4e, #4ade80)' },
        themeTag:     { color: '#2f855a', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)' },
    },
    dusk: {
        name:         'Sore',
        root:         { background: '#1c1007' },
        bgDot:        { backgroundImage: 'radial-gradient(circle, #d97706 1px, transparent 1px)', opacity: 0.04 },
        bgGlow1:      { background: 'radial-gradient(ellipse, #78350f 0%, transparent 70%)', opacity: 0.6 },
        bgGlow2:      { background: 'radial-gradient(ellipse, #7c2d12 0%, transparent 70%)', opacity: 0.35 },
        header:       { borderBottomColor: 'rgba(255,255,255,0.07)', background: 'rgba(28,16,7,0.7)' },
        logo:         { background: 'linear-gradient(135deg, #b45309, #92400e)', boxShadow: '0 0 20px rgba(217,119,6,0.3)' },
        brandName:    { color: '#fef3c7' },
        eventName:    { color: '#fbbf24' },
        clockTime:    { color: '#fef3c7', textShadow: '0 0 30px rgba(251,191,36,0.2)' },
        clockDate:    { color: '#6b7280' },
        heroCard:     { background: 'rgba(120,53,15,0.18)', border: '1px solid rgba(251,191,36,0.2)', boxShadow: 'none' },
        heroGlow:     { background: 'radial-gradient(ellipse at 50% 120%, rgba(217,119,6,0.12) 0%, transparent 65%)' },
        liveBadge:    { background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.25)' },
        liveDot:      { background: '#f59e0b', boxShadow: '0 0 8px rgba(245,158,11,0.9)' },
        liveText:     { color: '#fbbf24' },
        heroIconWrap: { background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.2)' },
        heroNumber:   { color: '#fbbf24', textShadow: '0 0 60px rgba(251,191,36,0.3), 0 0 120px rgba(251,191,36,0.1)' },
        heroLabel:    { color: 'rgba(254,243,199,0.45)' },
        heroDivider:  { background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.3), transparent)' },
        secCard:      { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: 'none' },
        secLabel:     { color: 'rgba(255,255,255,0.35)' },
        secAccents:   ['#fbbf24', '#f59e0b', '#fb923c'],
        footer:       { borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(28,16,7,0.7)' },
        footerText:   { color: '#4b5563' },
        progressBar:  { background: 'rgba(255,255,255,0.07)' },
        progressFill: { background: 'linear-gradient(90deg, #b45309, #fbbf24)' },
        themeTag:     { color: '#f59e0b', background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.2)' },
    },
    night: {
        name:         'Malam',
        root:         { background: '#040d07' },
        bgDot:        { backgroundImage: 'radial-gradient(circle, #2f855a 1px, transparent 1px)', opacity: 0.03 },
        bgGlow1:      { background: 'radial-gradient(ellipse, #1a3a2a 0%, transparent 70%)', opacity: 0.5 },
        bgGlow2:      { background: 'radial-gradient(ellipse, #1a3a2a 0%, transparent 70%)', opacity: 0.3 },
        header:       { borderBottomColor: 'rgba(255,255,255,0.07)', background: 'rgba(4,13,7,0.6)' },
        logo:         { background: 'linear-gradient(135deg, #2f6f4e, #245840)', boxShadow: '0 0 20px rgba(34,197,94,0.25)' },
        brandName:    { color: '#fff' },
        eventName:    { color: '#4ade80' },
        clockTime:    { color: '#fff', textShadow: '0 0 30px rgba(74,222,128,0.2)' },
        clockDate:    { color: '#4b5563' },
        heroCard:     { background: 'rgba(20,83,45,0.15)', border: '1px solid rgba(74,222,128,0.2)', boxShadow: 'none' },
        heroGlow:     { background: 'radial-gradient(ellipse at 50% 120%, rgba(34,197,94,0.12) 0%, transparent 65%)' },
        liveBadge:    { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' },
        liveDot:      { background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.8)' },
        liveText:     { color: '#4ade80' },
        heroIconWrap: { background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' },
        heroNumber:   { color: '#4ade80', textShadow: '0 0 60px rgba(74,222,128,0.3), 0 0 120px rgba(74,222,128,0.1)' },
        heroLabel:    { color: 'rgba(255,255,255,0.45)' },
        heroDivider:  { background: 'linear-gradient(90deg, transparent, rgba(74,222,128,0.3), transparent)' },
        secCard:      { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: 'none' },
        secLabel:     { color: 'rgba(255,255,255,0.35)' },
        secAccents:   ['#4ade80', '#a3e635', '#86efac'],
        footer:       { borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(4,13,7,0.6)' },
        footerText:   { color: '#374151' },
        progressBar:  { background: 'rgba(255,255,255,0.07)' },
        progressFill: { background: 'linear-gradient(90deg, #2f6f4e, #4ade80)' },
        themeTag:     { color: '#4ade80', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' },
    },
};

/* ─── Animated Number ──────────────────────────────────────────────── */
const AnimatedNumber = ({ value, style }) => {
    const [displayed, setDisplayed] = useState(value);
    const [flash, setFlash]         = useState(false);
    const prevRef                   = useRef(value);

    useEffect(() => {
        if (value !== prevRef.current) {
            setFlash(true);
            const t = setTimeout(() => { setDisplayed(value); setFlash(false); }, 150);
            prevRef.current = value;
            return () => clearTimeout(t);
        }
    }, [value]);

    return (
        <span style={{ ...style, transition: 'opacity 0.15s ease', opacity: flash ? 0.4 : 1 }}>
            {(displayed ?? 0).toLocaleString('id-ID')}
        </span>
    );
};

/* ─── Main Component ───────────────────────────────────────────────── */
const Monitor = () => {
    const [stats, setStats]               = useState(null);
    const [isLoading, setIsLoading]       = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError]               = useState(null);
    const [lastUpdated, setLastUpdated]   = useState(null);
    const [countdown, setCountdown]       = useState(REFRESH_INTERVAL);
    const [clock, setClock]               = useState(new Date());
    const countdownRef                    = useRef(REFRESH_INTERVAL);
    const [realtimeStatus, setRealtimeStatus] = useState(supabaseRealtime ? 'connecting' : 'disabled');

    const [themeKey, setThemeKey] = useState(() => getThemeByHour(new Date()));
    const t = THEMES[themeKey];

    useEffect(() => {
        const tick = setInterval(() => {
            const now = new Date();
            setClock(now);
            setThemeKey(getThemeByHour(now));
        }, 1000);
        return () => clearInterval(tick);
    }, []);

    const fetchStats = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);
        try {
            const res  = await api.get('/dashboard/stats');
            const data = res.data.data;
            if (!data?.event_id) { setError('no_event'); setStats(null); }
            else { setStats(data); setError(null); }
            setLastUpdated(new Date());
        } catch (err) {
            const s = err.response?.status;
            setError(s === 401 || s === 403 ? 'auth' : 'network');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchStats(false); }, [fetchStats]);

    useEffect(() => {
        let channel = null;
        if (supabaseRealtime) {
            channel = supabaseRealtime
                .channel('monitor-kunjungan-live')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'kunjungan' },
                    () => {
                        fetchStats(true);
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') setRealtimeStatus('connected');
                    else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setRealtimeStatus('error');
                    else if (status === 'CLOSED') setRealtimeStatus('disabled');
                });
        } else {
            setRealtimeStatus('disabled');
        }

        countdownRef.current = REFRESH_INTERVAL;
        setCountdown(REFRESH_INTERVAL);
        const interval = setInterval(() => {
            countdownRef.current -= 1;
            setCountdown(countdownRef.current);
            if (countdownRef.current <= 0) {
                countdownRef.current = REFRESH_INTERVAL;
                setCountdown(REFRESH_INTERVAL);
                fetchStats(true);
            }
        }, 1000);

        return () => {
            if (channel) supabaseRealtime.removeChannel(channel);
            clearInterval(interval);
        };
    }, [fetchStats]);

    const fmtClock = (d) =>
        d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const fmtDate = (d) =>
        d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const fmtLast = (d) =>
        d ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--';

    /* ── Error: Auth ── */
    if (error === 'auth') {
        return (
            <div className="mon" style={{ ...BASE.root, ...t.root, alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                <style>{GLOBAL_STYLES}</style>
                <WifiOff size={48} style={{ color: '#f87171', marginBottom: '1.5rem' }} />
                <h1 style={{ color: t.brandName.color, fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Sesi Tidak Ditemukan
                </h1>
                <p style={{ color: '#6b7280', maxWidth: '28rem', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Halaman monitor memerlukan sesi admin aktif. Buka dari browser yang sama di mana Anda sudah login sebagai admin.
                </p>
                <Link to="/login" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    background: '#2f6f4e', color: '#fff', padding: '0.75rem 1.5rem',
                    borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
                }}>
                    Login Dulu <ExternalLink size={15} />
                </Link>
            </div>
        );
    }

    /* ── Loading ── */
    if (isLoading) {
        return (
            <div className="mon" style={{ ...BASE.root, ...t.root, alignItems: 'center', justifyContent: 'center' }}>
                <style>{GLOBAL_STYLES}</style>
                <RefreshCw size={36} style={{ color: t.liveDot.background, marginBottom: '1rem' }} className="spin" />
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Memuat data monitor…</p>
            </div>
        );
    }

    const secondaryCards = [
        { label: 'Total Tap Masuk',    value: stats?.total_masuk  ?? 0, icon: LogIn,         accent: t.secAccents[0] },
        { label: 'Total Tap Keluar',   value: stats?.total_keluar ?? 0, icon: LogOut,        accent: t.secAccents[1] },
        { label: 'Kunjungan Hari Ini', value: stats?.total_harian ?? 0, icon: CalendarCheck, accent: t.secAccents[2] },
    ];

    return (
        <>
            <style>{GLOBAL_STYLES}</style>

            <div className="mon" style={{ ...BASE.root, ...t.root }}>

                {/* ── BG ── */}
                <div style={{ ...BASE.bgDot, ...t.bgDot }} />
                <div style={{ ...BASE.bgGlow1, ...t.bgGlow1 }} />
                <div style={{ ...BASE.bgGlow2, ...t.bgGlow2 }} />

                {/* ══ HEADER ══════════════════════════════════════════════ */}
                <header style={{ ...BASE.header, ...t.header }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.75rem,1.5vw,1.25rem)', minWidth: 0 }}>
                        <img src={logoImg} alt="Logo Pekan Banyumasan" style={{ ...BASE.logo, ...t.logo, objectFit: 'cover', background: 'none', boxShadow: t.logo?.boxShadow }} />
                        <div style={{ minWidth: 0 }}>
                            <div style={{ ...BASE.brandName, ...t.brandName }}>Pekan Banyumasan</div>
                            {stats?.nama_event   && <div style={{ ...BASE.eventName, ...t.eventName }}>{stats.nama_event}</div>}
                            {error === 'no_event' && <div style={{ ...BASE.eventName, color: '#fbbf24' }}>Tidak ada event aktif</div>}
                            {error === 'network'  && <div style={{ ...BASE.eventName, color: '#f87171' }}>Gagal terhubung ke server</div>}
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '0.3rem' }}>
                            <span style={{ ...BASE.themeTag, ...t.themeTag }}>
                                {themeKey === 'day' ? '☀ Siang' : themeKey === 'dusk' ? '🌇 Sore' : '🌙 Malam'}
                            </span>
                            <div style={{ ...BASE.clockTime, ...t.clockTime }}>{fmtClock(clock)}</div>
                        </div>
                        <div style={{ ...BASE.clockDate, ...t.clockDate }}>{fmtDate(clock)}</div>
                    </div>
                </header>

                {/* ══ MAIN ════════════════════════════════════════════════ */}
                <main style={BASE.main}>

                    {/* Hero Card */}
                    <div style={{ ...BASE.heroCard, ...t.heroCard }} className="hero-card">
                        <div style={{ ...BASE.heroGlow, ...t.heroGlow }} className="hero-glow" />

                        <div style={{ ...BASE.liveBadge, ...t.liveBadge }}>
                            <span style={{ ...BASE.liveDot, ...t.liveDot }} className="pulse-dot" />
                            <span style={{ ...BASE.liveText, ...t.liveText }}>LIVE</span>
                        </div>

                        <div style={{ ...BASE.heroIconWrap, ...t.heroIconWrap }}>
                            <Users size={28} color={t.secAccents[0]} />
                        </div>

                        <AnimatedNumber
                            value={stats?.di_dalam ?? 0}
                            style={{ ...BASE.heroNumber, ...t.heroNumber }}
                        />

                        <div style={{ ...BASE.heroLabel, ...t.heroLabel }}>Pengunjung di Dalam</div>
                        <div style={{ ...BASE.heroDivider, ...t.heroDivider }} />
                    </div>

                    {/* [FIX 2] secondaryGrid: tambahkan className="mon-sec-grid" agar media query mobile bekerja */}
                    <div style={BASE.secondaryGrid} className="mon-sec-grid">
                        {secondaryCards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <div key={card.label} style={{ ...BASE.secCard, ...t.secCard }} className="sec-card">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                        <div style={{ ...BASE.secIconWrap, background: card.accent + '18', border: `1px solid ${card.accent}28` }}>
                                            <Icon size={18} color={card.accent} />
                                        </div>
                                        <div style={{ ...BASE.secAccentBar, background: card.accent + '20', color: card.accent }}>↑</div>
                                    </div>

                                    <AnimatedNumber
                                        value={card.value}
                                        style={{ ...BASE.secNumber, color: card.accent }}
                                    />

                                    <div style={{ ...BASE.secLabel, ...t.secLabel }}>{card.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </main>

                {/* ══ FOOTER ══════════════════════════════════════════════ */}
                <footer style={{ ...BASE.footer, ...t.footer }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {error === 'network'
                            ? <WifiOff size={13} color="#f87171" />
                            : <Wifi    size={13} color={t.secAccents[0]} />}
                        <span style={{ ...BASE.footerText, ...t.footerText }}>
                            {error === 'network' ? 'Koneksi terputus' : realtimeStatus === 'connected' ? 'Realtime aktif' : realtimeStatus === 'connecting' ? 'Menghubungkan realtime' : realtimeStatus === 'error' ? 'Backup polling aktif' : 'Terhubung'}
                        </span>
                        {isRefreshing && (
                            <RefreshCw size={11} color={t.secAccents[0]} className="spin" style={{ marginLeft: '0.25rem' }} />
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.75rem,2vw,1.5rem)' }}>
                        <span style={{ ...BASE.footerText, ...t.footerText }}>
                            Diperbarui {fmtLast(lastUpdated)}
                            <span style={{ margin: '0 0.4rem', opacity: 0.4 }}>·</span>
                            Refresh dalam <strong style={{ color: t.secAccents[0] }}>{countdown}s</strong>
                        </span>
                        <div style={{ ...BASE.progressBar, ...t.progressBar }}>
                            <div style={{ ...BASE.progressFill, ...t.progressFill, width: `${(countdown / REFRESH_INTERVAL) * 100}%` }} />
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

/* ─── Base Styles ──────────────────────────────────────────────────── */
const BASE = {
    root: {
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', userSelect: 'none', WebkitUserSelect: 'none',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        transition: 'background 2s ease',
    },
    bgDot: {
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundSize: '52px 52px',
        transition: 'opacity 2s ease',
    },
    bgGlow1: {
        position: 'absolute', top: '-10%', left: '-5%',
        width: 'clamp(300px,50vw,700px)', height: 'clamp(200px,35vh,450px)',
        pointerEvents: 'none', borderRadius: '50%',
        transition: 'background 2s ease, opacity 2s ease',
    },
    bgGlow2: {
        position: 'absolute', bottom: '-10%', right: '-5%',
        width: 'clamp(200px,40vw,550px)', height: 'clamp(150px,30vh,380px)',
        pointerEvents: 'none', borderRadius: '50%',
        transition: 'background 2s ease, opacity 2s ease',
    },
    header: {
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'clamp(0.75rem,2vh,1.25rem) clamp(1rem,3vw,2.5rem)',
        backdropFilter: 'blur(8px)', gap: '1rem',
        // borderBottom via t.header.borderBottomColor + inline borderBottomWidth/Style
        borderBottomWidth: '1px', borderBottomStyle: 'solid',
        transition: 'background 2s ease, border-color 2s ease',
    },
    logo: {
        flexShrink: 0,
        width: 'clamp(2.25rem,3.5vw,3rem)', height: 'clamp(2.25rem,3.5vw,3rem)',
        borderRadius: '0.625rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
        fontFamily: 'Lora, serif',
        fontSize: 'clamp(1rem,2vw,1.5rem)', letterSpacing: '0.05em',
        transition: 'background 2s ease, box-shadow 2s ease',
    },
    brandName: {
        fontWeight: 700, fontSize: 'clamp(0.9rem,1.6vw,1.35rem)',
        letterSpacing: '0.02em', lineHeight: 1.2, whiteSpace: 'nowrap',
        transition: 'color 2s ease',
    },
    eventName: {
        fontSize: 'clamp(0.65rem,1vw,0.8rem)', fontWeight: 500,
        marginTop: '0.2rem', letterSpacing: '0.04em',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        transition: 'color 2s ease',
    },
    themeTag: {
        fontSize: 'clamp(0.55rem,0.75vw,0.68rem)',
        fontWeight: 600, letterSpacing: '0.06em',
        padding: '0.2rem 0.55rem', borderRadius: '999px',
        transition: 'all 2s ease',
    },
    clockTime: {
        fontFamily: 'Lora, serif',
        fontSize: 'clamp(2rem,5.5vw,5rem)',
        letterSpacing: '0.04em', lineHeight: 1,
        transition: 'color 2s ease, text-shadow 2s ease',
    },
    clockDate: {
        fontSize: 'clamp(0.6rem,0.9vw,0.8rem)',
        marginTop: '0.25rem', fontWeight: 400, letterSpacing: '0.03em', textAlign: 'right',
        transition: 'color 2s ease',
    },
    main: {
        position: 'relative', zIndex: 10, flex: 1,
        display: 'flex', flexDirection: 'column',
        gap: 'clamp(0.75rem,1.5vh,1.25rem)',
        padding: 'clamp(0.75rem,2vh,1.5rem) clamp(1rem,3vw,2.5rem)',
        overflow: 'hidden',
    },
    heroCard: {
        position: 'relative', flex: '1 1 0', minHeight: 0,
        borderRadius: 'clamp(1rem,1.5vw,1.5rem)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        padding: 'clamp(1rem,2vh,2rem) clamp(1rem,2vw,2rem)',
        transition: 'background 2s ease, border-color 2s ease, box-shadow 2s ease',
    },
    heroGlow: {
        position: 'absolute', inset: 0, pointerEvents: 'none',
        transition: 'background 2s ease',
    },
    liveBadge: {
        position: 'absolute',
        top: 'clamp(0.6rem,1.5vh,1rem)', right: 'clamp(0.75rem,1.5vw,1.25rem)',
        display: 'flex', alignItems: 'center', gap: '0.375rem',
        borderRadius: '999px', padding: '0.25rem 0.625rem',
        transition: 'background 2s ease, border-color 2s ease',
    },
    liveDot: {
        display: 'block',
        width: 'clamp(6px,0.6vw,9px)', height: 'clamp(6px,0.6vw,9px)',
        borderRadius: '50%',
        transition: 'background 2s ease, box-shadow 2s ease',
    },
    liveText: {
        fontWeight: 700, fontSize: 'clamp(0.55rem,0.75vw,0.7rem)', letterSpacing: '0.12em',
        transition: 'color 2s ease',
    },
    heroIconWrap: {
        width: 'clamp(2.5rem,4vw,3.5rem)', height: 'clamp(2.5rem,4vw,3.5rem)',
        borderRadius: '0.875rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 'clamp(0.5rem,1.5vh,1rem)',
        transition: 'background 2s ease, border-color 2s ease',
    },
    heroNumber: {
        fontFamily: 'Lora, serif',
        fontSize: 'clamp(5rem,18vw,16rem)',
        lineHeight: 0.9, letterSpacing: '0.02em', display: 'block',
        transition: 'color 2s ease, text-shadow 2s ease',
    },
    heroLabel: {
        fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase',
        fontSize: 'clamp(0.6rem,1.1vw,0.9rem)',
        marginTop: 'clamp(0.25rem,1vh,0.75rem)',
        transition: 'color 2s ease',
    },
    heroDivider: {
        position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '1px',
        transition: 'background 2s ease',
    },
    secondaryGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'clamp(0.5rem,1vw,1rem)', flexShrink: 0,
    },
    secCard: {
        borderRadius: 'clamp(0.75rem,1.2vw,1.25rem)',
        padding: 'clamp(0.75rem,2vh,1.5rem) clamp(0.75rem,1.5vw,1.5rem)',
        display: 'flex', flexDirection: 'column', gap: 'clamp(0.3rem,0.8vh,0.6rem)',
        transition: 'background 2s ease, border-color 2s ease, box-shadow 2s ease',
    },
    secIconWrap: {
        width: 'clamp(1.75rem,2.5vw,2.5rem)', height: 'clamp(1.75rem,2.5vw,2.5rem)',
        borderRadius: '0.6rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    secAccentBar: {
        fontSize: 'clamp(0.6rem,0.85vw,0.75rem)',
        fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '0.3rem', letterSpacing: '0.05em',
    },
    secNumber: {
        fontFamily: 'Lora, serif',
        fontSize: 'clamp(2.5rem,7vw,6.5rem)',
        lineHeight: 1, letterSpacing: '0.02em', display: 'block',
        transition: 'color 2s ease',
    },
    secLabel: {
        fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
        fontSize: 'clamp(0.55rem,0.85vw,0.75rem)', lineHeight: 1.3,
        transition: 'color 2s ease',
    },
    footer: {
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'clamp(0.4rem,1vh,0.6rem) clamp(1rem,3vw,2.5rem)', gap: '0.5rem',
        // [FIX 1] borderTop shorthand agar garis separator tampil.
        // t.footer meng-override dengan warna yang sesuai tema.
        borderTopWidth: '1px', borderTopStyle: 'solid',
        transition: 'background 2s ease, border-color 2s ease',
    },
    footerText: {
        fontSize: 'clamp(0.55rem,0.75vw,0.7rem)', fontWeight: 400, whiteSpace: 'nowrap',
        transition: 'color 2s ease',
    },
    progressBar: {
        width: 'clamp(3rem,5vw,6rem)', height: '3px',
        borderRadius: '999px', overflow: 'hidden', flexShrink: 0,
        transition: 'background 2s ease',
    },
    progressFill: {
        height: '100%', borderRadius: '999px',
        transition: 'width 1s linear, background 2s ease',
    },
};

/* ─── Global CSS ───────────────────────────────────────────────────── */
const GLOBAL_STYLES = `
    

    .mon * { box-sizing: border-box; }
    .mon   { font-family: 'Plus Jakarta Sans', sans-serif; }

    @keyframes spin      { to { transform: rotate(360deg); } }
    @keyframes pulseDot  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
    @keyframes heroGlow  { 0%,100%{opacity:.35} 50%{opacity:.55} }
    @keyframes floatUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

    .spin      { animation: spin 1s linear infinite; }
    .pulse-dot { animation: pulseDot 1.6s ease-in-out infinite; }
    .hero-glow { animation: heroGlow 3s ease-in-out infinite; }
    .hero-card { animation: floatUp .6s ease both; }
    .sec-card  { animation: floatUp .6s ease both; }
    .sec-card:nth-child(1) { animation-delay: .08s; }
    .sec-card:nth-child(2) { animation-delay: .16s; }
    .sec-card:nth-child(3) { animation-delay: .24s; }

    /* [FIX 2] Responsive grid — sekarang .mon-sec-grid di-assign ke elemen JSX */
    @media (max-width: 639px) {
        .mon-sec-grid { grid-template-columns: 1fr 1fr !important; }
    }
`;

export default Monitor;
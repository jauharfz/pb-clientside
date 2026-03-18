// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Users, LogIn, LogOut, CalendarCheck,
    ArrowDownCircle, ArrowUpCircle, RefreshCw,
    CreditCard, User, AlertCircle, Calendar, ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';

const Dashboard = () => {
    const navigate = useNavigate();
    const toast = useToast();

    const [stats, setStats] = useState({
        di_dalam: 0,
        total_masuk: 0,
        total_keluar: 0,
        total_harian: 0,
    });
    const [activities, setActivities] = useState([]);

    // event_id aktif dari response /dashboard/stats.
    // Wajib dikirim ke POST /visitors/manual (OpenAPI ManualVisitorRequest required field).
    const [activeEventId, setActiveEventId] = useState(null);
    const [namaEvent, setNamaEvent]         = useState(null);

    const [isLoadingStats, setIsLoadingStats]           = useState(true);
    const [isLoadingActivities, setIsLoadingActivities] = useState(true);
    const [submittingAction, setSubmittingAction]       = useState(null);
    // Increment on every background refresh to trigger re-mount of animated elements
    const [flashKey, setFlashKey]                       = useState(0);

    // Ambil role user untuk menampilkan link "Kelola Event" hanya kepada admin
    const userRole = (() => {
        try {
            const u = localStorage.getItem('user');
            return u ? JSON.parse(u).role : null;
        } catch { return null; }
    })();

    const fetchStats = useCallback(async (silent = false) => {
        try {
            if (!silent) setIsLoadingStats(true);
            const response = await api.get('/dashboard/stats');
            const data = response.data.data;
            setStats(data);
            if (data?.event_id) {
                setActiveEventId(data.event_id);
                setNamaEvent(data.nama_event || null);
                // Sync event info to AdminLayout via localStorage + CustomEvent
                // (storage event only fires cross-tab; CustomEvent works same-window)
                localStorage.setItem('pekan_active_event', JSON.stringify({ id: data.event_id, nama: data.nama_event || null }));
            } else {
                setActiveEventId(null);
                setNamaEvent(null);
                localStorage.removeItem('pekan_active_event');
            }
            window.dispatchEvent(new CustomEvent('pekan_event_update'));
            // Trigger flash animation on background refresh (not initial load)
            if (silent) setFlashKey(k => k + 1);
        } catch (error) {
            console.error('Gagal mengambil statistik:', error);
        } finally {
            if (!silent) setIsLoadingStats(false);
        }
    }, []);

    const fetchActivities = useCallback(async (silent = false) => {
        try {
            if (!silent) setIsLoadingActivities(true);
            // Gunakan local date bukan UTC agar sesuai dengan timezone WIB pengguna
            const d = new Date();
            const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            // Filter by event_id jika tersedia agar tidak mencampur data lintas event
            // pada hari yang sama. Jika belum ada event aktif, tetap fetch by tanggal.
            const params = { tanggal: today };
            if (activeEventId) params.event_id = activeEventId;
            const response = await api.get('/visitors', { params });
            const allVisits = response.data.data || [];
            // Sort by most recent activity: keluar → waktu_keluar, di_dalam → waktu_masuk
            const actTime = (v) =>
                v.status === 'keluar' && v.waktu_keluar
                    ? new Date(v.waktu_keluar)
                    : new Date(v.waktu_masuk);
            const sorted = [...allVisits].sort((a, b) => actTime(b) - actTime(a));
            setActivities(sorted.slice(0, 10));
        } catch (error) {
            console.error('Gagal mengambil aktivitas:', error);
        } finally {
            if (!silent) setIsLoadingActivities(false);
        }
    }, [activeEventId]);

    useEffect(() => {
        fetchStats();
        fetchActivities();

        const interval = setInterval(() => {
            fetchStats(true);
            fetchActivities(true);
        }, 10000);
        return () => clearInterval(interval);
    }, [fetchStats, fetchActivities]);

    const handleManualInput = async (aksi) => {
        if (!activeEventId) {
            toast.warning('Event aktif belum terdeteksi. Tunggu sebentar atau refresh halaman.');
            return;
        }
        try {
            setSubmittingAction(aksi);
            await api.post('/visitors/manual', { aksi, event_id: activeEventId });
            toast.success(`Pengunjung ${aksi === 'masuk' ? 'masuk' : 'keluar'} berhasil dicatat.`);
            fetchStats();
            fetchActivities();
        } catch (error) {
            toast.error(`Gagal mencatat pengunjung ${aksi}: ${error.message || 'Silakan coba lagi.'}`);
            console.error(error);
        } finally {
            setSubmittingAction(null);
        }
    };

    const getActivityTime = (act) => {
        if (act.status === 'keluar' && act.waktu_keluar) {
            return new Date(act.waktu_keluar);
        }
        return new Date(act.waktu_masuk);
    };

// Tombol MASUK/KELUAR di-disable selama: ada aksi berjalan ATAU event_id belum tersedia
    const isManualButtonDisabled = submittingAction !== null || !activeEventId;

    return (
        <div className="space-y-8 font-sans">
            {/* Keyframes untuk flash animation saat background refresh */}
            <style>{`
            @keyframes value-flash {
                0%   { background-color: transparent; }
                25%  { background-color: #dcfce7; }
                100% { background-color: transparent; }
            }
            @keyframes row-flash {
                0%   { background-color: transparent; }
                25%  { background-color: #f0fdf4; }
                100% { background-color: transparent; }
            }
            .value-flash { animation: value-flash 0.75s ease-out; }
            .row-flash   { animation: row-flash   0.75s ease-out; }
        `}</style>

            {/* ── BANNER: tidak ada event aktif ──────────────────────────────── */}
            {!isLoadingStats && !activeEventId && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-amber-800">
                            Tidak ada event aktif
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                            Tombol input manual dinonaktifkan. Tap NFC dari perangkat reader juga tidak akan diterima sistem sampai ada event yang aktif.
                        </p>
                    </div>
                    {/* Hanya tampilkan shortcut ke /events jika role admin */}
                    {userRole === 'admin' && (
                        <Link
                            to="/events"
                            className="shrink-0 flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition whitespace-nowrap"
                        >
                            <Calendar size={13} /> Kelola Event <ArrowRight size={13} />
                        </Link>
                    )}
                </div>
            )}

            {/* ── 4 STATISTIC CARDS ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Card 1: Sedang di Dalam */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="text-gray-500 text-sm font-medium">Sedang di Dalam</div>
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                            <Users size={16} />
                        </div>
                    </div>
                    <div className="text-4xl font-bold text-gray-800 mb-1">
                        {isLoadingStats ? '...' : <span key={`di_dalam-${flashKey}`} className="value-flash inline-block">{stats.di_dalam}</span>}
                    </div>
                    <div className="text-xs text-green-700 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live Update
                    </div>
                </div>

                {/* Card 2: Total Masuk */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-gray-500 text-sm font-medium">Total Tap Masuk</div>
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <LogIn size={16} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                        {isLoadingStats ? '...' : <span key={`total_masuk-${flashKey}`} className="value-flash inline-block">{stats.total_masuk}</span>}
                    </div>
                    <div className="text-xs text-gray-400">Pengunjung hari ini</div>
                </div>

                {/* Card 3: Total Keluar */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-gray-500 text-sm font-medium">Total Tap Keluar</div>
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                            <LogOut size={16} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                        {isLoadingStats ? '...' : <span key={`total_keluar-${flashKey}`} className="value-flash inline-block">{stats.total_keluar}</span>}
                    </div>
                    <div className="text-xs text-gray-400">Pengunjung hari ini</div>
                </div>

                {/* Card 4: Total Harian */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-gray-500 text-sm font-medium">Total Kunjungan Hari Ini</div>
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                            <CalendarCheck size={16} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                        {isLoadingStats ? '...' : <span key={`total_harian-${flashKey}`} className="value-flash inline-block">{stats.total_harian}</span>}
                    </div>
                    <div className="text-xs text-gray-400">Sejak awal hari ini</div>
                </div>
            </div>

            {/* ── MAIN ACTION AREA ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* KIRI: Tombol Input Manual */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Input Pengunjung Biasa</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Gunakan tombol ini jika pengunjung tidak memiliki keychain NFC (Non-Member).
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={() => handleManualInput('masuk')}
                                disabled={isManualButtonDisabled}
                                title={!activeEventId ? 'Menunggu data event aktif...' : ''}
                                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white rounded-2xl p-6 flex flex-col items-center justify-center transition-all shadow-lg shadow-green-200 group"
                            >
                                <ArrowDownCircle
                                    className={`text-4xl mb-3 ${!isManualButtonDisabled && 'group-hover:scale-110'} transition-transform`}
                                    size={40}
                                />
                                <span className="text-xl font-bold tracking-wide">
                                    {submittingAction === 'masuk' ? 'MEMPROSES...' : '+ MASUK'}
                                </span>
                                <span className="text-green-100 text-sm mt-1">Catat 1 Pengunjung Masuk</span>
                            </button>

                            <button
                                onClick={() => handleManualInput('keluar')}
                                disabled={isManualButtonDisabled}
                                title={!activeEventId ? 'Menunggu data event aktif...' : ''}
                                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-2xl p-6 flex flex-col items-center justify-center transition-all shadow-lg shadow-red-200 group"
                            >
                                <ArrowUpCircle
                                    className={`text-4xl mb-3 ${!isManualButtonDisabled && 'group-hover:scale-110'} transition-transform`}
                                    size={40}
                                />
                                <span className="text-xl font-bold tracking-wide">
                                    {submittingAction === 'keluar' ? 'MEMPROSES...' : '- KELUAR'}
                                </span>
                                <span className="text-red-100 text-sm mt-1">Catat 1 Pengunjung Keluar</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* KANAN: Tabel Aktivitas Terbaru */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">Aktivitas Tap & Input Terbaru</h3>
                            <button
                                onClick={() => { fetchStats(); fetchActivities(); }}
                                className="text-sm text-green-700 font-medium hover:underline flex items-center gap-1"
                            >
                                Refresh <RefreshCw size={14} className={isLoadingActivities ? "animate-spin" : ""} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-6 py-4 font-semibold">Waktu</th>
                                    <th className="px-6 py-4 font-semibold">Tipe Pengunjung</th>
                                    <th className="px-6 py-4 font-semibold">Identitas</th>
                                    <th className="px-6 py-4 font-semibold">Aktivitas</th>
                                </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-50">
                                {isLoadingActivities ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            Memuat data aktivitas...
                                        </td>
                                    </tr>
                                ) : activities.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            Belum ada aktivitas hari ini.
                                        </td>
                                    </tr>
                                ) : (
                                    activities.map((act) => (
                                        <tr key={`${act.id}-${flashKey}`} className="hover:bg-gray-50 transition row-flash">
                                            <td className="px-6 py-4 text-gray-500 font-medium">
                                                {getActivityTime(act).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                })} WIB
                                            </td>
                                            <td className="px-6 py-4">
                                                {act.tipe_pengunjung === 'member' ? (
                                                    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-800 px-2.5 py-1 rounded-md text-xs font-semibold border border-green-100">
                                                        <CreditCard size={12} /> Member
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-semibold border border-gray-200">
                                                        <User size={12} /> Biasa
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {act.tipe_pengunjung === 'member' ? (
                                                    <>
                                                        <div className="font-semibold text-gray-800">
                                                            {act.member?.nama || act.nama_member || 'Member'}
                                                        </div>
                                                        <div className="text-xs text-gray-400 font-mono">
                                                            ID: {act.member_id?.substring(0, 8)}...
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="font-semibold text-gray-800">Pengunjung Biasa</div>
                                                        <div className="text-xs text-gray-400 font-mono">Input Manual</div>
                                                    </>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {act.status === 'di_dalam' ? (
                                                    <span className="text-green-600 font-bold flex items-center gap-2">
                                                        <LogIn size={14} /> Masuk
                                                    </span>
                                                ) : (
                                                    <span className="text-red-500 font-bold flex items-center gap-2">
                                                        <LogOut size={14} /> Keluar
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                            <button
                                onClick={() => navigate('/reports')}
                                className="text-sm font-semibold text-green-700 hover:text-green-900 transition"
                            >
                                Lihat Semua Riwayat Kunjungan &rarr;
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
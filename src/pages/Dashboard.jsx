// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, LogIn, LogOut, CalendarCheck,
    ArrowDownCircle, ArrowUpCircle, RefreshCw,
    CreditCard, User
} from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
    // State untuk menyimpan data
    const [stats, setStats] = useState({
        sedang_di_dalam: 0,
        total_masuk_hari_ini: 0,
        total_keluar_hari_ini: 0,
        total_kunjungan_event: 0
    });
    const [activities, setActivities] = useState([]);

    // State untuk loading
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isLoadingActivities, setIsLoadingActivities] = useState(true);
    const [submittingAction, setSubmittingAction] = useState(null); // 'masuk' | 'keluar' | null

    // Fungsi fetch Statistik
    const fetchStats = useCallback(async () => {
        try {
            setIsLoadingStats(true);
            const response = await api.get('/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Gagal mengambil statistik:', error);
        } finally {
            setIsLoadingStats(false);
        }
    }, []);

    // Fungsi fetch Aktivitas Terbaru
    const fetchActivities = useCallback(async () => {
        try {
            setIsLoadingActivities(true);
            const response = await api.get('/dashboard/recent-activity?limit=10');
            setActivities(response.data);
        } catch (error) {
            console.error('Gagal mengambil aktivitas:', error);
        } finally {
            setIsLoadingActivities(false);
        }
    }, []);

    // Panggil API saat komponen pertama kali di-render
    useEffect(() => {
        fetchStats();
        fetchActivities();

        // Opsional: Set interval untuk auto-refresh setiap 10 detik (karena belum pakai WebSocket/Supabase Realtime)
        const interval = setInterval(() => {
            fetchStats();
            fetchActivities();
        }, 10000);

        return () => clearInterval(interval);
    }, [fetchStats, fetchActivities]);

    // Handler untuk tombol input manual
    const handleManualInput = async (aksi) => {
        try {
            setSubmittingAction(aksi);
            await api.post('/kunjungan/manual', { aksi });

            // Refresh data setelah berhasil input
            fetchStats();
            fetchActivities();
        } catch (error) {
            alert(`Gagal mencatat pengunjung ${aksi}. Silakan coba lagi.`);
            console.error(error);
        } finally {
            setSubmittingAction(null);
        }
    };

    return (
        <div className="space-y-8 font-sans">

            {/* 4 STATISTIC CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Sedang di Dalam */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="text-gray-500 text-sm font-medium">Sedang di Dalam</div>
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Users size={16} />
                        </div>
                    </div>
                    <div className="text-4xl font-bold text-gray-800 mb-1">
                        {isLoadingStats ? '...' : stats.sedang_di_dalam}
                    </div>
                    <div className="text-xs text-blue-600 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Live Update
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
                        {isLoadingStats ? '...' : stats.total_masuk_hari_ini}
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
                        {isLoadingStats ? '...' : stats.total_keluar_hari_ini}
                    </div>
                    <div className="text-xs text-gray-400">Pengunjung hari ini</div>
                </div>

                {/* Card 4: Total Keseluruhan */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-gray-500 text-sm font-medium">Total Kunjungan Event</div>
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                            <CalendarCheck size={16} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                        {isLoadingStats ? '...' : stats.total_kunjungan_event}
                    </div>
                    <div className="text-xs text-gray-400">Sejak hari pertama</div>
                </div>
            </div>

            {/* MAIN ACTION AREA: INPUT MANUAL & RECENT ACTIVITY */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* KIRI: Tombol Input Manual */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Input Pengunjung Biasa</h3>
                        <p className="text-sm text-gray-500 mb-6">Gunakan tombol ini jika pengunjung tidak memiliki keychain NFC (Non-Member).</p>

                        <div className="space-y-4">
                            <button
                                onClick={() => handleManualInput('masuk')}
                                disabled={submittingAction !== null}
                                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-2xl p-6 flex flex-col items-center justify-center transition-all shadow-lg shadow-green-200 group"
                            >
                                <ArrowDownCircle className={`text-4xl mb-3 ${submittingAction !== 'masuk' && 'group-hover:scale-110'} transition-transform`} size={40} />
                                <span className="text-xl font-bold tracking-wide">
                  {submittingAction === 'masuk' ? 'MEMPROSES...' : '+ MASUK'}
                </span>
                                <span className="text-green-100 text-sm mt-1">Catat 1 Pengunjung Masuk</span>
                            </button>

                            <button
                                onClick={() => handleManualInput('keluar')}
                                disabled={submittingAction !== null}
                                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-2xl p-6 flex flex-col items-center justify-center transition-all shadow-lg shadow-red-200 group"
                            >
                                <ArrowUpCircle className={`text-4xl mb-3 ${submittingAction !== 'keluar' && 'group-hover:scale-110'} transition-transform`} size={40} />
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
                                className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
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
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Memuat data aktivitas...</td>
                                    </tr>
                                ) : activities.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Belum ada aktivitas hari ini.</td>
                                    </tr>
                                ) : (
                                    activities.map((act) => (
                                        <tr key={act.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-gray-500 font-medium">
                                                {/* Format waktu sederhana, sesuaikan dengan format API nanti */}
                                                {new Date(act.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
                                            </td>
                                            <td className="px-6 py-4">
                                                {act.tipe_pengunjung === 'member' ? (
                                                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-100">
                              <CreditCard size={12} /> Member
                            </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-semibold border border-gray-200">
                              <User size={12} /> Biasa
                            </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-800">{act.identitas}</div>
                                                <div className="text-xs text-gray-400 font-mono">
                                                    {act.tipe_pengunjung === 'member' ? `UID: ${act.nfc_uid}` : 'Input Manual'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {act.aktivitas === 'masuk' ? (
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
              <span className="text-sm font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                Lihat Semua Riwayat Kunjungan &rarr;
              </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;

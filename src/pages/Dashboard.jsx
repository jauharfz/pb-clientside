import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDownCircle,
  ArrowRight,
  ArrowUpCircle,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  LogIn,
  LogOut,
  RefreshCw,
  ScanLine,
  User,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import { supabaseRealtime } from '../lib/supabase';

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
  const [activeEventId, setActiveEventId] = useState(null);
  const [namaEvent, setNamaEvent] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [submittingAction, setSubmittingAction] = useState(null);
  const [flashKey, setFlashKey] = useState(0);
  const [scannerBuffer, setScannerBuffer] = useState('');
  const [scannerState, setScannerState] = useState('idle');
  const [scannerResult, setScannerResult] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState(supabaseRealtime ? 'connecting' : 'disabled');

  const activeEventIdRef = useRef(null);
  const scannerInputRef = useRef(null);

  const userRole = (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw).role : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const refocus = () => scannerInputRef.current?.focus();
    refocus();
    window.addEventListener('focus', refocus);
    document.addEventListener('click', refocus);
    return () => {
      window.removeEventListener('focus', refocus);
      document.removeEventListener('click', refocus);
    };
  }, []);

  const fetchStats = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoadingStats(true);
      const response = await api.get('/dashboard/stats');
      const data = response.data?.data || {};
      setStats({
        di_dalam: data.di_dalam || 0,
        total_masuk: data.total_masuk || 0,
        total_keluar: data.total_keluar || 0,
        total_harian: data.total_harian || 0,
      });

      if (data?.event_id) {
        setActiveEventId(data.event_id);
        activeEventIdRef.current = data.event_id;
        setNamaEvent(data.nama_event || null);
        localStorage.setItem('pekan_active_event', JSON.stringify({ id: data.event_id, nama: data.nama_event || null }));
      } else {
        setActiveEventId(null);
        activeEventIdRef.current = null;
        setNamaEvent(null);
        localStorage.removeItem('pekan_active_event');
      }

      window.dispatchEvent(new CustomEvent('pekan_event_update'));
      if (silent) setFlashKey((k) => k + 1);
    } catch (error) {
      console.error('Gagal mengambil statistik:', error);
    } finally {
      if (!silent) setIsLoadingStats(false);
    }
  }, []);

  const fetchActivities = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoadingActivities(true);
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const params = { tanggal: today };
      if (activeEventIdRef.current) params.event_id = activeEventIdRef.current;
      const response = await api.get('/visitors', { params });
      const rows = response.data?.data || [];
      const sortTime = (row) => (row.status === 'keluar' && row.waktu_keluar ? new Date(row.waktu_keluar) : new Date(row.waktu_masuk));
      const sorted = [...rows].sort((a, b) => sortTime(b) - sortTime(a));
      setActivities(sorted.slice(0, 10));
    } catch (error) {
      console.error('Gagal mengambil aktivitas:', error);
    } finally {
      if (!silent) setIsLoadingActivities(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchActivities();

    let channel = null;
    const polling = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchStats(true);
        fetchActivities(true);
      }
    }, 5000);

    if (supabaseRealtime) {
      channel = supabaseRealtime
        .channel('dashboard-kunjungan-privacy')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'kunjungan' }, () => {
          fetchStats(true);
          fetchActivities(true);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') setRealtimeStatus('connected');
          else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setRealtimeStatus('error');
          else if (status === 'CLOSED') setRealtimeStatus('disabled');
        });
    } else {
      setRealtimeStatus('disabled');
    }

    return () => {
      if (channel) supabaseRealtime.removeChannel(channel);
      clearInterval(polling);
    };
  }, [fetchActivities, fetchStats]);

  useEffect(() => {
    if (activeEventId) fetchActivities(true);
  }, [activeEventId, fetchActivities]);

  const handleManualInput = async (aksi) => {
    if (!activeEventId) {
      toast.warning('Event aktif belum terdeteksi.');
      return;
    }
    try {
      setSubmittingAction(aksi);
      await api.post('/visitors/manual', { aksi, event_id: activeEventId });
      toast.success(`Pengunjung ${aksi === 'masuk' ? 'masuk' : 'keluar'} berhasil dicatat.`);
      await Promise.all([fetchStats(true), fetchActivities(true)]);
    } catch (error) {
      toast.error(`Gagal mencatat pengunjung ${aksi}.`);
      console.error(error);
    } finally {
      setSubmittingAction(null);
    }
  };

  const processScannerTap = useCallback(async (rawUid) => {
    const scannedUid = String(rawUid || '').trim();
    if (!scannedUid) return;

    if (!activeEventIdRef.current) {
      setScannerState('error');
      setScannerResult({ ok: false, message: 'Tidak ada event aktif.' });
      toast.warning('Tidak ada event aktif.');
      setTimeout(() => setScannerState('idle'), 1800);
      return;
    }

    setScannerState('scanning');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: scannedUid, timestamp: new Date().toISOString() }),
      });
      const payload = await response.json();

      if (!response.ok || payload?.status !== 'success') {
        const message = payload?.detail?.message || payload?.message || 'Tap NFC gagal diproses.';
        setScannerState('error');
        setScannerResult({ ok: false, message });
        toast.error(message);
        return;
      }

      const aksi = payload?.data?.aksi;
      setScannerState(aksi === 'keluar' ? 'success-keluar' : 'success-masuk');
      setScannerResult({ ok: true, ...payload.data });
      toast.success(
        aksi === 'keluar'
          ? `${payload.data?.nama_member || 'Member'} berhasil tap keluar.`
          : `${payload.data?.nama_member || 'Member'} berhasil tap masuk.`
      );

      await Promise.all([fetchStats(true), fetchActivities(true)]);
    } catch (error) {
      const message = error?.message || 'Gagal terhubung ke server.';
      setScannerState('error');
      setScannerResult({ ok: false, message });
      toast.error(message);
    } finally {
      setScannerBuffer('');
      setTimeout(() => {
        setScannerState('idle');
        scannerInputRef.current?.focus();
      }, 1800);
    }
  }, [fetchActivities, fetchStats, toast]);

  const handleScannerKeyDown = useCallback(async (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const scannedUid = scannerBuffer.trim();
    setScannerBuffer('');
    await processScannerTap(scannedUid);
  }, [processScannerTap, scannerBuffer]);

  const handleScannerChange = useCallback((event) => {
    const nextValue = event.target.value || '';
    setScannerBuffer(nextValue);
    if (nextValue.trim()) setScannerState('scanning');
  }, []);

  const getActivityTime = (activity) => {
    if (activity.status === 'keluar' && activity.waktu_keluar) return new Date(activity.waktu_keluar);
    return new Date(activity.waktu_masuk);
  };

  const getScannerHeadline = () => {
    if (scannerState === 'error') return 'Tap gagal diproses';
    if (scannerState === 'scanning') return 'Membaca kartu member…';
    return scannerResult?.nama_member || 'Menunggu tap member';
  };

  const getScannerSubtext = () => {
    if (scannerState === 'error') return scannerResult?.message || 'Kartu tidak dikenali.';
    if (scannerState === 'success-keluar') return 'Tercatat keluar';
    if (scannerState === 'success-masuk') return 'Tercatat masuk';
    if (scannerState === 'scanning') return 'Reader aktif';
    return 'Siap menerima tap member';
  };

  const scannerTone =
    scannerState === 'error'
      ? 'border-red-200 bg-red-50'
      : scannerState === 'success-keluar'
        ? 'border-indigo-200 bg-indigo-50'
        : scannerState === 'success-masuk'
          ? 'border-green-200 bg-green-50'
          : scannerState === 'scanning'
            ? 'border-amber-200 bg-amber-50'
            : 'border-gray-100 bg-white';

  const isManualButtonDisabled = submittingAction !== null || !activeEventId;

  const RealtimeBadge = () => {
    if (realtimeStatus === 'connected') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
          <Wifi size={11} className="animate-pulse" /> Realtime
        </span>
      );
    }
    if (realtimeStatus === 'connecting') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          <RefreshCw size={11} className="animate-spin" /> Connecting…
        </span>
      );
    }
    if (realtimeStatus === 'error') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
          <WifiOff size={11} /> Backup Polling
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
        <RefreshCw size={11} /> Polling
      </span>
    );
  };

  const statCards = [
    { key: 'di_dalam', label: 'Sedang di Dalam', value: stats.di_dalam, icon: Users, iconTone: 'bg-green-100 text-green-700', meta: 'Live', metaTone: 'text-green-700' },
    { key: 'total_masuk', label: 'Tap Masuk', value: stats.total_masuk, icon: LogIn, iconTone: 'bg-emerald-100 text-emerald-700', meta: 'Hari ini', metaTone: 'text-gray-500' },
    { key: 'total_keluar', label: 'Tap Keluar', value: stats.total_keluar, icon: LogOut, iconTone: 'bg-orange-100 text-orange-700', meta: 'Hari ini', metaTone: 'text-gray-500' },
    { key: 'total_harian', label: 'Kunjungan Hari Ini', value: stats.total_harian, icon: CalendarCheck, iconTone: 'bg-purple-100 text-purple-700', meta: namaEvent || 'Event aktif', metaTone: 'text-gray-500' },
  ];

  return (
    <div className="space-y-4 font-sans pb-1">
      <style>{`
        @keyframes value-flash { 0% { background-color: transparent; } 25% { background-color: #dcfce7; } 100% { background-color: transparent; } }
        @keyframes row-flash { 0% { background-color: transparent; } 25% { background-color: #f0fdf4; } 100% { background-color: transparent; } }
        .value-flash { animation: value-flash 0.75s ease-out; }
        .row-flash { animation: row-flash 0.75s ease-out; }
      `}</style>

      {!isLoadingStats && !activeEventId && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-800">Tidak ada event aktif</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Tombol input manual dinonaktifkan. Tap NFC juga tidak akan diterima sampai ada event aktif.
            </p>
          </div>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="text-[13px] text-gray-500 font-medium leading-tight">{item.label}</div>
                  <div className={`text-[11px] mt-1 ${item.metaTone}`}>{item.meta}</div>
                </div>
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${item.iconTone}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="text-3xl md:text-[32px] font-bold leading-none text-gray-900">
                {isLoadingStats ? '...' : (
                  <span key={`${item.key}-${flashKey}`} className="value-flash inline-block px-1 rounded-lg">
                    {item.value}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[236px,minmax(0,1fr)] gap-4 lg:items-stretch">
        <div className="space-y-4">
          <input
            ref={scannerInputRef}
            type="text"
            value={scannerBuffer}
            onChange={handleScannerChange}
            onKeyDown={handleScannerKeyDown}
            autoComplete="off"
            inputMode="none"
            className="absolute opacity-0 pointer-events-none w-px h-px"
            aria-hidden="true"
          />

          <div className={`p-2.5 rounded-2xl shadow-sm border transition-colors ${scannerTone}`} onClick={() => scannerInputRef.current?.focus()}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-bold text-gray-800">Tap Member NFC</h3>
              <div className="w-7 h-7 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                <ScanLine size={14} />
              </div>
            </div>

            <div className="rounded-2xl bg-gray-900 text-white px-3 py-2.5 min-h-[88px] flex flex-col justify-center">
              <div className="text-[10px] uppercase tracking-[0.16em] text-gray-400 font-semibold mb-1.5">Tap Terakhir</div>
              <div className="text-[15px] font-semibold leading-snug break-words line-clamp-2">{getScannerHeadline()}</div>
              <div className={`mt-1 text-[11px] ${scannerState === 'error' ? 'text-red-300' : scannerState.startsWith('success') ? 'text-green-300' : scannerState === 'scanning' ? 'text-amber-300' : 'text-gray-300'}`}>
                {getScannerSubtext()}
              </div>
              {scannerResult?.ok && (
                <div className="mt-2 inline-flex w-max items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold border border-white/10 bg-white/10">
                  <CheckCircle2 size={11} className={scannerResult?.aksi === 'keluar' ? 'text-indigo-300' : 'text-green-300'} />
                  {scannerResult?.aksi === 'keluar' ? 'KELUAR' : 'MASUK'}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Input Pengunjung Biasa</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleManualInput('masuk')}
                disabled={isManualButtonDisabled}
                title={!activeEventId ? 'Menunggu data event aktif...' : ''}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white rounded-2xl px-3.5 py-3.5 flex flex-col items-center justify-center transition-all shadow-lg shadow-green-100 group"
              >
                <ArrowDownCircle className={`mb-2 ${!isManualButtonDisabled ? 'group-hover:scale-110' : ''} transition-transform`} size={28} />
                <span className="text-base font-bold tracking-wide leading-none">{submittingAction === 'masuk' ? 'PROSES…' : '+ MASUK'}</span>
                <span className="text-green-100 text-[11px] mt-1">1 pengunjung</span>
              </button>

              <button
                onClick={() => handleManualInput('keluar')}
                disabled={isManualButtonDisabled}
                title={!activeEventId ? 'Menunggu data event aktif...' : ''}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-2xl px-3.5 py-3.5 flex flex-col items-center justify-center transition-all shadow-lg shadow-red-100 group"
              >
                <ArrowUpCircle className={`mb-2 ${!isManualButtonDisabled ? 'group-hover:scale-110' : ''} transition-transform`} size={28} />
                <span className="text-base font-bold tracking-wide leading-none">{submittingAction === 'keluar' ? 'PROSES…' : '- KELUAR'}</span>
                <span className="text-red-100 text-[11px] mt-1">1 pengunjung</span>
              </button>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col lg:h-[calc(100vh-300px)] min-h-[420px]">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-gray-50/60">
              <div className="flex items-center gap-3 min-w-0">
                <h3 className="text-base font-bold text-gray-800 truncate">Aktivitas Tap & Input Terbaru</h3>
                <RealtimeBadge />
              </div>
              <button
                onClick={() => {
                  fetchStats();
                  fetchActivities();
                }}
                className="text-sm text-green-700 font-medium hover:underline flex items-center gap-1 shrink-0"
              >
                Refresh <RefreshCw size={14} className={isLoadingActivities ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-gray-400 text-[11px] uppercase tracking-wider border-b border-gray-100">
                    <th className="px-5 py-3 font-semibold whitespace-nowrap">Waktu</th>
                    <th className="px-5 py-3 font-semibold whitespace-nowrap">Tipe</th>
                    <th className="px-5 py-3 font-semibold">Identitas</th>
                    <th className="px-5 py-3 font-semibold whitespace-nowrap">Aktivitas</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {isLoadingActivities ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-8 text-center text-gray-500">Memuat data aktivitas...</td>
                    </tr>
                  ) : activities.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-8 text-center text-gray-500">Belum ada aktivitas hari ini.</td>
                    </tr>
                  ) : (
                    activities.map((activity) => (
                      <tr key={`${activity.id}-${flashKey}`} className="hover:bg-gray-50 transition row-flash align-top">
                        <td className="px-5 py-3 text-gray-500 font-medium whitespace-nowrap">
                          {getActivityTime(activity).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          {activity.tipe_pengunjung === 'member' ? (
                            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-800 px-2.5 py-1 rounded-md text-xs font-semibold border border-green-100">
                              <CreditCard size={12} /> Member
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-semibold border border-gray-200">
                              <User size={12} /> Biasa
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 min-w-[220px]">
                          {activity.tipe_pengunjung === 'member' ? (
                            <>
                              <div className="font-semibold text-gray-800 leading-snug">{activity.member?.nama || activity.nama_member || 'Member'}</div>
                              <div className="text-[11px] text-gray-400 font-mono mt-1">ID: {activity.member_id?.substring(0, 8)}...</div>
                            </>
                          ) : (
                            <>
                              <div className="font-semibold text-gray-800">Pengunjung Biasa</div>
                              <div className="text-[11px] text-gray-400 font-mono mt-1">Input Manual</div>
                            </>
                          )}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          {activity.status === 'di_dalam' ? (
                            <span className="text-green-600 font-bold flex items-center gap-2"><LogIn size={14} /> Masuk</span>
                          ) : (
                            <span className="text-red-500 font-bold flex items-center gap-2"><LogOut size={14} /> Keluar</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-center">
              <button onClick={() => navigate('/reports')} className="text-sm font-semibold text-green-700 hover:text-green-900 transition">
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

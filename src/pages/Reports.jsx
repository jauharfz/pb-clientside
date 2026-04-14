// src/pages/Reports.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    ChevronDown, FileSpreadsheet, FileText,
    ArrowRight, ArrowLeft, IdCard, User,
    Download, AlertTriangle, X, Loader2,
    Users, TrendingUp, UserCheck, Info, Store, BarChart2, CalendarDays
} from 'lucide-react';
import api from '../services/api';

const ITEMS_PER_PAGE = 15;

const getLocalDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

// Format tanggal YYYY-MM-DD → "Sen, 1 Jan 2025"
const fmtTanggal = (s) => new Date(s + 'T00:00:00').toLocaleDateString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
});

const Reports = () => {
    // ── Events list (untuk primary selector) ─────────────────────────────
    // ── Report tab ───────────────────────────────────────────────────────────
    const [reportTab, setReportTab] = useState('pengunjung'); // pengunjung | tenant | akumulasi

    const [events, setEvents]             = useState([]);
    const [isLoadingEvents, setLoadingEv] = useState(true);

    // ── Filter state ──────────────────────────────────────────────────────
    // selectedEventId kosong = belum pilih event (tampilkan placeholder)
    const [selectedEventId, setSelectedEventId] = useState('');
    // selectedDate kosong = semua hari event; isi = drill-down ke hari itu
    const [selectedDate, setSelectedDate]       = useState('');
    const [filterType, setFilterType]           = useState('Semua Tipe Pengunjung');

    // ── Report data ───────────────────────────────────────────────────────
    const [reportData, setReportData]           = useState(null);
    const [isLoading, setIsLoading]             = useState(false);
    // tanggal_range HANYA diperbarui saat fetch full-event (tanpa selectedDate).
    // Ini mencegah pills hilang saat user drill-down ke hari tertentu.
    const [eventTanggalRange, setEventTanggalRange] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [exportFormat, setExportFormat] = useState('');
    const [isExporting, setIsExporting]   = useState(false);

    // ── Load daftar event saat mount ──────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const res  = await api.get('/events');
                const raw  = res.data.data || [];
                // Urutkan: terbaru dulu berdasarkan tanggal
                const sorted = [...raw].sort((a, b) =>
                    new Date(b.tanggal) - new Date(a.tanggal)
                );
                setEvents(sorted);
                // Auto-pilih event aktif jika ada
                const aktif = sorted.find(e => e.status === 'aktif');
                if (aktif) setSelectedEventId(aktif.id);
            } catch {
                // gagal load events — biarkan user pilih manual
            } finally {
                setLoadingEv(false);
            }
        })();
    }, []);

    // ── Fetch laporan setiap kali filter berubah ──────────────────────────
    const fetchReports = useCallback(async () => {
        if (!selectedEventId && !selectedDate) {
            setReportData(null);
            return;
        }
        try {
            setIsLoading(true);
            const params = {};
            if (selectedEventId) params.event_id = selectedEventId;
            if (selectedDate)    params.tanggal   = selectedDate;
            if (!selectedEventId && !selectedDate) params.tanggal = getLocalDateStr();

            const response = await api.get('/reports', { params });
            const data = response.data.data || null;
            setReportData(data);
            setCurrentPage(1);

            // Hanya update eventTanggalRange saat fetch full-event (tanpa drill-down tanggal).
            // Saat drill-down ke hari tertentu, tanggal_range dari response hanya berisi
            // 1 entry → jangan overwrite, biarkan pills tetap tampil dari state lama.
            if (!selectedDate && data?.tanggal_range) {
                setEventTanggalRange(data.tanggal_range);
            }
        } catch (error) {
            console.error('Gagal mengambil data laporan:', error);
            setReportData(null);
        } finally {
            setIsLoading(false);
        }
    }, [selectedEventId, selectedDate]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // Reset date drill-down, tanggal_range, dan page saat event berubah
    useEffect(() => {
        setSelectedDate('');
        setEventTanggalRange([]);
        setCurrentPage(1);
    }, [selectedEventId]);

    useEffect(() => { setCurrentPage(1); }, [filterType]);

    const handleOpenExportModal = (format) => {
        setExportFormat(format);
        setIsModalOpen(true);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const formatParam = exportFormat.toLowerCase() === 'excel' ? 'excel' : 'pdf';
            const exportParams = { format: formatParam };
            if (selectedEventId) exportParams.event_id = selectedEventId;
            if (selectedDate)    exportParams.tanggal  = selectedDate;

            const response = await api.get('/reports/export', {
                params: exportParams,
                responseType: 'blob',
            });

            const ext = formatParam === 'excel' ? 'xlsx' : 'pdf';
            const safeName = (reportData?.nama_event || 'laporan').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
            const suffix   = selectedDate || safeName;
            const url  = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `laporan_kunjungan_${suffix}.${ext}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setIsModalOpen(false);
        } catch (error) {
            alert(`Gagal mengunduh file ${exportFormat}: ${error.message || 'Silakan coba lagi.'}`);
            console.error(error);
        } finally {
            setIsExporting(false);
        }
    };

    // --- FILTER & PAGINATION ---

    const allDetail = reportData?.detail || [];

    const filteredReports = allDetail.filter(row => {
        if (filterType === 'Semua Tipe Pengunjung') return true;
        if (filterType === 'Hanya Member (NFC)') return row.tipe_pengunjung === 'member';
        return row.tipe_pengunjung === 'biasa';
    });

    // [FIX] Hitung halaman dan slice data untuk halaman aktif
    const totalItems = filteredReports.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const indexOfFirst = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const indexOfLast = indexOfFirst + ITEMS_PER_PAGE;
    const pagedReports = filteredReports.slice(indexOfFirst, indexOfLast);

    // Generate nomor halaman yang ditampilkan (max 5 halaman di sekitar halaman aktif)
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        for (
            let i = Math.max(1, safeCurrentPage - delta);
            i <= Math.min(totalPages, safeCurrentPage + delta);
            i++
        ) {
            range.push(i);
        }
        return range;
    };

    return (
        <div className="font-sans h-full flex flex-col relative space-y-4">

          {/* ── Report Tab Bar ── */}
          <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm self-start">
            {[
              { v:'pengunjung', l:'Laporan Pengunjung', Icon:Users },
              { v:'tenant',     l:'Laporan UMKM',       Icon:Store },
              { v:'akumulasi',  l:'Akumulasi Event',    Icon:BarChart2 },
            ].map(({ v, l, Icon }) => (
              <button key={v} onClick={() => setReportTab(v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${reportTab===v ? 'bg-green-700 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Icon size={14}/>{l}
              </button>
            ))}
          </div>

          {/* ── Tab: Pengunjung (existing) ── */}
          {reportTab === 'pengunjung' && (
          <div className="flex flex-col gap-6 flex-1">

            {/* RINGKASAN STATISTIK */}
            {reportData?.ringkasan && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                            <Users size={18} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">{reportData.ringkasan.total_kunjungan}</div>
                            <div className="text-xs text-gray-500">Total Kunjungan</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                            <UserCheck size={18} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">{reportData.ringkasan.total_member}</div>
                            <div className="text-xs text-gray-500">Pengunjung Member</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                            <TrendingUp size={18} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">{reportData.ringkasan.total_biasa}</div>
                            <div className="text-xs text-gray-500">Pengunjung Biasa</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1">

                {/* TOOLBAR */}
                <div className="p-6 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/30 shrink-0">

                    {/* Baris 1: Event picker + filter tipe + export */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">

                            {/* Primary: Event picker */}
                            <div className="relative">
                                <select
                                    value={selectedEventId}
                                    onChange={(e) => setSelectedEventId(e.target.value)}
                                    disabled={isLoadingEvents}
                                    className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 text-sm font-medium cursor-pointer shadow-sm w-full sm:w-64 disabled:opacity-50"
                                >
                                    <option value="">
                                        {isLoadingEvents ? 'Memuat event...' : '— Pilih Event —'}
                                    </option>
                                    {events.map(ev => (
                                        <option key={ev.id} value={ev.id}>
                                            {ev.nama_event}
                                            {ev.status === 'aktif' ? ' ●' : ''}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                    <ChevronDown size={16} />
                                </div>
                            </div>

                            {/* Secondary: Filter tipe */}
                            <div className="relative">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 text-sm font-medium cursor-pointer shadow-sm w-full sm:w-auto"
                                >
                                    <option>Semua Tipe Pengunjung</option>
                                    <option>Hanya Member (NFC)</option>
                                    <option>Hanya Pengunjung Biasa</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <button
                                onClick={() => handleOpenExportModal('Excel')}
                                disabled={!selectedEventId}
                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 rounded-xl font-semibold text-sm transition"
                            >
                                <FileSpreadsheet size={16} /> Export Excel
                            </button>
                            <button
                                onClick={() => handleOpenExportModal('PDF')}
                                disabled={!selectedEventId}
                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 rounded-xl font-semibold text-sm transition"
                            >
                                <FileText size={16} /> Export PDF
                            </button>
                        </div>
                    </div>

                    {/* Baris 2: Date pills — hanya tampil jika event punya lebih dari 1 hari */}
                    {eventTanggalRange.length > 1 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-400 font-medium shrink-0">Filter hari:</span>
                            <button
                                onClick={() => setSelectedDate('')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                    selectedDate === ''
                                        ? 'bg-green-700 text-white border-green-700'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
                                }`}
                            >
                                Semua Hari ({eventTanggalRange.length})
                            </button>
                            {eventTanggalRange.map(tgl => (
                                <button
                                    key={tgl}
                                    onClick={() => setSelectedDate(tgl === selectedDate ? '' : tgl)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                        selectedDate === tgl
                                            ? 'bg-green-700 text-white border-green-700'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
                                    }`}
                                >
                                    {fmtTanggal(tgl)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* TABEL DATA */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                        <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 sticky top-0 z-10">
                            <th className="px-6 py-4 font-semibold">Waktu Masuk</th>
                            <th className="px-6 py-4 font-semibold">Tipe</th>
                            <th className="px-6 py-4 font-semibold">Identitas</th>
                            <th className="px-6 py-4 font-semibold">Waktu Keluar</th>
                            <th className="px-6 py-4 font-semibold">Durasi</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                        </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-green-600" />
                                    Memuat data laporan...
                                </td>
                            </tr>
                        ) : !selectedEventId ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                    Pilih event di atas untuk melihat laporan kunjungan.
                                </td>
                            </tr>
                        ) : pagedReports.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    Tidak ada data untuk filter yang dipilih.
                                </td>
                            </tr>
                        ) : (
                            pagedReports.map((row) => {
                                const isMember = row.tipe_pengunjung === 'member';

                                const waktuMasuk = row.waktu_masuk ? new Date(row.waktu_masuk) : null;
                                const waktuKeluar = row.waktu_keluar ? new Date(row.waktu_keluar) : null;

                                const fmtDate = (d) => d
                                    ? d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : '-';
                                const fmtJam = (d) => d
                                    ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                    : '-';

                                return (
                                    <tr key={row.id} className="hover:bg-gray-50 transition">

                                        {/* Waktu Masuk — akurat untuk semua tipe */}
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-700">{fmtDate(waktuMasuk)}</div>
                                            <div className="text-xs text-gray-500">{fmtJam(waktuMasuk)} WIB</div>
                                        </td>

                                        {/* Tipe */}
                                        <td className="px-6 py-4">
                                            {isMember ? (
                                                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-800 px-2.5 py-1 rounded-md text-xs font-semibold border border-green-100">
                                                    <IdCard size={14} /> Member
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-semibold border border-gray-200">
                                                    <User size={14} /> Biasa
                                                </span>
                                            )}
                                        </td>

                                        {/* Identitas */}
                                        <td className="px-6 py-4">
                                            {isMember ? (
                                                <>
                                                    <div className="font-semibold text-gray-800">{row.nama_member || '-'}</div>
                                                    <div className="text-xs text-gray-400 font-mono">
                                                        #{row.id?.substring(0, 8)}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="font-medium text-gray-400 italic">Pengunjung Biasa</div>
                                            )}
                                        </td>

                                        {/* Waktu Keluar
                                            Member   → akurat (tap NFC)
                                            Non-member → FIFO, tidak merepresentasikan individu
                                                         tampilkan dash + tooltip penjelasan */}
                                        <td className="px-6 py-4">
                                            {isMember ? (
                                                waktuKeluar ? (
                                                    <>
                                                        <div className="font-medium text-gray-700">{fmtDate(waktuKeluar)}</div>
                                                        <div className="text-xs text-gray-500">{fmtJam(waktuKeluar)} WIB</div>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )
                                            ) : (
                                                <span
                                                    className="inline-flex items-center gap-1 text-xs text-gray-400 cursor-default"
                                                    title="Pengunjung biasa tidak dilacak per individu. Waktu keluar tidak dapat dipasangkan secara akurat."
                                                >
                                                    — <Info size={12} className="opacity-60" />
                                                </span>
                                            )}
                                        </td>

                                        {/* Durasi
                                            Member   → akurat
                                            Non-member → tidak bermakna (FIFO pairing) */}
                                        <td className="px-6 py-4">
                                            {isMember && row.durasi_menit != null ? (
                                                <span className="text-sm text-gray-700 font-medium">
                                                    {row.durasi_menit} mnt
                                                </span>
                                            ) : isMember && row.status === 'di_dalam' ? (
                                                <span className="text-xs text-gray-400">Masih di dalam</span>
                                            ) : (
                                                <span
                                                    className="inline-flex items-center gap-1 text-xs text-gray-400 cursor-default"
                                                    title="Durasi tidak dihitung untuk pengunjung biasa."
                                                >
                                                    — <Info size={12} className="opacity-60" />
                                                </span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            {row.status === 'di_dalam' ? (
                                                <span className="text-green-600 font-bold flex items-center gap-1.5 text-sm">
                                                    <ArrowRight size={14} /> Di Dalam
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 font-bold flex items-center gap-1.5 text-sm">
                                                    <ArrowLeft size={14} /> Keluar
                                                </span>
                                            )}
                                        </td>

                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>

                {/* [FIX] PAGINATION — sebelumnya sepenuhnya static/placeholder:
                    Prev/Next selalu disabled hardcoded, selalu menampilkan halaman 1,
                    tidak ada state page, semua data ditampilkan sekaligus.
                    Sekarang: fully functional dengan state currentPage, slice data,
                    nomor halaman dinamis, Prev/Next berfungsi. */}
                <div className="p-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500 shrink-0">
                    <span>
                        {!selectedEventId
                            ? 'Pilih event untuk melihat data'
                            : totalItems === 0
                                ? 'Tidak ada data'
                                : `Menampilkan ${indexOfFirst + 1}–${Math.min(indexOfLast, totalItems)} dari ${totalItems} entri`
                        }
                        {reportData?.nama_event && (
                            <span className="ml-2 text-xs text-gray-400">
                                — <strong className="text-gray-600">{reportData.nama_event}</strong>
                                {selectedDate
                                    ? ` · ${fmtTanggal(selectedDate)}`
                                    : eventTanggalRange.length > 1
                                        ? ` · ${eventTanggalRange.length} hari`
                                        : eventTanggalRange.length === 1
                                            ? ` · ${fmtTanggal(eventTanggalRange[0])}`
                                            : ''
                                }
                            </span>
                        )}
                    </span>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            {/* Tombol Prev */}
                            <button
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={safeCurrentPage === 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-medium"
                            >
                                &laquo; Prev
                            </button>

                            {/* Elipsis kiri */}
                            {getPageNumbers()[0] > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-xs font-medium"
                                    >
                                        1
                                    </button>
                                    {getPageNumbers()[0] > 2 && (
                                        <span className="px-2 text-gray-400">…</span>
                                    )}
                                </>
                            )}

                            {/* Nomor halaman di sekitar halaman aktif */}
                            {getPageNumbers().map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1.5 border rounded-lg transition text-xs font-medium ${
                                        page === safeCurrentPage
                                            ? 'bg-green-700 text-white border-green-700'
                                            : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            {/* Elipsis kanan */}
                            {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                                <>
                                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                                        <span className="px-2 text-gray-400">…</span>
                                    )}
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-xs font-medium"
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}

                            {/* Tombol Next */}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={safeCurrentPage === totalPages}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-medium"
                            >
                                Next &raquo;
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL EXPORT */}
            <ExportModal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              subtitle="Laporan Kunjungan Event"
              details={[
                ['Event', reportData?.nama_event || events.find(e => e.id === selectedEventId)?.nama_event || '—'],
                ['Scope', selectedDate ? fmtTanggal(selectedDate) : eventTanggalRange.length > 1 ? `Seluruh Event (${eventTanggalRange.length} hari)` : 'Seluruh Event'],
                ['Tipe Pengunjung', filterType],
                ['Total Data', `${filteredReports.length} entri`],
                ['Format', exportFormat + ' Document'],
              ]}
              onExcel={() => { setExportFormat('Excel'); handleExport(); }}
              onPdf={()    => { setExportFormat('PDF');   handleExport(); }}
            />
          </div>
          )} {/* end pengunjung tab */}

          {/* ── Tab: Laporan UMKM ── */}
          {reportTab === 'tenant' && <TenantReport events={events} isLoadingEvents={isLoadingEvents}/>}

          {/* ── Tab: Akumulasi Event ── */}
          {reportTab === 'akumulasi' && <AccumulationReport events={events}/>}

        </div>
    );
};
// ── Shared client-side export helpers ────────────────────────────────────────
// Excel: tab-separated, opens natively in Excel/LibreOffice
function exportExcel(filename, headers, rows) {
  const lines = [headers.join('\t'), ...rows.map(r => r.map(v => String(v ?? '')).join('\t'))];
  const blob  = new Blob(['\uFEFF' + lines.join('\n')], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href      = url;
  a.download  = filename.replace(/\.(csv|xls|xlsx)$/, '') + '.xls';
  a.click();
  URL.revokeObjectURL(url);
}

// PDF: print-friendly HTML opened in new window
function exportPDF(title, headers, rows, summaryRows) {
  const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const sr  = summaryRows || [];
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:11px;margin:20px;color:#111}
  h2{font-size:15px;margin-bottom:3px;color:#1a3a2a}
  .meta{font-size:10px;color:#666;margin-bottom:14px}
  table{width:100%;border-collapse:collapse}
  th{background:#2f6f4e;color:#fff;padding:6px 9px;text-align:left;font-size:10px;white-space:nowrap}
  td{padding:5px 9px;border-bottom:1px solid #e5e7eb;font-size:10px}
  tr.total td{font-weight:700;background:#f0fdf4;border-top:2px solid #2f6f4e}
  @media print{@page{margin:12mm}}
</style></head><body>
<h2>${esc(title)}</h2>
<div class="meta">Dicetak: ${new Date().toLocaleString('id-ID')} &nbsp;·&nbsp; Peken Banyumasan</div>
<table>
  <thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead>
  <tbody>
    ${rows.map(r=>`<tr>${r.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}
    ${sr.map(r=>`<tr class="total">${r.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}
  </tbody>
</table>
<script>window.onload=()=>window.print()</script>
</body></html>`;
  const w = window.open('','_blank');
  if (w) { w.document.write(html); w.document.close(); }
}

// ── Shared Export Modal — reused by all 3 report tabs ─────────────────────────
function ExportModal({ open, onClose, subtitle, details, onExcel, onPdf }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-green-700 p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
              <Download size={20}/>
            </div>
            <div className="text-white">
              <h3 className="font-bold text-lg leading-tight">Konfirmasi Export</h3>
              <p className="text-green-100 text-xs">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-green-200 hover:text-white transition">
            <X size={22}/>
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4">Pilih format yang akan diunduh:</p>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-5 space-y-2 text-sm">
            {details.map(([label, val]) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-gray-500 shrink-0">{label}:</span>
                <span className="font-bold text-gray-800 text-right truncate">{val}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { onExcel(); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-4 py-2.5 rounded-xl font-semibold text-sm transition">
              <FileSpreadsheet size={16}/> Export Excel
            </button>
            <button onClick={() => { onPdf(); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-4 py-2.5 rounded-xl font-semibold text-sm transition">
              <FileText size={16}/> Export PDF
            </button>
          </div>
        </div>
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button onClick={onClose}
            className="px-5 py-2 text-gray-600 font-semibold text-sm hover:bg-gray-200 rounded-xl transition">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
// ── Tenant Report Tab ─────────────────────────────────────────────────────────
const DEMO_TENANT_REPORT = [
  { id:'t1', nama:'Batik Sari Rahayu',    kategori:'Kriya & Fashion', omset:4850000, komisi_persen:15, transaksi:42, event_count:3, stand_terakhir:'A-3' },
  { id:'t2', nama:'Keripik Tempe Mrisi',  kategori:'Kuliner',         omset:2340000, komisi_persen:15, transaksi:98, event_count:2, stand_terakhir:'B-2' },
  { id:'t3', nama:'Calung Mas',           kategori:'Seni Pertunjukan',omset:1200000, komisi_persen:10, transaksi:24, event_count:4, stand_terakhir:'C-1' },
  { id:'t4', nama:'Tenun Lurik Cilacap',  kategori:'Kriya & Fashion', omset:3650000, komisi_persen:15, transaksi:31, event_count:2, stand_terakhir:'A-5' },
  { id:'t5', nama:'Dawet Ayu Bu Tari',    kategori:'Kuliner',         omset:1980000, komisi_persen:12, transaksi:76, event_count:3, stand_terakhir:'B-7' },
  { id:'t6', nama:'Anyam Bambu Banyumas', kategori:'Kriya & Fashion', omset:890000,  komisi_persen:15, transaksi:15, event_count:1, stand_terakhir:'A-2' },
];
const fmtRp = n => `Rp ${(n||0).toLocaleString('id-ID')}`;

function TenantReport({ events = [] }) {
  const [selEvent,   setSelEvent]   = React.useState('');
  const [sortBy,     setSortBy]     = React.useState('omset');
  const [search,     setSearch]     = React.useState('');
  const [showExport, setShowExport] = React.useState(false);

  const data = React.useMemo(() =>
    DEMO_TENANT_REPORT
      .filter(t => !search || t.nama.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'omset')     return b.omset - a.omset;
        if (sortBy === 'komisi')    return (b.omset * b.komisi_persen / 100) - (a.omset * a.komisi_persen / 100);
        if (sortBy === 'transaksi') return b.transaksi - a.transaksi;
        if (sortBy === 'event')     return b.event_count - a.event_count;
        return a.nama.localeCompare(b.nama);
      }),
    [sortBy, search]
  );

  const totalOmset  = data.reduce((s, t) => s + t.omset, 0);
  const totalKomisi = data.reduce((s, t) => s + Math.round(t.omset * t.komisi_persen / 100), 0);
  const totalTrx    = data.reduce((s, t) => s + t.transaksi, 0);

  const HDRS = ['Nama Usaha','Kategori','Stand Terakhir','Omset (Rp)','Komisi (Rp)','% Komisi','Netto (Rp)','Transaksi','Event Diikuti'];
  const makeRows = () => data.map(t => {
    const k = Math.round(t.omset * t.komisi_persen / 100);
    return [t.nama, t.kategori, t.stand_terakhir, t.omset, k, t.komisi_persen + '%', t.omset - k, t.transaksi, t.event_count + 'x'];
  });
  const makeTot = () => [['TOTAL (' + data.length + ' UMKM)', '', '', totalOmset, totalKomisi, '', totalOmset - totalKomisi, totalTrx, '']];

  return (
    <div className="space-y-4">

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Omset UMKM',   value: fmtRp(totalOmset),   cls: 'text-green-700', bg: 'bg-green-100' },
          { label: 'Total Komisi Masuk', value: fmtRp(totalKomisi),  cls: 'text-amber-700', bg: 'bg-amber-100' },
          { label: 'Total Transaksi',    value: totalTrx + ' trx',   cls: 'text-blue-700',  bg: 'bg-blue-100'  },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.bg}`}>
              <Store size={18} className={s.cls} />
            </div>
            <div>
              <div className={`text-xl font-bold ${s.cls}`}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <select value={selEvent} onChange={e => setSelEvent(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50 focus:outline-none focus:border-green-400">
          <option value="">Semua Event</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.nama_event || e.nama || 'Event'}</option>)}
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama usaha..."
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 w-48" />
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Urutkan:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50 focus:outline-none focus:border-green-400">
            <option value="omset">Omset Tertinggi</option>
            <option value="komisi">Komisi Terbesar</option>
            <option value="transaksi">Transaksi Terbanyak</option>
            <option value="event">Paling Sering Ikut</option>
            <option value="nama">Nama A–Z</option>
          </select>
          <button onClick={() => setShowExport(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-xl text-xs font-semibold transition whitespace-nowrap">
            <FileSpreadsheet size={13} /> Export Excel
          </button>
          <button onClick={() => exportPDF('Laporan UMKM – Peken Banyumasan', HDRS, makeRows(), makeTot())}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-semibold transition whitespace-nowrap">
            <FileText size={13} /> Export PDF
          </button>
        </div>
        <p className="w-full text-[11px] text-gray-400 mt-1 flex items-center gap-1">
          <Info size={11}/> Export mengikuti filter aktif — cari nama UMKM tertentu untuk export per-UMKM
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto">
        <table className="w-full text-left text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              {['UMKM', 'Kategori', 'Omset', 'Komisi', 'Netto', 'Trx', 'Event'].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(t => {
              const k = Math.round(t.omset * t.komisi_persen / 100);
              return (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{t.nama}</p>
                    <p className="text-xs text-gray-400">{t.stand_terakhir}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{t.kategori}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{fmtRp(t.omset)}</td>
                  <td className="px-4 py-3 text-red-500 text-xs">
                    −{fmtRp(k)} <span className="text-gray-400">({t.komisi_persen}%)</span>
                  </td>
                  <td className="px-4 py-3 text-green-700 font-bold">{fmtRp(t.omset - k)}</td>
                  <td className="px-4 py-3 text-gray-600">{t.transaksi}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                      {t.event_count}×
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t border-gray-200">
              <td className="px-4 py-3 font-bold text-gray-600 text-sm" colSpan={2}>Total ({data.length} UMKM)</td>
              <td className="px-4 py-3 font-bold text-gray-800">{fmtRp(totalOmset)}</td>
              <td className="px-4 py-3 font-bold text-red-500">−{fmtRp(totalKomisi)}</td>
              <td className="px-4 py-3 font-bold text-green-700">{fmtRp(totalOmset - totalKomisi)}</td>
              <td className="px-4 py-3 font-bold text-gray-800">{totalTrx}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <ExportModal
        open={showExport}
        onClose={() => setShowExport(false)}
        subtitle="Laporan UMKM – Peken Banyumasan"
        details={[
          ['Total UMKM',      `${data.length} usaha`],
          ['Filter Event',    selEvent ? (events.find(e => e.id === selEvent)?.nama_event || selEvent) : 'Semua Event'],
          ['Filter Nama',     search || '—'],
          ['Total Omset',     `Rp ${totalOmset.toLocaleString('id-ID')}`],
          ['Total Transaksi', `${totalTrx} trx`],
        ]}
        onExcel={() => exportExcel('laporan_umkm', HDRS, makeRows())}
        onPdf={()   => exportPDF('Laporan UMKM – Peken Banyumasan', HDRS, makeRows(), makeTot())}
      />
    </div>
  );
}

// ── Accumulation Report Tab ───────────────────────────────────────────────────
const DEMO_ACCUM = [
  { id:'e1', nama:'Festival Budaya Banyumasan 2025', tanggal:'2025-05-17', status:'mendatang',  pengunjung:0,    member_hadir:0,  umkm_count:8,  kreator_count:12, omset_umkm:0,        komisi:0 },
  { id:'e2', nama:'Workshop Batik & Tenun Nusantara', tanggal:'2025-04-26', status:'mendatang', pengunjung:0,    member_hadir:0,  umkm_count:3,  kreator_count:5,  omset_umkm:0,        komisi:0 },
  { id:'e4', nama:'Peken Banyumasan #12',             tanggal:'2025-03-20', status:'selesai',   pengunjung:1247, member_hadir:89, umkm_count:24, kreator_count:18, omset_umkm:28450000, komisi:4267500 },
];

function AccumulationReport({ events = [] }) {
  const [showExport, setShowExport] = React.useState(false);
  const data    = DEMO_ACCUM;
  const selesai = data.filter(e => e.status === 'selesai');
  const totP    = selesai.reduce((s,e) => s + e.pengunjung, 0);
  const totO    = selesai.reduce((s,e) => s + e.omset_umkm, 0);
  const totK    = selesai.reduce((s,e) => s + e.komisi, 0);

  const HDRS = ['Nama Event','Tanggal','Status','Pengunjung','Kreator Hadir','UMKM','Omset UMKM (Rp)','Komisi (Rp)'];
  const ROWS = data.map(e => [e.nama, new Date(e.tanggal).toLocaleDateString('id-ID'), e.status, e.pengunjung||0, e.kreator_count, e.umkm_count, e.omset_umkm||0, e.komisi||0]);
  const TOT  = selesai.length > 0
    ? [['TOTAL (selesai)','','', totP, selesai.reduce((s,e)=>s+e.kreator_count,0), selesai.reduce((s,e)=>s+e.umkm_count,0), totO, totK]]
    : [];

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Event Selesai',     value: selesai.length + ' event', cls:'text-gray-700' },
          { label:'Total Pengunjung',  value: totP.toLocaleString('id-ID'), cls:'text-green-700' },
          { label:'Total Omset UMKM',  value: fmtRp(totO), cls:'text-amber-700' },
          { label:'Komisi Terkumpul',  value: fmtRp(totK), cls:'text-blue-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`text-2xl font-bold ${s.cls}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-green-600"/>
            <p className="font-bold text-gray-800 text-sm">Ringkasan Per Event</p>
            <span className="text-[10px] text-gray-400 font-normal hidden sm:block">
              · Detail per-event ada di tab <button onClick={() => {}} className="text-green-600 underline underline-offset-2">Laporan Pengunjung</button>
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowExport(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-xl text-xs font-semibold transition whitespace-nowrap">
              <FileSpreadsheet size={13}/> Export Excel
            </button>
            <button onClick={() => exportPDF('Akumulasi Event – Peken Banyumasan', HDRS, ROWS, TOT)}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-semibold transition whitespace-nowrap">
              <FileText size={13}/> Export PDF
            </button>
          </div>
        </div>
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead><tr className="border-b border-gray-100 bg-gray-50/80">
            {['Event','Tanggal','Pengunjung','Kreator','UMKM','Omset UMKM','Komisi','Status'].map(h => (
              <th key={h} className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {data.map(e => (
              <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                <td className="px-4 py-3 font-semibold text-gray-800 max-w-[180px]"><p className="truncate">{e.nama}</p></td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(e.tanggal).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</td>
                <td className="px-4 py-3 font-semibold text-gray-800">{e.pengunjung ? e.pengunjung.toLocaleString('id-ID') : '—'}</td>
                <td className="px-4 py-3 text-gray-600">{e.kreator_count}</td>
                <td className="px-4 py-3 text-gray-600">{e.umkm_count}</td>
                <td className="px-4 py-3 text-gray-700">{e.omset_umkm ? fmtRp(e.omset_umkm) : '—'}</td>
                <td className="px-4 py-3 text-green-700 font-medium">{e.komisi ? fmtRp(e.komisi) : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${e.status==='selesai' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {e.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          {selesai.length > 0 && (
            <tfoot><tr className="bg-gray-50 border-t border-gray-200">
              <td className="px-4 py-3 font-bold text-gray-600 text-sm" colSpan={2}>Total (selesai)</td>
              <td className="px-4 py-3 font-bold text-gray-800">{totP.toLocaleString('id-ID')}</td>
              <td className="px-4 py-3 font-bold text-gray-800">{selesai.reduce((s,e)=>s+e.kreator_count,0)}</td>
              <td className="px-4 py-3 font-bold text-gray-800">{selesai.reduce((s,e)=>s+e.umkm_count,0)}</td>
              <td className="px-4 py-3 font-bold text-amber-700">{fmtRp(totO)}</td>
              <td className="px-4 py-3 font-bold text-green-700">{fmtRp(totK)}</td>
              <td/>
            </tr></tfoot>
          )}
        </table>
      </div>

      <ExportModal
        open={showExport}
        onClose={() => setShowExport(false)}
        subtitle="Akumulasi Event – Peken Banyumasan"
        details={[
          ['Total Event', `${data.length} event`],
          ['Event Selesai', `${selesai.length} event`],
          ['Total Pengunjung', totP.toLocaleString('id-ID')],
          ['Total Omset UMKM', fmtRp(totO)],
          ['Total Komisi', fmtRp(totK)],
        ]}
        onExcel={() => exportExcel('akumulasi_event', HDRS, ROWS)}
        onPdf={()   => exportPDF('Akumulasi Event – Peken Banyumasan', HDRS, ROWS, TOT)}
      />
    </div>
  );
}

export default Reports;


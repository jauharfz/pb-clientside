// src/pages/Reports.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    ChevronDown, FileSpreadsheet, FileText,
    ArrowRight, ArrowLeft, IdCard, User,
    Download, AlertTriangle, X, Loader2,
    Users, TrendingUp, UserCheck, Info
} from 'lucide-react';
import api from '../services/api';

const ITEMS_PER_PAGE = 15;

// Gunakan local date bukan UTC agar sesuai dengan timezone WIB
const getLocalDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const Reports = () => {
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading]   = useState(true);

    const [selectedDate, setSelectedDate] = useState(getLocalDateStr());
    const [filterType, setFilterType]     = useState('Semua Tipe Pengunjung');
    // [NEW] Filter per event — null = semua event di tanggal tersebut
    const [selectedEventId, setSelectedEventId] = useState('');
    // [NEW] Daftar event unik dari data yang dimuat (untuk dropdown)
    const [availableEvents, setAvailableEvents]   = useState([]);

    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [exportFormat, setExportFormat] = useState('');
    const [isExporting, setIsExporting]   = useState(false);

    const fetchReports = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = { tanggal: selectedDate };
            // Kirim event_id ke backend jika dipilih
            if (selectedEventId) params.event_id = selectedEventId;

            const response = await api.get('/reports', { params });
            const data = response.data.data || null;
            setReportData(data);
            setCurrentPage(1);

            // [NEW] Kumpulkan event unik dari detail untuk dropdown filter
            // Berguna ketika satu tanggal memiliki lebih dari satu event
            if (data?.detail?.length > 0 && !selectedEventId) {
                const seen = new Map();
                data.detail.forEach(row => {
                    if (row.event_id && row.nama_event && !seen.has(row.event_id)) {
                        seen.set(row.event_id, row.nama_event);
                    }
                });
                setAvailableEvents([...seen.entries()].map(([id, nama]) => ({ id, nama })));
            }
        } catch (error) {
            console.error('Gagal mengambil data laporan:', error);
            setReportData(null);
        } finally {
            setIsLoading(false);
        }
    }, [selectedDate, selectedEventId]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // Reset ke halaman 1 setiap kali filter tipe berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [filterType]);

    const handleOpenExportModal = (format) => {
        setExportFormat(format);
        setIsModalOpen(true);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const formatParam = exportFormat.toLowerCase() === 'excel' ? 'excel' : 'pdf';
            const exportParams = { format: formatParam, tanggal: selectedDate };
            if (selectedEventId) exportParams.event_id = selectedEventId;

            const response = await api.get('/reports/export', {
                params: exportParams,
                responseType: 'blob',
            });

            const ext = formatParam === 'excel' ? 'xlsx' : 'pdf';
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `laporan_kunjungan_${selectedDate}.${ext}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setIsModalOpen(false);
        } catch (error) {
            /**
             * [FIX] Sebelumnya: alert(`Gagal mengunduh file ${exportFormat}`)
             * Ketika export gagal dengan responseType: 'blob', error.response.data
             * adalah Blob bukan JSON. Interceptor di api.js sudah meng-parse Blob
             * dan menaruh hasilnya di error.message, jadi bisa langsung dipakai.
             */
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
        <div className="font-sans h-full flex flex-col relative space-y-6">

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
                <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-50/30 shrink-0">
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                // Reset event filter saat tanggal berubah karena
                                // daftar event yang tersedia mungkin berbeda
                                setSelectedEventId('');
                                setAvailableEvents([]);
                            }}
                            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 text-sm font-medium cursor-pointer shadow-sm"
                        />

                        {/* Filter per event — hanya muncul jika ada >1 event di tanggal ini */}
                        {availableEvents.length > 1 && (
                            <div className="relative">
                                <select
                                    value={selectedEventId}
                                    onChange={(e) => setSelectedEventId(e.target.value)}
                                    className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 text-sm font-medium cursor-pointer shadow-sm w-full sm:w-auto"
                                >
                                    <option value="">Semua Event</option>
                                    {availableEvents.map(ev => (
                                        <option key={ev.id} value={ev.id}>{ev.nama}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        )}

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
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-4 py-2.5 rounded-xl font-semibold text-sm transition"
                        >
                            <FileSpreadsheet size={16} /> Export Excel
                        </button>
                        <button
                            onClick={() => handleOpenExportModal('PDF')}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-4 py-2.5 rounded-xl font-semibold text-sm transition"
                        >
                            <FileText size={16} /> Export PDF
                        </button>
                    </div>
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
                        ) : pagedReports.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    Tidak ada data untuk tanggal dan filter yang dipilih.
                                </td>
                            </tr>
                        ) : (
                            pagedReports.map((row) => {
                                const isMember = row.tipe_pengunjung === 'member';

                                const waktuMasuk = row.waktu_masuk ? new Date(row.waktu_masuk) : null;
                                const waktuKeluar = row.waktu_keluar ? new Date(row.waktu_keluar) : null;

                                const fmtTanggal = (d) => d
                                    ? d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : '-';
                                const fmtJam = (d) => d
                                    ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                    : '-';

                                return (
                                    <tr key={row.id} className="hover:bg-gray-50 transition">

                                        {/* Waktu Masuk — akurat untuk semua tipe */}
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-700">{fmtTanggal(waktuMasuk)}</div>
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
                                                        <div className="font-medium text-gray-700">{fmtTanggal(waktuKeluar)}</div>
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
                        {totalItems === 0
                            ? 'Tidak ada data'
                            : `Menampilkan ${indexOfFirst + 1}–${Math.min(indexOfLast, totalItems)} dari ${totalItems} entri`
                        }
                        {reportData?.nama_event && (
                            <span className="ml-2 text-xs text-gray-400">
                                — <strong className="text-gray-600">{reportData.nama_event}</strong>
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
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

                        <div className="bg-green-700 p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
                                    <Download size={20} />
                                </div>
                                <div className="text-white">
                                    <h3 className="font-bold text-lg leading-tight">Konfirmasi Export</h3>
                                    <p className="text-green-100 text-xs">Laporan Kunjungan Event</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-green-200 hover:text-white transition">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-600 text-sm mb-4">
                                Anda akan mengunduh data laporan dengan detail berikut:
                            </p>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Format File:</span>
                                    <span className="font-bold text-gray-800">{exportFormat} Document</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tanggal Laporan:</span>
                                    <span className="font-bold text-gray-800">
                                        {new Date(selectedDate).toLocaleDateString('id-ID', {
                                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tipe Pengunjung:</span>
                                    <span className="font-bold text-gray-800">{filterType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total Data:</span>
                                    <span className="font-bold text-gray-800">{filteredReports.length} entri</span>
                                </div>
                            </div>
                            <p className="text-xs text-yellow-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex gap-2 items-start">
                                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                Proses export mungkin memakan waktu beberapa detik karena jumlah data yang besar.
                            </p>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={isExporting}
                                className="px-5 py-2.5 text-gray-600 font-semibold text-sm hover:bg-gray-200 rounded-xl transition disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={isExporting || filteredReports.length === 0}
                                className="px-5 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center gap-2"
                            >
                                {isExporting ? (
                                    <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                                ) : (
                                    <><Download size={16} /> Unduh Sekarang</>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
// src/pages/Reports.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    ChevronDown, FileSpreadsheet, FileText,
    ArrowRight, ArrowLeft, IdCard, User,
    Download, AlertTriangle, X, Loader2
} from 'lucide-react';
import api from '../services/api';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // State untuk Filter
    const [filterDay, setFilterDay] = useState('Semua Hari Event');
    const [filterType, setFilterType] = useState('Semua Tipe Pengunjung');

    // State untuk Modal Export
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState(''); // 'PDF' | 'Excel'
    const [isExporting, setIsExporting] = useState(false);

    // Fetch Data Laporan
    // (Menggunakan endpoint recent-activity dengan limit lebih besar sebagai simulasi laporan)
    const fetchReports = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/dashboard/recent-activity?limit=50');
            setReports(response.data);
        } catch (error) {
            console.error('Gagal mengambil data laporan:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // Handler Buka Modal Export
    const handleOpenExportModal = (format) => {
        setExportFormat(format);
        setIsModalOpen(true);
    };

    // Simulasi Proses Export
    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            setIsModalOpen(false);
            alert(`File ${exportFormat} berhasil diunduh! (Simulasi)`);
        }, 2000);
    };

    // Filter Data di sisi Client (Frontend)
    const filteredReports = reports.filter(report => {
        const matchType =
            filterType === 'Semua Tipe Pengunjung' ? true :
                filterType === 'Hanya Member (NFC)' ? report.tipe_pengunjung === 'member' :
                    report.tipe_pengunjung === 'biasa';

        // Filter hari bisa dikembangkan lebih lanjut berdasarkan tanggal asli
        return matchType;
    });

    return (
        <div className="font-sans h-full flex flex-col relative">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">

                {/* TOOLBAR: Filter & Export */}
                <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-50/30 shrink-0">

                    {/* Filter Group */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="relative">
                            <select
                                value={filterDay}
                                onChange={(e) => setFilterDay(e.target.value)}
                                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium cursor-pointer shadow-sm w-full sm:w-auto"
                            >
                                <option>Semua Hari Event</option>
                                <option>Hari Ke-1</option>
                                <option>Hari Ke-2</option>
                                <option>Hari Ke-3</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <ChevronDown size={16} />
                            </div>
                        </div>

                        <div className="relative">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium cursor-pointer shadow-sm w-full sm:w-auto"
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

                    {/* Export Buttons */}
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
                            <th className="px-6 py-4 font-semibold">Waktu Tap/Input</th>
                            <th className="px-6 py-4 font-semibold">Tipe</th>
                            <th className="px-6 py-4 font-semibold">Identitas / UID</th>
                            <th className="px-6 py-4 font-semibold">Aktivitas</th>
                            <th className="px-6 py-4 font-semibold">Dicatat Oleh</th>
                        </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                                    Memuat data laporan...
                                </td>
                            </tr>
                        ) : filteredReports.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    Tidak ada data yang sesuai dengan filter.
                                </td>
                            </tr>
                        ) : (
                            filteredReports.map((row) => {
                                const dateObj = new Date(row.waktu);
                                const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                                const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                                return (
                                    <tr key={row.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-800">{dateStr}</div>
                                            <div className="text-xs text-gray-500">{timeStr} WIB</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {row.tipe_pengunjung === 'member' ? (
                                                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-100">
                            <IdCard size={14} /> Member
                          </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-semibold border border-gray-200">
                            <User size={14} /> Biasa
                          </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {row.tipe_pengunjung === 'member' ? (
                                                <>
                                                    <div className="font-semibold text-gray-800">{row.identitas}</div>
                                                    <div className="text-xs text-gray-400 font-mono">{row.nfc_uid}</div>
                                                </>
                                            ) : (
                                                <div className="font-semibold text-gray-400 italic">Tidak ada data</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {row.aktivitas === 'masuk' ? (
                                                <span className="text-green-600 font-bold flex items-center gap-2">
                            <ArrowRight size={16} /> Masuk
                          </span>
                                            ) : (
                                                <span className="text-red-500 font-bold flex items-center gap-2">
                            <ArrowLeft size={16} /> Keluar
                          </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {row.tipe_pengunjung === 'member' ? 'Sistem (NFC)' : 'Admin / Petugas'}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center text-sm text-gray-500 shrink-0">
                    <span>Menampilkan {filteredReports.length} entri</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>&laquo; Prev</button>
                        <button className="px-3 py-1 border border-gray-200 rounded bg-blue-50 text-blue-600 font-medium">1</button>
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Next &raquo;</button>
                    </div>
                </div>
            </div>

            {/* ==========================================
          MODAL OVERLAY EXPORT
          ========================================== */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">

                        {/* Modal Header */}
                        <div className="bg-blue-600 p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
                                    <Download size={20} />
                                </div>
                                <div className="text-white">
                                    <h3 className="font-bold text-lg leading-tight">Konfirmasi Export</h3>
                                    <p className="text-blue-100 text-xs">Laporan Kunjungan Event</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-blue-200 hover:text-white transition">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <p className="text-gray-600 text-sm mb-4">
                                Anda akan mengunduh data laporan dengan filter berikut:
                            </p>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Format File:</span>
                                    <span className="font-bold text-gray-800">{exportFormat} Document</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Rentang Waktu:</span>
                                    <span className="font-bold text-gray-800">{filterDay}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tipe Pengunjung:</span>
                                    <span className="font-bold text-gray-800">{filterType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total Baris:</span>
                                    <span className="font-bold text-gray-800">{filteredReports.length} Data</span>
                                </div>
                            </div>
                            <p className="text-xs text-yellow-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex gap-2 items-start">
                                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                Proses export mungkin memakan waktu beberapa detik karena jumlah data yang besar.
                            </p>
                        </div>

                        {/* Modal Footer */}
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
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center gap-2"
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

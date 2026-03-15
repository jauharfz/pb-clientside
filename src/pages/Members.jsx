// src/pages/Members.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    UserPlus, Wifi, Search,
    Edit, Ban, CheckCircle, Loader2, X
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

// ── Nilai awal form ───────────────────────────────────────────────────────────

const EMPTY_FORM = {
    id: null,
    nama: '',
    no_hp: '',
    email: '',
    nfc_uid: '',
    status: 'aktif',
    tanggal_daftar: new Date().toISOString().split('T')[0],
};

// ── Komponen Drawer ───────────────────────────────────────────────────────────

const MemberDrawer = ({
                          isOpen, isEditMode, formData,
                          isSubmitting, isScanning,
                          onClose, onChange, onScan, onSubmit,
                      }) => (
    <>
        {/* Keyframe slide-in/out */}
        <style>{`
            @keyframes _drawer_in {
                from { transform: translateX(100%); opacity: 0.6; }
                to   { transform: translateX(0);    opacity: 1;   }
            }
            .drawer-in { animation: _drawer_in 0.26s cubic-bezier(0.32, 0.72, 0, 1) both; }
        `}</style>

        {/* Backdrop */}
        {isOpen && (
            <div
                className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-40"
                onClick={onClose}
            />
        )}

        {/* Panel */}
        <div
            className={`
                fixed top-0 right-0 h-full w-full sm:w-[420px]
                bg-white shadow-2xl z-50 flex flex-col
                transition-transform duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)]
                ${isOpen ? 'translate-x-0 drawer-in' : 'translate-x-full'}
            `}
        >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0
                ${isEditMode ? 'bg-amber-50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                        ${isEditMode ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                        {isEditMode ? <Edit size={18} /> : <UserPlus size={18} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-base leading-tight">
                            {isEditMode ? 'Edit Member' : 'Registrasi Member'}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {isEditMode ? 'Ubah data member terpilih' : 'Tambah member baru ke sistem'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition"
                    aria-label="Tutup"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                <form id="member-form" className="space-y-5" onSubmit={onSubmit}>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text" name="nama" required
                            value={formData.nama} onChange={onChange}
                            placeholder="Budi Santoso"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            No. Handphone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel" name="no_hp" required
                            value={formData.no_hp} onChange={onChange}
                            placeholder="081234567890"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Email <span className="text-gray-400 font-normal">(opsional)</span>
                        </label>
                        <input
                            type="email" name="email"
                            value={formData.email} onChange={onChange}
                            placeholder="email@contoh.com"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
                        />
                    </div>

                    {/* Status — required di CreateMemberRequest */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="status" required
                            value={formData.status} onChange={onChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
                        >
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Nonaktif</option>
                        </select>
                    </div>

                    {/* Tanggal daftar — required di CreateMemberRequest */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Tanggal Daftar <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date" name="tanggal_daftar" required
                            value={formData.tanggal_daftar} onChange={onChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
                        />
                    </div>

                    {/* UID NFC */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            UID Keychain NFC <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text" readOnly required
                                value={formData.nfc_uid}
                                placeholder={isScanning ? 'Menunggu tap NFC...' : 'Scan NFC untuk mengisi...'}
                                className={`w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl font-mono text-sm cursor-not-allowed
                                    ${isScanning ? 'text-blue-500 animate-pulse' : 'text-gray-600'}`}
                            />
                            <button
                                type="button" onClick={onScan} disabled={isScanning}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-xl transition flex items-center gap-2 font-medium text-sm whitespace-nowrap shadow-sm shadow-blue-200"
                            >
                                {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Wifi size={16} />}
                                Scan
                            </button>
                        </div>
                    </div>

                </form>
            </div>

            {/* Footer — sticky */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white shrink-0 flex gap-3">
                <button
                    type="button" onClick={onClose} disabled={isSubmitting}
                    className="flex-1 py-2.5 text-gray-600 font-semibold text-sm bg-gray-100 hover:bg-gray-200 rounded-xl transition disabled:opacity-50"
                >
                    Batal
                </button>
                <button
                    type="submit" form="member-form"
                    disabled={isSubmitting || isScanning}
                    className={`flex-1 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-md flex justify-center items-center gap-2
                        ${isEditMode
                        ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                        : 'bg-gray-800 hover:bg-gray-900'}`}
                >
                    {isSubmitting
                        ? <Loader2 size={18} className="animate-spin" />
                        : (isEditMode ? 'Simpan Perubahan' : 'Simpan Member')}
                </button>
            </div>
        </div>
    </>
);

// ── Halaman Members ───────────────────────────────────────────────────────────

const Members = () => {
    const toast = useToast();

    const [members, setMembers]               = useState([]);
    const [isLoadingMembers, setIsLoading]    = useState(true);
    const [searchQuery, setSearchQuery]       = useState('');
    const [statusFilter, setStatusFilter]     = useState('semua'); // 'semua' | 'aktif' | 'nonaktif'
    const [currentPage, setCurrentPage]       = useState(1);
    const itemsPerPage                        = 10;

    const [isDrawerOpen, setIsDrawerOpen]     = useState(false);
    const [isEditMode, setIsEditMode]         = useState(false);
    const [formData, setFormData]             = useState(EMPTY_FORM);
    const [isSubmitting, setIsSubmitting]     = useState(false);
    const [isScanning, setIsScanning]         = useState(false);

    const [confirmToggle, setConfirmToggle]   = useState({ open: false, member: null });

    // ── Fetch ─────────────────────────────────────────────────────────────────

    const fetchMembers = useCallback(async () => {
        try {
            setIsLoading(true);
            // Kirim search ke API, status difilter client-side
            // supaya count per tab selalu tersedia tanpa extra request
            const res = await api.get('/members', { params: { search: searchQuery } });
            setMembers(res.data.data || []);
            setCurrentPage(1);
        } catch (err) {
            console.error('Gagal mengambil data member:', err);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        const t = setTimeout(() => fetchMembers(), 500);
        return () => clearTimeout(t);
    }, [fetchMembers]);

    // ── Drawer helpers ────────────────────────────────────────────────────────

    const openAddDrawer = () => {
        setFormData(EMPTY_FORM);
        setIsEditMode(false);
        setIsDrawerOpen(true);
    };

    const openEditDrawer = (member) => {
        setFormData({
            id: member.id,
            nama: member.nama,
            no_hp: member.no_hp,
            email: member.email || '',
            nfc_uid: member.nfc_uid,
            status: member.status,
            tanggal_daftar: member.tanggal_daftar,
        });
        setIsEditMode(true);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        if (isSubmitting) return;
        setIsDrawerOpen(false);
    };

    // ── Form ──────────────────────────────────────────────────────────────────

    const handleInputChange = (e) =>
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleScanNFC = () => {
        setIsScanning(true);
        setTimeout(() => {
            const uid = Array.from({ length: 7 }, () =>
                Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')
            ).join(':');
            setFormData(prev => ({ ...prev, nfc_uid: uid }));
            setIsScanning(false);
        }, 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nfc_uid) {
            toast.warning('Silakan scan keychain NFC terlebih dahulu!');
            return;
        }
        try {
            setIsSubmitting(true);
            const { id, ...payload } = formData; // id di path, bukan di body
            if (isEditMode) {
                await api.put(`/members/${id}`, payload);
                toast.success('Data member berhasil diperbarui!');
            } else {
                await api.post('/members', payload);
                toast.success('Member baru berhasil didaftarkan!');
            }
            setIsDrawerOpen(false);
            fetchMembers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Terjadi kesalahan pada server.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Toggle status ─────────────────────────────────────────────────────────

    const handleToggleStatus = (member) => setConfirmToggle({ open: true, member });

    const executeToggleStatus = async () => {
        const member = confirmToggle.member;
        setConfirmToggle({ open: false, member: null });
        const newStatus = member.status === 'aktif' ? 'nonaktif' : 'aktif';
        try {
            await api.put(`/members/${member.id}`, { status: newStatus });
            toast.success(
                newStatus === 'nonaktif'
                    ? `Member ${member.nama} berhasil dinonaktifkan.`
                    : `Member ${member.nama} berhasil diaktifkan.`
            );
            fetchMembers();
        } catch {
            toast.error('Gagal mengubah status member.');
        }
    };

    // ── Filter & Pagination ───────────────────────────────────────────────────

    // Count untuk badge tab — selalu dari data mentah tanpa filter status
    const countAktif    = members.filter(m => m.status === 'aktif').length;
    const countNonaktif = members.filter(m => m.status === 'nonaktif').length;

    // Filter client-side berdasarkan tab aktif
    const filteredMembers = statusFilter === 'semua'
        ? members
        : members.filter(m => m.status === statusFilter);

    const totalPages     = Math.ceil(filteredMembers.length / itemsPerPage);
    const indexOfLast    = currentPage * itemsPerPage;
    const indexOfFirst   = indexOfLast - itemsPerPage;
    const currentMembers = filteredMembers.slice(indexOfFirst, indexOfLast);

    // ── Render ────────────────────────────────────────────────────────────────

    const toggleMember = confirmToggle.member;

    return (
        <div className="font-sans">

            {/* ConfirmDialog toggle status */}
            <ConfirmDialog
                isOpen={confirmToggle.open}
                title="Ubah Status Member"
                message={`Apakah Anda yakin ingin ${toggleMember?.status === 'aktif' ? 'menonaktifkan' : 'mengaktifkan'} member ${toggleMember?.nama}?`}
                confirmLabel={toggleMember?.status === 'aktif' ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
                variant={toggleMember?.status === 'aktif' ? 'danger' : 'warning'}
                onConfirm={executeToggleStatus}
                onCancel={() => setConfirmToggle({ open: false, member: null })}
            />

            {/* Drawer */}
            <MemberDrawer
                isOpen={isDrawerOpen}
                isEditMode={isEditMode}
                formData={formData}
                isSubmitting={isSubmitting}
                isScanning={isScanning}
                onClose={closeDrawer}
                onChange={handleInputChange}
                onScan={handleScanNFC}
                onSubmit={handleSubmit}
            />

            {/* ── Tabel — selalu full-width ──────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">

                {/* Toolbar */}
                <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">Daftar Member Terdaftar</h3>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64 sm:flex-none">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text" value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama atau UID..."
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                            />
                        </div>
                        <button
                            onClick={openAddDrawer}
                            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm whitespace-nowrap"
                        >
                            <UserPlus size={16} />
                            <span className="hidden sm:inline">Tambah Member</span>
                            <span className="sm:hidden">Tambah</span>
                        </button>
                    </div>
                </div>

                {/* Tab filter status */}
                <div className="px-6 border-b border-gray-100 flex gap-1">
                    {[
                        { key: 'semua',    label: 'Semua',    count: members.length },
                        { key: 'aktif',    label: 'Aktif',    count: countAktif },
                        { key: 'nonaktif', label: 'Nonaktif', count: countNonaktif },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setStatusFilter(tab.key); setCurrentPage(1); }}
                            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
                                statusFilter === tab.key
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                                statusFilter === tab.key
                                    ? tab.key === 'nonaktif'
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-blue-100 text-blue-600'
                                    : 'bg-gray-100 text-gray-400'
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Tabel */}
                <div className="overflow-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                        <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                            <th className="px-6 py-4 font-semibold">Info Member</th>
                            <th className="px-6 py-4 font-semibold">Kontak</th>
                            <th className="px-6 py-4 font-semibold">UID NFC</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                        </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-50">
                        {isLoadingMembers ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                                    Memuat data...
                                </td>
                            </tr>
                        ) : currentMembers.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                    Tidak ada data ditemukan.
                                </td>
                            </tr>
                        ) : (
                            currentMembers.map((member) => (
                                <tr key={member.id} className={`hover:bg-gray-50 transition ${member.status !== 'aktif' && 'opacity-60'}`}>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{member.nama}</div>
                                        <div className="text-xs text-gray-400">Daftar: {member.tanggal_daftar || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-700">{member.no_hp}</div>
                                        <div className="text-xs text-gray-400">{member.email || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                                            {member.nfc_uid}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {member.status === 'aktif' ? (
                                            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-red-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Nonaktif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => openEditDrawer(member)}
                                            className="text-gray-400 hover:text-blue-600 transition p-1.5 rounded-lg hover:bg-blue-50"
                                            title="Edit Data"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(member)}
                                            className={`transition p-1.5 ml-1 rounded-lg ${
                                                member.status === 'aktif'
                                                    ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                            }`}
                                            title={member.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                                        >
                                            {member.status === 'aktif' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoadingMembers && filteredMembers.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                        <span>
                            Menampilkan {indexOfFirst + 1}–{Math.min(indexOfLast, filteredMembers.length)} dari {filteredMembers.length} member
                            {statusFilter !== 'semua' && (
                                <span className="ml-1 text-gray-400">
                                    ({statusFilter})
                                </span>
                            )}
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 transition text-xs"
                            >
                                &laquo; Prev
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-3 py-1 border rounded transition text-xs ${
                                        currentPage === i + 1
                                            ? 'bg-blue-50 text-blue-600 border-blue-200 font-semibold'
                                            : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 transition text-xs"
                            >
                                Next &raquo;
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Members;
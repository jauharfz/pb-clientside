// src/pages/Members.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    UserPlus, Wifi, Info, Search,
    Edit, Ban, CheckCircle, Loader2, X
} from 'lucide-react';
import api from '../services/api';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Ubah sesuai kebutuhan

    // Form State (Bisa untuk Create atau Edit)
    const [formData, setFormData] = useState({ id: null, nama: '', no_hp: '', email: '', nfc_uid: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const fetchMembers = useCallback(async () => {
        try {
            setIsLoadingMembers(true);
            const response = await api.get('/members', { params: { search: searchQuery } });
            setMembers(response.data);
            setCurrentPage(1); // Reset ke halaman 1 setiap kali search berubah
        } catch (error) {
            console.error('Gagal mengambil data member:', error);
        } finally {
            setIsLoadingMembers(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => { fetchMembers(); }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [fetchMembers]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleScanNFC = () => {
        setIsScanning(true);
        setTimeout(() => {
            const mockUid = Array.from({length: 4}, () => Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')).join(':');
            setFormData(prev => ({ ...prev, nfc_uid: mockUid }));
            setIsScanning(false);
        }, 2000);
    };

    // Handler Submit (Create / Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nfc_uid) return alert('Silakan scan keychain NFC terlebih dahulu!');

        try {
            setIsSubmitting(true);
            if (isEditMode) {
                // Asumsi API PUT /members/:id
                await api.put(`/members/${formData.id}`, formData);
                alert('Data member berhasil diperbarui!');
            } else {
                await api.post('/members', formData);
                alert('Member baru berhasil didaftarkan!');
            }

            resetForm();
            fetchMembers();
        } catch (error) {
            alert(error.response?.data?.message || 'Terjadi kesalahan pada server.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({ id: null, nama: '', no_hp: '', email: '', nfc_uid: '' });
        setIsEditMode(false);
    };

    // Handler Edit Button
    const handleEdit = (member) => {
        setFormData({
            id: member.id,
            nama: member.nama,
            no_hp: member.no_hp,
            email: member.email || '',
            nfc_uid: member.nfc_uid
        });
        setIsEditMode(true);
        // Scroll ke atas agar form terlihat (opsional)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handler Toggle Status (Ban / Aktifkan)
    const handleToggleStatus = async (member) => {
        const action = member.status_terakhir === 'di_dalam' ? 'menonaktifkan' : 'mengaktifkan';
        if (!window.confirm(`Apakah Anda yakin ingin ${action} member ${member.nama}?`)) return;

        try {
            // Asumsi API PATCH /members/:id/status
            await api.patch(`/members/${member.id}/status`, {
                status: member.status_terakhir === 'di_dalam' ? 'di_luar' : 'di_dalam'
            });
            fetchMembers(); // Refresh data
        } catch (error) {
            alert('Gagal mengubah status member.');
        }
    };

    // --- LOGIKA PAGINATION ---
    const totalPages = Math.ceil(members.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMembers = members.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 font-sans">

            {/* KIRI: Form Registrasi / Edit */}
            <div className="xl:col-span-1">
                <div className={`bg-white p-6 rounded-2xl shadow-sm border ${isEditMode ? 'border-amber-400 ring-4 ring-amber-50' : 'border-gray-100'} transition-all`}>
                    <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${isEditMode ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                {isEditMode ? <Edit size={20} /> : <UserPlus size={20} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{isEditMode ? 'Edit Member' : 'Registrasi Member'}</h3>
                                <p className="text-xs text-gray-500">{isEditMode ? 'Perbarui data member' : 'Daftarkan keychain NFC baru'}</p>
                            </div>
                        </div>
                        {isEditMode && (
                            <button onClick={resetForm} className="text-gray-400 hover:text-red-500 transition" title="Batal Edit">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Input Nama, No HP, Email sama seperti sebelumnya */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                            <input type="text" name="nama" required value={formData.nama} onChange={handleInputChange} placeholder="Masukkan nama lengkap" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nomor Handphone <span className="text-red-500">*</span></label>
                            <input type="tel" name="no_hp" required value={formData.no_hp} onChange={handleInputChange} placeholder="Contoh: 08123456789" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(Opsional)</span></label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="email@contoh.com" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">UID Keychain NFC <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input type="text" readOnly required value={formData.nfc_uid} placeholder={isScanning ? "Menunggu tap NFC..." : "Scan NFC untuk mengisi..."} className={`w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl font-mono text-sm cursor-not-allowed ${isScanning ? 'text-blue-500 animate-pulse' : 'text-gray-600'}`} />
                                <button type="button" onClick={handleScanNFC} disabled={isScanning} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 font-medium text-sm whitespace-nowrap shadow-sm shadow-blue-200">
                                    {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Wifi size={16} />} Scan
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <button type="submit" disabled={isSubmitting || isScanning} className={`w-full text-white font-bold py-3 px-4 rounded-xl transition shadow-md flex justify-center items-center gap-2 ${isEditMode ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-800 hover:bg-gray-900'}`}>
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (isEditMode ? 'Simpan Perubahan' : 'Simpan Member Baru')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* KANAN: Tabel Daftar Member */}
            <div className="xl:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">

                    <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
                        <h3 className="text-lg font-bold text-gray-800">Daftar Member Terdaftar</h3>
                        <div className="relative w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={16} className="text-gray-400" /></div>
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari nama atau UID..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
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
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500"><Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-500" />Memuat data...</td></tr>
                            ) : currentMembers.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Tidak ada data ditemukan.</td></tr>
                            ) : (
                                currentMembers.map((member) => (
                                    <tr key={member.id} className={`hover:bg-gray-50 transition group ${member.status_terakhir !== 'di_dalam' && 'opacity-75'}`}>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{member.nama}</div>
                                            <div className="text-xs text-gray-500">Daftar: {member.tanggal_daftar || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-700">{member.no_hp}</div>
                                            <div className="text-xs text-gray-400">{member.email || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">{member.nfc_uid}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.status_terakhir === 'di_dalam' ? (
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
                                            <button onClick={() => handleEdit(member)} className="text-gray-400 hover:text-blue-600 transition p-1" title="Edit Data">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleToggleStatus(member)} className={`transition p-1 ml-2 ${member.status_terakhir === 'di_dalam' ? 'text-gray-400 hover:text-red-600' : 'text-gray-400 hover:text-green-600'}`} title={member.status_terakhir === 'di_dalam' ? 'Nonaktifkan' : 'Aktifkan'}>
                                                {member.status_terakhir === 'di_dalam' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {!isLoadingMembers && members.length > 0 && (
                        <div className="p-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                            <span>Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, members.length)} dari {members.length} member</span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 transition"
                                >
                                    &laquo; Prev
                                </button>

                                {/* Generate Page Numbers */}
                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => setCurrentPage(index + 1)}
                                        className={`px-3 py-1 border rounded transition ${currentPage === index + 1 ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 transition"
                                >
                                    Next &raquo;
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Members;

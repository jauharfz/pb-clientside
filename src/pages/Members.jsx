// src/pages/Members.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    UserPlus, Wifi, Search,
    Edit, Ban, CheckCircle, Loader2
} from 'lucide-react';
import api from '../services/api';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // [FIX] Tambah field wajib OpenAPI CreateMemberRequest: status & tanggal_daftar
    // OpenAPI CreateMemberRequest required: nfc_uid, nama, no_hp, status, tanggal_daftar
    const [formData, setFormData] = useState({
        id: null,
        nama: '',
        no_hp: '',
        email: '',
        nfc_uid: '',
        status: 'aktif',
        tanggal_daftar: new Date().toISOString().split('T')[0],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const fetchMembers = useCallback(async () => {
        try {
            setIsLoadingMembers(true);
            // OpenAPI GET /members params: status (filter), search
            const response = await api.get('/members', { params: { search: searchQuery } });
            // [FIX] API membungkus data di response.data.data
            // OpenAPI GET /members response: { status: "success", data: [ ...Member[] ] }
            setMembers(response.data.data || []);
            setCurrentPage(1);
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
            const mockUid = Array.from({ length: 7 }, () =>
                Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')
            ).join(':');
            setFormData(prev => ({ ...prev, nfc_uid: mockUid }));
            setIsScanning(false);
        }, 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nfc_uid) return alert('Silakan scan keychain NFC terlebih dahulu!');

        try {
            setIsSubmitting(true);
            // [FIX] Pisahkan field 'id' dari payload → id tidak boleh dikirim ke body API
            // PUT /members/{id}: id ada di path, bukan di body (UpdateMemberRequest tidak punya field id)
            const { id, ...payload } = formData;

            if (isEditMode) {
                // OpenAPI: PUT /members/{id} dengan UpdateMemberRequest (semua field opsional)
                await api.put(`/members/${id}`, payload);
                alert('Data member berhasil diperbarui!');
            } else {
                // OpenAPI: POST /members dengan CreateMemberRequest
                // Required: nfc_uid, nama, no_hp, status, tanggal_daftar
                await api.post('/members', payload);
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
        setFormData({
            id: null,
            nama: '',
            no_hp: '',
            email: '',
            nfc_uid: '',
            status: 'aktif',
            tanggal_daftar: new Date().toISOString().split('T')[0],
        });
        setIsEditMode(false);
    };

    const handleEdit = (member) => {
        setFormData({
            id: member.id,
            nama: member.nama,
            no_hp: member.no_hp,
            email: member.email || '',
            nfc_uid: member.nfc_uid,
            // [FIX] Gunakan member.status (bukan member.status_terakhir yang tidak ada di schema)
            // OpenAPI Member schema: status enum ['aktif', 'nonaktif']
            status: member.status,
            tanggal_daftar: member.tanggal_daftar,
        });
        setIsEditMode(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // [FIX] Toggle status member:
    //   - Endpoint PATCH /members/:id/status TIDAK ADA di OpenAPI spec
    //   - Gunakan PUT /members/{id} (yang ada di spec) dengan field { status }
    //   - Nilai status: 'aktif' | 'nonaktif' (sesuai Member schema enum)
    //   - Bukan 'di_dalam' | 'di_luar' yang sebelumnya dipakai (tidak valid)
    const handleToggleStatus = async (member) => {
        const newStatus = member.status === 'aktif' ? 'nonaktif' : 'aktif';
        const action = newStatus === 'nonaktif' ? 'menonaktifkan' : 'mengaktifkan';
        if (!window.confirm(`Apakah Anda yakin ingin ${action} member ${member.nama}?`)) return;

        try {
            // OpenAPI: PUT /members/{id} dengan UpdateMemberRequest { status: 'aktif' | 'nonaktif' }
            await api.put(`/members/${member.id}`, { status: newStatus });
            fetchMembers();
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
                                <p className="text-xs text-gray-400">{isEditMode ? 'Ubah data member terpilih' : 'Tambah member baru ke sistem'}</p>
                            </div>
                        </div>
                        {isEditMode && (
                            <button onClick={resetForm} className="text-xs text-gray-400 hover:text-red-500 transition font-medium">
                                Batal Edit
                            </button>
                        )}
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                            <input
                                type="text" name="nama" required
                                value={formData.nama} onChange={handleInputChange}
                                placeholder="Budi Santoso"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">No. Handphone <span className="text-red-500">*</span></label>
                            <input
                                type="tel" name="no_hp" required
                                value={formData.no_hp} onChange={handleInputChange}
                                placeholder="081234567890"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(opsional)</span></label>
                            <input
                                type="email" name="email"
                                value={formData.email} onChange={handleInputChange}
                                placeholder="email@contoh.com"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
                            />
                        </div>

                        {/* [FIX] Tambah field 'status' — wajib di CreateMemberRequest, ada di UpdateMemberRequest */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
                            <select
                                name="status" required
                                value={formData.status} onChange={handleInputChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
                            >
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                        </div>

                        {/* [FIX] Tambah field 'tanggal_daftar' — wajib di CreateMemberRequest */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Daftar <span className="text-red-500">*</span></label>
                            <input
                                type="date" name="tanggal_daftar" required
                                value={formData.tanggal_daftar} onChange={handleInputChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">UID Keychain NFC <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input
                                    type="text" readOnly required
                                    value={formData.nfc_uid}
                                    placeholder={isScanning ? "Menunggu tap NFC..." : "Scan NFC untuk mengisi..."}
                                    className={`w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl font-mono text-sm cursor-not-allowed ${isScanning ? 'text-blue-500 animate-pulse' : 'text-gray-600'}`}
                                />
                                <button
                                    type="button" onClick={handleScanNFC} disabled={isScanning}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 font-medium text-sm whitespace-nowrap shadow-sm shadow-blue-200"
                                >
                                    {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Wifi size={16} />} Scan
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={isSubmitting || isScanning}
                                className={`w-full text-white font-bold py-3 px-4 rounded-xl transition shadow-md flex justify-center items-center gap-2 ${isEditMode ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-800 hover:bg-gray-900'}`}
                            >
                                {isSubmitting
                                    ? <Loader2 size={18} className="animate-spin" />
                                    : (isEditMode ? 'Simpan Perubahan' : 'Simpan Member Baru')}
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
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : currentMembers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Tidak ada data ditemukan.</td>
                                </tr>
                            ) : (
                                currentMembers.map((member) => (
                                    // [FIX] Gunakan member.status === 'aktif' (bukan member.status_terakhir)
                                    // OpenAPI Member schema: status enum ['aktif', 'nonaktif']
                                    <tr key={member.id} className={`hover:bg-gray-50 transition group ${member.status !== 'aktif' && 'opacity-75'}`}>
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
                                            {/* [FIX] Cek member.status ('aktif'/'nonaktif'), bukan member.status_terakhir */}
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
                                                onClick={() => handleEdit(member)}
                                                className="text-gray-400 hover:text-blue-600 transition p-1"
                                                title="Edit Data"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {/* [FIX] Gunakan member.status ('aktif'/'nonaktif') untuk logika toggle */}
                                            <button
                                                onClick={() => handleToggleStatus(member)}
                                                className={`transition p-1 ml-2 ${member.status === 'aktif' ? 'text-gray-400 hover:text-red-600' : 'text-gray-400 hover:text-green-600'}`}
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

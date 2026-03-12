// src/pages/Members.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    UserPlus, Wifi, Info, Search,
    Edit, Ban, CheckCircle, Loader2
} from 'lucide-react';
import api from '../services/api';

const Members = () => {
    // State untuk Tabel Member
    const [members, setMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // State untuk Form Registrasi
    const [formData, setFormData] = useState({
        nama: '',
        no_hp: '',
        email: '',
        nfc_uid: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    // Fungsi Fetch Data Member
    const fetchMembers = useCallback(async () => {
        try {
            setIsLoadingMembers(true);
            // Mengirim searchQuery sebagai parameter jika ada
            const response = await api.get('/members', {
                params: { search: searchQuery }
            });
            setMembers(response.data);
        } catch (error) {
            console.error('Gagal mengambil data member:', error);
        } finally {
            setIsLoadingMembers(false);
        }
    }, [searchQuery]);

    // Panggil API saat komponen di-render atau searchQuery berubah (dengan debounce sederhana)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchMembers();
        }, 500); // Tunggu 500ms setelah user berhenti mengetik baru fetch API

        return () => clearTimeout(delayDebounceFn);
    }, [fetchMembers]);

    // Handler Input Form
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Simulasi Scan NFC dari ESP32
    const handleScanNFC = () => {
        setIsScanning(true);
        // Simulasi loading 2 detik seolah-olah menunggu user tap keychain ke alat
        setTimeout(() => {
            // Generate random mock UID
            const mockUid = Array.from({length: 4}, () =>
                Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')
            ).join(':');

            setFormData(prev => ({ ...prev, nfc_uid: mockUid }));
            setIsScanning(false);
        }, 2000);
    };

    // Handler Submit Form Registrasi
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nfc_uid) {
            alert('Silakan scan keychain NFC terlebih dahulu!');
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post('/members', formData);

            // Reset form setelah sukses
            setFormData({ nama: '', no_hp: '', email: '', nfc_uid: '' });
            alert('Member berhasil didaftarkan!');

            // Refresh tabel
            fetchMembers();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal mendaftarkan member. UID mungkin sudah terdaftar.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">

            {/* KIRI: Form Registrasi Member Baru */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-lg">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Registrasi Member</h3>
                            <p className="text-xs text-gray-500">Daftarkan keychain NFC baru</p>
                        </div>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                            <input
                                type="text" name="nama" required
                                value={formData.nama} onChange={handleInputChange}
                                placeholder="Masukkan nama lengkap"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nomor Handphone <span className="text-red-500">*</span></label>
                            <input
                                type="tel" name="no_hp" required
                                value={formData.no_hp} onChange={handleInputChange}
                                placeholder="Contoh: 08123456789"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(Opsional)</span></label>
                            <input
                                type="email" name="email"
                                value={formData.email} onChange={handleInputChange}
                                placeholder="email@contoh.com"
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
                                    type="button"
                                    onClick={handleScanNFC}
                                    disabled={isScanning}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 font-medium text-sm whitespace-nowrap shadow-sm shadow-blue-200"
                                >
                                    {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Wifi size={16} />}
                                    Scan
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                                <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                Klik "Scan" lalu tap keychain ke reader ESP32.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={isSubmitting || isScanning}
                                className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-xl transition shadow-md flex justify-center items-center gap-2"
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Member Baru'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* KANAN: Tabel Daftar Member */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">

                    {/* Toolbar Tabel */}
                    <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
                        <h3 className="text-lg font-bold text-gray-800">Daftar Member Terdaftar</h3>

                        {/* Search Bar */}
                        <div className="relative w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama atau UID..."
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                            />
                        </div>
                    </div>

                    {/* Tabel Data */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                            <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                                <th className="px-6 py-4 font-semibold">Info Member</th>
                                <th className="px-6 py-4 font-semibold">Kontak</th>
                                <th className="px-6 py-4 font-semibold">UID NFC</th>
                                <th className="px-6 py-4 font-semibold">Status Posisi</th>
                                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                            </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-50">
                            {isLoadingMembers ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                                        Memuat data member...
                                    </td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        Tidak ada data member ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 transition group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{member.nama}</div>
                                            <div className="text-xs text-gray-500">Bergabung: {member.tanggal_daftar || '-'}</div>
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
                                            {/* Berdasarkan API Contract, status_terakhir: di_dalam / di_luar */}
                                            {member.status_terakhir === 'di_dalam' ? (
                                                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Di Dalam
                          </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-semibold border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Di Luar
                          </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-blue-600 transition p-1" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button className="text-gray-400 hover:text-red-600 transition p-1 ml-2" title="Nonaktifkan">
                                                <Ban size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Sederhana */}
                    <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center text-sm text-gray-500">
                        <span>Total: {members.length} member</span>
                        <div className="flex gap-1">
                            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>&laquo; Prev</button>
                            <button className="px-3 py-1 border border-gray-200 rounded bg-blue-50 text-blue-600 font-medium">1</button>
                            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Next &raquo;</button>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Members;

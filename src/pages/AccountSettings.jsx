// src/pages/AccountSettings.jsx
// Halaman pengaturan akun untuk admin/petugas yang sedang login.
// Bisa update nama tampilan dan ganti password.
// Berbeda dengan Profile.jsx yang merupakan halaman publik company profile.

import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, Save, KeyRound } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';

const AccountSettings = () => {
    const toast = useToast();

    // ── State profil ──────────────────────────────────────────────────────────
    const [profil, setProfil]     = useState({ id: '', nama: '', email: '', role: '' });
    const [nama, setNama]         = useState('');
    const [isLoadingProfil, setIsLoadingProfil] = useState(true);
    const [isSavingNama, setIsSavingNama]       = useState(false);

    // ── State password ────────────────────────────────────────────────────────
    const [pwdLama, setPwdLama]         = useState('');
    const [pwdBaru, setPwdBaru]         = useState('');
    const [pwdKonfirm, setPwdKonfirm]   = useState('');
    const [showPwdLama, setShowPwdLama] = useState(false);
    const [showPwdBaru, setShowPwdBaru] = useState(false);
    const [isSavingPwd, setIsSavingPwd] = useState(false);

    // ── Fetch profil saat mount ───────────────────────────────────────────────
    useEffect(() => {
        const fetchProfil = async () => {
            try {
                const res = await api.get('/auth/me');
                const data = res.data.data;
                setProfil(data);
                setNama(data.nama);
            } catch {
                toast.error('Gagal memuat data profil.');
            } finally {
                setIsLoadingProfil(false);
            }
        };
        fetchProfil();
    }, []);

    // ── Simpan nama ───────────────────────────────────────────────────────────
    const handleSimpanNama = async (e) => {
        e.preventDefault();
        const trimmed = nama.trim();
        if (!trimmed) {
            toast.error('Nama tidak boleh kosong.');
            return;
        }
        if (trimmed === profil.nama) {
            toast.info('Nama tidak berubah.');
            return;
        }
        setIsSavingNama(true);
        try {
            const res = await api.put('/auth/profile', { nama: trimmed });
            const updated = res.data.data;
            setProfil(updated);
            setNama(updated.nama);

            // Sync ke localStorage agar nama di header AdminLayout ikut terupdate
            try {
                const stored = localStorage.getItem('user');
                if (stored) {
                    const user = JSON.parse(stored);
                    user.nama = updated.nama;
                    localStorage.setItem('user', JSON.stringify(user));
                    // Beritahu AdminLayout agar re-read dari localStorage
                    window.dispatchEvent(new CustomEvent('pekan_user_update'));
                }
            } catch { /* tidak masalah jika sync gagal */ }

            toast.success('Nama berhasil diperbarui.');
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal memperbarui nama.';
            toast.error(msg);
        } finally {
            setIsSavingNama(false);
        }
    };

    // ── Ganti password ────────────────────────────────────────────────────────
    const handleGantiPassword = async (e) => {
        e.preventDefault();
        if (pwdBaru !== pwdKonfirm) {
            toast.error('Konfirmasi password baru tidak cocok.');
            return;
        }
        if (pwdBaru.length < 8) {
            toast.error('Password baru minimal 8 karakter.');
            return;
        }
        setIsSavingPwd(true);
        try {
            await api.put('/auth/password', {
                password_lama: pwdLama,
                password_baru: pwdBaru,
            });
            toast.success('Password berhasil diubah.');
            setPwdLama('');
            setPwdBaru('');
            setPwdKonfirm('');
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal mengubah password.';
            toast.error(msg);
        } finally {
            setIsSavingPwd(false);
        }
    };

    // ── Render loading ────────────────────────────────────────────────────────
    if (isLoadingProfil) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                Memuat data profil...
            </div>
        );
    }

    const roleBadge = profil.role === 'admin'
        ? 'bg-green-100 text-green-700 border-green-200'
        : 'bg-amber-100 text-amber-700 border-amber-200';

    return (
        <div className="max-w-2xl mx-auto space-y-6">

            {/* ── Info akun (read-only) ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <User size={16} className="text-green-700" /> Informasi Akun
                </h2>
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-500 font-medium">Email</span>
                        <span className="text-sm text-gray-800 font-semibold">{profil.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-500 font-medium">Role</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${roleBadge}`}>
                            {profil.role === 'admin' ? 'Administrator' : 'Petugas'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Form ubah nama ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <User size={16} className="text-green-700" /> Ubah Nama Tampilan
                </h2>
                <form onSubmit={handleSimpanNama} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            placeholder="Masukkan nama lengkap"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 transition"
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSavingNama}
                            className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm disabled:opacity-60"
                        >
                            <Save size={15} />
                            {isSavingNama ? 'Menyimpan...' : 'Simpan Nama'}
                        </button>
                    </div>
                </form>
            </div>

            {/* ── Form ganti password ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <KeyRound size={16} className="text-green-700" /> Ganti Password
                </h2>
                <form onSubmit={handleGantiPassword} className="space-y-4">
                    {/* Password lama */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Password Saat Ini
                        </label>
                        <div className="relative">
                            <input
                                type={showPwdLama ? 'text' : 'password'}
                                value={pwdLama}
                                onChange={(e) => setPwdLama(e.target.value)}
                                placeholder="Masukkan password saat ini"
                                className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 transition"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwdLama(!showPwdLama)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPwdLama ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Password baru */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Password Baru
                        </label>
                        <div className="relative">
                            <input
                                type={showPwdBaru ? 'text' : 'password'}
                                value={pwdBaru}
                                onChange={(e) => setPwdBaru(e.target.value)}
                                placeholder="Minimal 8 karakter"
                                className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 transition"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwdBaru(!showPwdBaru)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPwdBaru ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Konfirmasi password baru */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Konfirmasi Password Baru
                        </label>
                        <input
                            type="password"
                            value={pwdKonfirm}
                            onChange={(e) => setPwdKonfirm(e.target.value)}
                            placeholder="Ulangi password baru"
                            className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 transition ${
                                pwdKonfirm && pwdBaru !== pwdKonfirm
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-gray-200'
                            }`}
                            required
                        />
                        {pwdKonfirm && pwdBaru !== pwdKonfirm && (
                            <p className="text-xs text-red-500 mt-1">Password tidak cocok.</p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSavingPwd}
                            className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm disabled:opacity-60"
                        >
                            <Lock size={15} />
                            {isSavingPwd ? 'Menyimpan...' : 'Ubah Password'}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
};

export default AccountSettings;
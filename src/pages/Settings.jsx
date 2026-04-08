// src/pages/Settings.jsx
// Halaman pengaturan akun untuk admin/petugas Gate.
// Endpoint: PUT /api/auth/profile (ganti nama), PUT /api/auth/password (ganti password)
// Bisa diakses oleh semua role yang sudah login (admin & petugas).
import React, { useState, useEffect } from 'react';
import { User, KeyRound, CheckCircle, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';

// ── Sub-komponen: Card wrapper ────────────────────────────────────────────────
const SectionCard = ({ icon: Icon, title, subtitle, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                <Icon size={18} />
            </div>
            <div>
                <h3 className="font-bold text-gray-800 text-base leading-tight">{title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            </div>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

// ── Sub-komponen: Form input ──────────────────────────────────────────────────
const FormInput = ({ label, type = 'text', value, onChange, placeholder, suffix, disabled }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                           disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
                           transition pr-10"
            />
            {suffix && (
                <button
                    type="button"
                    onClick={suffix.onClick}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                >
                    {suffix.icon}
                </button>
            )}
        </div>
    </div>
);

// ── Password strength indicator ───────────────────────────────────────────────
const PasswordStrength = ({ password }) => {
    if (!password) return null;
    const len = password.length;
    let strength = 0;
    if (len >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
    const colors = ['bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'];
    const textColors = ['text-red-500', 'text-amber-500', 'text-blue-500', 'text-green-600'];

    return (
        <div className="mt-2">
            <div className="flex gap-1 mb-1">
                {[0, 1, 2, 3].map(i => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? colors[strength - 1] : 'bg-gray-200'}`}
                    />
                ))}
            </div>
            <p className={`text-xs font-medium ${textColors[strength - 1] || 'text-gray-400'}`}>
                {strength > 0 ? labels[strength - 1] : ''}
            </p>
        </div>
    );
};

// ── Halaman Settings ──────────────────────────────────────────────────────────

const Settings = () => {
    const toast = useToast();

    // Data user dari localStorage
    const [userData, setUserData] = useState({ nama: '', email: '', role: '' });

    // State form ganti nama
    const [namaBaru, setNamaBaru]         = useState('');
    const [isUpdatingNama, setIsUpdatingNama] = useState(false);

    // State form ganti password
    const [pwLama, setPwLama]             = useState('');
    const [pwBaru, setPwBaru]             = useState('');
    const [pwKonfirmasi, setPwKonfirmasi] = useState('');
    const [showPwLama, setShowPwLama]     = useState(false);
    const [showPwBaru, setShowPwBaru]     = useState(false);
    const [showPwKonfirmasi, setShowPwKonfirmasi] = useState(false);
    const [isUpdatingPw, setIsUpdatingPw] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            const u = JSON.parse(stored);
            setUserData(u);
            setNamaBaru(u.nama || '');
        }
    }, []);

    // ── Handler: ganti nama ───────────────────────────────────────────────────
    const handleUpdateNama = async (e) => {
        e.preventDefault();
        const nama = namaBaru.trim();
        if (!nama) {
            toast.error('Nama tidak boleh kosong');
            return;
        }
        if (nama === userData.nama) {
            toast.warning('Nama tidak berubah');
            return;
        }
        try {
            setIsUpdatingNama(true);
            const res = await api.put('/auth/profile', { nama });
            // Update localStorage dengan nama baru
            const newUser = { ...userData, nama: res.data.data.nama };
            localStorage.setItem('user', JSON.stringify(newUser));
            setUserData(newUser);
            // Broadcast ke AdminLayout agar nama di sidebar ikut berubah
            window.dispatchEvent(new CustomEvent('pekan_user_update', { detail: newUser }));
            toast.success('Nama berhasil diperbarui');
        } catch (error) {
            toast.error(error.message || 'Gagal memperbarui nama');
        } finally {
            setIsUpdatingNama(false);
        }
    };

    // ── Handler: ganti password ───────────────────────────────────────────────
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!pwLama || !pwBaru || !pwKonfirmasi) {
            toast.error('Semua field password wajib diisi');
            return;
        }
        if (pwBaru.length < 8) {
            toast.error('Password baru minimal 8 karakter');
            return;
        }
        if (pwBaru !== pwKonfirmasi) {
            toast.error('Konfirmasi password tidak cocok');
            return;
        }
        if (pwBaru === pwLama) {
            toast.error('Password baru tidak boleh sama dengan password lama');
            return;
        }
        try {
            setIsUpdatingPw(true);
            await api.put('/auth/password', {
                password_lama: pwLama,
                password_baru: pwBaru,
            });
            toast.success('Password berhasil diubah. Silakan login ulang jika perlu.');
            // Reset form
            setPwLama('');
            setPwBaru('');
            setPwKonfirmasi('');
        } catch (error) {
            toast.error(error.message || 'Gagal mengubah password. Periksa password lama Anda.');
        } finally {
            setIsUpdatingPw(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-2xl space-y-6">

            {/* Info Akun */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-green-600 text-white flex items-center justify-center text-2xl font-bold shrink-0">
                    {(userData.nama || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-lg leading-tight truncate">{userData.nama || '—'}</p>
                    <p className="text-sm text-gray-500 truncate">{userData.email || '—'}</p>
                    <span className={`inline-flex items-center gap-1 mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full
                        ${userData.role === 'admin'
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                        <ShieldCheck size={11} />
                        {userData.role === 'admin' ? 'Admin' : 'Petugas'}
                    </span>
                </div>
            </div>

            {/* Form Ganti Nama */}
            <SectionCard
                icon={User}
                title="Ganti Nama Tampilan"
                subtitle="Nama ini muncul di sidebar dan header sistem"
            >
                <form onSubmit={handleUpdateNama} className="space-y-4">
                    <FormInput
                        label="Nama Baru"
                        value={namaBaru}
                        onChange={e => setNamaBaru(e.target.value)}
                        placeholder="Masukkan nama baru"
                        disabled={isUpdatingNama}
                    />
                    <button
                        type="submit"
                        disabled={isUpdatingNama || !namaBaru.trim() || namaBaru.trim() === userData.nama}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700
                                   disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold
                                   px-6 py-2.5 rounded-xl transition text-sm"
                    >
                        {isUpdatingNama
                            ? <><Loader2 size={16} className="animate-spin" /> Menyimpan…</>
                            : <><CheckCircle size={16} /> Simpan Nama</>
                        }
                    </button>
                </form>
            </SectionCard>

            {/* Form Ganti Password */}
            <SectionCard
                icon={KeyRound}
                title="Ganti Password"
                subtitle="Verifikasi password lama diperlukan untuk keamanan akun"
            >
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <FormInput
                        label="Password Lama"
                        type={showPwLama ? 'text' : 'password'}
                        value={pwLama}
                        onChange={e => setPwLama(e.target.value)}
                        placeholder="Masukkan password saat ini"
                        disabled={isUpdatingPw}
                        suffix={{
                            onClick: () => setShowPwLama(v => !v),
                            icon: showPwLama ? <EyeOff size={16} /> : <Eye size={16} />,
                        }}
                    />
                    <div>
                        <FormInput
                            label="Password Baru"
                            type={showPwBaru ? 'text' : 'password'}
                            value={pwBaru}
                            onChange={e => setPwBaru(e.target.value)}
                            placeholder="Minimal 8 karakter"
                            disabled={isUpdatingPw}
                            suffix={{
                                onClick: () => setShowPwBaru(v => !v),
                                icon: showPwBaru ? <EyeOff size={16} /> : <Eye size={16} />,
                            }}
                        />
                        <PasswordStrength password={pwBaru} />
                    </div>
                    <FormInput
                        label="Konfirmasi Password Baru"
                        type={showPwKonfirmasi ? 'text' : 'password'}
                        value={pwKonfirmasi}
                        onChange={e => setPwKonfirmasi(e.target.value)}
                        placeholder="Ulangi password baru"
                        disabled={isUpdatingPw}
                        suffix={{
                            onClick: () => setShowPwKonfirmasi(v => !v),
                            icon: showPwKonfirmasi ? <EyeOff size={16} /> : <Eye size={16} />,
                        }}
                    />
                    {/* Match indicator */}
                    {pwBaru && pwKonfirmasi && (
                        <p className={`text-xs font-medium flex items-center gap-1 ${pwBaru === pwKonfirmasi ? 'text-green-600' : 'text-red-500'}`}>
                            {pwBaru === pwKonfirmasi
                                ? <><CheckCircle size={12} /> Password cocok</>
                                : '✕ Password tidak cocok'
                            }
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={isUpdatingPw || !pwLama || !pwBaru || !pwKonfirmasi}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700
                                   disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold
                                   px-6 py-2.5 rounded-xl transition text-sm"
                    >
                        {isUpdatingPw
                            ? <><Loader2 size={16} className="animate-spin" /> Mengubah…</>
                            : <><KeyRound size={16} /> Ubah Password</>
                        }
                    </button>
                </form>
            </SectionCard>

        </div>
    );
};

export default Settings;
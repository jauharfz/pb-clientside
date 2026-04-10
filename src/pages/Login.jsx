// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, HelpCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import logoImg from '../assets/logo.png';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // POST /auth/login → response: { status, message, data: { token, user } }
            const response = await api.post('/auth/login', formData);

            // [FIX] API membungkus payload di dalam .data.data (bukan .data langsung)
            // OpenAPI LoginResponse: { status, message, data: { token, user: {...} } }
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Email atau password salah. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* SISI KIRI: Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-green-800 relative flex-col justify-between p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -ml-20 -mb-20"></div>

                <div className="relative z-10 flex items-center gap-3">
                    <img src={logoImg} alt="Logo Pekan Banyumasan" className="w-12 h-12 rounded-xl object-cover shadow-lg" />
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-wide"> Banyumasan</h1>
                        <p className="text-green-200 text-sm font-medium">Sistem Manajemen Event</p>
                    </div>
                </div>

                <div className="relative z-10 max-w-md">
                    <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Kelola pengunjung event dengan lebih cerdas.</h2>
                    <p className="text-green-100 text-lg leading-relaxed">
                        Pantau data real-time, kelola member NFC, dan optimalkan operasional event Pekan Banyumasan dalam satu platform terintegrasi.
                    </p>
                </div>

                <div className="relative z-10 text-green-200 text-sm">
                    &copy; 2026 Panitia Pekan Banyumasan. All rights reserved.
                </div>
            </div>

            {/* SISI KANAN: Form Login */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
                <div className="absolute top-8 right-8">
                    <button className="text-sm font-medium text-gray-500 hover:text-green-700 transition flex items-center gap-2">
                        <HelpCircle size={16} /> Butuh Bantuan?
                    </button>
                </div>

                <div className="w-full max-w-md">
                    <div className="flex lg:hidden items-center gap-3 mb-10">
                        <img src={logoImg} alt="Logo Pekan Banyumasan" className="w-10 h-10 rounded-lg object-cover shadow-md" />
                        <h1 className="text-xl font-bold text-gray-900 tracking-wide">Pekan Banyumasan</h1>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang</h2>
                        <p className="text-gray-500">Silakan masuk ke akun admin atau petugas Anda.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="email" name="email" required
                                    value={formData.email} onChange={handleChange}
                                    placeholder="admin@Pekanbanyumas.com"
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 transition shadow-sm text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"} name="password" required
                                    value={formData.password} onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 transition shadow-sm text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-lg shadow-green-200 flex justify-center items-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? 'Memproses...' : (
                                <>Masuk ke Dashboard <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                            <ShieldAlert size={14} className="text-gray-400" /> Akses dibatasi hanya untuk Panitia dan Petugas Event.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
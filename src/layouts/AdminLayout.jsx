// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { PieChart, Users, Store, FileText, LogOut, User } from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: PieChart },
        { path: '/members', label: 'Kelola Member', icon: Users },
        { path: '/tenants', label: 'Tenant UMKM', icon: Store },
        { path: '/reports', label: 'Laporan', icon: FileText },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
            {/* SIDEBAR */}
            <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex shrink-0">
                <div className="p-6 border-b border-gray-200 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        P
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 leading-tight">Peken</h2>
                        <p className="text-xs text-gray-500 font-medium">Banyumasan</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">Menu Utama</div>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                }`}
                            >
                                <Icon size={20} /> {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl font-medium transition"
                    >
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* HEADER */}
                <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 shrink-0">
                    <div>
                        {/* Title bisa dibuat dinamis nanti menggunakan Context atau match path */}
                        <h1 className="text-2xl font-bold text-gray-800">Sistem Admin</h1>
                        <p className="text-sm text-gray-500">Peken Banyumasan</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-gray-800">Admin Utama</div>
                            <div className="text-xs text-green-600 font-medium">Admin / Petugas</div>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border border-blue-200">
                            <User size={20} />
                        </div>
                    </div>
                </header>

                {/* SCROLLABLE CONTENT (Halaman Spesifik akan render di sini) */}
                <div className="flex-1 overflow-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;

// src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { PieChart, Users, Store, FileText, LogOut, User, Menu, X, ShieldCheck, UserCog } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // OpenAPI AdminUser schema: { id, nama, email, role: 'admin' | 'petugas' }
    const [userData, setUserData] = useState({ nama: 'Admin', role: 'admin' });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const executeLogout = () => {
        setShowLogoutConfirm(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Filter navItems berdasarkan role.
    // OpenAPI REQ-AUTH-002 RBAC:
    //   - Admin:   akses penuh ke semua halaman
    //   - Petugas: hanya Dashboard
    const allNavItems = [
        { path: '/',        label: 'Dashboard',     icon: PieChart,  roles: ['admin', 'petugas'] },
        { path: '/members', label: 'Kelola Member', icon: Users,     roles: ['admin'] },
        { path: '/tenants', label: 'Tenant UMKM',   icon: Store,     roles: ['admin'] },
        { path: '/reports', label: 'Laporan',       icon: FileText,  roles: ['admin'] },
    ];

    const navItems = allNavItems.filter(item => item.roles.includes(userData.role));

    const getPageInfo = () => {
        switch (location.pathname) {
            case '/':         return { title: 'Dashboard Real-time',  subtitle: 'Pantau pergerakan pengunjung event hari ini' };
            case '/members':  return { title: 'Manajemen Member',     subtitle: 'Registrasi member baru dan kelola data keychain NFC' };
            case '/tenants':  return { title: 'Data Tenant UMKM',     subtitle: 'Integrasi data tenant dan promo diskon' };
            case '/reports':  return { title: 'Laporan Kunjungan',    subtitle: 'Rekapitulasi data pengunjung selama event' };
            default:          return { title: 'Sistem Admin',         subtitle: 'Pekan Banyumasan' };
        }
    };

    const pageInfo = getPageInfo();

    // Style badge role: admin → hijau, petugas → amber
    const roleBadgeStyle = userData.role === 'admin'
        ? 'text-green-600'
        : 'text-amber-600';

    const RoleIcon = userData.role === 'admin' ? ShieldCheck : UserCog;

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">

            {/* ConfirmDialog logout */}
            <ConfirmDialog
                isOpen={showLogoutConfirm}
                title="Konfirmasi Logout"
                message="Apakah Anda yakin ingin keluar dari sistem?"
                confirmLabel="Ya, Keluar"
                cancelLabel="Batal"
                variant="danger"
                onConfirm={executeLogout}
                onCancel={() => setShowLogoutConfirm(false)}
            />

            {/* OVERLAY MOBILE */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 border-b border-gray-200 flex items-center justify-between md:justify-start gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">P</div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 leading-tight">Pekan</h2>
                            <p className="text-xs text-gray-500 font-medium">Banyumasan</p>
                        </div>
                    </div>
                    <button className="md:hidden text-gray-500" onClick={() => setIsMobileMenuOpen(false)}>
                        <X size={24} />
                    </button>
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
                                onClick={() => setIsMobileMenuOpen(false)}
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

                {/* Info Role di Sidebar */}
                <div className="px-4 py-3 border-t border-gray-100 mx-4 mb-1">
                    <div className={`flex items-center gap-2 text-xs font-semibold ${roleBadgeStyle}`}>
                        <RoleIcon size={14} />
                        <span className="capitalize">{userData.role === 'admin' ? 'Administrator' : 'Petugas'}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5 truncate">{userData.email || userData.nama}</div>
                </div>

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
            <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
                {/* HEADER */}
                <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-4 md:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden text-gray-600 hover:text-blue-600"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800">{pageInfo.title}</h1>
                            <p className="text-xs md:text-sm text-gray-500 hidden sm:block">{pageInfo.subtitle}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-gray-800">{userData.nama}</div>
                            <div className={`text-xs font-medium capitalize flex items-center justify-end gap-1 ${roleBadgeStyle}`}>
                                <RoleIcon size={12} />
                                {userData.role === 'admin' ? 'Administrator' : 'Petugas'}
                            </div>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border border-blue-200">
                            <User size={20} />
                        </div>
                    </div>
                </header>

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
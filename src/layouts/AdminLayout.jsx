// src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    PieChart, Users, Store, FileText, LogOut,
    User, Menu, X, ShieldCheck, UserCog,
    Calendar, Monitor, BookOpen, SettingsIcon
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // OpenAPI AdminUser schema: { id, nama, email, role: 'admin' | 'petugas' }
    const [userData, setUserData] = useState({ nama: 'Admin', role: 'admin' });

    // Badge event aktif — disync dari Dashboard via localStorage + CustomEvent
    const [activeEventBadge, setActiveEventBadge] = useState(() => {
        try {
            const stored = localStorage.getItem('pekan_active_event');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    // Badge pending UMKM — disync dari Tenants page via localStorage + CustomEvent
    const [pendingUmkmCount, setPendingUmkmCount] = useState(() => {
        try {
            const stored = localStorage.getItem('pekan_pending_umkm');
            return stored ? parseInt(stored, 10) : 0;
        } catch { return 0; }
    });

    useEffect(() => {
        const handler = () => {
            try {
                const stored = localStorage.getItem('pekan_active_event');
                setActiveEventBadge(stored ? JSON.parse(stored) : null);
            } catch { setActiveEventBadge(null); }
        };
        window.addEventListener('pekan_event_update', handler);
        return () => window.removeEventListener('pekan_event_update', handler);
    }, []);

    // Dengarkan update pending count dari Tenants page
    useEffect(() => {
        const handler = (e) => {
            const count = e?.detail?.count ?? 0;
            setPendingUmkmCount(count);
        };
        window.addEventListener('pekan_pending_umkm_update', handler);
        return () => window.removeEventListener('pekan_pending_umkm_update', handler);
    }, []);

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
        { path: '/tenants', label: 'Tenant UMKM',   icon: Store,     roles: ['admin'], badge: pendingUmkmCount },
        { path: '/reports', label: 'Laporan',       icon: FileText,  roles: ['admin'] },
        { path: '/events',  label: 'Kelola Event',  icon: Calendar,  roles: ['admin'] },
    ];

    const navItems = allNavItems.filter(item => item.roles.includes(userData.role));

    // Link eksternal (buka tab baru, bukan di dalam layout)
    const externalLinks = [
        { path: '/monitor', label: 'Display Monitor', icon: Monitor },
        { path: '/profile', label: 'Company Profile', icon: BookOpen },
        { path: '/settings', label: 'Settings', icon: SettingsIcon }
    ];

    const getPageInfo = () => {
        switch (location.pathname) {
            case '/':         return { title: 'Dashboard Real-time',  subtitle: 'Pantau pergerakan pengunjung event hari ini' };
            case '/members':  return { title: 'Manajemen Member',     subtitle: 'Registrasi member baru dan kelola data keychain NFC' };
            case '/tenants':  return { title: 'Data Tenant UMKM',     subtitle: 'Integrasi data tenant, promo diskon, dan persetujuan pendaftaran' };
            case '/reports':  return { title: 'Laporan Kunjungan',    subtitle: 'Rekapitulasi data pengunjung selama event' };
            case '/events':   return { title: 'Kelola Event',         subtitle: 'Buat, aktifkan, dan nonaktifkan event Pekan Banyumasan' };
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
                {/* Logo */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between md:justify-start gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center text-white font-bold text-xl">P</div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 leading-tight">Pekan</h2>
                            <p className="text-xs text-gray-500 font-medium">Banyumasan</p>
                        </div>
                    </div>
                    <button className="md:hidden text-gray-500" onClick={() => setIsMobileMenuOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2 px-1">Menu Utama</div>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        const hasBadge = item.badge > 0;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm ${
                                    isActive
                                        ? 'bg-green-50 text-green-800'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-green-700'
                                }`}
                            >
                                {/* Ikon dengan badge dot jika ada pending */}
                                <span className="relative shrink-0">
                                    <Icon size={18} />
                                    {hasBadge && (
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    )}
                                </span>
                                <span className="flex-1">{item.label}</span>
                                {/* Badge pill di kanan label */}
                                {hasBadge && (
                                    <span className="shrink-0 bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-200 leading-none">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    {/* Divider dan link eksternal (admin only) */}
                    {userData.role === 'admin' && (
                        <>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-5 mb-2 px-1">Halaman Publik</div>
                            {externalLinks.map((item) => {
                                const Icon = item.icon;
                                const hashHref = `${window.location.origin}${window.location.pathname}#${item.path}`;
                                return (
                                    <a
                                        key={item.path}
                                        href={hashHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm text-gray-500 hover:bg-gray-50 hover:text-green-700"
                                    >
                                        <Icon size={18} />
                                        <span className="flex-1">{item.label}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 opacity-40">
                                            <path fillRule="evenodd" d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
                                        </svg>
                                    </a>
                                );
                            })}
                        </>
                    )}
                </nav>

                {/* Info Role */}
                <div className="px-4 py-3 border-t border-gray-100 mx-4 mb-1">
                    <div className={`flex items-center gap-2 text-xs font-semibold ${roleBadgeStyle}`}>
                        <RoleIcon size={14} />
                        <span className="capitalize">{userData.role === 'admin' ? 'Administrator' : 'Petugas'}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5 truncate">{userData.email || userData.nama}</div>
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl font-medium transition text-sm"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">

                {/* HEADER */}
                <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-4 md:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden text-gray-600 hover:text-green-700"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl md:text-2xl font-bold text-gray-800">{pageInfo.title}</h1>
                                {/* Badge event aktif — hanya tampil di Dashboard saat ada event */}
                                {location.pathname === '/' && activeEventBadge?.nama && (
                                    <span className="hidden sm:inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0"></span>
                                        {activeEventBadge.nama}
                                    </span>
                                )}
                                {/* Badge pending di header Tenants */}
                                {location.pathname === '/tenants' && pendingUmkmCount > 0 && (
                                    <span className="hidden sm:inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                                        {pendingUmkmCount} pendaftaran masuk
                                    </span>
                                )}
                            </div>
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
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 border border-green-200">
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
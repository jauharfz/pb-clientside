// src/pages/Tenants.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, RefreshCw, CheckCircle,
    Utensils, Coffee, Shirt, Store, AlertCircle
} from 'lucide-react';
import api from '../services/api';

const Tenants = () => {
    const [tenants, setTenants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(new Date());

    // State untuk Filter & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');

    // Helper untuk styling dinamis berdasarkan kategori
    const getCategoryStyle = (category) => {
        const cat = category?.toLowerCase() || '';
        if (cat.includes('makanan')) {
            return { icon: Utensils, bg: 'bg-orange-100', text: 'text-orange-500', badge: 'bg-orange-50 text-orange-700' };
        }
        if (cat.includes('minuman')) {
            return { icon: Coffee, bg: 'bg-amber-100', text: 'text-amber-600', badge: 'bg-amber-50 text-amber-700' };
        }
        if (cat.includes('fashion') || cat.includes('kriya') || cat.includes('pakaian')) {
            return { icon: Shirt, bg: 'bg-purple-100', text: 'text-purple-600', badge: 'bg-purple-50 text-purple-700' };
        }
        // Default style
        return { icon: Store, bg: 'bg-blue-100', text: 'text-blue-500', badge: 'bg-blue-50 text-blue-700' };
    };

    // Fungsi Fetch Data Tenant
    const fetchTenants = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/tenants');
            setTenants(response.data);
        } catch (error) {
            console.error('Gagal mengambil data tenant:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    // Simulasi Sinkronisasi API Eksternal
    const handleSync = async () => {
        setIsSyncing(true);
        try {
            // Simulasi delay jaringan untuk sinkronisasi
            await new Promise(resolve => setTimeout(resolve, 1500));
            await fetchTenants();
            setLastSync(new Date());
        } catch (error) {
            alert('Gagal melakukan sinkronisasi dengan server UMKM.');
        } finally {
            setIsSyncing(false);
        }
    };

    // Filter data berdasarkan search dan kategori
    const filteredTenants = tenants.filter(tenant => {
        const matchSearch = tenant.nama_tenant.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = selectedCategory === 'Semua Kategori' || tenant.kategori === selectedCategory;
        return matchSearch && matchCategory;
    });

    // Dapatkan daftar kategori unik untuk dropdown
    const uniqueCategories = ['Semua Kategori', ...new Set(tenants.map(t => t.kategori))];

    return (
        <div className="font-sans">

            {/* TOOLBAR */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                {/* Search & Filter */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nama tenant..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm cursor-pointer hidden sm:block"
                    >
                        {uniqueCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Sync Button */}
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-md shadow-blue-200"
                >
                    <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi API UMKM'}
                </button>
            </div>

            {/* INFO STATUS API */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-0.5 shrink-0" size={20} />
                <div>
                    <h4 className="text-sm font-bold text-green-800">Terhubung dengan Sistem UMKM</h4>
                    <p className="text-xs text-green-700 mt-1">
                        Sinkronisasi terakhir: {lastSync.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB.
                        Menampilkan {filteredTenants.length} Tenant aktif.
                    </p>
                </div>
            </div>

            {/* GRID CARDS TENANT */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <RefreshCw size={32} className="animate-spin mb-4 text-blue-500" />
                    <p>Memuat data tenant UMKM...</p>
                </div>
            ) : filteredTenants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <AlertCircle size={48} className="mb-4 text-gray-300" />
                    <p>Tidak ada tenant yang sesuai dengan pencarian Anda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTenants.map((tenant) => {
                        const style = getCategoryStyle(tenant.kategori);
                        const Icon = style.icon;

                        return (
                            <div key={tenant.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group flex flex-col h-full">
                                {/* Header Card (Warna dinamis) */}
                                <div className={`h-24 relative ${style.bg}`}>
                                    <div className="absolute -bottom-6 left-6 w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-xl">
                                        <Icon className={style.text} size={24} />
                                    </div>
                                    {/* Stand Number (Opsional, jika ada di API) */}
                                    <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-gray-700 shadow-sm">
                                        Stand {tenant.id.substring(0,4).toUpperCase()}
                                    </div>
                                </div>

                                {/* Body Card */}
                                <div className="p-6 pt-8 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-1 gap-2">
                                        <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-1" title={tenant.nama_tenant}>
                                            {tenant.nama_tenant}
                                        </h3>
                                        <span className={`${style.badge} text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap`}>
                      {tenant.kategori}
                    </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-4 line-clamp-2 flex-1">
                                        {tenant.deskripsi}
                                    </p>

                                    {/* Promo Section */}
                                    {tenant.promo_aktif ? (
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mt-auto">
                                            <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-1">Promo Member NFC</div>
                                            <div className="font-semibold text-blue-800 text-sm leading-tight">
                                                {tenant.promo_aktif}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-center h-[66px] mt-auto">
                                            <span className="text-xs text-gray-400 font-medium italic">Tidak ada promo aktif</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
};

export default Tenants;

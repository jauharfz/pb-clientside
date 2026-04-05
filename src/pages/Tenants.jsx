// src/pages/Tenants.jsx
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
    Search, RefreshCw, CheckCircle,
    Utensils, Coffee, Shirt, Store, AlertCircle,
    Tag, ChevronDown, ChevronUp, Percent
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';

// ─── Konstanta modul-level (bukan di dalam komponen) ────────────────────────
const PREVIEW_COUNT = 2;

// ─── Pure helper (di luar komponen agar tidak re-create tiap render) ─────────
const getCategoryStyle = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('makanan') || cat.includes('kuliner'))
        return { icon: Utensils,  bg: 'bg-orange-100', text: 'text-orange-500',  badge: 'bg-orange-50 text-orange-700',  accentBorder: 'border-orange-200', accentBg: 'bg-orange-50', accentText: 'text-orange-800', pill: 'bg-orange-100 text-orange-700' };
    if (cat.includes('minuman'))
        return { icon: Coffee,    bg: 'bg-amber-100',  text: 'text-amber-600',   badge: 'bg-amber-50 text-amber-700',    accentBorder: 'border-amber-200',  accentBg: 'bg-amber-50',  accentText: 'text-amber-800',  pill: 'bg-amber-100 text-amber-700'  };
    if (cat.includes('fashion') || cat.includes('kriya') || cat.includes('pakaian') || cat.includes('kerajinan'))
        return { icon: Shirt,     bg: 'bg-purple-100', text: 'text-purple-600',  badge: 'bg-purple-50 text-purple-700',  accentBorder: 'border-purple-200', accentBg: 'bg-purple-50', accentText: 'text-purple-800', pill: 'bg-purple-100 text-purple-700' };
    return     { icon: Store,     bg: 'bg-green-100',  text: 'text-green-600',   badge: 'bg-green-50 text-green-800',    accentBorder: 'border-green-200',  accentBg: 'bg-green-50',  accentText: 'text-green-900',  pill: 'bg-green-100 text-green-700'  };
};

// ─── Custom hook: debounce input ──────────────────────────────────────────────
// Cegah filter jalan setiap keystroke — penting kalau tenants ratusan
function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

// ─── TenantCard: komponen terpisah + memo ─────────────────────────────────────
//
// WHY:  Kalau ini inline di map(), setiap perubahan state di Tenants (misal
//       expand card lain) akan re-render SEMUA card. Dengan memo, card hanya
//       re-render kalau prop-nya benar-benar berubah.
//
// PENTING: `onToggleExpand` harus di-wrap useCallback di parent agar referensi
//           stabil dan memo bekerja efektif.
const TenantCard = memo(({ tenant, isExpanded, onToggleExpand }) => {
    const style       = getCategoryStyle(tenant.kategori);
    const Icon        = style.icon;
    const discounts   = tenant.all_discounts || [];
    const hasDiscount = discounts.length > 0;

    const visibleDiscounts = isExpanded ? discounts : discounts.slice(0, PREVIEW_COUNT);
    const hiddenCount      = discounts.length - PREVIEW_COUNT;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col h-full">

            {/* ── Header berwarna ── */}
            <div className={`h-24 relative ${style.bg}`}>
                {/* Ikon kategori melayang di bawah header */}
                <div className="absolute -bottom-6 left-6 w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                    <Icon className={style.text} size={24} />
                </div>

                {/* Nomor stand — kanan atas */}
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-gray-700 shadow-sm">
                    Stand {tenant.nomor_stand || '-'}
                </div>

                {/* Badge jumlah promo — kiri atas, hanya kalau ada promo */}
                {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1">
                        <Tag size={9} />
                        {discounts.length} Promo
                    </div>
                )}
            </div>

            {/* ── Body ── */}
            <div className="p-6 pt-8 flex-1 flex flex-col">

                {/*
                    FIX NAMA TERPOTONG:
                    Sebelumnya nama & badge kategori diletakkan dalam satu baris flex
                    (justify-between). Nama tidak punya min-w-0 sehingga badge
                    mendorong dan memaksa nama menyempit — line-clamp-1 akhirnya
                    memotong di tengah kata.

                    Solusi: pisah menjadi dua baris (flex-col). Nama bebas pakai
                    penuh lebar kartu (line-clamp-2 untuk tetap rapi), badge
                    kategori turun ke bawahnya sebagai inline-block.
                */}
                <div className="mb-3">
                    <h3
                        className="font-bold text-gray-800 text-base leading-snug line-clamp-2 mb-1.5"
                        title={tenant.nama_tenant}   /* tooltip tetap ada untuk nama sangat panjang */
                    >
                        {tenant.nama_tenant}
                    </h3>
                    <span className={`inline-block ${style.badge} text-[10px] px-2 py-0.5 rounded-full font-medium`}>
                        {tenant.kategori}
                    </span>
                </div>

                <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                    {tenant.deskripsi || '—'}
                </p>

                {/* ── Blok diskon (didorong ke bawah card) ── */}
                <div className="mt-auto">
                    {hasDiscount ? (
                        <div className={`border rounded-xl overflow-hidden ${style.accentBorder} ${style.accentBg}`}>

                            {/* Header blok diskon */}
                            <div className={`px-3 py-2 flex items-center justify-between border-b ${style.accentBorder}`}>
                                <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${style.accentText}`}>
                                    <Tag size={10} />
                                    Promo Member NFC
                                </span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${style.pill}`}>
                                    {discounts.length} aktif
                                </span>
                            </div>

                            {/* Daftar diskon */}
                            <div className={`divide-y ${style.accentBorder}`}>
                                {visibleDiscounts.map((disc, idx) => (
                                    <div key={disc.id ?? idx} className="px-3 py-2.5 flex items-start gap-2">
                                        <span className={`shrink-0 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center mt-0.5 ${style.pill}`}>
                                            {idx + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-semibold leading-snug ${style.accentText}`}>
                                                {disc.deskripsi_diskon}
                                            </p>
                                            {disc.persentase_diskon > 0 && (
                                                <span className="inline-flex items-center gap-0.5 mt-1 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                                                    <Percent size={8} />
                                                    Hemat {disc.persentase_diskon}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Expand / Collapse */}
                            {discounts.length > PREVIEW_COUNT && (
                                <button
                                    onClick={() => onToggleExpand(tenant.id)}
                                    className={`w-full flex items-center justify-center gap-1 py-2 text-[11px] font-semibold border-t transition-colors hover:bg-black/5 ${style.accentBorder} ${style.accentText}`}
                                >
                                    {isExpanded
                                        ? <><ChevronUp   size={12} /> Sembunyikan</>
                                        : <><ChevronDown size={12} /> {hiddenCount} promo lainnya</>
                                    }
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-center h-[66px]">
                            <span className="text-xs text-gray-400 font-medium italic">Tidak ada promo aktif</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
TenantCard.displayName = 'TenantCard';

// ─── Komponen utama ───────────────────────────────────────────────────────────
const Tenants = () => {
    const toast = useToast();
    const [tenants,    setTenants   ] = useState([]);
    const [isLoading,  setIsLoading ] = useState(true);
    const [isSyncing,  setIsSyncing ] = useState(false);
    const [lastSync,   setLastSync  ] = useState(new Date());
    const [fetchError, setFetchError] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    const [searchQuery,       setSearchQuery      ] = useState('');
    const [selectedCategory,  setSelectedCategory ] = useState('Semua Kategori');

    // Debounce: filter hanya jalan 300 ms setelah user berhenti mengetik
    const debouncedSearch = useDebounce(searchQuery, 300);

    // useMemo: filteredTenants & uniqueCategories tidak dihitung ulang kecuali
    // dependensinya benar-benar berubah — krusial kalau ada ratusan UMKM
    const filteredTenants = useMemo(() =>
            tenants.filter(t => {
                const matchSearch   = t.nama_tenant?.toLowerCase().includes(debouncedSearch.toLowerCase());
                const matchCategory = selectedCategory === 'Semua Kategori' || t.kategori === selectedCategory;
                return matchSearch && matchCategory;
            }),
        [tenants, debouncedSearch, selectedCategory]
    );

    const uniqueCategories = useMemo(() =>
            ['Semua Kategori', ...new Set(tenants.map(t => t.kategori).filter(Boolean))],
        [tenants]
    );

    /**
     * Fetch data tenant (GET /umkm) + diskon aktif (GET /discounts) paralel,
     * lalu merge berdasarkan tenant_id.
     */
    const fetchTenants = useCallback(async () => {
        try {
            setIsLoading(true);

            const [umkmRes, discountsResult] = await Promise.all([
                api.get('/umkm'),
                api.get('/discounts', { params: { is_aktif: true } }).catch(() => null),
            ]);

            const umkmList     = umkmRes.data?.data    || [];
            const discountList = discountsResult?.data?.data || [];

            const tenantsWithPromo = umkmList.map((tenant) => ({
                ...tenant,
                all_discounts: discountList.filter(d => d.tenant_id === tenant.id),
            }));

            setTenants(tenantsWithPromo);
            setFetchError(false);

            if (!discountsResult) {
                toast.error('Data diskon sementara tidak dapat dimuat. Tenant tetap ditampilkan.');
            }
        } catch (error) {
            console.error('Gagal mengambil data tenant:', error);
            setFetchError(true);
            toast.error('Gagal memuat data tenant UMKM. Coba sinkronisasi ulang.');
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await fetchTenants();
            setLastSync(new Date());
            setExpandedId(null);
            toast.success('Data tenant berhasil disinkronisasi.');
        } catch {
            toast.error('Gagal melakukan sinkronisasi dengan server UMKM.');
        } finally {
            setIsSyncing(false);
        }
    };

    // useCallback agar referensi stabil → TenantCard memo bekerja efektif
    const handleToggleExpand = useCallback((id) => {
        setExpandedId(prev => (prev === id ? null : id));
    }, []);

    return (
        <div className="font-sans">

            {/* TOOLBAR */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Cari nama tenant..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 text-sm shadow-sm"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 text-sm shadow-sm cursor-pointer hidden sm:block"
                    >
                        {uniqueCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-md shadow-green-200"
                >
                    <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi API UMKM'}
                </button>
            </div>

            {/* STATUS API */}
            {fetchError ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                    <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
                    <div>
                        <h4 className="text-sm font-bold text-red-800">Gagal Terhubung ke API UMKM</h4>
                        <p className="text-xs text-red-700 mt-1">
                            Data tenant tidak dapat dimuat. Periksa koneksi atau coba sinkronisasi ulang.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                    <CheckCircle className="text-green-600 mt-0.5 shrink-0" size={20} />
                    <div>
                        <h4 className="text-sm font-bold text-green-800">Terhubung dengan Sistem UMKM</h4>
                        <p className="text-xs text-green-700 mt-1">
                            Sinkronisasi terakhir: {lastSync.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB.
                            Menampilkan {filteredTenants.length} tenant aktif.
                        </p>
                    </div>
                </div>
            )}

            {/* GRID CARDS */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <RefreshCw size={32} className="animate-spin mb-4 text-green-600" />
                    <p>Memuat data tenant UMKM...</p>
                </div>
            ) : filteredTenants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <AlertCircle size={48} className="mb-4 text-gray-300" />
                    <p>Tidak ada tenant yang sesuai dengan pencarian Anda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTenants.map(tenant => (
                        <TenantCard
                            key={tenant.id}
                            tenant={tenant}
                            isExpanded={expandedId === tenant.id}
                            onToggleExpand={handleToggleExpand}
                        />
                    ))}
                </div>
            )}

        </div>
    );
};

export default Tenants;
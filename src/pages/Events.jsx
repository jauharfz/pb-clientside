// src/pages/Events.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Calendar, Plus, MapPin, Clock, AlertCircle,
    RefreshCw, X, CheckCircle, XCircle, ToggleLeft,
    Edit, Trash2, Lock
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

// ── Helper tanggal ────────────────────────────────────────────────────────────

// Gunakan local date (bukan UTC) agar cocok dengan nilai dari HTML date input
// dan timezone pengguna WIB (UTC+7).
// new Date().toISOString() selalu UTC — menyebabkan mismatch antara 00:00–06:59 WIB.
const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

/**
 * Klasifikasi visual event.
 * DB status hanya 'aktif' | 'selesai'.
 * Badge display ditentukan dari kombinasi status + tanggal:
 *   aktif              → AKTIF         (sedang berlangsung)
 *   selesai + tgl depan → BELUM MULAI  (tersimpan, belum bisa diaktifkan)
 *   selesai + tgl lalu  → SELESAI      (sudah berakhir)
 */
const getEventDisplay = (event) => {
    const today = getTodayStr();
    if (event.status === 'aktif') {
        return {
            badge: 'AKTIF', badgeCls: 'bg-green-100 text-green-700',
            pulse: true, cardBorder: 'border-green-200', dim: false,
            iconBg: 'bg-green-100', iconCls: 'text-green-700',
            canActivate: false, // sudah aktif
        };
    }
    if (event.tanggal > today) {
        return {
            badge: 'BELUM MULAI', badgeCls: 'bg-blue-100 text-blue-700',
            pulse: false, cardBorder: 'border-blue-100', dim: false,
            iconBg: 'bg-blue-100', iconCls: 'text-blue-600',
            canActivate: false, // tanggal belum tiba
        };
    }
    return {
        badge: 'SELESAI', badgeCls: 'bg-gray-100 text-gray-500',
        pulse: false, cardBorder: 'border-gray-100', dim: true,
        iconBg: 'bg-gray-100', iconCls: 'text-gray-400',
        canActivate: true, // tanggal sudah tiba, bisa diaktifkan kembali
    };
};

// ── Modal Form (Tambah & Edit) ────────────────────────────────────────────────

const EventFormModal = ({ isOpen, isEditMode, initialData, activeEvents, onClose, onSuccess }) => {
    const toast = useToast();
    const [formData, setFormData]         = useState({ nama_event: '', tanggal: '', lokasi: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setFormData(isEditMode && initialData
            ? { nama_event: initialData.nama_event, tanggal: initialData.tanggal, lokasi: initialData.lokasi }
            : { nama_event: '', tanggal: '', lokasi: '' }
        );
    }, [isOpen, isEditMode, initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isEditMode) {
                // Hanya sertakan tanggal dalam payload jika benar-benar berubah.
                // Jika event sedang aktif dan tanggal tidak berubah, backend tidak perlu
                // tahu tentang tanggal → mencegah false-positive guard 422.
                const editPayload = {
                    nama_event: formData.nama_event,
                    lokasi:     formData.lokasi,
                };
                if (dateChanged) {
                    editPayload.tanggal = formData.tanggal;
                }
                await api.patch(`/events/${initialData.id}`, editPayload);
                toast.success('Event berhasil diperbarui!');
            } else {
                await api.post('/events', formData);
                toast.success('Event berhasil dibuat!');
            }
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Terjadi kesalahan pada server.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const today           = getTodayStr();
    const selectedDate    = formData.tanggal;
    const isCurrentActive = isEditMode && initialData?.status === 'aktif';
    const dateChanged     = isEditMode && selectedDate !== initialData?.tanggal;

    // Info otomatis untuk mode Tambah (berdasarkan tanggal dipilih)
    const willBeActive  = !isEditMode && selectedDate && selectedDate === today;
    const willBePast    = !isEditMode && selectedDate && selectedDate < today;
    const willBePending = !isEditMode && selectedDate && selectedDate > today;
    const willDeactivateOthers = willBeActive && activeEvents.length > 0;

    // Info perubahan tanggal untuk mode Edit
    const editDateWillActivate = isEditMode && dateChanged && selectedDate === today;
    const editDateWillPast     = isEditMode && dateChanged && selectedDate < today && !isCurrentActive;
    const editDateWillPend     = isEditMode && dateChanged && selectedDate > today;
    const editWillDeactivateOthers = editDateWillActivate && activeEvents.some(e => e.id !== initialData?.id);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             onClick={() => !isSubmitting && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                 onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isEditMode ? 'bg-amber-100' : 'bg-green-100'}`}>
                            {isEditMode ? <Edit size={17} className="text-amber-600"/> : <Calendar size={17} className="text-green-700"/>}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">{isEditMode ? 'Edit Event' : 'Tambah Event Baru'}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {isEditMode ? 'Perbarui detail event' : 'Isi detail event yang akan dibuat'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 transition p-1">
                        <X size={20}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Nama Event */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Nama Event <span className="text-red-500">*</span>
                        </label>
                        <input type="text" required value={formData.nama_event}
                               onChange={(e) => setFormData(p => ({ ...p, nama_event: e.target.value }))}
                               placeholder="cth. Pekan Banyumasan Juli 2025"
                               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition text-sm"/>
                    </div>

                    {/* Tanggal */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Tanggal Pelaksanaan <span className="text-red-500">*</span>
                            {isCurrentActive && (
                                <span className="ml-2 text-xs font-normal text-red-500 inline-flex items-center gap-1">
                                    <Lock size={11}/> Dikunci saat event aktif
                                </span>
                            )}
                        </label>
                        {isCurrentActive ? (
                            /* Tanggal dikunci untuk event yang sedang aktif */
                            <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 flex items-center gap-2 cursor-not-allowed">
                                <Lock size={14} className="text-gray-400 shrink-0"/>
                                <span>
                                    {new Date(initialData.tanggal + 'T00:00:00').toLocaleDateString('id-ID', {
                                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                    })}
                                </span>
                                <span className="ml-auto text-xs text-red-400">Tidak dapat diubah</span>
                            </div>
                        ) : (
                            <input type="date" required value={formData.tanggal}
                                   onChange={(e) => setFormData(p => ({ ...p, tanggal: e.target.value }))}
                                   className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition text-sm"/>
                        )}
                    </div>

                    {/* Lokasi */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Lokasi <span className="text-red-500">*</span>
                        </label>
                        <input type="text" required value={formData.lokasi}
                               onChange={(e) => setFormData(p => ({ ...p, lokasi: e.target.value }))}
                               placeholder="cth. Alun-alun Purwokerto"
                               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition text-sm"/>
                    </div>

                    {!isEditMode && selectedDate && (
                        <>
                            {willBeActive && !willDeactivateOthers && (
                                <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-700 flex items-start gap-2">
                                    <CheckCircle size={14} className="shrink-0 mt-0.5"/>
                                    <p>Tanggal hari ini — event akan langsung berstatus <strong>Aktif</strong> dan siap menerima tap NFC.</p>
                                </div>
                            )}
                            {willDeactivateOthers && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                                    <AlertCircle size={14} className="shrink-0 mt-0.5"/>
                                    <p>Ada event lain yang sedang aktif. Event tersebut akan otomatis <strong>dinonaktifkan</strong> saat event baru ini dibuat.</p>
                                </div>
                            )}
                            {willBePast && (
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-600 flex items-start gap-2">
                                    <AlertCircle size={14} className="shrink-0 mt-0.5"/>
                                    <p>Tanggal sudah lewat — event akan tersimpan langsung sebagai <strong>Selesai</strong>. Anda masih bisa mengaktifkannya manual jika diperlukan.</p>
                                </div>
                            )}
                            {willBePending && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 flex items-start gap-2">
                                    <Clock size={14} className="shrink-0 mt-0.5"/>
                                    <p>Tanggal di masa depan — event tersimpan sebagai <strong>Belum Mulai</strong>. Tombol Aktifkan baru tersedia di hari pelaksanaan.</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Info dinamis: mode Edit, tanggal berubah */}
                    {isEditMode && !isCurrentActive && dateChanged && selectedDate && (
                        <>
                            {editDateWillActivate && !editWillDeactivateOthers && (
                                <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-700 flex items-start gap-2">
                                    <CheckCircle size={14} className="shrink-0 mt-0.5"/>
                                    <p>Tanggal diubah ke hari ini — event akan otomatis berstatus <strong>Aktif</strong> setelah disimpan.</p>
                                </div>
                            )}
                            {editWillDeactivateOthers && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                                    <AlertCircle size={14} className="shrink-0 mt-0.5"/>
                                    <p>Tanggal diubah ke hari ini dan ada event lain yang aktif. Event aktif tersebut akan otomatis <strong>dinonaktifkan</strong>.</p>
                                </div>
                            )}
                            {editDateWillPast && (
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-600 flex items-start gap-2">
                                    <AlertCircle size={14} className="shrink-0 mt-0.5"/>
                                    <p>Tanggal diubah ke masa lalu — event akan tetap berstatus <strong>Selesai</strong>.</p>
                                </div>
                            )}
                            {editDateWillPend && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 flex items-start gap-2">
                                    <Clock size={14} className="shrink-0 mt-0.5"/>
                                    <p>Tanggal diubah ke masa depan — event akan otomatis berstatus <strong>Belum Mulai</strong>.</p>
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex justify-end gap-3 pt-1">
                        <button type="button" onClick={onClose} disabled={isSubmitting}
                                className="px-5 py-2 text-gray-600 font-semibold text-sm hover:bg-gray-100 rounded-xl transition disabled:opacity-50">
                            Batal
                        </button>
                        <button type="submit" disabled={isSubmitting}
                                className={`px-5 py-2 text-white font-semibold text-sm rounded-xl transition shadow-md disabled:opacity-60 flex items-center gap-2 ${
                                    isEditMode ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-green-700 hover:bg-green-800 shadow-green-200'
                                }`}>
                            {isSubmitting
                                ? <><RefreshCw size={14} className="animate-spin"/> Menyimpan...</>
                                : isEditMode ? 'Simpan Perubahan' : 'Buat Event'
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Halaman Events ────────────────────────────────────────────────────────────

const Events = () => {
    const toast = useToast();
    const [events, setEvents]       = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modal, setModal]         = useState({ open: false, editMode: false, data: null });
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, event: null, action: null });

    const fetchEvents = useCallback(async () => {
        try {
            setIsLoading(true);
            const res    = await api.get('/events');
            const raw    = res.data.data || [];
            const today  = getTodayStr();
            // Urutan: Aktif → Belum Mulai (depan) → Selesai (lalu)
            const rankOf = (e) => {
                if (e.status === 'aktif')                          return 0;
                if (e.status === 'selesai' && e.tanggal > today)   return 1;
                return 2;
            };
            const sorted = [...raw].sort((a, b) => {
                const rd = rankOf(a) - rankOf(b);
                return rd !== 0 ? rd : new Date(b.tanggal) - new Date(a.tanggal);
            });
            setEvents(sorted);
        } catch {
            toast.error('Gagal memuat data event.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const closeConfirm = () => setConfirmDialog({ isOpen: false, event: null, action: null });

    const executeToggle = async () => {
        const { event } = confirmDialog;
        const newStatus = event.status === 'aktif' ? 'selesai' : 'aktif';
        closeConfirm();
        try {
            await api.patch(`/events/${event.id}`, { status: newStatus });
            toast.success(newStatus === 'aktif'
                ? `Event "${event.nama_event}" berhasil diaktifkan.`
                : `Event "${event.nama_event}" dinonaktifkan.`);
            fetchEvents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal mengubah status event.');
        }
    };

    const executeDelete = async () => {
        const { event } = confirmDialog;
        closeConfirm();
        try {
            await api.delete(`/events/${event.id}`);
            toast.success(`Event "${event.nama_event}" berhasil dihapus.`);
            fetchEvents();
        } catch (err) {
            const msg    = err.response?.data?.message || '';
            const status = err.response?.status;
            if (status === 409 || msg.toLowerCase().includes('kunjungan') || msg.toLowerCase().includes('restrict')) {
                toast.error('Event tidak dapat dihapus karena sudah memiliki data kunjungan. Nonaktifkan event sebagai gantinya.');
            } else {
                toast.error(msg || 'Gagal menghapus event.');
            }
        }
    };

    const handleConfirm = () => {
        if (confirmDialog.action === 'toggle') executeToggle();
        else if (confirmDialog.action === 'delete') executeDelete();
    };

    const getConfirmProps = () => {
        const { event, action } = confirmDialog;
        if (!event) return {};
        if (action === 'toggle') {
            const toActive     = event.status !== 'aktif';
            const hasOtherActive = toActive && events.some(e => e.status === 'aktif' && e.id !== event.id);
            const isPastDate   = toActive && event.tanggal < getTodayStr();
            return {
                title:        toActive ? 'Aktifkan Event' : 'Nonaktifkan Event',
                message:      toActive
                    ? isPastDate
                        ? `Tanggal event ini (${event.tanggal}) sudah lewat. Sistem tetap bisa menerima tap NFC dan input manual setelah diaktifkan.${hasOtherActive ? ' Event lain yang sedang aktif akan otomatis dinonaktifkan.' : ''} Tetap aktifkan?`
                        : hasOtherActive
                            ? `Mengaktifkan event ini akan otomatis menonaktifkan event lain yang sedang aktif. Lanjutkan?`
                            : `Event "${event.nama_event}" akan diaktifkan dan langsung menerima tap NFC serta input manual. Lanjutkan?`
                    : `Event "${event.nama_event}" akan dinonaktifkan. Data kunjungan tetap tersimpan. Lanjutkan?`,
                confirmLabel: toActive ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan',
                variant:      toActive ? 'warning' : 'danger',
            };
        }
        return {
            title:        'Hapus Event',
            message:      `Event "${event.nama_event}" akan dihapus permanen. Penghapusan hanya berhasil jika belum ada data kunjungan. Lanjutkan?`,
            confirmLabel: 'Ya, Hapus',
            variant:      'danger',
        };
    };

    const formatTanggal = (d) =>
        new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const today         = getTodayStr();
    const activeEvents  = events.filter(e => e.status === 'aktif');
    const activeCount   = activeEvents.length;
    const pendingCount  = events.filter(e => e.status === 'selesai' && e.tanggal > today).length;
    const finishedCount = events.filter(e => e.status === 'selesai' && e.tanggal <= today).length;

    return (
        <div className="font-sans space-y-8">

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onConfirm={handleConfirm}
                onCancel={closeConfirm}
                {...getConfirmProps()}
            />

            <EventFormModal
                isOpen={modal.open}
                isEditMode={modal.editMode}
                initialData={modal.data}
                activeEvents={activeEvents}
                onClose={() => setModal({ open: false, editMode: false, data: null })}
                onSuccess={fetchEvents}
            />

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs text-gray-500 font-medium mb-1">Total Event</p>
                    <p className="text-3xl font-bold text-gray-800">{events.length}</p>
                </div>
                <div className="bg-green-50 rounded-2xl border border-green-100 shadow-sm p-5">
                    <p className="text-xs text-green-600 font-medium mb-1">Sedang Aktif</p>
                    <div className="flex items-center justify-between">
                        <p className="text-3xl font-bold text-green-700">{activeCount}</p>
                        {activeCount > 0 && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Live
                            </span>
                        )}
                    </div>
                </div>
                <div className="bg-blue-50 rounded-2xl border border-blue-100 shadow-sm p-5">
                    <p className="text-xs text-blue-600 font-medium mb-1">Belum Mulai</p>
                    <p className="text-3xl font-bold text-blue-600">{pendingCount}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs text-gray-500 font-medium mb-1">Selesai</p>
                    <p className="text-3xl font-bold text-gray-400">{finishedCount}</p>
                </div>
            </div>

            {/* Banner tidak ada event aktif */}
            {!isLoading && activeCount === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5"/>
                    <div>
                        <p className="text-sm font-bold text-amber-800">Tidak ada event aktif</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                            Tap NFC dan input manual tidak berfungsi. Aktifkan event yang ada{pendingCount > 0 ? ' (tombol Aktifkan tersedia di hari pelaksanaan)' : ''}, atau buat event baru dengan tanggal hari ini.
                        </p>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-gray-700">
                    Daftar Semua Event <span className="ml-2 text-sm font-normal text-gray-400">({events.length})</span>
                </h2>
                <button
                    onClick={() => setModal({ open: true, editMode: false, data: null })}
                    className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-md shadow-green-200">
                    <Plus size={16}/> Tambah Event
                </button>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <RefreshCw size={32} className="animate-spin text-green-600"/>
                </div>
            ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                    <Calendar size={48} className="mb-4 text-gray-300"/>
                    <p className="font-medium">Belum ada event terdaftar</p>
                    <p className="text-sm mt-1">Klik "Tambah Event" untuk membuat event pertama</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {events.map((event) => {
                        const disp    = getEventDisplay(event);
                        const isAktif = event.status === 'aktif';

                        return (
                            <div key={event.id}
                                 className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:shadow-md ${disp.cardBorder} ${disp.dim ? 'opacity-60' : ''}`}>

                                {/* Info */}
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${disp.iconBg}`}>
                                        <Calendar size={22} className={disp.iconCls}/>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-800 text-base leading-tight">{event.nama_event}</h3>
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${disp.badgeCls}`}>
                                                {disp.pulse && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>}
                                                {!disp.pulse && disp.badge === 'SELESAI' && <CheckCircle size={10}/>}
                                                {disp.badge}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <Clock size={12} className="shrink-0"/>{formatTanggal(event.tanggal)}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <MapPin size={12} className="shrink-0"/>{event.lokasi}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Aksi */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {/* Edit */}
                                    <button
                                        onClick={() => setModal({ open: true, editMode: true, data: event })}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700"
                                        title="Edit event">
                                        <Edit size={14}/><span className="hidden sm:inline">Edit</span>
                                    </button>

                                    {/* Toggle aktif / nonaktifkan */}
                                    {isAktif ? (
                                        <button
                                            onClick={() => setConfirmDialog({ isOpen: true, event, action: 'toggle' })}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition bg-red-50 text-red-600 hover:bg-red-100">
                                            <XCircle size={14}/><span className="hidden sm:inline">Nonaktifkan</span>
                                        </button>
                                    ) : disp.canActivate ? (
                                        /* Tombol Aktifkan hanya muncul jika tanggal sudah tiba */
                                        <button
                                            onClick={() => setConfirmDialog({ isOpen: true, event, action: 'toggle' })}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition bg-green-50 text-green-700 hover:bg-green-100">
                                            <ToggleLeft size={14}/><span className="hidden sm:inline">Aktifkan</span>
                                        </button>
                                    ) : (
                                        /* Belum Mulai: tombol disabled dengan tooltip */
                                        <div
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-gray-50 text-gray-300 cursor-not-allowed select-none"
                                            title="Aktifkan hanya tersedia di hari pelaksanaan">
                                            <Lock size={14}/><span className="hidden sm:inline">Aktifkan</span>
                                        </div>
                                    )}

                                    {/* Hapus — hanya untuk event tidak aktif */}
                                    {!isAktif && (
                                        <button
                                            onClick={() => setConfirmDialog({ isOpen: true, event, action: 'delete' })}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                            title="Hapus event (hanya jika belum ada data kunjungan)">
                                            <Trash2 size={14}/>
                                        </button>
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

export default Events;
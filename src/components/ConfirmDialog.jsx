// src/components/ConfirmDialog.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Modal konfirmasi pengganti window.confirm().
 *
 * Props:
 *  - isOpen      {boolean}  — tampilkan atau sembunyikan dialog
 *  - title       {string}   — judul dialog
 *  - message     {string|ReactNode} — isi pesan
 *  - confirmLabel{string}   — teks tombol konfirmasi (default: 'Ya, Lanjutkan')
 *  - cancelLabel {string}   — teks tombol batal (default: 'Batal')
 *  - variant     {'danger'|'warning'} — warna aksen (default: 'danger')
 *  - onConfirm   {function} — dipanggil saat tombol konfirmasi diklik
 *  - onCancel    {function} — dipanggil saat tombol batal atau backdrop diklik
 */
const ConfirmDialog = ({
    isOpen,
    title = 'Konfirmasi',
    message,
    confirmLabel = 'Ya, Lanjutkan',
    cancelLabel = 'Batal',
    variant = 'danger',
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    const isDanger = variant === 'danger';

    const iconBg   = isDanger ? 'bg-red-100'               : 'bg-yellow-100';
    const iconCls  = isDanger ? 'text-red-600'             : 'text-yellow-600';
    const btnCls   = isDanger
        ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
        : 'bg-amber-500 hover:bg-amber-600 shadow-amber-200';

    return (
        <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                onClick={(e) => e.stopPropagation()}   // cegah klik bubble ke backdrop
            >
                {/* Body */}
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                            <AlertTriangle size={20} className={iconCls} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-base mb-1.5">{title}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2 text-gray-600 font-semibold text-sm hover:bg-gray-200 rounded-xl transition"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-5 py-2 text-white font-semibold text-sm rounded-xl shadow-md transition ${btnCls}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;

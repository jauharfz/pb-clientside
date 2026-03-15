// src/components/Toast.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast harus digunakan di dalam ToastProvider');
    return ctx;
};

let _id = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'info', duration = 3500) => {
        const id = ++_id;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => dismiss(id), duration);
    }, [dismiss]);

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error:   (msg) => addToast(msg, 'error', 4500),
        warning: (msg) => addToast(msg, 'warning'),
        info:    (msg) => addToast(msg, 'info'),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
};

// ── Konfigurasi per tipe ────────────────────────────────────────────────────

const CONFIG = {
    success: {
        Icon: CheckCircle,
        wrapperCls: 'bg-green-50 border-green-200',
        iconCls: 'text-green-500',
        textCls: 'text-green-800',
        closeCls: 'text-green-400 hover:text-green-600',
    },
    error: {
        Icon: XCircle,
        wrapperCls: 'bg-red-50 border-red-200',
        iconCls: 'text-red-500',
        textCls: 'text-red-800',
        closeCls: 'text-red-400 hover:text-red-600',
    },
    warning: {
        Icon: AlertTriangle,
        wrapperCls: 'bg-yellow-50 border-yellow-200',
        iconCls: 'text-yellow-500',
        textCls: 'text-yellow-800',
        closeCls: 'text-yellow-400 hover:text-yellow-600',
    },
    info: {
        Icon: Info,
        wrapperCls: 'bg-blue-50 border-blue-200',
        iconCls: 'text-blue-500',
        textCls: 'text-blue-800',
        closeCls: 'text-blue-400 hover:text-blue-600',
    },
};

// ── Container ───────────────────────────────────────────────────────────────

const ToastContainer = ({ toasts, onDismiss }) => (
    <>
        {/* Keyframes di-inject sekali */}
        <style>{`
            @keyframes toast-in {
                from { opacity: 0; transform: translateX(100%); }
                to   { opacity: 1; transform: translateX(0); }
            }
            .toast-item { animation: toast-in 0.25s ease-out; }
        `}</style>

        <div
            aria-live="polite"
            className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-80 pointer-events-none"
        >
            {toasts.map(({ id, message, type }) => {
                const c = CONFIG[type] || CONFIG.info;
                const { Icon } = c;
                return (
                    <div
                        key={id}
                        className={`toast-item pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${c.wrapperCls}`}
                    >
                        <Icon size={18} className={`shrink-0 mt-0.5 ${c.iconCls}`} />
                        <p className={`flex-1 text-sm font-medium leading-snug ${c.textCls}`}>
                            {message}
                        </p>
                        <button
                            onClick={() => onDismiss(id)}
                            className={`shrink-0 transition ${c.closeCls}`}
                            aria-label="Tutup notifikasi"
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    </>
);

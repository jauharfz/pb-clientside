import React, { useEffect, useMemo } from 'react';
import logoImg from '../assets/logo.png';

const normalizePublicUrl = (value) => {
    const raw = String(value || '').trim();

    if (!raw) return '/';
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith('//')) return `https:${raw}`;
    if (raw.startsWith('/')) return raw;

    return `https://${raw}`;
};

const resolvePublicEventUrl = () => {
    return normalizePublicUrl(
        import.meta.env.VITE_PUBLIC_EVENT_URL ||
        import.meta.env.VITE_UMKM_PUBLIC_URL ||
        '/'
    );
};

export default function Profile() {
    const targetUrl = useMemo(resolvePublicEventUrl, []);

    useEffect(() => {
        window.location.replace(targetUrl);
    }, [targetUrl]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: '#f8fafc',
            color: '#1f2937',
            fontFamily: 'Inter, system-ui, sans-serif',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '520px',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: '0 18px 40px rgba(15,23,42,0.08)',
                textAlign: 'center',
            }}>
                <img src={logoImg} alt="Logo Pekan Banyumasan" style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    objectFit: 'cover',
                    marginBottom: '16px',
                    display: 'inline-block',
                }} />
                <h1 style={{ margin: '0 0 8px', fontSize: '24px', lineHeight: 1.2 }}>Mengalihkan ke halaman publik event</h1>
                <p style={{ margin: '0 0 20px', color: '#6b7280', lineHeight: 1.7 }}>
                    Anda akan langsung diarahkan ke halaman publik UMKM dan event Peken Banyumasan.
                </p>
                <a
                    href={targetUrl}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px 18px',
                        borderRadius: '14px',
                        background: '#245840',
                        color: '#fff',
                        fontWeight: 700,
                        textDecoration: 'none',
                    }}
                >
                    Buka Halaman Publik
                </a>
            </div>
        </div>
    );
}

// src/pages/Profile.jsx
// Halaman Company Profile — REQ-PROFILE-001
// Ditujukan untuk masyarakat umum dan pengunjung event Pekan Banyumasan.
// Halaman statis di sisi frontend React, tidak memerlukan backend API.
// Dapat diakses tanpa login (PublicRoute).

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    MapPin, Phone, Mail, Calendar,
    ChevronDown, ShieldCheck, Star,
    Wifi, Gift, Store, ArrowRight,
    Clock, Music, Utensils
} from 'lucide-react';

// ── Data statis ───────────────────────────────────────────────────────────────

const FAQ = [
    {
        q: 'Apa itu Pekan Banyumasan?',
        a: 'Pekan Banyumasan adalah festival budaya, kuliner, dan UMKM khas Banyumas yang diselenggarakan secara rutin. Acara ini menghadirkan ratusan booth makanan, minuman, kerajinan tangan, dan pertunjukan seni tradisional untuk seluruh lapisan masyarakat.',
    },
    {
        q: 'Apakah tiket masuk berbayar?',
        a: 'Masuk ke area Pekan Banyumasan GRATIS untuk semua pengunjung. Biaya hanya dikenakan jika Anda membeli produk dari tenant UMKM yang berpartisipasi.',
    },
    {
        q: 'Apa itu Keychain NFC Member?',
        a: 'Keychain NFC adalah gantungan kunci kecil berteknologi chip yang bisa Anda dapatkan dengan mendaftar sebagai member. Cukup dekatkan ke alat di pintu masuk — sistem langsung mencatat kunjungan Anda dan Anda mendapat diskon eksklusif di booth UMKM.',
    },
    {
        q: 'Bagaimana cara mendaftar member?',
        a: 'Datang ke loket pendaftaran di area pintu masuk event, berikan nama dan nomor WhatsApp aktif kepada petugas, dan Anda akan langsung menerima keychain NFC. Pendaftaran cepat, mudah, dan GRATIS.',
    },
    {
        q: 'Apakah keychain NFC bisa dipakai lagi di event berikutnya?',
        a: 'Ya! Keychain NFC Anda terdaftar permanen di sistem dan dapat digunakan di seluruh event Pekan Banyumasan berikutnya selama kartu masih aktif.',
    },
    {
        q: 'Di mana lokasi event berlangsung?',
        a: 'Pekan Banyumasan diselenggarakan di Alun-alun Purwokerto dan beberapa lokasi di sekitar Kabupaten Banyumas. Informasi lokasi spesifik diumumkan melalui media sosial kami menjelang hari H.',
    },
];

const HIGHLIGHTS = [
    { icon: Utensils, label: 'Kuliner Khas', desc: 'Soto Sokaraja, Mendoan, Wedang Uwuh, dan ratusan hidangan Banyumasan lainnya' },
    { icon: Store,    label: 'UMKM Lokal',  desc: 'Lebih dari 40 booth kerajinan, batik, fashion, dan produk unggulan daerah' },
    { icon: Music,    label: 'Seni Budaya', desc: 'Pertunjukan calung, lengger, dan berbagai kesenian tradisional Banyumas' },
    { icon: Gift,     label: 'Promo Member',desc: 'Diskon eksklusif di semua booth UMKM hanya dengan memiliki keychain NFC member' },
];

const MANFAAT_MEMBER = [
    'Diskon khusus di 40+ booth UMKM peserta',
    'Tidak perlu antre panjang di pintu masuk',
    'Data kunjungan Anda tercatat otomatis',
    'Keychain berlaku untuk semua event Pekan Banyumasan',
    'Pendaftaran gratis, tanpa biaya apapun',
];

// ── Komponen FAQ ──────────────────────────────────────────────────────────────

const FaqItem = ({ item }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-stone-200 last:border-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-5 text-left gap-4 group"
            >
                <span className="font-semibold text-gray-800 group-hover:text-green-700 transition text-sm md:text-base leading-snug">
                    {item.q}
                </span>
                <ChevronDown
                    size={18}
                    className={`shrink-0 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180 text-green-600' : ''}`}
                />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-48 pb-5' : 'max-h-0'}`}>
                <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
            </div>
        </div>
    );
};

// ── Halaman Utama ─────────────────────────────────────────────────────────────

const Profile = () => {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                .pf-serif { font-family: 'Lora', Georgia, serif; }
                .pf-sans  { font-family: 'Plus Jakarta Sans', sans-serif; }
                @keyframes _fade-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .fade-up  { animation: _fade-up 0.6s ease-out both; }
                .delay-1  { animation-delay: 0.1s; }
                .delay-2  { animation-delay: 0.2s; }
                .delay-3  { animation-delay: 0.3s; }
            `}</style>

            <div className="pf-sans bg-white min-h-screen text-gray-800">

                {/* ── NAVBAR ── */}
                <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-sm">
                    <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center text-white font-bold text-base shadow">P</div>
                            <span className="pf-serif font-bold text-gray-900 text-lg leading-none">Pekan Banyumasan</span>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                            <a href="#acara"  className="text-sm text-gray-500 hover:text-green-700 transition hidden md:block">Acara</a>
                            <a href="#member" className="text-sm text-gray-500 hover:text-green-700 transition hidden md:block">Member NFC</a>
                            <a href="#faq"    className="text-sm text-gray-500 hover:text-green-700 transition hidden md:block">FAQ</a>
                            <a href="#kontak" className="text-sm text-gray-500 hover:text-green-700 transition hidden md:block">Kontak</a>
                        </div>
                    </div>
                </nav>

                {/* ── HERO ── */}
                <section className="relative bg-green-800 overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-[0.07] pointer-events-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23fff'%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3Ccircle cx='0' cy='0' r='3'/%3E%3Ccircle cx='80' cy='0' r='3'/%3E%3Ccircle cx='0' cy='80' r='3'/%3E%3Ccircle cx='80' cy='80' r='3'/%3E%3Ccircle cx='40' cy='0' r='1.5'/%3E%3Ccircle cx='40' cy='80' r='1.5'/%3E%3Ccircle cx='0' cy='40' r='1.5'/%3E%3Ccircle cx='80' cy='40' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500 rounded-full opacity-10 blur-3xl -mr-60 -mt-40 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500 rounded-full opacity-10 blur-3xl -ml-32 -mb-16 pointer-events-none" />

                    <div className="relative z-10 max-w-5xl mx-auto px-5 py-20 md:py-28">
                        <div className="max-w-2xl fade-up">
                            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold px-4 py-2 rounded-full mb-6 tracking-wide uppercase">
                                <Star size={11} className="fill-current" /> Festival Budaya & UMKM Banyumas
                            </div>
                            <h1 className="pf-serif text-white text-4xl md:text-6xl font-bold leading-tight mb-5">
                                Selamat Datang di<br />
                                <span className="text-amber-300">Pekan Banyumasan</span>
                            </h1>
                            <p className="text-green-100 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
                                Festival tahunan yang merayakan kekayaan budaya, kuliner, dan produk UMKM kebanggaan masyarakat Banyumas. Gratis untuk semua pengunjung!
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <a
                                    href="#member"
                                    className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-900 font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-amber-900/20 text-sm"
                                >
                                    Daftar Member Gratis <ArrowRight size={16} />
                                </a>
                                <a
                                    href="#acara"
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition text-sm"
                                >
                                    Lihat Acara
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-12 overflow-hidden">
                        <svg viewBox="0 0 1200 50" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full fill-white">
                            <path d="M0,50 C300,0 900,50 1200,20 L1200,50 Z" />
                        </svg>
                    </div>
                </section>

                {/* ── INFO CEPAT ── */}
                <section className="max-w-5xl mx-auto px-5 -mt-4 mb-16">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { icon: Calendar, label: 'Jadwal',   value: 'Lihat pengumuman resmi kami' },
                            { icon: MapPin,   label: 'Lokasi',   value: 'Alun-alun Purwokerto & sekitarnya' },
                            { icon: Clock,    label: 'Jam Buka', value: 'Pagi hingga malam hari' },
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className={`bg-white rounded-2xl shadow-md border border-stone-100 p-5 flex items-center gap-4 fade-up delay-${i + 1}`}>
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                                        <Icon size={18} className="text-green-700" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{item.label}</p>
                                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── APA YANG ADA DI ACARA ── */}
                <section id="acara" className="py-16 bg-stone-50 border-y border-stone-100">
                    <div className="max-w-5xl mx-auto px-5">
                        <div className="text-center mb-12">
                            <p className="text-xs font-bold text-green-600 tracking-widest uppercase mb-2">Nikmati Berbagai Hiburan</p>
                            <h2 className="pf-serif text-3xl md:text-4xl font-bold text-gray-900">Ada Apa di Pekan Banyumasan?</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {HIGHLIGHTS.map((h, i) => {
                                const Icon = h.icon;
                                return (
                                    <div key={i} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm flex items-start gap-4 hover:shadow-md transition hover:border-green-100 group">
                                        <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-green-700 transition">
                                            <Icon size={20} className="text-green-700 group-hover:text-white transition" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1">{h.label}</h3>
                                            <p className="text-sm text-gray-500 leading-relaxed">{h.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── MEMBER NFC ── */}
                <section id="member" className="py-20 max-w-5xl mx-auto px-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="text-xs font-bold text-green-600 tracking-widest uppercase mb-3">Keychain NFC Member</p>
                            <h2 className="pf-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                Belanja Lebih Hemat<br />dengan Jadi Member
                            </h2>
                            <p className="text-gray-500 leading-relaxed mb-6 text-sm md:text-base">
                                Daftarkan diri Anda sebagai member Pekan Banyumasan dan dapatkan keychain NFC gratis. Cukup dekatkan ke alat di pintu masuk, sistem langsung mengenali Anda — tidak perlu antre, tidak perlu isi formulir berulang-ulang.
                            </p>
                            <ul className="space-y-3 mb-8">
                                {MANFAAT_MEMBER.map((m, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-green-600" />
                                        </div>
                                        {m}
                                    </li>
                                ))}
                            </ul>
                            <a
                                href="#cara-daftar"
                                className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-xl transition shadow-md shadow-green-200 text-sm"
                            >
                                Cara Mendaftar <ArrowRight size={15} />
                            </a>
                        </div>

                        <div className="relative">
                            <div className="bg-gradient-to-br from-green-50 to-amber-50 rounded-3xl p-10 border border-green-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-green-200 rounded-full opacity-30 -mr-10 -mt-10" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-200 rounded-full opacity-40 -ml-8 -mb-8" />
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-green-700 rounded-2xl shadow-xl shadow-green-300/50 flex items-center justify-center mb-5">
                                        <Wifi size={36} className="text-white" />
                                    </div>
                                    <div className="pf-serif text-xl font-bold text-green-800 mb-1">Keychain NFC</div>
                                    <div className="text-xs text-green-600 font-medium mb-6">Teknologi 13.56 MHz</div>
                                    <div className="w-full space-y-3">
                                        {[
                                            { no: '1', text: 'Daftar di loket (gratis)' },
                                            { no: '2', text: 'Terima keychain NFC Anda' },
                                            { no: '3', text: 'Tap → langsung masuk & dapat diskon' },
                                        ].map(s => (
                                            <div key={s.no} className="flex items-center gap-3 bg-white/70 rounded-xl px-4 py-2.5 text-left">
                                                <div className="w-6 h-6 bg-green-700 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{s.no}</div>
                                                <span className="text-sm text-gray-700 font-medium">{s.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 bg-amber-400 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-2">
                                <Gift size={16} className="text-amber-900" />
                                <div>
                                    <div className="text-xs font-bold text-amber-900">Pendaftaran</div>
                                    <div className="text-sm font-black text-amber-900">100% GRATIS</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CARA DAFTAR ── */}
                <section id="cara-daftar" className="py-16 bg-green-800 relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-[0.06] pointer-events-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23fff'%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3Ccircle cx='0' cy='0' r='3'/%3E%3Ccircle cx='80' cy='0' r='3'/%3E%3Ccircle cx='0' cy='80' r='3'/%3E%3Ccircle cx='80' cy='80' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />
                    <div className="relative z-10 max-w-5xl mx-auto px-5">
                        <div className="text-center mb-12">
                            <p className="text-xs font-bold text-amber-300 tracking-widest uppercase mb-2">Mudah & Cepat</p>
                            <h2 className="pf-serif text-3xl font-bold text-white">Cara Daftar Member</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { no: '01', title: 'Datang ke Loket',  desc: 'Cari loket pendaftaran member di dekat pintu masuk area event.' },
                                { no: '02', title: 'Berikan Data Diri', desc: 'Cukup sebutkan nama lengkap dan nomor WhatsApp aktif Anda.' },
                                { no: '03', title: 'Terima Keychain',   desc: 'Petugas mendaftarkan keychain NFC Anda ke sistem dalam hitungan detik.' },
                                { no: '04', title: 'Langsung Nikmati', desc: 'Tap keychain di pintu masuk dan nikmati diskon di semua booth UMKM!' },
                            ].map((s, i) => (
                                <div key={i} className="bg-white/10 border border-white/15 rounded-2xl p-5 hover:bg-white/20 transition">
                                    <div className="pf-serif text-4xl font-bold text-white/20 mb-3 leading-none">{s.no}</div>
                                    <h3 className="font-bold text-white mb-2">{s.title}</h3>
                                    <p className="text-green-200 text-sm leading-relaxed">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── SOCIAL PROOF ── */}
                <section className="py-14 border-b border-stone-100">
                    <div className="max-w-5xl mx-auto px-5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            {[
                                { value: '500+',     label: 'Member Terdaftar' },
                                { value: '40+',      label: 'Booth UMKM' },
                                { value: 'Gratis',   label: 'Tiket Masuk' },
                                { value: '< 2 detik', label: 'Proses Tap NFC' },
                            ].map((s, i) => (
                                <div key={i}>
                                    <div className="pf-serif text-3xl md:text-4xl font-bold text-green-700 mb-1">{s.value}</div>
                                    <div className="text-sm text-gray-500 font-medium">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FAQ ── */}
                <section id="faq" className="py-20 max-w-3xl mx-auto px-5">
                    <div className="text-center mb-12">
                        <p className="text-xs font-bold text-green-600 tracking-widest uppercase mb-2">Pertanyaan Umum</p>
                        <h2 className="pf-serif text-3xl md:text-4xl font-bold text-gray-900">Ada yang Ingin Ditanyakan?</h2>
                    </div>
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm divide-y divide-stone-200 px-6">
                        {FAQ.map((item, i) => <FaqItem key={i} item={item} />)}
                    </div>
                </section>

                {/* ── KONTAK ── */}
                <section id="kontak" className="py-16 bg-stone-50 border-t border-stone-100">
                    <div className="max-w-5xl mx-auto px-5">
                        <div className="text-center mb-12">
                            <p className="text-xs font-bold text-green-600 tracking-widest uppercase mb-2">Hubungi Kami</p>
                            <h2 className="pf-serif text-3xl font-bold text-gray-900">Panitia Siap Membantu</h2>
                            <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
                                Punya pertanyaan lebih lanjut tentang event atau pendaftaran member? Jangan ragu untuk menghubungi kami.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
                            {[
                                { icon: MapPin, label: 'Lokasi Utama',     value: 'Alun-alun Purwokerto, Kab. Banyumas, Jawa Tengah' },
                                { icon: Phone,  label: 'WhatsApp Panitia', value: '+62 812-3456-7890' },
                                { icon: Mail,   label: 'Email',            value: 'panitia@pekenbanyumasan.id' },
                            ].map((c, i) => {
                                const Icon = c.icon;
                                return (
                                    <div key={i} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm text-center hover:shadow-md hover:border-green-200 transition">
                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <Icon size={20} className="text-green-700" />
                                        </div>
                                        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">{c.label}</div>
                                        <div className="text-gray-700 font-medium text-sm leading-relaxed">{c.value}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="bg-gray-900 text-gray-400 py-8">
                    <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-green-700 rounded-md flex items-center justify-center text-white font-bold text-sm">P</div>
                            <span>&copy; 2026 Panitia Pekan Banyumasan. Hak cipta dilindungi.</span>
                        </div>
                        <div className="flex items-center gap-5">
                            <Link to="/monitor" className="hover:text-white transition flex items-center gap-1.5 text-xs">
                                <Calendar size={13} /> Display Monitor
                            </Link>
                            <Link to="/login" className="hover:text-white transition flex items-center gap-1.5 text-xs">
                                <ShieldCheck size={13} /> Panel Admin
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Profile;
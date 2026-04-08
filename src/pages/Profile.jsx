import { useMemo } from "react";

const FAQ = [
  {
    q: "Apa itu Peken Banyumasan?",
    a: "Peken Banyumasan adalah ruang temu publik yang menghadirkan event budaya, tenant UMKM lokal, pengalaman member NFC, dan aktivitas promosi yang terhubung dalam satu ekosistem sistem.",
  },
  {
    q: "Apakah halaman ini khusus untuk UMKM saja?",
    a: "Tidak. Halaman ini diposisikan sebagai company profile umum Peken Banyumasan. Pelaku usaha dapat menggunakan jalur pendaftaran UMKM, sedangkan pengunjung dapat memahami ekosistem event dan manfaat member NFC.",
  },
  {
    q: "Bagaimana alur pendaftaran UMKM?",
    a: "Pelaku usaha mengisi formulir pendaftaran, mengunggah dokumen pendukung, memilih stand yang tersedia, lalu menunggu verifikasi admin Gate sebelum akun operasional digunakan.",
  },
  {
    q: "Apakah promo tenant bisa terhubung ke member NFC?",
    a: "Ya. Promo aktif dari tenant UMKM dapat terintegrasi ke benefit member NFC sehingga pengunjung memperoleh pengalaman yang lebih konsisten saat event berlangsung.",
  },
];

const HIGHLIGHTS = [
  {
    icon: "🎪",
    title: "Event & Aktivitas Publik",
    desc: "Identitas Peken Banyumasan ditampilkan sebagai event publik yang rapi, jelas, dan mudah dipahami pengunjung.",
  },
  {
    icon: "🏪",
    title: "Pendaftaran UMKM",
    desc: "Jalur pendaftaran usaha dibuat sebagai pintu masuk resmi untuk tenant yang ingin bergabung di ekosistem event.",
  },
  {
    icon: "📡",
    title: "Member NFC",
    desc: "Teknologi NFC mendukung pencatatan kunjungan dan dapat dikaitkan dengan benefit promosi tenant saat event berjalan.",
  },
  {
    icon: "🔗",
    title: "Integrasi Gate + UMKM",
    desc: "Data tenant, promo, dan operasional bergerak dalam ekosistem yang saling terhubung tanpa membuat tampilan publik terasa teknis.",
  },
];

function FaqItem({ item }) {
  const id = item.q.replace(/\s+/g, "-").toLowerCase();
  return (
    <details className="pp-faq-item">
      <summary className="pp-faq-btn" id={id}>
        <span>{item.q}</span>
        <span className="pp-faq-chevron">⌄</span>
      </summary>
      <p className="pp-faq-body">{item.a}</p>
    </details>
  );
}

const jumpTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const openRegister = () => {
  const target = import.meta.env.VITE_UMKM_PUBLIC_URL || "/daftar-umkm";
  window.location.href = target;
};

export default function CompanyProfile() {
  const todayLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date());
    } catch {
      return "Peken Banyumas";
    }
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box}
        body{margin:0;font-family:'Plus Jakarta Sans',sans-serif;background:#fff;color:#1f2937}
        .pp-root{min-height:100vh;background:#fff}
        .pp-serif{font-family:'Lora',serif}
        .pp-nav{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.94);backdrop-filter:blur(10px);border-bottom:1px solid #f0f0f0}
        .pp-nav-inner,.pp-section,.pp-hero{max-width:1120px;margin:0 auto;padding:0 24px}
        .pp-nav-inner{height:68px;display:flex;align-items:center;justify-content:space-between;gap:16px}
        .pp-brand{display:flex;align-items:center;gap:12px;font-weight:700;color:#111827}
        .pp-brand-mark{width:40px;height:40px;border-radius:12px;background:#166534;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;box-shadow:0 10px 24px rgba(22,101,52,.18)}
        .pp-nav-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .pp-link-btn,.pp-primary-btn,.pp-secondary-btn{border:none;border-radius:14px;padding:12px 18px;font-weight:700;cursor:pointer;transition:.2s;font-family:'Plus Jakarta Sans',sans-serif}
        .pp-link-btn{background:transparent;color:#4b5563;padding:8px 12px}
        .pp-link-btn:hover{background:#f3f4f6;color:#166534}
        .pp-primary-btn{background:#166534;color:#fff;box-shadow:0 12px 24px rgba(22,101,52,.18)}
        .pp-primary-btn:hover{transform:translateY(-1px);background:#14532d}
        .pp-secondary-btn{background:#fff;color:#166534;border:1.5px solid #166534}
        .pp-secondary-btn:hover{background:#f0fdf4}
        .pp-hero-wrap{background:linear-gradient(135deg,#166534 0%,#14532d 42%,#052e16 100%);overflow:hidden;position:relative}
        .pp-hero-wrap:before{content:'';position:absolute;inset:-120px auto auto -120px;width:320px;height:320px;border-radius:999px;background:rgba(251,191,36,.12);filter:blur(30px)}
        .pp-hero-wrap:after{content:'';position:absolute;right:-100px;bottom:-120px;width:340px;height:340px;border-radius:999px;background:rgba(34,197,94,.14);filter:blur(30px)}
        .pp-hero{display:grid;grid-template-columns:1.15fr .85fr;gap:36px;align-items:center;padding-top:84px;padding-bottom:88px;position:relative;z-index:1}
        .pp-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.28);color:#fde68a;border-radius:999px;padding:8px 14px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:18px}
        .pp-hero-title{font-size:50px;line-height:1.12;color:#fff;margin:0 0 16px}
        .pp-hero-title span{color:#fde68a}
        .pp-hero-sub{font-size:16px;line-height:1.75;color:#d1fae5;max-width:640px;margin:0 0 28px}
        .pp-hero-actions{display:flex;flex-wrap:wrap;gap:12px}
        .pp-side-grid{display:grid;gap:16px}
        .pp-side-card{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:24px;padding:22px;color:#fff;backdrop-filter:blur(10px)}
        .pp-side-card.light{background:#fff;color:#111827;border-color:#eef2f7;box-shadow:0 18px 40px rgba(15,23,42,.08)}
        .pp-mini-label{font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#bbf7d0}
        .pp-side-card.light .pp-mini-label{color:#6b7280}
        .pp-big{font-size:30px;font-weight:800;margin-top:8px;line-height:1.15}
        .pp-muted{font-size:14px;line-height:1.7;color:#d1fae5;margin-top:8px}
        .pp-side-card.light .pp-muted{color:#6b7280}
        .pp-mini-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
        .pp-section{padding:72px 24px}
        .pp-title{font-size:34px;line-height:1.2;color:#111827;margin:0 0 12px}
        .pp-subtitle{color:#6b7280;line-height:1.8;max-width:760px;margin:0}
        .pp-highlights{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:30px}
        .pp-highlight{border:1px solid #eef2f7;border-radius:22px;padding:22px;background:#fff;box-shadow:0 10px 30px rgba(15,23,42,.04)}
        .pp-highlight-icon{width:46px;height:46px;border-radius:16px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:14px}
        .pp-highlight h3{margin:0 0 8px;font-size:18px;color:#111827}
        .pp-highlight p{margin:0;color:#6b7280;line-height:1.7;font-size:14px}
        .pp-strip{background:#f8fafc;border-top:1px solid #eef2f7;border-bottom:1px solid #eef2f7}
        .pp-points{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:30px}
        .pp-point{background:#fff;border:1px solid #e5e7eb;border-radius:24px;padding:24px;box-shadow:0 12px 30px rgba(15,23,42,.05)}
        .pp-point-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:#f0fdf4;color:#166534;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;width:max-content}
        .pp-point-title{font-size:20px;margin:14px 0 8px;color:#111827}
        .pp-point-desc{margin:0;color:#6b7280;line-height:1.7;font-size:14px}
        .pp-cta-box{margin-top:18px;display:flex;justify-content:flex-start}
        .pp-faq-wrap{max-width:860px;margin-top:30px}
        .pp-faq-item{border-bottom:1px solid #eef2f7}
        .pp-faq-btn{list-style:none;width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 0;background:none;border:none;text-align:left;font-size:15px;font-weight:700;color:#111827;cursor:pointer}
        .pp-faq-btn::-webkit-details-marker{display:none}
        .pp-faq-chevron{font-size:18px;color:#9ca3af;transition:transform .2s}
        .pp-faq-item[open] .pp-faq-chevron{transform:rotate(180deg)}
        .pp-faq-body{margin:0 0 18px;color:#6b7280;line-height:1.8;font-size:14px}
        .pp-footer{padding:24px;color:#6b7280;text-align:center;border-top:1px solid #f3f4f6;font-size:13px}
        @media (max-width: 960px){
          .pp-hero{grid-template-columns:1fr;gap:28px;padding-top:64px;padding-bottom:72px}
          .pp-mini-grid,.pp-highlights,.pp-points{grid-template-columns:1fr}
          .pp-hero-title{font-size:40px}
        }
        @media (max-width: 640px){
          .pp-nav-inner,.pp-section,.pp-hero{padding-left:18px;padding-right:18px}
          .pp-nav-actions .pp-link-btn{display:none}
          .pp-hero-title{font-size:32px}
          .pp-primary-btn,.pp-secondary-btn{width:100%;justify-content:center}
        }
      `}</style>

      <div className="pp-root">
        <div className="pp-nav">
          <div className="pp-nav-inner">
            <div className="pp-brand">
              <div className="pp-brand-mark">P</div>
              <div>
                <div>Peken Banyumas</div>
                <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Company Profile</div>
              </div>
            </div>
            <div className="pp-nav-actions">
              <button className="pp-link-btn" onClick={() => jumpTo("tentang")}>Tentang</button>
              <button className="pp-link-btn" onClick={() => jumpTo("fitur")}>Fitur</button>
              <button className="pp-link-btn" onClick={() => jumpTo("faq")}>FAQ</button>
              <button className="pp-primary-btn" onClick={openRegister}>Daftar UMKM</button>
            </div>
          </div>
        </div>

        <section className="pp-hero-wrap">
          <div className="pp-hero">
            <div>
              <div className="pp-eyebrow">Portal Publik Peken Banyumasan</div>
              <h1 className="pp-serif pp-hero-title">
                Profil umum untuk <span>Peken Banyumasan</span>, bukan halaman dashboard.
              </h1>
              <p className="pp-hero-sub">
                Halaman ini disederhanakan sebagai wajah publik Peken Banyumasan. Fokusnya menjelaskan identitas event,
                integrasi Gate dan UMKM, manfaat member NFC, serta menyediakan satu jalur aksi yang jelas untuk
                pendaftaran tenant UMKM.
              </p>
              <div className="pp-hero-actions">
                <button className="pp-primary-btn" onClick={openRegister}>Daftar UMKM</button>
                <button className="pp-secondary-btn" onClick={() => jumpTo("fitur")}>Lihat Ekosistem</button>
              </div>
            </div>

            <div className="pp-side-grid">
              <div className="pp-side-card">
                <div className="pp-mini-label">Hari Ini</div>
                <div className="pp-big">{todayLabel}</div>
                <div className="pp-muted">Informasi publik ditata agar rapi dan tidak saling bertumpuk seperti versi sebelumnya.</div>
              </div>
              <div className="pp-mini-grid">
                <div className="pp-side-card light">
                  <div className="pp-mini-label">Identitas</div>
                  <div className="pp-big" style={{ fontSize: 26 }}>Publik & Umum</div>
                  <div className="pp-muted">Tidak menampilkan jalur login dashboard pada company profile.</div>
                </div>
                <div className="pp-side-card light">
                  <div className="pp-mini-label">Integrasi</div>
                  <div className="pp-big" style={{ fontSize: 26 }}>Gate + UMKM</div>
                  <div className="pp-muted">Ekosistem event, tenant, promo, dan member NFC tetap terhubung.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pp-section" id="tentang">
          <h2 className="pp-serif pp-title">Satu profil untuk keseluruhan Peken Banyumasan</h2>
          <p className="pp-subtitle">
            Company profile ini diposisikan sebagai halaman publik utama. Jalur yang terasa janggal seperti masuk ke dashboard
            atau melihat status pendaftaran dari halaman profil sengaja dihilangkan agar konteks halaman tetap bersih dan tepat.
          </p>
        </section>

        <section className="pp-section" id="fitur">
          <h2 className="pp-serif pp-title">Elemen inti ekosistem</h2>
          <p className="pp-subtitle">
            Isi halaman difokuskan pada hal-hal yang memang relevan untuk publik dan calon tenant, tanpa menumpuk kartu informasi yang saling bertabrakan.
          </p>
          <div className="pp-highlights">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="pp-highlight">
                <div className="pp-highlight-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pp-section pp-strip">
          <h2 className="pp-serif pp-title">Apa yang dilakukan halaman ini</h2>
          <p className="pp-subtitle">
            Halaman publik cukup memberi arah, bukan menjadi tempat menjalankan semua alur internal sekaligus.
          </p>
          <div className="pp-points">
            <div className="pp-point">
              <div className="pp-point-badge">Untuk Publik</div>
              <h3 className="pp-point-title">Menjelaskan identitas event</h3>
              <p className="pp-point-desc">Pengunjung memahami bahwa Peken Banyumasan adalah event publik yang menghubungkan aktivitas budaya, tenant, dan pengalaman digital.</p>
            </div>
            <div className="pp-point">
              <div className="pp-point-badge">Untuk Tenant</div>
              <h3 className="pp-point-title">Memberi satu jalur aksi</h3>
              <p className="pp-point-desc">Pelaku usaha diarahkan langsung ke formulir pendaftaran UMKM tanpa dibingungkan tombol dashboard atau status yang kurang tepat konteksnya.</p>
              <div className="pp-cta-box">
                <button className="pp-primary-btn" onClick={openRegister}>Daftar UMKM</button>
              </div>
            </div>
            <div className="pp-point">
              <div className="pp-point-badge">Untuk Sistem</div>
              <h3 className="pp-point-title">Menjaga narasi tetap konsisten</h3>
              <p className="pp-point-desc">Gate dan UMKM tetap terhubung di balik layar, tetapi tampilan publik dijaga tetap sederhana, jelas, dan profesional.</p>
            </div>
          </div>
        </section>

        <section className="pp-section" id="faq">
          <h2 className="pp-serif pp-title">Pertanyaan yang sering muncul</h2>
          <p className="pp-subtitle">Ringkasan ini membantu pengunjung dan calon tenant memahami fungsi halaman tanpa banyak kebingungan.</p>
          <div className="pp-faq-wrap">
            {FAQ.map((item) => <FaqItem key={item.q} item={item} />)}
          </div>
        </section>

        <div className="pp-footer">
          Peken Banyumas · Company profile publik yang diselaraskan untuk ekosistem Gate, tenant UMKM, dan member NFC.
        </div>
      </div>
    </>
  );
}

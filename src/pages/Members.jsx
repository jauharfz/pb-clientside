// Members.jsx — Kelola Kreator dengan tab drawer (Info, Event, Portofolio, Story)
import React, { useState, useEffect } from 'react';
import {
  Search, CheckCircle, XCircle, UserCheck, Users, MapPin, Eye,
  Mail, X, Plus, Trash2, Calendar, Loader2, Image, BookOpen, Star, StarOff
} from 'lucide-react';
import { useToast } from '../components/Toast';

const SUBSEKTORS = ['Semua','Kriya','Fashion','Musik','Seni Pertunjukan','Fotografi','Kuliner','Desain Produk','Seni Rupa','Film & Animasi'];

const DUMMY_MEMBERS = [
  { id:'m1', nama:'Sari Dewi Rahayu',  email:'sari@email.com', kota:'Banyumas',     subsektor:['Kriya','Fashion'],            status:'aktif',    tanggal_daftar:'2024-03-15', total_karya:18, bio:'Pengrajin batik tulis Banyumas dengan fokus motif lokal.' },
  { id:'m2', nama:'Ahmad Fauzi',        email:'ahmad@email.com', kota:'Purwokerto',  subsektor:['Musik','Seni Pertunjukan'],    status:'aktif',    tanggal_daftar:'2024-04-02', total_karya:12, bio:'Musisi tradisional dan penggiat kesenian calung Banyumas.' },
  { id:'m3', nama:'Rizky Pramesti',     email:'rizky@email.com', kota:'Banyumas',    subsektor:['Fotografi'],                  status:'pending',  tanggal_daftar:'2025-04-08', total_karya:0,  bio:'Fotografer dokumentasi budaya dan event lokal.' },
  { id:'m4', nama:'Nurul Hidayah',      email:'nurul@email.com', kota:'Cilacap',     subsektor:['Kuliner'],                    status:'aktif',    tanggal_daftar:'2024-05-10', total_karya:5,  bio:'Pengembang kuliner tradisional berbasis bahan lokal Banyumas.' },
  { id:'m5', nama:'Dimas Arya',         email:'dimas@email.com', kota:'Purbalingga', subsektor:['Desain Produk','Kriya'],      status:'pending',  tanggal_daftar:'2025-04-09', total_karya:0,  bio:'Desainer produk kriya berbahan dasar bambu dan rotan.' },
  { id:'m6', nama:'Laras Wulandari',    email:'laras@email.com', kota:'Banyumas',    subsektor:['Seni Rupa'],                  status:'suspended',tanggal_daftar:'2024-02-01', total_karya:8,  bio:'Pelukis dengan medium cat air berbasis motif wayang.' },
  { id:'m7', nama:'Budi Santoso',       email:'budi@email.com',  kota:'Purwokerto',  subsektor:['Film & Animasi'],             status:'aktif',    tanggal_daftar:'2024-06-20', total_karya:3,  bio:'Sineas dokumenter budaya lokal Banyumas.' },
];

const DUMMY_MEMBER_EVENTS = {
  m1: [
    { id:'em1', event_id:'e1', nama:'Festival Budaya Banyumasan 2025', tanggal:'2025-05-17', jam_mulai:'08:00', jam_selesai:'22:00', peran:'performer', status_kehadiran:'terdaftar' },
    { id:'em2', event_id:'e4', nama:'Peken Banyumasan #12', tanggal:'2025-03-20', jam_mulai:'16:00', jam_selesai:'22:00', peran:'performer', status_kehadiran:'hadir' },
  ],
  m2: [
    { id:'em3', event_id:'e1', nama:'Festival Budaya Banyumasan 2025', tanggal:'2025-05-17', jam_mulai:'08:00', jam_selesai:'22:00', peran:'performer', status_kehadiran:'terdaftar' },
    { id:'em4', event_id:'e4', nama:'Peken Banyumasan #12', tanggal:'2025-03-20', jam_mulai:'16:00', jam_selesai:'22:00', peran:'performer', status_kehadiran:'hadir' },
  ],
  m4: [{ id:'em5', event_id:'e2', nama:'Workshop Batik & Tenun Nusantara', tanggal:'2025-04-26', jam_mulai:'09:00', jam_selesai:'17:00', peran:'peserta', status_kehadiran:'terdaftar' }],
};

const DUMMY_MEMBER_PORTO = {
  m1: [
    { id:'p1', judul:'Batik Sekar Jagad Kontemporer', kategori:'Kriya', tahun:2024, is_featured:true },
    { id:'p2', judul:'Koleksi Tenun Banyumas Vol.3', kategori:'Fashion', tahun:2024, is_featured:false },
    { id:'p3', judul:'Instalasi Bambu Gedek', kategori:'Kriya', tahun:2023, is_featured:false },
  ],
  m2: [
    { id:'p4', judul:'Album Calung Kontemporer', kategori:'Musik', tahun:2024, is_featured:true },
  ],
};

const DUMMY_MEMBER_STORY = {
  m1: [
    { id:'s1', konten:'Proses pembuatan batik tulis hari ini...', created_at:'2025-04-10', like_count:34, status:'aktif' },
    { id:'s2', konten:'Workshop batik shibori bersama siswa SMA!', created_at:'2025-04-07', like_count:61, status:'aktif' },
  ],
  m2: [
    { id:'s3', konten:'Latihan calung untuk festival minggu depan...', created_at:'2025-04-09', like_count:22, status:'aktif' },
  ],
};

const DUMMY_ALL_EVENTS = [
  { id:'e1', nama:'Festival Budaya Banyumasan 2025',   status:'published' },
  { id:'e2', nama:'Workshop Batik & Tenun Nusantara',  status:'published' },
  { id:'e3', nama:'Pameran Kriya Ekraf Regional',       status:'draft'     },
  { id:'e4', nama:'Peken Banyumasan #12',               status:'selesai'   },
];

const STATUS_MAP = {
  aktif:    { label:'Aktif',   cls:'bg-green-50 text-green-700 border-green-200',  dot:'bg-green-500' },
  pending:  { label:'Pending', cls:'bg-amber-50 text-amber-700 border-amber-200',  dot:'bg-amber-400' },
  suspended:{ label:'Suspend', cls:'bg-red-50 text-red-600 border-red-200',        dot:'bg-red-400' },
};
const PERAN_CLS = {
  peserta:'bg-indigo-50 text-indigo-600', performer:'bg-purple-50 text-purple-700', panitia:'bg-orange-50 text-orange-600',
};

function useDebounce(v, d=300) {
  const [dv, setDv] = useState(v);
  useEffect(() => { const t=setTimeout(()=>setDv(v),d); return()=>clearTimeout(t); },[v,d]);
  return dv;
}

// ── AssignEventModal ─────────────────────────────────────────────────────────
function AssignEventModal({ memberId, existingIds, onClose, onAssign }) {
  const [selected, setSelected] = useState(null);
  const [peran, setPeran] = useState('peserta');
  const [saving, setSaving] = useState(false);
  const available = DUMMY_ALL_EVENTS.filter(e =>
    ['published','berlangsung'].includes(e.status) && !existingIds.includes(e.id));

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    onAssign({ id:'em'+Date.now(), event_id:selected.id, nama:selected.nama, tanggal:new Date().toISOString().split('T')[0], peran, status_kehadiran:'terdaftar' });
    setSaving(false); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b"><h3 className="font-bold text-gray-800">Assign ke Event</h3><button onClick={onClose}><X size={18} className="text-gray-400"/></button></div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {available.length === 0
              ? <p className="text-gray-400 text-sm text-center py-4">Tidak ada event tersedia</p>
              : available.map(e => (
                <button key={e.id} onClick={() => setSelected(e)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition ${selected?.id===e.id?'border-green-400 bg-green-50':'border-gray-100 hover:border-gray-300'}`}>
                  {e.nama}
                </button>
              ))
            }
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Peran</label>
            <div className="flex gap-2">
              {['peserta','performer','panitia'].map(p => (
                <button key={p} onClick={() => setPeran(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border capitalize transition ${peran===p?'bg-green-700 text-white border-green-700':'border-gray-200 text-gray-600'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-semibold">Batal</button>
            <button onClick={save} disabled={!selected||saving}
              className="flex-1 bg-green-700 text-white py-2 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1">
              {saving?<Loader2 size={13} className="animate-spin"/>:<Plus size={13}/>} Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MemberRow ─────────────────────────────────────────────────────────────────
const MemberRow = React.memo(({ m, onApprove, onSuspend, onDetail, onDelete, isProcessing }) => {
  const st = STATUS_MAP[m.status] || STATUS_MAP.aktif;
  const fmt = d => new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition group">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-800 font-bold text-sm shrink-0">{m.nama.charAt(0)}</div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{m.nama}</p>
            <p className="text-gray-400 text-xs flex items-center gap-1"><Mail size={10}/>{m.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1 text-gray-500 text-xs"><MapPin size={11}/>{m.kota}</div>
        <div className="flex flex-wrap gap-1 mt-1">
          {m.subsektor.slice(0,2).map(s => <span key={s} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-medium">{s}</span>)}
          {m.subsektor.length>2 && <span className="text-gray-400 text-[10px]">+{m.subsektor.length-2}</span>}
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${st.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`}/>{st.label}
        </span>
      </td>
      <td className="px-4 py-3.5 text-gray-500 text-sm">{m.total_karya}</td>
      <td className="px-4 py-3.5 text-gray-400 text-xs">{fmt(m.tanggal_daftar)}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
          <button onClick={() => onDetail(m)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition" title="Detail"><Eye size={14}/></button>
          {m.status === 'pending'   && <button onClick={() => onApprove(m.id)} disabled={isProcessing===m.id} className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition" title="Setujui"><CheckCircle size={14}/></button>}
          {m.status === 'aktif'     && <button onClick={() => onSuspend(m.id)} disabled={isProcessing===m.id} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition" title="Suspend"><XCircle size={14}/></button>}
          {m.status === 'suspended' && (
            <>
              <button onClick={() => onApprove(m.id)} disabled={isProcessing===m.id} className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition" title="Aktifkan"><UserCheck size={14}/></button>
              <button onClick={() => onDelete(m.id)} disabled={isProcessing===m.id} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Hapus Akun"><Trash2 size={14}/></button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
});

// ── DetailDrawer ─────────────────────────────────────────────────────────────
const DetailDrawer = ({ member, onClose, onApprove, onSuspend }) => {
  const [tab, setTab] = useState('info');
  const [memberEvents, setMemberEvents] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [stories, setStories] = useState([]);
  const [showAssignEvent, setShowAssignEvent] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!member) return;
    setMemberEvents(DUMMY_MEMBER_EVENTS[member.id] || []);
    setPortfolio(DUMMY_MEMBER_PORTO[member.id] || []);
    setStories(DUMMY_MEMBER_STORY[member.id] || []);
    setTab('info');
  }, [member?.id]);

  if (!member) return null;
  const st = STATUS_MAP[member.status];

  const removeEvent = (emId) => {
    setMemberEvents(l => l.filter(e => e.id !== emId));
    toast.success('Member dihapus dari event');
  };

  const toggleFeatured = (pid) => {
    setPortfolio(l => l.map(p => p.id===pid ? {...p, is_featured:!p.is_featured} : p));
    toast.success('Status featured diperbarui');
  };

  const deleteStory = (sid) => {
    if (!confirm('Hapus story ini?')) return;
    setStories(l => l.filter(s => s.id !== sid));
    toast.success('Story dihapus');
  };

  const fmtTgl = d => new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
  const TABS = [['info','Info'],['event','Event'],['portofolio','Porto'],['story','Story']];

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-40" onClick={onClose}/>
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col" style={{animation:'slideIn .26s cubic-bezier(.32,.72,0,1) both'}}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-800 font-bold text-base shrink-0">{member.nama.charAt(0)}</div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">{member.nama}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${st.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>{st.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 transition"><X size={18}/></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          {TABS.map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`flex-1 py-2.5 text-xs font-semibold transition border-b-2 ${tab===v?'border-green-600 text-green-700':'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* TAB: Info */}
          {tab === 'info' && (
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600"><Mail size={13}/>{member.email}</div>
                <div className="flex items-center gap-2 text-gray-600"><MapPin size={13}/>{member.kota}</div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Subsektor</p>
                <div className="flex flex-wrap gap-2">
                  {member.subsektor.map(s => <span key={s} className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-medium">{s}</span>)}
                </div>
              </div>
              {member.bio && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bio</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-amber-700">{member.total_karya}</p>
                  <p className="text-amber-600 text-xs mt-0.5">Total Karya</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-indigo-500 font-medium">Terdaftar</p>
                  <p className="text-indigo-700 text-xs mt-1">{new Date(member.tanggal_daftar).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Event */}
          {tab === 'event' && (
            <div>
              <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
                <p className="text-sm text-gray-500">{memberEvents.length} event</p>
                <button onClick={() => setShowAssignEvent(true)}
                  className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition">
                  <Plus size={12}/> Assign Event
                </button>
              </div>
              {memberEvents.length === 0
                ? <div className="py-12 text-center text-gray-400 text-sm"><Calendar size={28} className="text-gray-200 mx-auto mb-2"/>Belum ada event</div>
                : <div className="divide-y divide-gray-50">
                    {memberEvents.map(e => (
                      <div key={e.id} className="px-5 py-3 flex items-start gap-3 group hover:bg-gray-50/50 transition">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm leading-snug">{e.nama}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{fmtTgl(e.tanggal)}{e.jam_mulai && <span className="ml-1 text-gray-300">· {e.jam_mulai.replace(':','.')}{e.jam_selesai?`–${e.jam_selesai.replace(':','.')}`:''} WIB</span>}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {/* Editable peran */}
                            <select
                              value={e.peran}
                              onChange={ev => setMemberEvents(l => l.map(x => x.id===e.id ? {...x,peran:ev.target.value} : x))}
                              className="text-[10px] border border-gray-200 rounded-lg px-1.5 py-1 focus:outline-none focus:border-green-400 bg-white"
                            >
                              <option value="peserta">Peserta</option>
                              <option value="performer">Performer</option>
                              <option value="panitia">Panitia</option>
                            </select>
                            {/* Editable kehadiran */}
                            <select
                              value={e.status_kehadiran}
                              onChange={ev => setMemberEvents(l => l.map(x => x.id===e.id ? {...x,status_kehadiran:ev.target.value} : x))}
                              className={`text-[10px] border border-gray-200 rounded-lg px-1.5 py-1 focus:outline-none focus:border-green-400 bg-white ${e.status_kehadiran==='hadir'?'text-green-600':e.status_kehadiran==='tidak_hadir'?'text-red-500':'text-gray-400'}`}
                            >
                              <option value="terdaftar">Terdaftar</option>
                              <option value="hadir">Hadir ✓</option>
                              <option value="tidak_hadir">Tidak Hadir</option>
                            </select>
                          </div>
                        </div>
                        <button onClick={() => removeEvent(e.id)} className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50">
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* TAB: Portofolio */}
          {tab === 'portofolio' && (
            <div className="p-5">
              {portfolio.length === 0
                ? <div className="py-12 text-center text-gray-400 text-sm"><Image size={28} className="text-gray-200 mx-auto mb-2"/>Belum ada portofolio</div>
                : <div className="space-y-2.5">
                    {portfolio.map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                          <Image size={16}/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm">{p.judul}</p>
                          <p className="text-gray-400 text-xs">{p.kategori} · {p.tahun}</p>
                        </div>
                        <button onClick={() => toggleFeatured(p.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${p.is_featured?'bg-yellow-50 text-yellow-600 border border-yellow-200':'bg-gray-100 text-gray-400 border border-gray-200 hover:border-yellow-300'}`}>
                          {p.is_featured ? <><Star size={11} fill="currentColor"/>Featured</> : <><StarOff size={11}/>Feature</>}
                        </button>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* TAB: Story */}
          {tab === 'story' && (
            <div className="p-5 space-y-3">
              {stories.length === 0
                ? <div className="py-12 text-center text-gray-400 text-sm"><BookOpen size={28} className="text-gray-200 mx-auto mb-2"/>Belum ada story</div>
                : stories.map(s => (
                    <div key={s.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 group">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-gray-700 text-sm leading-relaxed flex-1">{s.konten}</p>
                        <button onClick={() => deleteStory(s.id)} className="opacity-0 group-hover:opacity-100 transition text-gray-300 hover:text-red-500 p-1">
                          <Trash2 size={13}/>
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>{new Date(s.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'short'})}</span>
                        <span>👏 {s.like_count}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${s.status==='aktif'?'text-green-600':'text-red-500'}`}>{s.status}</span>
                      </div>
                    </div>
                  ))
              }
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-100 shrink-0 flex gap-2.5">
          {member.status === 'pending'   && <button onClick={() => { onApprove(member.id); onClose(); }} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-semibold text-sm transition"><CheckCircle size={15}/> Setujui</button>}
          {member.status === 'aktif'     && <button onClick={() => { onSuspend(member.id); onClose(); }} className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-500 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-50 transition"><XCircle size={15}/> Suspend</button>}
          {member.status === 'suspended' && <button onClick={() => { onApprove(member.id); onClose(); }} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-semibold text-sm transition"><UserCheck size={15}/> Aktifkan</button>}
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition">Tutup</button>
        </div>

        {showAssignEvent && (
          <AssignEventModal
            memberId={member.id}
            existingIds={memberEvents.map(e => e.event_id)}
            onClose={() => setShowAssignEvent(false)}
            onAssign={(ev) => { setMemberEvents(l => [...l, ev]); toast.success('Berhasil di-assign ke event'); }}
          />
        )}
      </div>
    </>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Members() {
  const toast = useToast();
  const [members, setMembers] = useState(DUMMY_MEMBERS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [filterSub, setFilterSub] = useState('Semua');
  const [filterEvent, setFilterEvent] = useState('semua');
  const [sortBy, setSortBy] = useState('newest');
  const [detail, setDetail] = useState(null);
  const [processing, setProcessing] = useState(null);
  const dSearch = useDebounce(search);

  const approve = async (id) => {
    setProcessing(id);
    await new Promise(r=>setTimeout(r,600));
    const m = members.find(x=>x.id===id);
    setMembers(l => l.map(m => m.id===id ? {...m,status:'aktif'} : m));
    toast.success('Kreator berhasil disetujui');
    // Auto-notify member
    try {
      const { triggerMemberApproved } = await import('../lib/notifications');
      if (m) triggerMemberApproved(m.nama);
    } catch {}
    setProcessing(null);
  };
  const suspend = async (id) => {
    setProcessing(id);
    await new Promise(r=>setTimeout(r,600));
    setMembers(l => l.map(m => m.id===id ? {...m,status:'suspended'} : m));
    toast.error('Akun disuspend');
    setProcessing(null);
  };

  const deleteMember = async (id) => {
    if (!confirm('Hapus akun ini secara permanen? Data akan diarsipkan dan tidak bisa dipulihkan.')) return;
    setProcessing(id);
    await new Promise(r=>setTimeout(r,500));
    setMembers(l => l.map(m => m.id===id ? {...m, status:'deleted'} : m));
    toast.error('Akun dihapus (diarsipkan)');
    setProcessing(null);
  };

  const memberIdsInEvent = (eventId) => {
    return Object.entries(DUMMY_MEMBER_EVENTS)
      .filter(([, evs]) => evs.some(e => e.event_id === eventId))
      .map(([mid]) => mid);
  };

  // Count events per member
  const eventCount = (id) => (DUMMY_MEMBER_EVENTS[id] || []).length;

  const SORT_FNS = {
    newest:      (a,b) => new Date(b.tanggal_daftar) - new Date(a.tanggal_daftar),
    oldest:      (a,b) => new Date(a.tanggal_daftar) - new Date(b.tanggal_daftar),
    name_asc:    (a,b) => a.nama.localeCompare(b.nama),
    name_desc:   (a,b) => b.nama.localeCompare(a.nama),
    most_events: (a,b) => eventCount(b.id) - eventCount(a.id),
    least_events:(a,b) => eventCount(a.id) - eventCount(b.id),
    most_works:  (a,b) => (b.total_karya||0) - (a.total_karya||0),
  };

  const filtered = members
    .filter(m => m.status !== 'deleted')  // exclude soft-deleted from main list
    .filter(m => {
      const matchQ = !dSearch || m.nama.toLowerCase().includes(dSearch.toLowerCase()) || m.email.toLowerCase().includes(dSearch.toLowerCase());
      const matchS = filterStatus==='semua' || m.status===filterStatus;
      const matchSub = filterSub==='Semua' || m.subsektor.includes(filterSub);
      const matchEv = filterEvent==='semua' || memberIdsInEvent(filterEvent).includes(m.id);
      return matchQ && matchS && matchSub && matchEv;
    })
    .sort(SORT_FNS[sortBy] || SORT_FNS.newest);

  const active = members.filter(m=>m.status!=='deleted');
  const counts = {
    semua:     active.length,
    aktif:     active.filter(m=>m.status==='aktif').length,
    pending:   active.filter(m=>m.status==='pending').length,
    suspended: active.filter(m=>m.status==='suspended').length,
  };

  return (
    <div className="space-y-5">
      <style>{`.animate-in{animation:slideIn .26s cubic-bezier(.32,.72,0,1) both}@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[['Total PK',counts.semua,'bg-indigo-600'],['Aktif',counts.aktif,'bg-green-600'],['Pending',counts.pending,'bg-amber-500'],['Suspend',counts.suspended,'bg-red-500']].map(([l,v,c]) => (
          <div key={l} className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-gray-800">{v}</p>
            <div className="flex items-center gap-2 mt-1"><div className={`w-2 h-2 rounded-full ${c}`}/><p className="text-gray-500 text-xs">{l}</p></div>
          </div>
        ))}
      </div>

      {/* Toolbar — industry standard: search + filter row + sort row */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

        {/* Row 1: Search */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-50">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama atau email..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition"/>
          </div>
        </div>

        {/* Row 2: Filters (labeled) */}
        <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3 flex-wrap">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Filter:</span>

          {/* Status chips */}
          <div className="flex gap-1.5 flex-wrap">
            {['semua','aktif','pending','suspended'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border
                  ${filterStatus===s
                    ? s==='aktif' ? 'bg-green-600 text-white border-green-600'
                    : s==='pending' ? 'bg-amber-500 text-white border-amber-500'
                    : s==='suspended' ? 'bg-red-500 text-white border-red-500'
                    : 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                {s === 'semua' ? 'Semua' : STATUS_MAP[s]?.label || s}
                {s !== 'semua' && counts[s] > 0 && (
                  <span className="ml-1.5 opacity-75">({counts[s]})</span>
                )}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-gray-200 shrink-0"/>

          {/* Subsektor filter */}
          <select value={filterSub} onChange={e=>setFilterSub(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 bg-gray-50 focus:outline-none focus:border-indigo-400 transition">
            {SUBSEKTORS.map(s => <option key={s}>{s}</option>)}
          </select>

          {/* Event filter */}
          <select value={filterEvent} onChange={e=>setFilterEvent(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 bg-gray-50 focus:outline-none focus:border-indigo-400 transition">
            <option value="semua">Semua Event</option>
            {DUMMY_ALL_EVENTS.map(e => <option key={e.id} value={e.id}>{e.nama}</option>)}
          </select>
        </div>

        {/* Row 3: Sort (labeled, right-aligned) */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {filtered.length} dari {members.filter(m=>m.status!=='deleted').length} anggota
            {filterEvent !== 'semua' && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-semibold">
                🎪 {DUMMY_ALL_EVENTS.find(e=>e.id===filterEvent)?.nama?.slice(0,20)}
                <button onClick={()=>setFilterEvent('semua')} className="hover:text-red-500 ml-0.5">×</button>
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Urutkan:</span>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 bg-gray-50 focus:outline-none focus:border-indigo-400 transition">
              <option value="newest">Terbaru Daftar</option>
              <option value="oldest">Terlama Daftar</option>
              <option value="name_asc">Nama A–Z</option>
              <option value="name_desc">Nama Z–A</option>
              <option value="most_events">Terbanyak Event</option>
              <option value="least_events">Tersedikit Event</option>
              <option value="most_works">Terbanyak Karya</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              {['Kreator','Subsektor / Kota','Status','Karya','Terdaftar','Aksi'].map(h => (
                <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">Tidak ada hasil</td></tr>
              : filtered.map(m => <MemberRow key={m.id} m={m} onApprove={approve} onSuspend={suspend} onDetail={setDetail} onDelete={deleteMember} isProcessing={processing}/>)
            }
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400 flex items-center justify-between">
          <span>Menampilkan {filtered.length} dari {members.length} Kreator</span>
          {filterEvent !== 'semua' && (
            <span className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-medium">
              🎪 {DUMMY_ALL_EVENTS.find(e=>e.id===filterEvent)?.nama}
              <button onClick={()=>setFilterEvent('semua')} className="hover:text-red-500 transition">×</button>
            </span>
          )}
        </div>
      </div>

      <DetailDrawer member={detail} onClose={() => setDetail(null)} onApprove={approve} onSuspend={suspend}/>
    </div>
  );
}

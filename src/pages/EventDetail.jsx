// EventDetail.jsx — Halaman Detail Event + Kelola Relasi Member & Tenant
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Users, Image, Tag, FileText,
  Plus, Trash2, Search, X, Loader2, CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '../components/Toast';
import ZoneSelector from '../components/ZoneSelector';

// ── DUMMY DATA ────────────────────────────────────────────────────────────────
const DUMMY_EVENTS = {
  e1: {
    id:'e1', nama:'Festival Budaya Banyumasan 2025',
    tanggal:'2025-05-17', jam_mulai:'08:00', jam_selesai:'22:00', tanggal_selesai:'2025-05-19',
    lokasi:'Alun-Alun Purwokerto',
    deskripsi:'Festival tahunan menampilkan seni, kuliner, dan kerajinan khas Banyumas.',
    konten_lengkap:'Festival Budaya Banyumasan adalah ajang tahunan yang mempertemukan seniman, pengrajin, dan pelaku kuliner dari seluruh eks-Karesidenan Banyumas. Tahun ini menampilkan lebih dari 80 penampil dan 50 stand UMKM.',
    status:'published', kapasitas:200, peserta:34,
    banner_url: null,
    galeri: [],
    subsektor: ['Kriya','Musik','Seni Pertunjukan','Kuliner'],
  },
  e2: {
    id:'e2', nama:'Workshop Batik & Tenun Nusantara',
    tanggal:'2025-04-26', jam_mulai:'09:00', jam_selesai:'17:00', tanggal_selesai:'2025-04-27',
    lokasi:'Gedung Kebudayaan Cilacap',
    deskripsi:'Pelatihan intensif 2 hari teknik batik tulis dan tenun lurik.',
    konten_lengkap:'Workshop ini dirancang untuk pekerja kreatif yang ingin memperdalam teknik batik tulis dan tenun. Dibimbing oleh maestro batik dari Banyumas.',
    status:'published', kapasitas:30, peserta:18,
    banner_url: null,
    galeri: [],
    subsektor: ['Kriya','Fashion'],
  },
  e3: {
    id:'e3', nama:'Pameran Kriya Ekraf Regional',
    tanggal:'2025-06-10', jam_mulai:'10:00', jam_selesai:'21:00', tanggal_selesai:'2025-06-12',
    lokasi:'Mall Cilacap Raya',
    deskripsi:'Pameran dan bazaar produk ekonomi kreatif se-eks Karesidenan Banyumas.',
    konten_lengkap:'Pameran terbesar tahun ini akan menampilkan lebih dari 100 produk unggulan dari seluruh kota di Banyumas Raya.',
    status:'draft', kapasitas:500, peserta:0,
    banner_url: null,
    galeri: [],
    subsektor: ['Kriya','Desain Produk','Fashion'],
  },
  e4: {
    id:'e4', nama:'Peken Banyumasan #12',
    tanggal:'2025-03-20', jam_mulai:'16:00', jam_selesai:'22:00', tanggal_selesai:'2025-03-20',
    lokasi:'Amphitheater GOR Satria',
    deskripsi:'Pasar budaya mingguan dengan penampilan seniman lokal.',
    konten_lengkap:'Peken Banyumasan edisi ke-12 sukses digelar dengan ratusan pengunjung.',
    status:'selesai', kapasitas:500, peserta:145,
    banner_url: null,
    galeri: [],
    subsektor: ['Musik','Kuliner','Seni Pertunjukan'],
  },
};

const DUMMY_ALL_MEMBERS = [
  { id:'m1', nama:'Sari Dewi Rahayu',  subsektor:['Kriya','Fashion'],         status:'aktif' },
  { id:'m2', nama:'Ahmad Fauzi',        subsektor:['Musik','Seni Pertunjukan'], status:'aktif' },
  { id:'m4', nama:'Nurul Hidayah',      subsektor:['Kuliner'],                 status:'aktif' },
  { id:'m7', nama:'Budi Santoso',       subsektor:['Film & Animasi'],          status:'aktif' },
];

const DUMMY_ALL_TENANTS = [
  { id:'t1', nama_usaha:'Batik Sari Rahayu',    kategori:'Kriya & Fashion', status:'aktif' },
  { id:'t2', nama_usaha:'Calung Mas',            kategori:'Seni Pertunjukan', status:'aktif' },
  { id:'t4', nama_usaha:'Tenun Lurik Cilacap',   kategori:'Kriya & Fashion', status:'aktif' },
  { id:'t5', nama_usaha:'Keripik Tempe Mrisi',   kategori:'Kuliner',         status:'aktif' },
];

const DUMMY_EVENT_MEMBERS = {
  e1: [
    { id:'em1', member_id:'m1', nama:'Sari Dewi Rahayu',  subsektor:['Kriya'], peran:'performer', status_kehadiran:'terdaftar', assigned_by:'admin' },
    { id:'em2', member_id:'m2', nama:'Ahmad Fauzi',        subsektor:['Musik'], peran:'performer', status_kehadiran:'terdaftar', assigned_by:'self'  },
    { id:'em3', member_id:'m4', nama:'Nurul Hidayah',      subsektor:['Kuliner'], peran:'peserta', status_kehadiran:'terdaftar', assigned_by:'self'  },
  ],
  e2: [
    { id:'em4', member_id:'m1', nama:'Sari Dewi Rahayu',  subsektor:['Kriya'], peran:'panitia', status_kehadiran:'hadir', assigned_by:'admin' },
  ],
  e3: [],
  e4: [
    { id:'em5', member_id:'m1', nama:'Sari Dewi Rahayu',  subsektor:['Kriya'], peran:'performer', status_kehadiran:'hadir',      assigned_by:'admin' },
    { id:'em6', member_id:'m2', nama:'Ahmad Fauzi',        subsektor:['Musik'], peran:'performer', status_kehadiran:'hadir',      assigned_by:'self'  },
    { id:'em7', member_id:'m7', nama:'Budi Santoso',       subsektor:['Film'], peran:'panitia',   status_kehadiran:'tidak_hadir',assigned_by:'admin' },
  ],
};

const DUMMY_EVENT_TENANTS = {
  e1: [
    { id:'et1', tenant_id:'t1', nama_usaha:'Batik Sari Rahayu',  kategori:'Kriya & Fashion', posisi_event:'Zona A - Stand 3', assigned_by:'admin' },
    { id:'et2', tenant_id:'t5', nama_usaha:'Keripik Tempe Mrisi', kategori:'Kuliner',         posisi_event:'Zona Kuliner - Stand 7', assigned_by:'self'  },
  ],
  e2: [],
  e3: [
    { id:'et3', tenant_id:'t4', nama_usaha:'Tenun Lurik Cilacap', kategori:'Kriya & Fashion', posisi_event:'Zona B - Stand 2', assigned_by:'admin' },
  ],
  e4: [
    { id:'et4', tenant_id:'t1', nama_usaha:'Batik Sari Rahayu',  kategori:'Kriya & Fashion', posisi_event:'Zona A', assigned_by:'admin' },
    { id:'et5', tenant_id:'t2', nama_usaha:'Calung Mas',          kategori:'Seni Pertunjukan', posisi_event:'Panggung Utama', assigned_by:'admin' },
  ],
};

const fmtTgl = d => d ? new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : '—';
const STATUS_CLS = {
  draft:       'bg-gray-50 text-gray-500 border-gray-200',
  published:   'bg-green-50 text-green-700 border-green-200',
  berlangsung: 'bg-blue-50 text-blue-600 border-blue-200',
  selesai:     'bg-yellow-50 text-yellow-700 border-yellow-200',
};
const PERAN_CLS = {
  peserta:   'bg-indigo-50 text-indigo-600 border-indigo-200',
  performer: 'bg-purple-50 text-purple-600 border-purple-200',
  panitia:   'bg-orange-50 text-orange-600 border-orange-200',
};
const HADIR_CLS = {
  terdaftar:    'text-gray-500',
  hadir:        'text-green-600',
  tidak_hadir:  'text-red-500',
};

// ── AssignMemberModal ─────────────────────────────────────────────────────────
function AssignMemberModal({ onClose, onAssign, existingIds }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [peran, setPeran] = useState('peserta');
  const [saving, setSaving] = useState(false);

  const available = DUMMY_ALL_MEMBERS.filter(m =>
    !existingIds.includes(m.id) &&
    (m.nama.toLowerCase().includes(search.toLowerCase()))
  );

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    onAssign({ ...selected, peran, status_kehadiran: 'terdaftar', assigned_by: 'admin', id: 'em' + Date.now() });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Assign Pekerja Kreatif</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama member..."
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"/>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1.5">
            {available.length === 0
              ? <p className="text-gray-400 text-sm text-center py-4">Tidak ada member tersedia</p>
              : available.map(m => (
                <button key={m.id} onClick={() => setSelected(m)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition ${selected?.id === m.id ? 'border-green-400 bg-green-50' : 'border-gray-100 hover:border-gray-300'}`}>
                  <p className="font-semibold text-gray-800">{m.nama}</p>
                  <p className="text-gray-400 text-xs">{m.subsektor.join(', ')}</p>
                </button>
              ))
            }
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Peran</label>
            <div className="flex gap-2">
              {['peserta','performer','panitia'].map(p => (
                <button key={p} onClick={() => setPeran(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border capitalize transition ${peran === p ? 'bg-green-700 text-white border-green-700' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2.5 pt-1">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">Batal</button>
            <button onClick={save} disabled={!selected || saving}
              className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={13} className="animate-spin"/> : <Plus size={13}/>}
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AssignTenantModal ─────────────────────────────────────────────────────────
function AssignTenantModal({ onClose, onAssign, existingIds }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [posisi, setPosisi] = useState('');
  const [useZone, setUseZone] = useState(true);
  const [saving, setSaving] = useState(false);

  const available = DUMMY_ALL_TENANTS.filter(t =>
    !existingIds.includes(t.id) &&
    t.nama_usaha.toLowerCase().includes(search.toLowerCase())
  );

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    onAssign({ ...selected, posisi_event: posisi, assigned_by: 'admin', id: 'et' + Date.now() });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-gray-800">Assign UMKM ke Event</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama usaha..."
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"/>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1.5">
            {available.length === 0
              ? <p className="text-gray-400 text-sm text-center py-4">Tidak ada UMKM tersedia</p>
              : available.map(t => (
                <button key={t.id} onClick={() => setSelected(t)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition ${selected?.id === t.id ? 'border-green-400 bg-green-50' : 'border-gray-100 hover:border-gray-300'}`}>
                  <p className="font-semibold text-gray-800">{t.nama_usaha}</p>
                  <p className="text-gray-400 text-xs">{t.kategori}</p>
                </button>
              ))
            }
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Posisi Stand</label>
              <button onClick={() => setUseZone(!useZone)} className="text-xs text-green-600 hover:underline">
                {useZone ? 'Input manual' : 'Pilih dari peta zona'}
              </button>
            </div>
            {useZone ? (
              <ZoneSelector value={posisi} onChange={setPosisi}/>
            ) : (
              <input value={posisi} onChange={e => setPosisi(e.target.value)} placeholder="cth: Zona A - Stand 5"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400"/>
            )}
          </div>
        </div>
        <div className="flex gap-2.5 p-5 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">Batal</button>
          <button onClick={save} disabled={!selected || saving}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={13} className="animate-spin"/> : <Plus size={13}/>}
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}

// ── StandSelectModal — centered modal, no overflow-clip issue ─────────────────
function StandSelectModal({ value, onClose, onChange }) {
  const [local, setLocal] = React.useState(value || '');

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="font-bold text-gray-800 text-sm">Pilih Posisi Stand</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
        </div>
        <div className="p-5 space-y-4">
          <ZoneSelector value={local} onChange={setLocal} compact/>
          <div className="pt-2 border-t border-gray-100">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Atau ketik manual</label>
            <input
              value={local}
              onChange={e => setLocal(e.target.value)}
              placeholder="cth: Zona A - Stand 5"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400"
            />
          </div>
        </div>
        <div className="flex gap-2.5 px-5 pb-5">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">Batal</button>
          <button
            onClick={() => { onChange(local); onClose(); }}
            disabled={!local}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TenantPosisiEditor — opens modal (no overflow-clip issue) ─────────────────
function TenantPosisiEditor({ value, onChange }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition whitespace-nowrap
          ${value
            ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
            : 'border-dashed border-gray-300 text-gray-400 hover:border-green-300 hover:text-green-600'}`}
      >
        <span>📍</span>
        <span className="max-w-[100px] truncate">{value || 'Pilih stand'}</span>
      </button>
      {open && (
        <StandSelectModal
          value={value}
          onClose={() => setOpen(false)}
          onChange={onChange}
        />
      )}
    </>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [members, setMembers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [activeTab, setActiveTab] = useState('members');
  const [showAssignMember, setShowAssignMember] = useState(false);
  const [showAssignTenant, setShowAssignTenant] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setEvent(DUMMY_EVENTS[id] || null);
      setMembers(DUMMY_EVENT_MEMBERS[id] || []);
      setTenants(DUMMY_EVENT_TENANTS[id] || []);
      setLoading(false);
    }, 400);
  }, [id]);

  const removeMember = async (emId) => {
    if (!confirm('Hapus member dari event ini?')) return;
    setMembers(l => l.filter(m => m.id !== emId));
    toast.success('Member dihapus dari event');
  };

  const removeTenant = async (etId) => {
    if (!confirm('Hapus UMKM dari event ini?')) return;
    setTenants(l => l.filter(t => t.id !== etId));
    toast.success('UMKM dihapus dari event');
  };

  const updateMemberKehadiran = (emId, val) => {
    setMembers(l => l.map(m => m.id === emId ? { ...m, status_kehadiran: val } : m));
  };

  const updateTenantPosisi = (etId, val) => {
    setTenants(l => l.map(t => t.id === etId ? { ...t, posisi_event: val } : t));
  };

  const assignMember = async (data) => {
    setMembers(l => [...l, { ...data, member_id: data.id }]);
    toast.success(`${data.nama} berhasil di-assign sebagai ${data.peran}`);
    try {
      const { triggerEventAssignedToMember } = await import('../lib/notifications');
      triggerEventAssignedToMember(event.nama, data.peran);
    } catch {}
  };

  const assignTenant = async (data) => {
    setTenants(l => [...l, { ...data, tenant_id: data.id }]);
    toast.success(`${data.nama_usaha} berhasil di-assign ke event`);
    try {
      const { triggerUmkmEventAssigned } = await import('../lib/notifications');
      triggerUmkmEventAssigned(event.nama, data.posisi_event || '—');
    } catch {}
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-green-600"/>
    </div>
  );

  if (!event) return (
    <div className="text-center py-20 text-gray-400">
      <p>Event tidak ditemukan.</p>
      <button onClick={() => navigate('/events')} className="mt-3 text-green-600 hover:underline text-sm">← Kembali ke daftar event</button>
    </div>
  );

  const pct = Math.min(100, Math.round(members.length / event.kapasitas * 100));

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={() => navigate('/events')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm transition">
        <ArrowLeft size={15}/> Kembali ke Daftar Event
      </button>

      {/* 2-kolom layout */}
      <div className="grid lg:grid-cols-5 gap-5 items-start">

        {/* Kolom kiri — Info Event */}
        <div className="lg:col-span-2 space-y-4">
          {/* Banner */}
          {event.banner_url
            ? <img src={event.banner_url} alt="banner" className="w-full h-40 object-cover rounded-2xl"/>
            : <div className="w-full h-40 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                <Image size={36} className="text-green-400"/>
              </div>
          }

          {/* Info utama */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
            <div className="flex items-start gap-3 justify-between">
              <h1 className="font-bold text-gray-900 text-lg leading-snug">{event.nama}</h1>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${STATUS_CLS[event.status]}`}>
                {event.status}
              </span>
            </div>
            <div className="space-y-1.5 text-sm text-gray-500">
              <div className="flex items-center gap-2"><Calendar size={13}/>{fmtTgl(event.tanggal)}
                {event.tanggal_selesai && event.tanggal_selesai !== event.tanggal && ` — ${fmtTgl(event.tanggal_selesai)}`}
                {event.jam_mulai && <span className="ml-1 text-gray-500">· {event.jam_mulai.replace(':','.')}{event.jam_selesai ? ` – ${event.jam_selesai.replace(':','.')}` : ''} WIB</span>}
              </div>
              <div className="flex items-center gap-2"><MapPin size={13}/>{event.lokasi}</div>
              <div className="flex items-center gap-2"><Users size={13}/>{members.length} terdaftar / {event.kapasitas} kapasitas</div>
            </div>
            {/* Kapasitas bar */}
            <div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{width:`${pct}%`}}/>
              </div>
              <p className="text-xs text-gray-400 mt-1">{pct}% kapasitas terisi</p>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><FileText size={12}/>Deskripsi</p>
            <p className="text-gray-600 text-sm leading-relaxed">{event.deskripsi}</p>
            {event.konten_lengkap && event.konten_lengkap !== event.deskripsi && (
              <p className="text-gray-500 text-sm leading-relaxed mt-3">{event.konten_lengkap}</p>
            )}
          </div>

          {/* Subsektor tags */}
          {event.subsektor?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Tag size={12}/>Subsektor</p>
              <div className="flex flex-wrap gap-2">
                {event.subsektor.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Stats ringkas */}
          <div className="grid grid-cols-3 gap-3">
            {[
              ['Kapasitas', event.kapasitas, 'text-gray-700'],
              ['Terdaftar', members.length, 'text-green-700'],
              ['Hadir', members.filter(m=>m.status_kehadiran==='hadir').length, 'text-blue-600'],
            ].map(([l,v,c]) => (
              <div key={l} className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
                <p className={`text-xl font-bold ${c}`}>{v}</p>
                <p className="text-gray-400 text-[11px] mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom kanan — Relasi */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100">
            {[['members','Pekerja Kreatif'],['tenants','UMKM']].map(([v,l]) => (
              <button key={v} onClick={() => setActiveTab(v)}
                className={`flex-1 py-3.5 text-sm font-semibold transition border-b-2 ${activeTab===v ? 'border-green-600 text-green-700 bg-green-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {l} <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-500">
                  {v==='members' ? members.length : tenants.length}
                </span>
              </button>
            ))}
          </div>

          {/* Tab: Pekerja Kreatif */}
          {activeTab === 'members' && (
            <div>
              <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
                <p className="text-sm text-gray-500">{members.length} pekerja kreatif di event ini</p>
                <button onClick={() => setShowAssignMember(true)}
                  className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition">
                  <Plus size={13}/> Assign Member
                </button>
              </div>
              {members.length === 0
                ? <div className="py-16 text-center text-gray-400 text-sm">
                    <Users size={32} className="text-gray-200 mx-auto mb-3"/>
                    Belum ada pekerja kreatif di event ini
                  </div>
                : <div className="divide-y divide-gray-50">
                    {members.map(m => (
                      <div key={m.id} className="px-5 py-3.5 flex items-center gap-3 group hover:bg-gray-50/60 transition">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                          {m.nama.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm">{m.nama}</p>
                          <span className="text-gray-400 text-[10px]">
                            {m.assigned_by === 'admin' ? 'Oleh Admin' : 'Mandiri'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Editable peran */}
                          <select value={m.peran}
                            onChange={e => setMembers(l => l.map(x => x.id===m.id ? {...x,peran:e.target.value} : x))}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-400 bg-white transition text-gray-600">
                            <option value="peserta">Peserta</option>
                            <option value="performer">Performer</option>
                            <option value="panitia">Panitia</option>
                          </select>
                          {/* Editable kehadiran */}
                          <select value={m.status_kehadiran}
                            onChange={e => updateMemberKehadiran(m.id, e.target.value)}
                            className={`text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-400 bg-white transition ${HADIR_CLS[m.status_kehadiran]}`}>
                            <option value="terdaftar">Terdaftar</option>
                            <option value="hadir">Hadir</option>
                            <option value="tidak_hadir">Tidak Hadir</option>
                          </select>
                          <button onClick={() => removeMember(m.id)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100">
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* Tab: UMKM */}
          {activeTab === 'tenants' && (
            <div>
              <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
                <p className="text-sm text-gray-500">{tenants.length} UMKM di event ini</p>
                <button onClick={() => setShowAssignTenant(true)}
                  className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition">
                  <Plus size={13}/> Assign UMKM
                </button>
              </div>
              {tenants.length === 0
                ? <div className="py-16 text-center text-gray-400 text-sm">
                    <Plus size={32} className="text-gray-200 mx-auto mb-3"/>
                    Belum ada UMKM di event ini
                  </div>
                : <div className="divide-y divide-gray-50">
                    {tenants.map(t => (
                      <div key={t.id} className="px-5 py-3.5 flex items-center gap-3 group hover:bg-gray-50/60 transition">
                        <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
                          {t.nama_usaha.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm">{t.nama_usaha}</p>
                          <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] rounded font-medium">{t.kategori}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <TenantPosisiEditor
                            value={t.posisi_event}
                            onChange={val => updateTenantPosisi(t.id, val)}
                          />
                          <button onClick={() => removeTenant(t.id)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100">
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}
        </div>
      </div>

      {showAssignMember && (
        <AssignMemberModal
          onClose={() => setShowAssignMember(false)}
          onAssign={assignMember}
          existingIds={members.map(m => m.member_id)}
        />
      )}
      {showAssignTenant && (
        <AssignTenantModal
          onClose={() => setShowAssignTenant(false)}
          onAssign={assignTenant}
          existingIds={tenants.map(t => t.tenant_id)}
        />
      )}
    </div>
  );
}

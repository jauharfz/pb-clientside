// Events.jsx — Kelola Event + Publikasi ke Beranda (revisi dengan field baru)
import React, { useState } from 'react';
import {
  Plus, Calendar, MapPin, Edit3, Trash2, Eye, EyeOff, X, Save, Loader2,
  Users, Tag, FileText, Settings
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';

const SUBSEKTORS_ALL = [
  'Kuliner','Kriya','Fashion','Musik','Seni Pertunjukan','Film & Animasi',
  'Fotografi','Desain Produk','Arsitektur','Periklanan','Penerbitan',
  'Seni Rupa','Televisi & Radio','Game','Aplikasi Digital','Riset & Pengembangan','Lainnya',
];

const DUMMY_EVENTS = [
  { id:'e1', nama:'Festival Budaya Banyumasan 2025', tanggal:'2025-05-17', jam_mulai:'08:00', jam_selesai:'22:00', tanggal_selesai:'2025-05-19', lokasi:'Alun-Alun Purwokerto', deskripsi:'Festival tahunan menampilkan seni, kuliner, dan kerajinan khas Banyumas.', konten_lengkap:'', status:'published', peserta:34, kapasitas:200, subsektor:['Kriya','Musik','Kuliner'], banner_url:'', galeri:[] },
  { id:'e2', nama:'Workshop Batik & Tenun Nusantara', tanggal:'2025-04-26', jam_mulai:'09:00', jam_selesai:'17:00', tanggal_selesai:'2025-04-27', lokasi:'Gedung Kebudayaan Cilacap', deskripsi:'Pelatihan intensif 2 hari teknik batik tulis dan tenun lurik.', konten_lengkap:'', status:'published', peserta:18, kapasitas:30, subsektor:['Kriya','Fashion'], banner_url:'', galeri:[] },
  { id:'e3', nama:'Pameran Kriya Ekraf Regional', tanggal:'2025-06-10', jam_mulai:'10:00', jam_selesai:'21:00', tanggal_selesai:'2025-06-12', lokasi:'Mall Cilacap Raya', deskripsi:'Pameran dan bazaar produk ekonomi kreatif se-eks Karesidenan Banyumas.', konten_lengkap:'', status:'draft', peserta:0, kapasitas:500, subsektor:['Kriya','Desain Produk'], banner_url:'', galeri:[] },
  { id:'e4', nama:'Peken Banyumasan #12', tanggal:'2025-03-20', jam_mulai:'16:00', jam_selesai:'22:00', tanggal_selesai:'2025-03-20', lokasi:'Amphitheater GOR Satria', deskripsi:'Pasar budaya mingguan dengan penampilan seniman lokal.', konten_lengkap:'', status:'selesai', peserta:145, kapasitas:500, subsektor:['Musik','Kuliner'], banner_url:'', galeri:[] },
];

const EMPTY = { nama:'', tanggal:'', jam_mulai:'08:00', jam_selesai:'22:00', tanggal_selesai:'', lokasi:'', deskripsi:'', konten_lengkap:'', kapasitas:100, status:'draft', subsektor:[], banner_url:'', galeri:[] };
const fmtTgl = d => d ? new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) : '';
const STATUS_CLS = {
  published:   'bg-green-50 text-green-700 border-green-200',
  draft:       'bg-gray-50 text-gray-500 border-gray-200',
  selesai:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  berlangsung: 'bg-blue-50 text-blue-600 border-blue-200',
};

function EventFormModal({ editItem, onClose, onSave }) {
  const [form, setForm] = useState(editItem ? {...editItem} : EMPTY);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleSub = (s) => set('subsektor', (form.subsektor||[]).includes(s)
    ? form.subsektor.filter(x => x !== s)
    : [...(form.subsektor||[]), s]);

  const save = async () => {
    if (!form.nama || !form.tanggal || !form.jam_mulai) { toast.error('Nama, tanggal, dan jam mulai wajib diisi'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-gray-800">{editItem ? 'Edit Event' : 'Buat Event Baru'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div>
            <label className="text-gray-600 text-xs font-semibold mb-1.5 block">Nama Event *</label>
            <input value={form.nama} onChange={e => set('nama', e.target.value)} placeholder="Nama event"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 text-xs font-semibold mb-1.5 block">Tanggal Mulai *</label>
              <input type="date" value={form.tanggal} onChange={e => set('tanggal', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"/>
            </div>
            <div>
              <label className="text-gray-600 text-xs font-semibold mb-1.5 block">Tanggal Selesai</label>
              <input type="date" value={form.tanggal_selesai} onChange={e => set('tanggal_selesai', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 text-xs font-semibold mb-1.5 block">🕐 Jam Mulai *</label>
              <input type="time" value={form.jam_mulai} onChange={e => set('jam_mulai', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"/>
            </div>
            <div>
              <label className="text-gray-600 text-xs font-semibold mb-1.5 block">🕐 Jam Selesai</label>
              <input type="time" value={form.jam_selesai} onChange={e => set('jam_selesai', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 text-xs font-semibold mb-1.5 block">Lokasi</label>
              <input value={form.lokasi} onChange={e => set('lokasi', e.target.value)} placeholder="Nama tempat"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"/>
            </div>
            <div>
              <label className="text-gray-600 text-xs font-semibold mb-1.5 block">Kapasitas</label>
              <input type="number" value={form.kapasitas} onChange={e => set('kapasitas', +e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"/>
            </div>
          </div>
          <div>
            <label className="text-gray-600 text-xs font-semibold mb-1.5 block">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition bg-white">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="berlangsung">Berlangsung</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
          {/* Banner photo upload */}
          <ImageUpload
            value={form.banner_url}
            onChange={v => set('banner_url', v)}
            label="Foto Banner Event"
            hint="JPG, PNG, WebP · maks 5 MB · disarankan 16:9"
            shape="wide"
          />
          <div>
            <label className="text-gray-600 text-xs font-semibold mb-1.5 block">Deskripsi Singkat</label>
            <textarea value={form.deskripsi} onChange={e => set('deskripsi', e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition resize-none"/>
          </div>
          <div>
            <label className="text-gray-600 text-xs font-semibold mb-1.5 block flex items-center gap-1.5"><FileText size={12}/>Konten Lengkap</label>
            <textarea value={form.konten_lengkap} onChange={e => set('konten_lengkap', e.target.value)} rows={4}
              placeholder="Deskripsi detail, jadwal, informasi tambahan..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition resize-none"/>
          </div>
          <div>
            <label className="text-gray-600 text-xs font-semibold mb-2 block flex items-center gap-1.5"><Tag size={12}/>Subsektor Budaya</label>
            <div className="flex flex-wrap gap-1.5">
              {SUBSEKTORS_ALL.map(s => (
                <button key={s} type="button" onClick={() => toggleSub(s)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${(form.subsektor||[]).includes(s) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 shrink-0 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">Batal</button>
          <button onClick={save} disabled={saving}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={14} className="animate-spin"/>Menyimpan...</> : <><Save size={14}/>Simpan</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  const toast = useToast();
  const [events, setEvents] = useState(DUMMY_EVENTS);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const openAdd  = () => { setEditItem(null); setModal(true); };
  const openEdit = (e, ev) => { e.stopPropagation(); setEditItem({...ev}); setModal(true); };

  const handleSave = (form) => {
    if (editItem) {
      setEvents(l => l.map(e => e.id === editItem.id ? {...e,...form} : e));
      toast.success('Event diperbarui');
    } else {
      setEvents(l => [{ id:'e'+Date.now(), ...form, peserta:0 }, ...l]);
      toast.success('Event dibuat');
    }
  };

  const del = (e, id) => {
    e.stopPropagation();
    if (!confirm('Hapus event ini?')) return;
    setEvents(l => l.filter(ev => ev.id !== id));
    toast.success('Event dihapus');
  };

  const togglePublish = (e, id) => {
    e.stopPropagation();
    setEvents(l => l.map(ev => ev.id===id ? {...ev, status: ev.status==='published' ? 'draft' : 'published'} : ev));
    const ev = events.find(ev => ev.id === id);
    toast.success(ev?.status==='published' ? 'Event disembunyikan' : 'Event dipublikasikan');
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Dipublikasi', events.filter(e=>e.status==='published').length, 'bg-green-50 text-green-700'],
          ['Draft',       events.filter(e=>e.status==='draft').length,      'bg-gray-50 text-gray-600'],
          ['Berlangsung', events.filter(e=>e.status==='berlangsung').length,'bg-blue-50 text-blue-600'],
          ['Selesai',     events.filter(e=>e.status==='selesai').length,    'bg-yellow-50 text-yellow-700'],
        ].map(([l,v,cls]) => (
          <div key={l} className={`${cls} rounded-2xl p-4 border border-white/60`}>
            <p className="text-2xl font-bold">{v}</p>
            <p className="text-sm font-medium opacity-80 mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">{events.length} total event</p>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition">
          <Plus size={16}/> Buat Event Baru
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {events.map(ev => (
          <div key={ev.id} className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-shadow
            ${ev.status==='published' ? 'border-green-200' : ev.status==='berlangsung' ? 'border-blue-200' : 'border-gray-100'}`}>
            <div className="w-full h-2 bg-gradient-to-r from-green-200 via-yellow-100 to-orange-100"/>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-800 text-sm leading-snug">{ev.nama}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_CLS[ev.status]}`}>{ev.status}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs"><Calendar size={11}/>{fmtTgl(ev.tanggal)}{ev.tanggal_selesai && ev.tanggal_selesai !== ev.tanggal && ` — ${fmtTgl(ev.tanggal_selesai)}`}{ev.jam_mulai && ` · ${ev.jam_mulai.replace(':','.')}${ev.jam_selesai ? ` – ${ev.jam_selesai.replace(':','.')}` : ''} WIB`}</div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5"><MapPin size={11}/>{ev.lokasi}</div>
                </div>
              </div>
              {ev.subsektor?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {ev.subsektor.slice(0,3).map(s => <span key={s} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] rounded font-medium">{s}</span>)}
                  {ev.subsektor.length > 3 && <span className="text-gray-400 text-[10px]">+{ev.subsektor.length-3}</span>}
                </div>
              )}
              <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{ev.deskripsi}</p>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Users size={11}/>{ev.peserta} / {ev.kapasitas} peserta</span>
                  <span className="text-xs font-semibold text-green-700">{Math.round(ev.peserta/ev.kapasitas*100)}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{width:`${Math.min(100,ev.peserta/ev.kapasitas*100)}%`}}/>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between gap-1.5">
              <Link to={`/events/${ev.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-semibold transition">
                <Settings size={12}/> Kelola
              </Link>
              <div className="flex items-center gap-1">
                {ev.status !== 'selesai' && (
                  <button onClick={(e) => togglePublish(e, ev.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition
                      ${ev.status==='published' ? 'text-gray-500 hover:bg-gray-100' : 'text-green-700 hover:bg-green-50'}`}>
                    {ev.status==='published' ? <><EyeOff size={13}/>Sembunyikan</> : <><Eye size={13}/>Publikasi</>}
                  </button>
                )}
                <button onClick={(e) => openEdit(e, ev)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"><Edit3 size={14}/></button>
                <button onClick={(e) => del(e, ev.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><Trash2 size={14}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && <EventFormModal editItem={editItem} onClose={() => setModal(false)} onSave={handleSave}/>}
    </div>
  );
}

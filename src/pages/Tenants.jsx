// Tenants.jsx — Kelola UMKM + tab drawer (Usaha, Event, Profil Publik)
import React, { useState, useEffect, memo } from 'react';
import {
  Search, CheckCircle, XCircle, Store, AlertCircle,
  ChevronDown, ChevronUp, Percent, MapPin, Phone, Mail,
  FileText, X, TrendingUp, Wallet, Edit3, Save, Loader2,
  Plus, Trash2, Calendar, Image, Tag
} from 'lucide-react';
import { useToast } from '../components/Toast';
import ZoneSelector from '../components/ZoneSelector';
import { getEventZones } from '../lib/eventZones';

const DUMMY_TENANTS = [
  { id:'t1', nama_usaha:'Batik Sari Rahayu',    pemilik:'Sari Dewi',     kategori:'Kriya & Fashion', kota:'Banyumas',    no_hp:'08111234567', email:'sari@batik.com', status:'aktif',    tanggal_daftar:'2024-03-10', komisi_persen:15, posisi:'Zona A - Lapak 3', total_penjualan:4500000, komisi_terkumpul:675000,  deskripsi:'Batik tulis dan printing motif Banyumasan.' },
  { id:'t2', nama_usaha:'Calung Mas',            pemilik:'Budi Hartono',  kategori:'Seni Pertunjukan',kota:'Purwokerto',  no_hp:'08122345678', email:'calung@mas.com',  status:'aktif',    tanggal_daftar:'2024-04-01', komisi_persen:10, posisi:'Panggung Utama', total_penjualan:2800000, komisi_terkumpul:280000,  deskripsi:'Pertunjukan calung dan angklung tradisional.' },
  { id:'t3', nama_usaha:'Dawet Ayu Banjarnegara',pemilik:'Nia Rahma',     kategori:'Kuliner',         kota:'Banjarnegara',no_hp:'08133456789', email:'dawet@ayu.com',   status:'pending',  tanggal_daftar:'2025-04-09', komisi_persen:0,  posisi:'',               total_penjualan:0,       komisi_terkumpul:0,       deskripsi:'Dawet ayu asli Banjarnegara.' },
  { id:'t4', nama_usaha:'Tenun Lurik Cilacap',   pemilik:'Hendra W.',     kategori:'Kriya & Fashion', kota:'Cilacap',     no_hp:'08144567890', email:'lurik@cilacap.com',status:'aktif',   tanggal_daftar:'2024-05-15', komisi_persen:12, posisi:'Zona B - Lapak 7', total_penjualan:3200000, komisi_terkumpul:384000,  deskripsi:'Tenun lurik dengan corak khas pesisir selatan.' },
  { id:'t5', nama_usaha:'Keripik Tempe Mrisi',   pemilik:'Sulastri K.',   kategori:'Kuliner',         kota:'Purbalingga', no_hp:'08155678901', email:'tempe@mrisi.com', status:'aktif',    tanggal_daftar:'2024-06-20', komisi_persen:10, posisi:'Zona C - Lapak 2', total_penjualan:1900000, komisi_terkumpul:190000,  deskripsi:'Keripik tempe dan aneka olahan kedelai.' },
  { id:'t6', nama_usaha:'Wayang Golek Banyumas', pemilik:'Dalang Suratno',kategori:'Seni Pertunjukan',kota:'Banyumas',    no_hp:'08166789012', email:'wayang@dalang.com',status:'pending', tanggal_daftar:'2025-04-10', komisi_persen:0,  posisi:'',               total_penjualan:0,       komisi_terkumpul:0,       deskripsi:'Pertunjukan wayang golek gaya Banyumasan.' },
];

const DUMMY_TENANT_EVENTS = {
  t1: [
    { id:'et1', event_id:'e1', nama:'Festival Budaya Banyumasan 2025', tanggal:'2025-05-17', jam_mulai:'08:00', jam_selesai:'22:00', posisi_event:'Zona A - Stand 3', assigned_by:'admin' },
    { id:'et2', event_id:'e4', nama:'Peken Banyumasan #12', tanggal:'2025-03-20', jam_mulai:'16:00', jam_selesai:'22:00', posisi_event:'Zona A', assigned_by:'admin' },
  ],
  t2: [{ id:'et3', event_id:'e4', nama:'Peken Banyumasan #12', tanggal:'2025-03-20', jam_mulai:'16:00', jam_selesai:'22:00', posisi_event:'Panggung Utama', assigned_by:'admin' }],
  t5: [{ id:'et4', event_id:'e1', nama:'Festival Budaya Banyumasan 2025', tanggal:'2025-05-17', jam_mulai:'08:00', jam_selesai:'22:00', posisi_event:'Zona Kuliner - Stand 7', assigned_by:'self' }],
};

const DUMMY_ALL_EVENTS = [
  { id:'e1', nama:'Festival Budaya Banyumasan 2025', status:'published' },
  { id:'e2', nama:'Workshop Batik & Tenun Nusantara', status:'published' },
];

const fmtRupiah = v => 'Rp ' + (v||0).toLocaleString('id-ID');
const fmtTgl = d => new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
function useDebounce(v,d=300){const[r,s]=useState(v);useEffect(()=>{const t=setTimeout(()=>s(v),d);return()=>clearTimeout(t)},[v,d]);return r}

// ── AssignEventModal ─────────────────────────────────────────────────────────
// ── PosisiInlineEditor — click-to-edit stand position ────────────────────────
// ── PosisiSelectModal — centered modal with ZoneSelector ─────────────────────
function PosisiSelectModal({ value, onClose, onChange, eventId }) {
  const [local, setLocal] = useState(value || '');
  const zones = eventId ? getEventZones(eventId) : [];
  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="font-bold text-gray-800 text-sm">Pilih Posisi Stand</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
        </div>
        <div className="p-5 space-y-4">
          <ZoneSelector value={local} onChange={setLocal} zones={zones} compact/>
          <div className="pt-2 border-t border-gray-100">
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Atau ketik manual</label>
            <input value={local} onChange={e => setLocal(e.target.value)} placeholder="cth: Zona A - Stand 5"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400"/>
          </div>
        </div>
        <div className="flex gap-2.5 px-5 pb-5">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">Batal</button>
          <button onClick={() => { onChange(local); onClose(); }} disabled={!local}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50">
            Simpan Posisi
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PosisiInlineEditor — button opens PosisiSelectModal ───────────────────────
function PosisiInlineEditor({ value, onChange, eventId }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 text-xs font-medium transition rounded-lg px-2 py-1 border
          ${value
            ? 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100'
            : 'text-gray-400 border-dashed border-gray-300 hover:border-green-300 hover:text-green-600'}`}>
        <span>📍</span>
        <span className="max-w-[100px] truncate">{value || 'Pilih stand'}</span>
        <span className="text-gray-300 text-[9px]">▼</span>
      </button>
      {open && <PosisiSelectModal value={value} onClose={() => setOpen(false)} onChange={onChange} eventId={eventId}/>}
    </>
  );
}

function AssignEventModal({ existingIds, onClose, onAssign }) {
  const [selected, setSelected] = useState(null);
  const [posisi, setPosisi] = useState('');
  const [saving, setSaving] = useState(false);
  const available = DUMMY_ALL_EVENTS.filter(e => !existingIds.includes(e.id));

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    onAssign({ id:'et'+Date.now(), event_id:selected.id, nama:selected.nama, tanggal:new Date().toISOString().split('T')[0], posisi_event:posisi, assigned_by:'admin' });
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
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Posisi Stand di Event</label>
            <ZoneSelector value={posisi} onChange={setPosisi} zones={selected ? getEventZones(selected.id) : []} compact/>
            <div className="mt-2">
              <input value={posisi} onChange={e=>setPosisi(e.target.value)} placeholder="Atau ketik manual: cth Zona A - Stand 5"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-green-400"/>
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

// ── PendingCard ───────────────────────────────────────────────────────────────
const PendingCard = memo(({ t, onApprove, onReject, isProcessing }) => {
  const [exp, setExp] = useState(false);
  const [komisi, setKomisi] = useState(10);
  const [posisi, setPosisi] = useState('');
  return (
    <div className="bg-white border border-amber-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"/><span className="text-amber-700 text-xs font-semibold">Menunggu Persetujuan</span></div>
        <span className="text-amber-500 text-xs">{fmtTgl(t.tanggal_daftar)}</span>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0">{t.nama_usaha.charAt(0)}</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800">{t.nama_usaha}</p>
            <p className="text-gray-500 text-sm">{t.pemilik} · {t.kota}</p>
            <span className="mt-1 inline-block px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 text-[10px] rounded font-medium">{t.kategori}</span>
          </div>
          <button onClick={() => setExp(!exp)} className="text-gray-400 hover:text-gray-600">{exp?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</button>
        </div>
        {exp && (
          <div className="mt-4 space-y-3">
            <p className="text-gray-500 text-sm">{t.deskripsi}</p>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block flex items-center gap-1"><Percent size={11}/>Komisi (%)</label>
              <input type="number" min="0" max="30" value={komisi} onChange={e=>setKomisi(+e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 transition"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block flex items-center gap-1"><MapPin size={11}/>Pilih Posisi Lapak</label>
              <ZoneSelector value={posisi} onChange={setPosisi} zones={getEventZones('e1')} compact/>
              <input value={posisi} onChange={e=>setPosisi(e.target.value)} placeholder="Atau ketik manual..."
                className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-green-400 transition"/>
            </div>
          </div>
        )}
        <div className="flex gap-2.5 mt-4">
          <button onClick={() => onApprove(t.id, { komisi_persen:komisi, posisi })} disabled={isProcessing===t.id}
            className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-60">
            {isProcessing===t.id?<Loader2 size={13} className="animate-spin"/>:<CheckCircle size={13}/>} Setujui
          </button>
          <button onClick={() => onReject(t.id)} className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-500 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-50 transition">
            <XCircle size={13}/> Tolak
          </button>
        </div>
      </div>
    </div>
  );
});

const TenantRow = memo(({ t, onEdit }) => (
  <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition group">
    <td className="px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-green-800 font-bold text-sm shrink-0">{t.nama_usaha.charAt(0)}</div>
        <div><p className="font-semibold text-gray-800 text-sm">{t.nama_usaha}</p><p className="text-gray-400 text-xs">{t.pemilik}</p></div>
      </div>
    </td>
    <td className="px-4 py-3.5">
      <span className="px-2 py-0.5 bg-green-50 border border-green-100 text-green-700 rounded text-[11px] font-medium">{t.kategori}</span>
      <p className="text-gray-400 text-xs flex items-center gap-1 mt-1"><MapPin size={10}/>{t.posisi||'—'}</p>
    </td>
    <td className="px-4 py-3.5"><span className="flex items-center gap-1 text-sm font-semibold text-indigo-700"><Percent size={12}/>{t.komisi_persen}%</span></td>
    <td className="px-4 py-3.5">
      <p className="text-sm font-semibold text-gray-800">{fmtRupiah(t.total_penjualan)}</p>
      <p className="text-xs text-emerald-600 font-medium">{fmtRupiah(t.komisi_terkumpul)} komisi</p>
    </td>
    <td className="px-4 py-3.5">
      <button onClick={() => onEdit(t)} className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"><Edit3 size={14}/></button>
    </td>
  </tr>
));

// ── EditDrawer ────────────────────────────────────────────────────────────────
const EditDrawer = ({ tenant, onClose, onSave }) => {
  const [tab, setTab] = useState('usaha');
  const [komisi, setKomisi] = useState(tenant?.komisi_persen||0);
  const [posisi, setPosisi] = useState(tenant?.posisi||'');
  const [saving, setSaving] = useState(false);
  const [tenantEvents, setTenantEvents] = useState([]);
  const [showAssign, setShowAssign] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!tenant) return;
    setKomisi(tenant.komisi_persen||0);
    setPosisi(tenant.posisi||'');
    setTenantEvents(DUMMY_TENANT_EVENTS[tenant.id] || []);
    setTab('usaha');
  }, [tenant?.id]);

  if (!tenant) return null;

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    onSave(tenant.id, { komisi_persen:komisi, posisi });
    setSaving(false);
    onClose();
  };

  const removeEvent = (etId) => {
    setTenantEvents(l => l.filter(e => e.id !== etId));
    toast.success('UMKM dihapus dari event');
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-40" onClick={onClose}/>
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col" style={{animation:'slideIn .26s cubic-bezier(.32,.72,0,1) both'}}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold shrink-0">{tenant.nama_usaha.charAt(0)}</div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">{tenant.nama_usaha}</p>
              <p className="text-gray-400 text-xs">{tenant.pemilik} · {tenant.kota}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 transition"><X size={18}/></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          {[['usaha','Usaha'],['event','Event'],['profil','Profil Publik']].map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`flex-1 py-2.5 text-xs font-semibold transition border-b-2 ${tab===v?'border-green-600 text-green-700':'border-transparent text-gray-500 hover:text-gray-700'}`}>{l}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* TAB: Usaha */}
          {tab === 'usaha' && (
            <div className="p-5 space-y-5">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2">
                <p className="text-emerald-700 text-xs font-semibold uppercase tracking-wide">Ringkasan Revenue</p>
                {[['Total Penjualan', fmtRupiah(tenant.total_penjualan),'text-gray-800'],
                  ['Komisi Terkumpul', fmtRupiah(tenant.komisi_terkumpul),'text-emerald-700'],
                  ['Diterima UMKM', fmtRupiah(tenant.total_penjualan-tenant.komisi_terkumpul),'text-indigo-700'],
                ].map(([l,v,c]) => (
                  <div key={l} className="flex justify-between text-sm"><span className="text-gray-600">{l}</span><span className={`font-semibold ${c}`}>{v}</span></div>
                ))}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-1.5"><Percent size={14}/>Persentase Komisi</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="0" max="30" value={komisi} onChange={e=>setKomisi(+e.target.value)} className="flex-1"/>
                  <div className="w-16 border border-gray-200 rounded-xl px-3 py-2 text-center font-bold text-indigo-700 text-sm bg-indigo-50">{komisi}%</div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 leading-relaxed">
                📍 <strong>Posisi stand</strong> dikelola per-event dari tab <em>Event</em> di sini atau dari halaman <em>Kelola Event</em>. Tidak ada posisi default — setiap event memiliki zona dan stand yang berbeda.
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kontak</p>
                <div className="flex items-center gap-2 text-gray-600"><Phone size={13}/>{tenant.no_hp}</div>
                <div className="flex items-center gap-2 text-gray-600"><Mail size={13}/>{tenant.email}</div>
              </div>
            </div>
          )}

          {/* TAB: Event */}
          {tab === 'event' && (
            <div>
              <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
                <p className="text-sm text-gray-500">{tenantEvents.length} event</p>
                <button onClick={() => setShowAssign(true)}
                  className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition">
                  <Plus size={12}/> Assign Event
                </button>
              </div>
              {tenantEvents.length === 0
                ? <div className="py-12 text-center text-gray-400 text-sm"><Calendar size={28} className="text-gray-200 mx-auto mb-2"/>Belum ada event</div>
                : <div className="divide-y divide-gray-50">
                    {tenantEvents.map(e => (
                      <div key={e.id} className="px-5 py-3 flex items-start gap-3 group hover:bg-gray-50/50 transition">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm">{e.nama}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{fmtTgl(e.tanggal)}{e.jam_mulai && <span className="ml-1 text-gray-300">· {e.jam_mulai.replace(':','.')}{e.jam_selesai?`–${e.jam_selesai.replace(':','.')}`:''} WIB</span>}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <PosisiInlineEditor
                              value={e.posisi_event}
                              onChange={val => setTenantEvents(l => l.map(x => x.id===e.id ? {...x,posisi_event:val} : x))}
                              eventId={e.event_id}
                            />
                            <span className={`text-[10px] ${e.assigned_by==='admin'?'text-blue-500':'text-gray-400'}`}>
                              {e.assigned_by==='admin'?'Oleh Admin':'Mandiri'}
                            </span>
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

          {/* TAB: Profil Publik */}
          {tab === 'profil' && (
            <div className="p-5 space-y-4">
              <div className="bg-gray-100 rounded-2xl h-32 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Image size={28} className="mx-auto mb-1.5"/>
                  <p className="text-xs">Foto Usaha</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Nama Usaha</span><span className="font-semibold text-gray-800">{tenant.nama_usaha}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Kategori</span><span className="font-semibold text-gray-800">{tenant.kategori}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Kota</span><span className="font-semibold text-gray-800">{tenant.kota}</span></div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Deskripsi</p>
                <p className="text-gray-600 text-sm leading-relaxed">{tenant.deskripsi}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
                Galeri dan foto profil dapat diupload dari halaman Company Profile di dashboard UMKM.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 shrink-0 flex gap-2.5">
          {tab === 'usaha' && (
            <button onClick={save} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-70">
              {saving?<><Loader2 size={14} className="animate-spin"/>Menyimpan...</>:<><Save size={14}/>Simpan</>}
            </button>
          )}
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">Tutup</button>
        </div>

        {showAssign && (
          <AssignEventModal
            existingIds={tenantEvents.map(e => e.event_id)}
            onClose={() => setShowAssign(false)}
            onAssign={(ev) => { setTenantEvents(l => [...l, ev]); toast.success('UMKM berhasil di-assign ke event'); }}
          />
        )}
      </div>
    </>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Tenants() {
  const toast = useToast();
  const [tenants, setTenants] = useState(DUMMY_TENANTS);
  const [tab, setTab] = useState('aktif');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterEvent, setFilterEvent] = useState('semua');
  const [editItem, setEditItem] = useState(null);
  const [processing, setProcessing] = useState(null);
  const dSearch = useDebounce(search);

  const pending = tenants.filter(t => t.status === 'pending');
  const aktif   = tenants.filter(t => t.status === 'aktif');

  useEffect(() => {
    try {
      localStorage.setItem('pekan_pending_umkm', String(pending.length));
      window.dispatchEvent(new CustomEvent('pekan_pending_umkm_update',{detail:{count:pending.length}}));
    } catch {}
  }, [pending.length]);

  const approve = async (id, extra={}) => {
    setProcessing(id);
    await new Promise(r => setTimeout(r, 700));
    const t = tenants.find(x=>x.id===id);
    setTenants(l => l.map(t => t.id===id ? {...t, status:'aktif', ...extra} : t));
    toast.success('UMKM berhasil disetujui');
    // Auto-notify UMKM
    try {
      const { triggerUmkmApproved } = await import('../lib/notifications');
      if (t) triggerUmkmApproved(t.nama_usaha);
    } catch {}
    setProcessing(null);
    if (tab === 'pending' && pending.length === 1) setTab('aktif');
  };
  const reject = async (id) => {
    if (!confirm('Tolak pendaftaran ini?')) return;
    setProcessing(id);
    await new Promise(r => setTimeout(r, 500));
    setTenants(l => l.filter(t => t.id !== id));
    toast.error('Pendaftaran ditolak');
    setProcessing(null);
  };
  const saveEdit = (id, data) => {
    setTenants(l => l.map(t => t.id===id ? {...t,...data} : t));
    toast.success('Data tenant diperbarui');
  };

  // Count events per tenant from DUMMY_TENANT_EVENTS
  const eventCountForTenant = (tid) => Object.values(DUMMY_TENANT_EVENTS)
    .flat().filter(e => e.tenant_id === tid || e.id?.startsWith(tid)).length;

  const SORT_FNS = {
    newest:       (a,b) => new Date(b.tanggal_daftar)-new Date(a.tanggal_daftar),
    oldest:       (a,b) => new Date(a.tanggal_daftar)-new Date(b.tanggal_daftar),
    name_asc:     (a,b) => a.nama_usaha.localeCompare(b.nama_usaha),
    name_desc:    (a,b) => b.nama_usaha.localeCompare(a.nama_usaha),
    most_events:  (a,b) => eventCountForTenant(b.id)-eventCountForTenant(a.id),
    most_revenue: (a,b) => (b.total_penjualan||0)-(a.total_penjualan||0),
    most_komisi:  (a,b) => (b.komisi_terkumpul||0)-(a.komisi_terkumpul||0),
    komisi_rate:  (a,b) => (b.komisi_persen||0)-(a.komisi_persen||0),
  };

  const tenantIdsInEvent = (eventId) =>
    Object.entries(DUMMY_TENANT_EVENTS)
      .filter(([, evs]) => evs.some(e => e.event_id === eventId))
      .map(([tid]) => tid);

  const filtered = aktif
    .filter(t => (!dSearch
      || t.nama_usaha.toLowerCase().includes(dSearch.toLowerCase())
      || t.pemilik.toLowerCase().includes(dSearch.toLowerCase()))
      && (filterEvent === 'semua' || tenantIdsInEvent(filterEvent).includes(t.id))
    )
    .sort(SORT_FNS[sortBy] || SORT_FNS.newest);

  const totalPenjualan = aktif.reduce((s,t) => s+t.total_penjualan, 0);
  const totalKomisi    = aktif.reduce((s,t) => s+t.komisi_terkumpul, 0);

  return (
    <div className="space-y-5">
      <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[['Total UMKM',aktif.length,'text-gray-800','bg-white'],
          ['Pending',pending.length,'text-amber-700','bg-amber-50'],
          ['Total Penjualan',fmtRupiah(totalPenjualan),'text-gray-800','bg-white'],
          ['Komisi Terkumpul',fmtRupiah(totalKomisi),'text-emerald-700','bg-emerald-50'],
        ].map(([l,v,tc,bg]) => (
          <div key={l} className={`${bg} border border-gray-100 rounded-2xl p-4`}>
            <p className={`font-bold text-lg ${tc}`}>{v}</p>
            <p className="text-gray-400 text-xs mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {[['pending',`Menunggu (${pending.length})`],['aktif','UMKM Aktif']].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition border ${tab===v?'bg-green-700 text-white border-green-700':'bg-white text-gray-600 border-gray-200 hover:border-green-300'}`}>
            {l}{v==='pending' && pending.length>0 && <span className="ml-2 w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse"/>}
          </button>
        ))}
      </div>

      {tab === 'pending' && (
        pending.length === 0
          ? <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm"><CheckCircle size={36} className="text-green-300 mx-auto mb-2"/>Tidak ada pendaftaran</div>
          : <div className="grid sm:grid-cols-2 gap-4">{pending.map(t => <PendingCard key={t.id} t={t} onApprove={approve} onReject={reject} isProcessing={processing}/>)}</div>
      )}

      {tab === 'aktif' && (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Row 1: Search */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-50">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama usaha atau pemilik..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition"/>
              </div>
            </div>

            {/* Row 2: Filter by event */}
            <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3 flex-wrap">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Filter:</span>
              <select value={filterEvent} onChange={e=>setFilterEvent(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 bg-gray-50 focus:outline-none focus:border-green-400 transition">
                <option value="semua">Semua Event</option>
                {DUMMY_ALL_EVENTS.map(e => <option key={e.id} value={e.id}>{e.nama}</option>)}
              </select>
              {filterEvent !== 'semua' && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-semibold">
                  🎪 {DUMMY_ALL_EVENTS.find(e=>e.id===filterEvent)?.nama?.slice(0,25)}
                  <button onClick={()=>setFilterEvent('semua')} className="hover:text-red-500 ml-0.5">×</button>
                </span>
              )}
            </div>

            {/* Row 3: Sort */}
            <div className="px-4 py-2.5 flex items-center justify-between">
              <p className="text-xs text-gray-400">{filtered.length} dari {aktif.length} UMKM aktif</p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Urutkan:</span>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 bg-gray-50 focus:outline-none focus:border-green-400 transition">
                  <option value="newest">Terbaru Daftar</option>
                  <option value="oldest">Terlama Daftar</option>
                  <option value="name_asc">Nama A–Z</option>
                  <option value="name_desc">Nama Z–A</option>
                  <option value="most_events">Paling Banyak Event</option>
                  <option value="most_revenue">Revenue Tertinggi</option>
                  <option value="most_komisi">Komisi Terbanyak</option>
                  <option value="komisi_rate">Tarif Komisi ↓</option>
                </select>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {['Usaha','Kategori & Posisi','Komisi','Revenue','Aksi'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">Tidak ada hasil</td></tr>
                  : filtered.map(t => <TenantRow key={t.id} t={t} onEdit={setEditItem}/>)
                }
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">{filtered.length} UMKM aktif</div>
          </div>
        </>
      )}

      <EditDrawer tenant={editItem} onClose={() => setEditItem(null)} onSave={saveEdit}/>
    </div>
  );
}

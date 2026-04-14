// ZoneEditor.jsx — Kelola layout zona global (berlaku semua event, venue sama)
// Self-contained: baca/tulis langsung ke eventZones lib, notif parent via onZonesChange()
import React, { useState } from 'react';
import { Plus, Trash2, Settings, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { addZone, removeZone, addStands, removeStand, getGlobalZones, saveGlobalZones, saveAsVenueDefault, hasVenueDefault } from '../lib/eventZones';

const WARNA_PRESETS = ['#8B5E3C','#D97706','#7C3AED','#1D4ED8','#065F46','#9D174D','#374151','#B45309','#1e5c3a','#c48930'];

export default function ZoneEditor({ zones = [], onZonesChange }) {
  const [expanded, setExpanded] = useState(null);
  const [showAdd,  setShowAdd]  = useState(false);
  const [addCount,    setAddCount]    = useState({});
  const [isSaved,     setIsSaved]     = useState(false);
  const [nz, setNz] = useState({ zona: '', label: '', warna: '#374151', kapasitas: 6 });

  // Defensive: normalize zones
  const safe = (Array.isArray(zones) ? zones : []).map(z => ({
    zona:   z.zona  || '?',
    label:  z.label || `Zona ${z.zona}`,
    warna:  z.warna || '#374151',
    stands: Array.isArray(z.stands) ? z.stands : [],
  }));

  const totalStands = safe.reduce((n, z) => n + z.stands.length, 0);

  const refresh = () => { try { onZonesChange(); } catch {} };

  const handleAdd = () => {
    if (!nz.zona.trim() || !nz.label.trim()) return;
    try {
      addZone(nz.zona.toUpperCase().slice(0,3), nz.label.trim(), nz.warna, Math.max(1, Math.min(50, nz.kapasitas)));
      setNz({ zona:'', label:'', warna:'#374151', kapasitas:6 });
      setShowAdd(false);
      refresh();
    } catch(e) { alert(e.message); }
  };

  const handleRemoveZone = (zonaCode) => {
    if (!confirm(`Hapus Zona ${zonaCode}? Berlaku untuk semua event.`)) return;
    try { removeZone(zonaCode); refresh(); } catch {}
  };

  const handleAddStands = (zonaCode) => {
    const n = parseInt(addCount[zonaCode]) || 0;
    if (n < 1 || n > 20) { alert('Masukkan angka 1–20'); return; }
    try { addStands(zonaCode, n); setAddCount(p => ({...p,[zonaCode]:''})); refresh(); } catch {}
  };

  const handleRemoveStand = (standId) => {
    try { removeStand(standId); refresh(); } catch {}
  };



  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="flex gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
        <Info size={13} className="shrink-0 mt-0.5"/>
        <span>Layout zona <strong>berlaku untuk semua event</strong> (venue sama). Status stand terisi dikelola otomatis saat assign UMKM per event.</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-medium">{safe.length} zona · {totalStands} stand total</p>
        <div className="flex gap-2">
          <button onClick={() => {
              if (confirm('Reset ke layout default (4 zona festival)? Konfigurasi saat ini akan diganti.')) {
                saveGlobalZones([
                  { zona:'A', label:'Zona A – Kriya & Fashion', warna:'#8B5E3C', stands: Array.from({length:8},(_,i)=>({id:`A-${i+1}`})) },
                  { zona:'B', label:'Zona B – Kuliner',         warna:'#D97706', stands: Array.from({length:10},(_,i)=>({id:`B-${i+1}`})) },
                  { zona:'C', label:'Zona C – Seni & Pertunjukan', warna:'#7C3AED', stands: Array.from({length:4},(_,i)=>({id:`C-${i+1}`})) },
                  { zona:'P', label:'Zona P – Panggung',        warna:'#1D4ED8', stands: Array.from({length:2},(_,i)=>({id:`P-${i+1}`})) },
                ]);
                refresh();
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition"
            title="Reset ke 4-zona layout festival default">
            <Settings size={11}/> Reset Default
          </button>
          <button onClick={() => {
              if (!confirm('Simpan layout ini sebagai default venue permanen?\nSemua event baru akan otomatis menggunakan layout ini.')) return;
              const ok = saveAsVenueDefault(zones);
              if (ok) setIsSaved(true);
              setTimeout(() => setIsSaved(false), 2500);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              isSaved
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-green-700 hover:bg-green-800 text-white'
            }`}
            title="Simpan layout saat ini sebagai default untuk semua event baru">
            {isSaved ? '✓ Tersimpan!' : '⭐ Jadikan Default Venue'}
          </button>
          <button onClick={() => setShowAdd(p=>!p)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-semibold transition">
            <Plus size={11}/> Zona Baru
          </button>
        </div>
      </div>



      {/* Add zone form */}
      {showAdd && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Tambah Zona</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Kode *</label>
              <input value={nz.zona} maxLength={3} placeholder="D"
                onChange={e=>setNz(p=>({...p,zona:e.target.value.toUpperCase().slice(0,3)}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold uppercase focus:outline-none focus:border-green-400"/>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Jumlah Stand *</label>
              <input type="number" min={1} max={50} value={nz.kapasitas}
                onChange={e=>setNz(p=>({...p,kapasitas:+e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400"/>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Label Zona *</label>
            <input value={nz.label} placeholder="Zona D – Desain & Teknologi"
              onChange={e=>setNz(p=>({...p,label:e.target.value}))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400"/>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Warna</label>
            <div className="flex gap-1.5 flex-wrap items-center">
              {WARNA_PRESETS.map(w=>(
                <button key={w} onClick={()=>setNz(p=>({...p,warna:w}))}
                  className={`w-6 h-6 rounded-md border-2 transition ${nz.warna===w?'border-gray-700 scale-110':'border-transparent hover:scale-105'}`}
                  style={{background:w}} title={w}/>
              ))}
              <input type="color" value={nz.warna} onChange={e=>setNz(p=>({...p,warna:e.target.value}))}
                className="w-6 h-6 rounded-md cursor-pointer border border-gray-200 p-0.5"/>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setShowAdd(false)}
              className="flex-1 border border-gray-200 text-gray-500 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition">Batal</button>
            <button onClick={handleAdd} disabled={!nz.zona||!nz.label}
              className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50">
              + Zona {nz.zona}
            </button>
          </div>
        </div>
      )}

      {/* Zone list */}
      {safe.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-xl mb-2">🗺️</p>
          <p className="text-sm">Belum ada zona. Tambah zona atau pilih template.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {safe.map(z => {
            const exp = expanded === z.zona;
            const occ = z.stands.filter(s=>s.occupied).length;
            return (
              <div key={z.zona} className="border border-gray-100 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer select-none"
                  onClick={()=>setExpanded(exp?null:z.zona)}>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:z.warna}}/>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm leading-tight">{z.label}</p>
                    <p className="text-[10px] text-gray-400">{z.stands.length} stand · {occ} terisi saat ini</p>
                  </div>
                  {/* Mini bar */}
                  <div className="hidden sm:flex gap-0.5 shrink-0">
                    {z.stands.slice(0,12).map(s=>(
                      <div key={s.id} className="w-1.5 h-4 rounded-sm"
                        style={{background: s.occupied?'#fca5a5':z.warna, opacity:s.occupied?1:0.35}}/>
                    ))}
                    {z.stands.length>12 && <span className="text-[9px] text-gray-400 ml-1 self-center">+{z.stands.length-12}</span>}
                  </div>
                  {exp ? <ChevronUp size={13} className="text-gray-400 shrink-0"/> : <ChevronDown size={13} className="text-gray-400 shrink-0"/>}
                </div>

                {exp && (
                  <div className="px-4 py-3 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {z.stands.map(s=>(
                        <div key={s.id} className="relative group">
                          <div className={`flex flex-col items-center px-2 py-1.5 rounded-lg border text-[10px] font-bold min-w-[40px]
                            ${s.occupied?'bg-red-50 text-red-400 border-red-100':'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            <span>{s.id}</span>
                            <span className="font-normal text-[7px]">{s.occupied?'✕ Terisi':'○ Bebas'}</span>
                          </div>
                          {!s.occupied && (
                            <button onClick={()=>handleRemoveStand(s.id)}
                              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white hidden group-hover:flex items-center justify-center text-[9px] shadow">×</button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-400 shrink-0">Tambah:</span>
                      <input type="number" min={1} max={20} placeholder="Jml"
                        value={addCount[z.zona]||''}
                        onChange={e=>setAddCount(p=>({...p,[z.zona]:e.target.value}))}
                        className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-green-400"/>
                      <button onClick={()=>handleAddStands(z.zona)} disabled={!addCount[z.zona]}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-green-700 text-white rounded-lg text-[10px] font-semibold disabled:opacity-40 hover:bg-green-800 transition">
                        <Plus size={10}/> Stand
                      </button>
                      <div className="flex-1"/>
                      <button onClick={()=>handleRemoveZone(z.zona)}
                        className="flex items-center gap-1 px-2.5 py-1.5 border border-red-200 text-red-400 hover:bg-red-50 rounded-lg text-[10px] font-medium transition">
                        <Trash2 size={10}/> Hapus Zona
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

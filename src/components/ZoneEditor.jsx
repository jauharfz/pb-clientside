// ZoneEditor.jsx — Admin UI to manage zones & stands per event
// All mutations go through eventZones.js which persists to localStorage
import React, { useState } from 'react';
import { Plus, Trash2, Settings, ChevronDown, ChevronUp, Info } from 'lucide-react';
import {
  addZone, removeZone, addStands, removeStand,
  resetToTemplate, getZoneStats, ZONE_TEMPLATES,
} from '../lib/eventZones';

const WARNA_PRESETS = [
  '#8B5E3C','#D97706','#7C3AED','#1D4ED8','#065F46',
  '#9D174D','#374151','#B45309','#0369A1','#4D7C0F',
];

export default function ZoneEditor({ eventId, zones, onZonesChange }) {
  const [expandedZona, setExpandedZona] = useState(null);
  const [showAddZone, setShowAddZone]   = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [newZone, setNewZone] = useState({ zona:'', label:'', warna:'#374151', kapasitas:6 });
  const [addCount, setAddCount] = useState({}); // zonaId → count
  const [saving, setSaving]     = useState(false);

  const stats = getZoneStats(zones);

  const handleAddZone = () => {
    if (!newZone.zona.trim() || !newZone.label.trim()) return;
    try {
      const updated = addZone(eventId, {
        zona: newZone.zona.toUpperCase().trim(),
        label: newZone.label.trim(),
        warna: newZone.warna,
        kapasitas: Math.max(1, Math.min(50, newZone.kapasitas)),
      });
      onZonesChange(updated);
      setNewZone({ zona:'', label:'', warna:'#374151', kapasitas:6 });
      setShowAddZone(false);
    } catch(e) {
      alert(e.message);
    }
  };

  const handleRemoveZone = (zonaId) => {
    const z = zones.find(z => z.zona === zonaId);
    const hasOccupied = z?.stands.some(s => s.occupied);
    if (hasOccupied) {
      if (!confirm(`Zona ${zonaId} masih memiliki stand terisi. Hapus tetap?`)) return;
    } else {
      if (!confirm(`Hapus Zona ${zonaId} beserta ${z?.stands.length} stand?`)) return;
    }
    const updated = removeZone(eventId, zonaId);
    onZonesChange(updated);
  };

  const handleAddStands = (zonaId) => {
    const count = parseInt(addCount[zonaId]) || 1;
    if (count < 1 || count > 20) { alert('Tambah 1–20 stand sekaligus'); return; }
    const updated = addStands(eventId, zonaId, count);
    onZonesChange(updated);
    setAddCount(p => ({...p, [zonaId]: ''}));
  };

  const handleRemoveStand = (standId) => {
    const updated = removeStand(eventId, standId);
    onZonesChange(updated);
  };

  const handleTemplate = (key) => {
    if (!confirm(`Reset zona ke template "${key}"? Konfigurasi occupied saat ini akan hilang.`)) return;
    const updated = resetToTemplate(eventId, key);
    onZonesChange(updated);
    setShowTemplate(false);
  };

  return (
    <div className="space-y-4">
      {/* Header + stats */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Konfigurasi Zona & Stand</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-500">{zones.length} zona</span>
            <span className="text-xs text-gray-500">{stats.totalStands} stand total</span>
            <span className="text-xs text-green-600 font-medium">{stats.available} bebas</span>
            <span className="text-xs text-red-400 font-medium">{stats.occupied} terisi</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setShowTemplate(p => !p)}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition">
            <Settings size={12}/> Template
          </button>
          <button onClick={() => setShowAddZone(p => !p)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-semibold transition">
            <Plus size={12}/> Tambah Zona
          </button>
        </div>
      </div>

      {/* Template picker */}
      {showTemplate && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1.5">
            <Info size={13}/> Reset ke Template
          </p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(ZONE_TEMPLATES).map(([key, tmpl]) => (
              <button key={key} onClick={() => handleTemplate(key)}
                className="bg-white border border-blue-200 rounded-xl p-3 text-left hover:border-blue-400 transition">
                <p className="text-xs font-bold text-gray-800 capitalize mb-1">{key}</p>
                <p className="text-[10px] text-gray-400">
                  {tmpl.length} zona · {tmpl.reduce((n,z)=>n+z.kapasitas,0)} stand
                </p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {tmpl.map(z => (
                    <span key={z.zona} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{background:z.warna}}>{z.zona}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add zone form */}
      {showAddZone && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Tambah Zona Baru</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Kode Zona *</label>
              <input value={newZone.zona} onChange={e => setNewZone(p=>({...p,zona:e.target.value.toUpperCase().slice(0,3)}))}
                placeholder="D" maxLength={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold uppercase focus:outline-none focus:border-green-400"/>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Jumlah Stand *</label>
              <input type="number" min={1} max={50} value={newZone.kapasitas}
                onChange={e => setNewZone(p=>({...p,kapasitas:+e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400"/>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Label Zona *</label>
            <input value={newZone.label} onChange={e => setNewZone(p=>({...p,label:e.target.value}))}
              placeholder="Zona D – Desain & Teknologi"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400"/>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block">Warna Zona</label>
            <div className="flex gap-1.5 flex-wrap">
              {WARNA_PRESETS.map(w => (
                <button key={w} onClick={() => setNewZone(p=>({...p,warna:w}))}
                  className={`w-7 h-7 rounded-lg transition border-2 ${newZone.warna===w?'border-gray-700 scale-110':'border-transparent hover:scale-105'}`}
                  style={{background:w}}/>
              ))}
              <input type="color" value={newZone.warna} onChange={e => setNewZone(p=>({...p,warna:e.target.value}))}
                className="w-7 h-7 rounded-lg cursor-pointer border border-gray-200 p-0.5"/>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowAddZone(false)}
              className="flex-1 border border-gray-200 text-gray-500 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition">
              Batal
            </button>
            <button onClick={handleAddZone} disabled={!newZone.zona || !newZone.label}
              className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50">
              + Tambah Zona {newZone.zona}
            </button>
          </div>
        </div>
      )}

      {/* Zone list */}
      {zones.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-2xl mb-2">🗺️</p>
          <p className="text-sm">Belum ada zona. Tambah zona atau pilih template.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {zones.map(z => {
            const isExpanded = expandedZona === z.zona;
            const occupied   = z.stands.filter(s=>s.occupied).length;
            return (
              <div key={z.zona} className="border border-gray-100 rounded-2xl overflow-hidden">
                {/* Zone header row */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedZona(isExpanded ? null : z.zona)}>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{background:z.warna}}/>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm">{z.label}</p>
                    <p className="text-[11px] text-gray-400">{z.stands.length} stand · {occupied} terisi · {z.stands.length-occupied} bebas</p>
                  </div>
                  {/* Stand mini-preview */}
                  <div className="flex gap-0.5 shrink-0">
                    {z.stands.slice(0,12).map(s => (
                      <div key={s.id} className="w-2 h-4 rounded-sm"
                        style={{background: s.occupied ? '#fca5a5' : z.warna, opacity: s.occupied ? 1 : 0.4}}/>
                    ))}
                    {z.stands.length > 12 && <span className="text-[9px] text-gray-400 ml-1">+{z.stands.length-12}</span>}
                  </div>
                  {isExpanded ? <ChevronUp size={15} className="text-gray-400 shrink-0"/> : <ChevronDown size={15} className="text-gray-400 shrink-0"/>}
                </div>

                {/* Expanded: stand management */}
                {isExpanded && (
                  <div className="px-4 py-3 space-y-3">
                    {/* Stand grid with remove button */}
                    <div className="flex flex-wrap gap-1.5">
                      {z.stands.map(s => (
                        <div key={s.id} className="relative group">
                          <div className={`flex flex-col items-center px-2.5 py-1.5 rounded-xl border text-xs font-bold min-w-[52px]
                            ${s.occupied
                              ? 'bg-red-50 text-red-400 border-red-100'
                              : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            <span>{s.id}</span>
                            <span className="text-[8px] font-normal">{s.occupied?'✕ Terisi':'○ Bebas'}</span>
                          </div>
                          {/* Remove button — only if not occupied */}
                          {!s.occupied && (
                            <button
                              onClick={() => handleRemoveStand(s.id)}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white hidden group-hover:flex items-center justify-center transition shadow-sm"
                              title={`Hapus stand ${s.id}`}>
                              <span className="text-[10px] leading-none">×</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add stands row */}
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                      <span className="text-xs text-gray-400 shrink-0">Tambah stand:</span>
                      <input
                        type="number" min={1} max={20}
                        value={addCount[z.zona] || ''}
                        onChange={e => setAddCount(p=>({...p,[z.zona]:e.target.value}))}
                        placeholder="Jumlah"
                        className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-green-400"
                      />
                      <button onClick={() => handleAddStands(z.zona)}
                        disabled={!addCount[z.zona]}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-semibold transition disabled:opacity-40">
                        <Plus size={11}/> Tambah
                      </button>
                      <div className="flex-1"/>
                      <button onClick={() => handleRemoveZone(z.zona)}
                        className="flex items-center gap-1 px-2.5 py-1.5 border border-red-200 text-red-400 hover:bg-red-50 rounded-lg text-xs font-medium transition">
                        <Trash2 size={11}/> Hapus Zona
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

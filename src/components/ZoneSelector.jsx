// ZoneSelector.jsx — Click-to-select zone/stand grid
// Zones are per-event (from eventZones.js), not global hardcoded
// compact=true: smaller, used in modals/drawers

import React from 'react';

export default function ZoneSelector({ value, onChange, zones = [], compact = false }) {
  if (!zones || zones.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm">
        <p className="text-2xl mb-2">🗺️</p>
        <p>Belum ada zona dikonfigurasi untuk event ini.</p>
        <p className="text-xs mt-1 text-gray-300">Admin dapat menambah zona di tab "Kelola Zona".</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {zones.map(z => {
        const available = z.stands.filter(s => !s.occupied).length;
        return (
          <div key={z.zona}>
            {/* Zone header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{background: z.warna || '#374151'}}/>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider flex-1">{z.label}</p>
              <span className="text-[10px] text-gray-400 shrink-0">
                {available} bebas / {z.stands.length} stand
              </span>
            </div>
            {/* Stand grid */}
            <div className="flex flex-wrap gap-1.5">
              {z.stands.map(s => {
                const isSelected = value === s.id;
                const isOccupied = s.occupied;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={isOccupied && !isSelected}
                    onClick={() => !isOccupied && onChange(s.id)}
                    title={isOccupied ? 'Sudah terisi' : `Pilih ${s.id}`}
                    className={[
                      'flex flex-col items-center rounded-xl border text-xs font-bold transition',
                      compact ? 'px-2 py-1.5 min-w-[48px]' : 'px-3 py-2 min-w-[60px]',
                      isSelected
                        ? 'bg-green-700 text-white border-green-700 shadow-md ring-2 ring-green-200'
                        : isOccupied
                        ? 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-green-400 hover:bg-green-50 cursor-pointer',
                    ].join(' ')}
                  >
                    <span>{s.id}</span>
                    <span className={[
                      'font-normal mt-0.5',
                      compact ? 'text-[8px]' : 'text-[9px]',
                      isSelected ? 'text-green-100' : isOccupied ? 'text-red-300' : 'text-gray-400',
                    ].join(' ')}>
                      {isOccupied ? '✕ Terisi' : isSelected ? '✓ Dipilih' : '○ Bebas'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {value && (
        <p className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5">
          <span>📍</span> Dipilih: <span className="font-bold">{value}</span>
          <button onClick={() => onChange('')}
            className="ml-1 text-green-400 hover:text-red-400 transition text-sm leading-none">×</button>
        </p>
      )}
    </div>
  );
}

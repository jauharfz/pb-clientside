// ZoneSelector.jsx — Admin shared component for zone/stand selection
// Reusable for: EventDetail (assign tenant), Tenants (set posisi), Register approve flow

import React from 'react';

// This data should come from API in production: GET /api/events/:id/zones
export const DEFAULT_ZONES = [
  { zona:'A', label:'Zona A – Kriya & Fashion', stands:[
    {id:'A-1',occupied:false},{id:'A-2',occupied:true},{id:'A-3',occupied:true},
    {id:'A-4',occupied:false},{id:'A-5',occupied:false},{id:'A-6',occupied:true},
  ]},
  { zona:'B', label:'Zona B – Kuliner', stands:[
    {id:'B-1',occupied:false},{id:'B-2',occupied:false},{id:'B-3',occupied:true},
    {id:'B-4',occupied:false},{id:'B-5',occupied:true},
  ]},
  { zona:'C', label:'Zona C – Seni & Pertunjukan', stands:[
    {id:'C-1',occupied:false},{id:'C-2',occupied:false},
    {id:'C-3',occupied:false},{id:'C-4',occupied:true},
  ]},
];

/**
 * ZoneSelector — click-to-select zone/stand grid
 * @param {string} value - currently selected stand id (e.g. "A-3")
 * @param {function} onChange - called with new stand id
 * @param {array} zones - optional custom zones array
 * @param {boolean} compact - smaller layout
 */
export default function ZoneSelector({ value, onChange, zones = DEFAULT_ZONES, compact = false }) {
  return (
    <div className="space-y-3">
      {zones.map(z => (
        <div key={z.zona}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{z.label}</p>
          <div className={`flex flex-wrap gap-1.5`}>
            {z.stands.map(s => {
              const isSelected = value === s.id;
              const isOccupied = s.occupied;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={isOccupied}
                  onClick={() => !isOccupied && onChange(s.id)}
                  title={isOccupied ? 'Sudah terisi' : 'Klik untuk pilih'}
                  className={`
                    flex flex-col items-center px-3 py-2 rounded-xl border text-xs font-bold transition
                    ${compact ? 'min-w-[56px]' : 'min-w-[64px]'}
                    ${isSelected
                      ? 'bg-green-700 text-white border-green-700 shadow-md'
                      : isOccupied
                      ? 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-green-400 hover:bg-green-50 cursor-pointer'
                    }
                  `}
                >
                  <span>{s.id}</span>
                  <span className={`text-[9px] font-normal mt-0.5 ${isSelected?'text-green-100':isOccupied?'text-red-300':'text-gray-400'}`}>
                    {isOccupied ? '✕ Terisi' : isSelected ? '✓ Dipilih' : '○ Bebas'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {value && (
        <p className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5">
          <span>📍</span> Dipilih: <span className="font-bold">{value}</span>
          <button onClick={() => onChange('')} className="ml-1 text-green-400 hover:text-red-400 transition text-sm leading-none">×</button>
        </p>
      )}
    </div>
  );
}

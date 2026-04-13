// eventZones.js — Per-event zone/stand configuration
// Source of truth: localStorage (demo) → swap to API call in production
// Key: pekan_zones_{eventId}

const STORAGE_PREFIX = 'pekan_zones_';

// Default zone templates admin can start from
export const ZONE_TEMPLATES = {
  festival: [
    { zona:'A', label:'Zona A – Kriya & Fashion', warna:'#8B5E3C', kapasitas:8 },
    { zona:'B', label:'Zona B – Kuliner',          warna:'#D97706', kapasitas:10 },
    { zona:'C', label:'Zona C – Seni & Pertunjukan',warna:'#7C3AED', kapasitas:4 },
    { zona:'P', label:'Zona P – Panggung',          warna:'#1D4ED8', kapasitas:2 },
  ],
  workshop: [
    { zona:'R', label:'Zona R – Ruang Utama',  warna:'#065F46', kapasitas:6 },
    { zona:'L', label:'Zona L – Lab Praktek',  warna:'#9D174D', kapasitas:8 },
  ],
  bazaar: [
    { zona:'A', label:'Zona A – Depan',   warna:'#8B5E3C', kapasitas:10 },
    { zona:'B', label:'Zona B – Tengah',  warna:'#D97706', kapasitas:12 },
    { zona:'C', label:'Zona C – Belakang',warna:'#374151', kapasitas:8 },
  ],
};

// Default zones with seeded occupied data per event
const DEFAULT_EVENT_ZONES = {
  e1: [
    { zona:'A', label:'Zona A – Kriya & Fashion', warna:'#8B5E3C',
      stands:[
        {id:'A-1',occupied:false},{id:'A-2',occupied:true},{id:'A-3',occupied:true},
        {id:'A-4',occupied:false},{id:'A-5',occupied:false},{id:'A-6',occupied:true},
        {id:'A-7',occupied:false},{id:'A-8',occupied:false},
      ]},
    { zona:'B', label:'Zona B – Kuliner', warna:'#D97706',
      stands:[
        {id:'B-1',occupied:false},{id:'B-2',occupied:false},{id:'B-3',occupied:true},
        {id:'B-4',occupied:false},{id:'B-5',occupied:true},{id:'B-6',occupied:false},
        {id:'B-7',occupied:false},{id:'B-8',occupied:true},{id:'B-9',occupied:false},{id:'B-10',occupied:false},
      ]},
    { zona:'C', label:'Zona C – Seni & Pertunjukan', warna:'#7C3AED',
      stands:[
        {id:'C-1',occupied:false},{id:'C-2',occupied:false},
        {id:'C-3',occupied:false},{id:'C-4',occupied:true},
      ]},
    { zona:'P', label:'Zona P – Panggung', warna:'#1D4ED8',
      stands:[
        {id:'P-1',occupied:true},{id:'P-2',occupied:false},
      ]},
  ],
  e2: [
    { zona:'R', label:'Zona R – Ruang Utama', warna:'#065F46',
      stands:[
        {id:'R-1',occupied:true},{id:'R-2',occupied:false},{id:'R-3',occupied:true},
        {id:'R-4',occupied:false},{id:'R-5',occupied:false},{id:'R-6',occupied:false},
      ]},
    { zona:'L', label:'Zona L – Lab Praktek', warna:'#9D174D',
      stands:[
        {id:'L-1',occupied:false},{id:'L-2',occupied:true},{id:'L-3',occupied:false},
        {id:'L-4',occupied:false},{id:'L-5',occupied:false},
      ]},
  ],
  e3: [
    { zona:'A', label:'Zona A – Depan',    warna:'#8B5E3C', stands: Array.from({length:10},(_,i)=>({id:`A-${i+1}`,occupied:false})) },
    { zona:'B', label:'Zona B – Tengah',   warna:'#D97706', stands: Array.from({length:12},(_,i)=>({id:`B-${i+1}`,occupied:false})) },
    { zona:'C', label:'Zona C – Belakang', warna:'#374151', stands: Array.from({length:8}, (_,i)=>({id:`C-${i+1}`,occupied:false})) },
  ],
};

/** Get zones for an event (from localStorage, falling back to default seed) */
export function getEventZones(eventId) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + eventId);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_EVENT_ZONES[eventId] || ZONE_TEMPLATES.festival.map(z => ({
    ...z,
    stands: Array.from({length: z.kapasitas}, (_, i) => ({ id:`${z.zona}-${i+1}`, occupied:false })),
  }));
}

/** Save zones for an event */
export function saveEventZones(eventId, zones) {
  try {
    localStorage.setItem(STORAGE_PREFIX + eventId, JSON.stringify(zones));
    window.dispatchEvent(new CustomEvent('pekan_zones_update', { detail: { eventId } }));
  } catch {}
}

/** Mark a stand as occupied/free */
export function setStandOccupied(eventId, standId, occupied) {
  const zones = getEventZones(eventId);
  const updated = zones.map(z => ({
    ...z,
    stands: z.stands.map(s => s.id === standId ? { ...s, occupied } : s),
  }));
  saveEventZones(eventId, updated);
  return updated;
}

/** Derive occupied stands from assigned tenants */
export function syncOccupiedFromTenants(eventId, tenants) {
  const zones = getEventZones(eventId);
  const occupiedIds = new Set(
    tenants.map(t => t.posisi_event).filter(Boolean)
  );
  const updated = zones.map(z => ({
    ...z,
    stands: z.stands.map(s => ({ ...s, occupied: occupiedIds.has(s.id) })),
  }));
  saveEventZones(eventId, updated);
  return updated;
}

/** Add a new zone to an event */
export function addZone(eventId, { zona, label, warna, kapasitas }) {
  const zones = getEventZones(eventId);
  if (zones.find(z => z.zona === zona)) throw new Error(`Zona ${zona} sudah ada`);
  const newZone = {
    zona, label, warna: warna || '#374151',
    stands: Array.from({length: kapasitas}, (_, i) => ({ id:`${zona}-${i+1}`, occupied:false })),
  };
  const updated = [...zones, newZone];
  saveEventZones(eventId, updated);
  return updated;
}

/** Remove a zone from an event */
export function removeZone(eventId, zonaId) {
  const zones = getEventZones(eventId);
  const updated = zones.filter(z => z.zona !== zonaId);
  saveEventZones(eventId, updated);
  return updated;
}

/** Add stands to an existing zone */
export function addStands(eventId, zonaId, count) {
  const zones = getEventZones(eventId);
  const updated = zones.map(z => {
    if (z.zona !== zonaId) return z;
    const maxNum = Math.max(0, ...z.stands.map(s => parseInt(s.id.split('-')[1])||0));
    const newStands = Array.from({length: count}, (_, i) => ({
      id: `${zonaId}-${maxNum + i + 1}`, occupied: false,
    }));
    return { ...z, stands: [...z.stands, ...newStands] };
  });
  saveEventZones(eventId, updated);
  return updated;
}

/** Remove a stand from a zone */
export function removeStand(eventId, standId) {
  const zones = getEventZones(eventId);
  const updated = zones.map(z => ({
    ...z, stands: z.stands.filter(s => s.id !== standId),
  }));
  saveEventZones(eventId, updated);
  return updated;
}

/** Reset zones for an event to a template */
export function resetToTemplate(eventId, templateKey) {
  const template = ZONE_TEMPLATES[templateKey];
  if (!template) return;
  const zones = template.map(z => ({
    ...z,
    stands: Array.from({length: z.kapasitas}, (_, i) => ({ id:`${z.zona}-${i+1}`, occupied:false })),
  }));
  saveEventZones(eventId, zones);
  return zones;
}

/** Summary stats for a zone config */
export function getZoneStats(zones) {
  const totalStands = zones.reduce((n, z) => n + z.stands.length, 0);
  const occupied    = zones.reduce((n, z) => n + z.stands.filter(s=>s.occupied).length, 0);
  return { totalStands, occupied, available: totalStands - occupied };
}

// eventZones.js — Zone & Stand configuration
//
// ARCHITECTURE (best practice for recurring-venue events):
//   • Zone layout (which zones exist, how many stands) = GLOBAL config
//     stored in localStorage: "pekan_zones_global"
//     → same venue is reused event after event, so layout is shared
//   • Occupied state = per-event
//     stored in localStorage: "pekan_occupied_{eventId}"
//     → who has which stand differs per event
//
// This means admin sets up zones once, then just assigns stands per event.
// Admin can still edit the global layout at any time.

const GLOBAL_KEY    = 'pekan_zones_global';
const OVERRIDE_KEY  = 'pekan_zones_default_override'; // Admin-saved permanent default
const OCC_PREFIX    = 'pekan_occupied_';
const UPDATE_EVT    = 'pekan_zones_update';

// ── Default global layout ─────────────────────────────────────────────────────
export const DEFAULT_GLOBAL_ZONES = [
  {
    zona:'A', label:'Zona A – Kriya & Fashion', warna:'#8B5E3C',
    stands: Array.from({ length: 8 }, (_, i) => ({ id: `A-${i + 1}` })),
  },
  {
    zona:'B', label:'Zona B – Kuliner', warna:'#D97706',
    stands: Array.from({ length: 10 }, (_, i) => ({ id: `B-${i + 1}` })),
  },
  {
    zona:'C', label:'Zona C – Seni & Pertunjukan', warna:'#7C3AED',
    stands: Array.from({ length: 4 }, (_, i) => ({ id: `C-${i + 1}` })),
  },
  {
    zona:'P', label:'Zona P – Panggung', warna:'#1D4ED8',
    stands: Array.from({ length: 2 }, (_, i) => ({ id: `P-${i + 1}` })),
  },
];

export const ZONE_TEMPLATES = {
  festival: [
    { zona:'A', label:'Zona A – Kriya & Fashion',    warna:'#8B5E3C', kapasitas: 8  },
    { zona:'B', label:'Zona B – Kuliner',             warna:'#D97706', kapasitas: 10 },
    { zona:'C', label:'Zona C – Seni & Pertunjukan',  warna:'#7C3AED', kapasitas: 4  },
    { zona:'P', label:'Zona P – Panggung',            warna:'#1D4ED8', kapasitas: 2  },
  ],
  workshop: [
    { zona:'R', label:'Zona R – Ruang Utama',  warna:'#065F46', kapasitas: 6 },
    { zona:'L', label:'Zona L – Lab Praktek',  warna:'#9D174D', kapasitas: 8 },
  ],
  bazaar: [
    { zona:'A', label:'Zona A – Depan',    warna:'#8B5E3C', kapasitas: 10 },
    { zona:'B', label:'Zona B – Tengah',   warna:'#D97706', kapasitas: 12 },
    { zona:'C', label:'Zona C – Belakang', warna:'#374151', kapasitas: 8  },
  ],
};

// ── Global layout CRUD ────────────────────────────────────────────────────────

/** Get the global zone layout (stand definitions, no occupied state) */
export function getGlobalZones() {
  try {
    const raw = localStorage.getItem(GLOBAL_KEY);
    if (raw) return JSON.parse(raw);
    // Fall back to admin-saved default, then hardcoded default
    const override = localStorage.getItem(OVERRIDE_KEY);
    if (override) return JSON.parse(override);
  } catch {}
  return DEFAULT_GLOBAL_ZONES;
}

/**
 * Save current layout as the permanent venue default.
 * Future events (and any event without a saved layout) will inherit this.
 */
export function saveAsVenueDefault(zones) {
  try {
    const clean = zones.map(z => ({
      zona: z.zona, label: z.label, warna: z.warna,
      stands: z.stands.map(s => ({ id: s.id })),
    }));
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(clean));
    window.dispatchEvent(new CustomEvent(UPDATE_EVT));
    return true;
  } catch { return false; }
}

/** Check if admin has saved a custom venue default */
export function hasVenueDefault() {
  return !!localStorage.getItem(OVERRIDE_KEY);
}

/** Save the global zone layout */
export function saveGlobalZones(zones) {
  try {
    // Strip occupied from layout — occupied is per-event only
    const clean = zones.map(z => ({
      zona: z.zona, label: z.label, warna: z.warna,
      stands: z.stands.map(s => ({ id: s.id })),
    }));
    localStorage.setItem(GLOBAL_KEY, JSON.stringify(clean));
    window.dispatchEvent(new CustomEvent(UPDATE_EVT));
  } catch {}
}

export function addZone(zonaCode, label, warna, kapasitas) {
  const zones = getGlobalZones();
  const code  = zonaCode.toUpperCase().trim();
  if (zones.find(z => z.zona === code)) throw new Error(`Zona ${code} sudah ada`);
  const n = Math.max(1, Math.min(50, kapasitas));
  const newZone = {
    zona: code, label, warna: warna || '#374151',
    stands: Array.from({ length: n }, (_, i) => ({ id: `${code}-${i + 1}` })),
  };
  const updated = [...zones, newZone];
  saveGlobalZones(updated);
  return updated;
}

export function removeZone(zonaCode) {
  const updated = getGlobalZones().filter(z => z.zona !== zonaCode);
  saveGlobalZones(updated);
  return updated;
}

export function addStands(zonaCode, count) {
  const zones = getGlobalZones();
  const updated = zones.map(z => {
    if (z.zona !== zonaCode) return z;
    const maxNum = Math.max(0, ...z.stands.map(s => parseInt(s.id.split('-')[1]) || 0));
    const newStands = Array.from({ length: count }, (_, i) => ({
      id: `${zonaCode}-${maxNum + i + 1}`,
    }));
    return { ...z, stands: [...z.stands, ...newStands] };
  });
  saveGlobalZones(updated);
  return updated;
}

export function removeStand(standId) {
  const zones = getGlobalZones();
  const updated = zones.map(z => ({
    ...z, stands: z.stands.filter(s => s.id !== standId),
  }));
  saveGlobalZones(updated);
  return updated;
}

export function resetToTemplate(templateKey) {
  const tmpl = ZONE_TEMPLATES[templateKey];
  if (!tmpl) return;
  const zones = tmpl.map(z => ({
    zona: z.zona, label: z.label, warna: z.warna,
    stands: Array.from({ length: z.kapasitas }, (_, i) => ({ id: `${z.zona}-${i + 1}` })),
  }));
  saveGlobalZones(zones);
  return zones;
}

// ── Per-event occupied state ──────────────────────────────────────────────────

/** Get stand IDs that are occupied for a given event */
function getOccupied(eventId) {
  try {
    return new Set(JSON.parse(localStorage.getItem(OCC_PREFIX + eventId) || '[]'));
  } catch {
    return new Set();
  }
}

function saveOccupied(eventId, occupiedSet) {
  try {
    localStorage.setItem(OCC_PREFIX + eventId, JSON.stringify([...occupiedSet]));
  } catch {}
}

/**
 * Get zones for a specific event:
 * global layout + per-event occupied state merged
 */
export function getEventZones(eventId) {
  const layout   = getGlobalZones();
  const occupied = getOccupied(eventId);
  return layout.map(z => ({
    ...z,
    stands: z.stands.map(s => ({ ...s, occupied: occupied.has(s.id) })),
  }));
}

/**
 * Sync occupied stands from the list of assigned tenants.
 * Called whenever a tenant is assigned or removed.
 */
export function syncOccupiedFromTenants(eventId, tenants) {
  const occupiedIds = new Set(
    tenants.map(t => t.posisi_event).filter(Boolean)
  );
  saveOccupied(eventId, occupiedIds);
  return getEventZones(eventId);
}

/** Stats helper */
export function getZoneStats(zones) {
  const total    = zones.reduce((n, z) => n + z.stands.length, 0);
  const occupied = zones.reduce((n, z) => n + z.stands.filter(s => s.occupied).length, 0);
  return { total, occupied, available: total - occupied };
}

// ── Backward compat alias ─────────────────────────────────────────────────────
export function saveEventZones(eventId, zones) {
  // For backward compat: save the occupied state extracted from zones
  const occupied = new Set(
    zones.flatMap(z => z.stands.filter(s => s.occupied).map(s => s.id))
  );
  saveOccupied(eventId, occupied);
}

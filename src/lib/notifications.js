// lib/notifications.js — Event-driven notification queue
// Works in dummy/offline mode via localStorage
// Replace addNotif() with API POST when backend ready
// Auto-triggers when actions happen (approve, assign, register, etc.)

export const NotifType = {
  // Member receives
  MEMBER_APPROVED:      'member_approved',      // admin setujui akun baru
  EVENT_ASSIGNED:       'event_assigned',       // admin assign ke event
  EVENT_STATUS_CHANGE:  'event_status_change',  // event berlangsung/selesai
  STORY_DELETED:        'story_deleted',         // admin hapus story
  // UMKM receives
  UMKM_APPROVED:        'umkm_approved',         // admin setujui pendaftaran
  UMKM_EVENT_APPROVED:  'umkm_event_approved',   // admin setujui request event
  UMKM_EVENT_ASSIGNED:  'umkm_event_assigned',   // admin assign langsung
  // Admin receives
  NEW_MEMBER_REQUEST:   'new_member_request',    // member baru daftar
  NEW_UMKM_REQUEST:     'new_umkm_request',      // umkm baru daftar
  EVENT_REGISTER:       'event_register',         // member daftar mandiri ke event
  UMKM_EVENT_REQUEST:   'umkm_event_request',    // umkm request ikut event
};

const ICONS = {
  member_approved:      '✅',
  event_assigned:       '📅',
  event_status_change:  '🔔',
  story_deleted:        '🗑️',
  umkm_approved:        '✅',
  umkm_event_approved:  '📅',
  umkm_event_assigned:  '📍',
  new_member_request:   '👤',
  new_umkm_request:     '🏪',
  event_register:       '📋',
  umkm_event_request:   '🏬',
};

const key = (role) => `pekan_notif_${role}`;
const DISPATCH_EVENT = 'pekan_notif_update';

/** Get notifications for a role (member | umkm | admin) */
export function getNotifs(role) {
  try { return JSON.parse(localStorage.getItem(key(role)) || '[]'); } catch { return []; }
}

/** Add a notification for a role */
export function addNotif(role, { type, title, message, link = null }) {
  const existing = getNotifs(role);
  const notif = {
    id:         'n' + Date.now() + Math.random().toString(36).slice(2, 5),
    type,
    icon:       ICONS[type] || '🔔',
    title,
    message,
    link,
    read:       false,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(key(role), JSON.stringify([notif, ...existing].slice(0, 50)));
  window.dispatchEvent(new CustomEvent(DISPATCH_EVENT, { detail: { role } }));
  return notif;
}

/** Mark one notification as read */
export function markRead(role, id) {
  const updated = getNotifs(role).map(n => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem(key(role), JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(DISPATCH_EVENT, { detail: { role } }));
}

/** Mark all notifications as read */
export function markAllRead(role) {
  const updated = getNotifs(role).map(n => ({ ...n, read: true }));
  localStorage.setItem(key(role), JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(DISPATCH_EVENT, { detail: { role } }));
}

/** Get unread count */
export function unreadCount(role) {
  return getNotifs(role).filter(n => !n.read).length;
}

/** React hook — subscribes to realtime notification updates */
export function useNotifCount(role) {
  const { useState, useEffect } = require('react');
  const [count, setCount] = useState(() => unreadCount(role));

  useEffect(() => {
    const handler = (e) => {
      if (!e.detail?.role || e.detail.role === role) {
        setCount(unreadCount(role));
      }
    };
    setCount(unreadCount(role));
    window.addEventListener(DISPATCH_EVENT, handler);
    return () => window.removeEventListener(DISPATCH_EVENT, handler);
  }, [role]);

  return count;
}

// ── Pre-built trigger helpers ─────────────────────────────────────────────────

export const triggerMemberApproved = (memberNama) =>
  addNotif('member', {
    type: NotifType.MEMBER_APPROVED,
    title: 'Akun Diverifikasi ✅',
    message: `Selamat ${memberNama}! Akun Kreator kamu telah diverifikasi admin. Profil kamu kini tampil di direktori publik.`,
    link: '/dashboard/profil',
  });

export const triggerEventAssignedToMember = (eventNama, peran) =>
  addNotif('member', {
    type: NotifType.EVENT_ASSIGNED,
    title: 'Kamu Ditugaskan ke Event 📅',
    message: `Admin menugaskan kamu sebagai ${peran} di "${eventNama}".`,
    link: '/dashboard/event',
  });

export const triggerUmkmApproved = (namaUsaha) =>
  addNotif('umkm', {
    type: NotifType.UMKM_APPROVED,
    title: 'Usaha Disetujui ✅',
    message: `"${namaUsaha}" berhasil didaftarkan. Kamu bisa mulai menggunakan dashboard UMKM.`,
    link: '/dashboard',
  });

export const triggerUmkmEventApproved = (namaUsaha, eventNama, posisi) =>
  addNotif('umkm', {
    type: NotifType.UMKM_EVENT_APPROVED,
    title: 'Permintaan Event Disetujui 📅',
    message: `"${namaUsaha}" disetujui untuk "${eventNama}" di posisi ${posisi}.`,
    link: '/dashboard/event',
  });

export const triggerUmkmEventAssigned = (eventNama, posisi) =>
  addNotif('umkm', {
    type: NotifType.UMKM_EVENT_ASSIGNED,
    title: 'Usahamu Dijadwalkan ke Event 📍',
    message: `Admin menambahkan usahamu ke "${eventNama}" di posisi ${posisi}.`,
    link: '/dashboard/event',
  });

export const triggerNewMemberRequest = (memberNama) =>
  addNotif('admin', {
    type: NotifType.NEW_MEMBER_REQUEST,
    title: 'Pendaftaran Member Baru 👤',
    message: `${memberNama} mendaftar sebagai Kreator. Perlu verifikasi.`,
    link: '/members',
  });

export const triggerNewUmkmRequest = (namaUsaha) =>
  addNotif('admin', {
    type: NotifType.NEW_UMKM_REQUEST,
    title: 'Pendaftaran UMKM Baru 🏪',
    message: `"${namaUsaha}" mendaftar sebagai UMKM. Perlu verifikasi.`,
    link: '/tenants',
  });

export const triggerUmkmEventRequest = (namaUsaha, eventNama, posisi) =>
  addNotif('admin', {
    type: NotifType.UMKM_EVENT_REQUEST,
    title: 'Permintaan Ikut Event 🏬',
    message: `"${namaUsaha}" ingin bergabung ke "${eventNama}" di posisi ${posisi}. Menunggu persetujuan.`,
    link: '/events',
  });

export const triggerMemberEventRegister = (memberNama, eventNama) =>
  addNotif('admin', {
    type: NotifType.EVENT_REGISTER,
    title: 'Member Daftar Event 📋',
    message: `${memberNama} mendaftar mandiri ke "${eventNama}".`,
    link: '/events',
  });

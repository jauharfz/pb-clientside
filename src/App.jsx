// src/App.jsx
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Tenants from './pages/Tenants';
import Reports from './pages/Reports';
import Events from './pages/Events';
import Monitor from './pages/Monitor';
import Profile from './pages/Profile';
import { ToastProvider } from './components/Toast';

// Helper: ambil data user dari localStorage
const getStoredUser = () => {
    try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

/**
 * PrivateRoute — Proteksi umum: harus sudah login (ada token).
 * Jika belum login, redirect ke /login.
 */
const PrivateRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * AdminRoute — Proteksi berlapis: harus login DAN role harus 'admin'.
 * OpenAPI AdminUser.role enum: ['admin', 'petugas']
 * Endpoint yang hanya boleh diakses admin:
 *   - GET /members, POST /members, PUT /members/:id  → /members
 *   - GET /umkm                                      → /tenants
 *   - GET /reports, GET /reports/export              → /reports
 *   - GET /events, POST /events, PATCH /events/:id   → /events
 *
 * Jika bukan admin, redirect ke '/' (Dashboard).
 */
const AdminRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    const user = getStoredUser();
    if (user?.role !== 'admin') return <Navigate to="/" replace />;

    return children;
};

/**
 * PublicOnlyRoute — Jika sudah login dan mencoba buka /login,
 * redirect langsung ke Dashboard.
 */
const PublicOnlyRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
    return (
        <ToastProvider>
            <Router>
                <Routes>

                    {/* ── PUBLIC ROUTES — tidak memerlukan login ──────────────── */}

                    {/*
                     * /profile — Company profile statis (REQ-PROFILE-001).
                     * Tidak memerlukan autentikasi, dapat diakses siapa saja.
                     */}
                    <Route path="/profile" element={<Profile />} />

                    {/*
                     * /monitor — Display monitor real-time untuk layar besar di venue.
                     * Tidak memerlukan layout admin. Menggunakan token localStorage
                     * jika tersedia (buka dari browser dengan sesi admin aktif).
                     */}
                    <Route path="/monitor" element={<Monitor />} />

                    {/* ── AUTH ROUTE ─────────────────────────────────────────── */}

                    <Route
                        path="/login"
                        element={
                            <PublicOnlyRoute>
                                <Login />
                            </PublicOnlyRoute>
                        }
                    />

                    {/* ── PROTECTED ROUTES — menggunakan AdminLayout ──────────── */}

                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <AdminLayout />
                            </PrivateRoute>
                        }
                    >
                        {/* Dashboard: boleh diakses admin DAN petugas */}
                        <Route index element={<Dashboard />} />

                        {/* Route berikut Admin only per OpenAPI spec */}
                        <Route
                            path="members"
                            element={
                                <AdminRoute>
                                    <Members />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="tenants"
                            element={
                                <AdminRoute>
                                    <Tenants />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="reports"
                            element={
                                <AdminRoute>
                                    <Reports />
                                </AdminRoute>
                            }
                        />
                        {/*
                         * /events — Manajemen event (Opsi C).
                         * Admin only: GET /events, POST /events, PATCH /events/:id
                         */}
                        <Route
                            path="events"
                            element={
                                <AdminRoute>
                                    <Events />
                                </AdminRoute>
                            }
                        />
                    </Route>

                    {/* Catch-all: redirect path tidak dikenal ke Dashboard */}
                    <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
            </Router>
        </ToastProvider>
    );
}

export default App;
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Tenants from './pages/Tenants';
import Reports from './pages/Reports';
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
                    <Route
                        path="/login"
                        element={
                            <PublicOnlyRoute>
                                <Login />
                            </PublicOnlyRoute>
                        }
                    />

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
                    </Route>

                    {/* Catch-all: redirect path tidak dikenal ke Dashboard */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ToastProvider>
    );
}

export default App;
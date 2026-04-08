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
import Settings from './pages/Settings';   // ← NEW
import { ToastProvider } from './components/Toast';

const getStoredUser = () => {
    try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    } catch { return null; }
};

/** PrivateRoute — harus sudah login */
const PrivateRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/** AdminRoute — harus login DAN role = admin */
const AdminRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    const user = getStoredUser();
    if (user?.role !== 'admin') return <Navigate to="/" replace />;
    return children;
};

/** PublicOnlyRoute — redirect ke Dashboard jika sudah login */
const PublicOnlyRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
    return (
        <ToastProvider>
            <Router>
                <Routes>

                    {/* ── PUBLIC ROUTES ─────────────────────────────────── */}
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/monitor" element={<Monitor />} />

                    {/* ── AUTH ──────────────────────────────────────────── */}
                    <Route
                        path="/login"
                        element={
                            <PublicOnlyRoute>
                                <Login />
                            </PublicOnlyRoute>
                        }
                    />

                    {/* ── PROTECTED (AdminLayout) ────────────────────────── */}
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <AdminLayout />
                            </PrivateRoute>
                        }
                    >
                        {/* Dashboard: admin & petugas */}
                        <Route index element={<Dashboard />} />

                        {/* Settings: semua role yang sudah login */}
                        <Route path="settings" element={<Settings />} />

                        {/* Admin only */}
                        <Route
                            path="members"
                            element={<AdminRoute><Members /></AdminRoute>}
                        />
                        <Route
                            path="tenants"
                            element={<AdminRoute><Tenants /></AdminRoute>}
                        />
                        <Route
                            path="reports"
                            element={<AdminRoute><Reports /></AdminRoute>}
                        />
                        <Route
                            path="events"
                            element={<AdminRoute><Events /></AdminRoute>}
                        />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ToastProvider>
    );
}

export default App;
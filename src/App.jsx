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
import EventDetail from './pages/EventDetail';
import Monitor from './pages/Monitor';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { ToastProvider } from './components/Toast';

const getStoredUser = () => {
    try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    } catch { return null; }
};

const PrivateRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    const user = getStoredUser();
    if (user?.role !== 'admin') return <Navigate to="/" replace />;
    return children;
};

const PublicOnlyRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
    return (
        <ToastProvider>
            <Router>
                <Routes>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/monitor" element={<Monitor />} />

                    <Route path="/login" element={
                        <PublicOnlyRoute><Login /></PublicOnlyRoute>
                    }/>

                    <Route path="/" element={
                        <PrivateRoute><AdminLayout /></PrivateRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="members"  element={<AdminRoute><Members /></AdminRoute>} />
                        <Route path="tenants"  element={<AdminRoute><Tenants /></AdminRoute>} />
                        <Route path="reports"  element={<AdminRoute><Reports /></AdminRoute>} />
                        <Route path="events"   element={<AdminRoute><Events /></AdminRoute>} />
                        <Route path="events/:id" element={<AdminRoute><EventDetail /></AdminRoute>} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ToastProvider>
    );
}

export default App;

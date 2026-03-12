// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Tenants from './pages/Tenants';
import Reports from './pages/Reports'; // <--- IMPORT BARU

const PrivateRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="members" element={<Members />} />
                    <Route path="tenants" element={<Tenants />} />

                    {/* GANTI PLACEHOLDER DENGAN KOMPONEN REPORTS */}
                    <Route path="reports" element={<Reports />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;

// src/services/api.js
import axios from 'axios';

const api = axios.create({
    // Gunakan environment variable nanti, fallback ke mock server untuk sekarang
    baseURL: import.meta.env.VITE_API_URL || 'https://37d894bd-e0ae-4224-81af-cda1ea415f2e.mock.pstmn.io/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor untuk menyisipkan token otomatis (jika ada)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor untuk handle error global (misal token expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle logout otomatis jika unauthenticated
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

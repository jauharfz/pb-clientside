// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://c0ddbb09-6731-4e3b-b51c-04306c08832c.mock.pstmn.io/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR
// ─────────────────────────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
    // Sisipkan JWT token ke setiap request yang butuh autentikasi
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    /**
     * [FIX] ROOT CAUSE "tap → logout":
     *
     * Postman private mock server memerlukan header "x-api-key" berisi
     * Postman API Key milik akun pemilik collection. Tanpa header ini,
     * mock server mengembalikan HTTP 401 untuk SEMUA request — bukan
     * karena JWT token tidak valid, melainkan karena Postman sendiri
     * menolak akses ke mock collection-nya.
     *
     * Ini BERBEDA dengan 401 dari real Flask API (token expired/invalid).
     *
     * Solusi: baca VITE_POSTMAN_API_KEY dari .env, sisipkan sebagai
     * header x-api-key saat menggunakan mock server.
     *
     * Cara pakai:
     *   1. Buka Postman → klik avatar/foto profil → Settings → API keys
     *   2. Generate API key baru (atau copy yang sudah ada)
     *   3. Buat file .env di root project (sejajar package.json):
     *        VITE_POSTMAN_API_KEY=your_postman_api_key_here
     *   4. Restart dev server: npm run dev
     *
     * Saat deploy ke production dengan Flask API sungguhan,
     * VITE_POSTMAN_API_KEY tidak perlu diisi — header ini hanya
     * dikirim kalau nilainya ada.
     */
    const postmanApiKey = import.meta.env.VITE_POSTMAN_API_KEY;
    if (postmanApiKey) {
        config.headers['x-api-key'] = postmanApiKey;
    }

    return config;
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: parse pesan error dari response
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Membaca pesan error dari response body, termasuk kasus responseType: 'blob'.
 *
 * Ketika request pakai responseType: 'blob' (GET /reports/export), axios
 * membungkus seluruh response body — termasuk error body — sebagai Blob.
 * Akibatnya error.response.data bukan JSON, melainkan Blob object.
 * Fungsi ini detect hal itu dan konversi kembali ke string.
 */
const parseErrorData = async (error) => {
    try {
        const data = error.response?.data;
        if (!data) return null;

        if (data instanceof Blob) {
            const text = await data.text();
            return JSON.parse(text);
        }

        return data; // sudah berupa object
    } catch {
        return null;
    }
};

/**
 * Membedakan 401 dari infrastruktur Postman mock vs 401 dari real API.
 *
 * Postman mock 401 (infrastruktur):
 *   { "error": { "name": "authError", "message": "Unauthorized" } }
 *   → Bukan karena JWT, tapi karena tidak ada x-api-key header
 *   → JANGAN logout, ini bukan kesalahan token user
 *
 * Real API 401 (token expired/invalid):
 *   { "status": "error", "message": "Token tidak valid atau telah kadaluarsa" }
 *   → Ini baru berarti sesi user sudah habis → HARUS logout
 *
 * Jika x-api-key sudah diisi dengan benar di .env, Postman tidak akan
 * return 401 lagi sehingga fungsi ini hanya fallback tambahan.
 */
const isPostmanInfrastructure401 = (errorData) => {
    if (!errorData) return false;
    // Cek format response Postman: { error: { name: "authError", ... } }
    return (
        errorData?.error?.name === 'authError' ||
        errorData?.error?.name === 'mockRequestNotFoundError' ||
        typeof errorData?.error === 'object'
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// ─────────────────────────────────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (!error.response) {
            // Network error (server mati, CORS, timeout) — tidak ada status code
            return Promise.reject(error);
        }

        const errorData = await parseErrorData(error);
        const message = errorData?.message || errorData?.error?.message || '';
        if (message) error.message = message;

        switch (error.response.status) {
            case 401: {
                const isPostmanError = isPostmanInfrastructure401(errorData);

                if (isPostmanError) {
                    /**
                     * 401 dari Postman mock infrastructure — bukan token expired.
                     * Ini terjadi ketika VITE_POSTMAN_API_KEY belum diisi di .env.
                     * Jangan logout. Tampilkan pesan yang actionable ke developer.
                     */
                    console.warn(
                        '[api.js] 401 dari Postman mock infrastructure.\n' +
                        'Tambahkan VITE_POSTMAN_API_KEY ke file .env\n' +
                        'Cara: Postman → Settings → API Keys → copy key → isi di .env'
                    );
                    error.message =
                        'Konfigurasi mock server belum lengkap. ' +
                        'Tambahkan VITE_POSTMAN_API_KEY di file .env (lihat console).';
                } else {
                    /**
                     * 401 dari real API — token benar-benar expired atau tidak valid.
                     * Hapus sesi dan redirect ke login.
                     * Gunakan setTimeout agar component catch block sempat
                     * menampilkan pesan error sebelum halaman berganti.
                     */
                    setTimeout(() => {
                        if (localStorage.getItem('token')) {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            window.location.href = '/login';
                        }
                    }, 1500);
                }
                break;
            }

            case 403:
                // Akses ditolak — user login tapi role tidak mencukupi (petugas → admin endpoint)
                // OpenAPI 403: "Akses ditolak. Hanya Admin yang dapat mengakses fitur ini."
                // Tidak redirect — user tetap login, hanya tampilkan pesan
                alert(message || 'Akses ditolak. Anda tidak memiliki izin untuk mengakses fitur ini.');
                break;

            default:
                break;
        }

        return Promise.reject(error);
    }
);

export default api;
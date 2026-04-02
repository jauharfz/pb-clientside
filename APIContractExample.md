# API Contract — Integrasi Gate NFC × UMKM
**Versi:** 1.0.0  
**Tanggal Kesepakatan:** 30 Maret 2026  
**Status:** ✅ Disepakati Kedua Pihak

---

## Pihak yang Terlibat

| Pihak | Sistem | Penanggung Jawab |
|---|---|---|
| **Kelompok Gate** | Sistem Pemindai NFC Masuk-Keluar Event Peken Banyumasan | Ahmad Al-Farizi, dkk |
| **Kelompok UMKM** | Sistem Manajemen Tenant & Diskon UMKM Peken Banyumasan | *(nama kelompok UMKM)* |

---

## Ringkasan Kesepakatan

Kedua kelompok saling menyediakan satu endpoint API untuk keperluan integrasi:

| # | Penyedia | Konsumen | Endpoint | Kebutuhan |
|---|---|---|---|---|
| 1 | Kelompok UMKM | Kelompok Gate | `GET /umkm/tenants` | Data daftar tenant UMKM aktif |
| 2 | Kelompok Gate | Kelompok UMKM | `GET /api/members` | Data daftar member beserta status keanggotaan |

---

## Kontrak 1: Kelompok UMKM → Kelompok Gate

> **Kelompok Gate membutuhkan data tenant UMKM** untuk ditampilkan di fitur diskon member pada dashboard React.

### Endpoint

```
GET {UMKM_API_URL}/tenants
```

### Autentikasi

```
Authorization: Bearer {UMKM_API_KEY}
```

> **Catatan implementasi (Gate):** URL dan API key dikonfigurasi via environment variable `UMKM_API_URL` dan `UMKM_API_KEY` di sisi Flask API kelompok Gate. Tidak di-hardcode.

### Query Parameters (Opsional)

| Parameter | Tipe | Default | Keterangan |
|---|---|---|---|
| `kategori` | `string` | — | Filter berdasarkan kategori produk (contoh: `makanan`, `minuman`, `kerajinan`) |
| `is_aktif` | `boolean` | `true` | `true` = hanya tenant yang sedang aktif berpartisipasi |

### Contoh Request

```http
GET https://api-umkm.example.com/tenants?is_aktif=true
Authorization: Bearer eyJhbGci...
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": [
    {
      "id": "e2f3a4b5-c6d7-8e9f-0a1b-c2d3e4f5a6b7",
      "nama_tenant": "Warung Soto Sokaraja Pak Joko",
      "kategori": "makanan",
      "nomor_stand": "A-05",
      "deskripsi": "Soto Sokaraja khas Banyumas dengan bumbu kacang",
      "is_aktif": true,
      "created_at": "2025-05-01T08:00:00+07:00"
    },
    {
      "id": "f3a4b5c6-d7e8-9f0a-1b2c-d3e4f5a6b7c8",
      "nama_tenant": "Batik Banyumas Ibu Sari",
      "kategori": "kerajinan",
      "nomor_stand": "B-12",
      "deskripsi": "Batik tulis motif khas Banyumas",
      "is_aktif": true,
      "created_at": "2025-05-01T09:00:00+07:00"
    }
  ]
}
```

### Response: 401 Unauthorized

```json
{
  "status": "error",
  "message": "API key tidak valid atau tidak ditemukan"
}
```

### Response: 502 (Jika diakses via proxy Gate)

Jika Flask API Gate gagal menghubungi API UMKM, Gate akan mengembalikan:

```json
{
  "status": "error",
  "message": "Gagal mengambil data dari API eksternal kelompok UMKM"
}
```

### Skema Field yang Disepakati

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `id` | `UUID` | ✅ | Primary key tenant |
| `nama_tenant` | `string` (max 100) | ✅ | Nama usaha tenant |
| `kategori` | `string` (max 50) | ✅ | Kategori produk |
| `nomor_stand` | `string` (max 10) | ✅ | Nomor stand di lokasi event |
| `deskripsi` | `string` | ❌ | Deskripsi singkat (boleh null) |
| `is_aktif` | `boolean` | ✅ | Status keaktifan tenant |
| `created_at` | `datetime` (ISO 8601) | ✅ | Waktu data dibuat |

---

## Kontrak 2: Kelompok Gate → Kelompok UMKM

> **Kelompok UMKM membutuhkan data member** untuk memvalidasi apakah pemegang NFC Tag berhak mendapat diskon, dan menampilkan status keanggotaan.

### Endpoint

```
GET {GATE_API_URL}/api/members
```

### Autentikasi

```
Authorization: Bearer {JWT_TOKEN}
```

JWT Token diperoleh dari:
```
POST {GATE_API_URL}/api/auth/login
```
dengan kredensial yang disepakati bersama (lihat bagian Kredensial di bawah).

### Query Parameters (Opsional)

| Parameter | Tipe | Default | Keterangan |
|---|---|---|---|
| `status` | `string` | — | Filter: `aktif` atau `nonaktif` |
| `search` | `string` | — | Cari member berdasarkan nama atau nomor HP |

### Contoh Request

```http
GET https://api-gate.example.com/api/members?status=aktif
Authorization: Bearer eyJhbGci...
```

### Response: 200 OK

```json
{
  "status": "success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "nfc_uid": "04:A3:2B:C1:5E:7F:80",
      "nama": "Budi Santoso",
      "no_hp": "081234567890",
      "email": "budi@email.com",
      "status": "aktif",
      "tanggal_daftar": "2025-05-01",
      "created_at": "2025-05-01T08:00:00+07:00"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "nfc_uid": "04:B7:3C:D2:6F:8A:91",
      "nama": "Siti Rahayu",
      "no_hp": "082233445566",
      "email": null,
      "status": "nonaktif",
      "tanggal_daftar": "2025-04-10",
      "created_at": "2025-04-10T09:15:00+07:00"
    }
  ]
}
```

### Response: 401 Unauthorized

```json
{
  "status": "error",
  "message": "Token tidak valid atau telah kadaluarsa. Silakan login kembali."
}
```

### Response: 403 Forbidden

```json
{
  "status": "error",
  "message": "Akses ditolak. Hanya Admin yang dapat mengakses fitur ini."
}
```

### Skema Field yang Disepakati

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `id` | `UUID` | ✅ | Primary key member |
| `nfc_uid` | `string` (max 50) | ✅ | UID unik NFC Tag Keyfob |
| `nama` | `string` (max 100) | ✅ | Nama lengkap member |
| `no_hp` | `string` (max 20) | ✅ | Nomor handphone |
| `email` | `string` | ❌ | Email (boleh null) |
| `status` | `enum` | ✅ | `aktif` atau `nonaktif` |
| `tanggal_daftar` | `date` (YYYY-MM-DD) | ✅ | Tanggal pendaftaran member |
| `created_at` | `datetime` (ISO 8601) | ✅ | Waktu data dibuat |

---

## Kredensial Akses (Disepakati Bersama)

> ⚠️ **Hanya untuk keperluan integrasi antar kelompok. Jangan disebarkan.**

### Akses Kelompok UMKM ke API Gate

| Item | Nilai |
|---|---|
| Login URL | `POST {GATE_API_URL}/api/auth/login` |
| Email | `umkm-integration@pekenbanyumasan.id` |
| Role | `admin` (read-only member list) |
| Password | *(disepakati offline, tidak ditulis di dokumen ini)* |

### Akses Kelompok Gate ke API UMKM

| Item | Nilai |
|---|---|
| API Base URL | *(diisi kelompok UMKM saat API siap)* |
| API Key | *(diisi kelompok UMKM saat API siap)* |

---

## Environment Variables

### Sisi Kelompok Gate (Flask API)

```env
UMKM_API_URL=https://api-umkm.example.com   # Diisi saat API UMKM siap
UMKM_API_KEY=                                # Diisi saat API UMKM siap
```

### Sisi Kelompok UMKM

```env
GATE_API_URL=https://api-gate.example.com
GATE_LOGIN_EMAIL=umkm-integration@pekenbanyumasan.id
GATE_LOGIN_PASSWORD=                         # Disepakati offline
```

---

## Ketentuan Teknis Bersama

1. **Format tanggal/waktu:** Semua field datetime menggunakan format ISO 8601 dengan timezone `+07:00` (WIB).
2. **Format UUID:** Semua ID menggunakan UUID v4.
3. **Encoding:** UTF-8.
4. **Protocol:** HTTPS (wajib di production, HTTP boleh untuk lokal/testing).
5. **Timeout:** Kelompok Gate menerapkan timeout 10 detik saat memanggil API UMKM. Jika timeout, dikembalikan array kosong ke frontend.
6. **Fallback:** Jika API UMKM tidak tersedia, endpoint `GET /api/umkm` di Gate mengembalikan `data: []` tanpa error — sistem tetap berjalan.

---

## Jadwal & Milestone

| Milestone | Target | Penanggung Jawab |
|---|---|---|
| Mock API UMKM tersedia (Postman/static) | *(tanggal)* | Kelompok UMKM |
| API Gate endpoint `/members` siap ditest | *(tanggal)* | Kelompok Gate |
| Integration test pertama (lokal) | *(tanggal)* | Bersama |
| API UMKM live (production/staging) | *(tanggal)* | Kelompok UMKM |
| Full integration test | *(tanggal)* | Bersama |

---

## Penanganan Perubahan

Jika salah satu pihak perlu mengubah skema atau endpoint yang sudah disepakati:

1. Beri notifikasi ke pihak lain **minimal H-3** sebelum perubahan diterapkan.
2. Buat versi baru kontrak (contoh: `v1.1.0`) dan minta persetujuan ulang.
3. Pertahankan versi lama selama minimal **1 minggu** untuk masa transisi.

---

## Persetujuan

Dengan ditandatanganinya/disetujuinya dokumen ini, kedua pihak menyatakan sepakat dengan seluruh ketentuan di atas.

| | Kelompok Gate | Kelompok UMKM |
|---|---|---|
| **Nama** | Ahmad Al-Farizi | *(nama PJ kelompok UMKM)* |
| **Tanggal** | 30 Maret 2026 | *(tanggal)* |
| **Tanda Tangan** | ________________ | ________________ |

---

*Dokumen ini dibuat menggunakan API Contract Tool — Peken Banyumasan Integration Suite v1.0*
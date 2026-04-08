import { useState, useEffect } from "react";
import api from "../services/api"; // axios instance yang sudah ada

export default function Settings() {
    const [profile, setProfile] = useState({ nama: "", email: "" });
    const [nama, setNama]         = useState("");
    const [pwdLama, setPwdLama]   = useState("");
    const [pwdBaru, setPwdBaru]   = useState("");
    const [pwdKonfirm, setPwdKonfirm] = useState("");
    const [msg, setMsg]           = useState({ type: "", text: "" });
    const [loading, setLoading]   = useState(false);

    useEffect(() => {
        api.get("/profile").then(res => {
            setProfile(res.data);
            setNama(res.data.nama);
        });
    }, []);

    const showMsg = (type, text) => {
        setMsg({ type, text });
        setTimeout(() => setMsg({ type: "", text: "" }), 4000);
    };

    const handleUpdateNama = async (e) => {
        e.preventDefault();
        if (!nama.trim()) return;
        setLoading(true);
        try {
            await api.put("/profile", { nama });
            showMsg("success", "Nama berhasil diperbarui");
        } catch {
            showMsg("error", "Gagal memperbarui nama");
        } finally { setLoading(false); }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (pwdBaru !== pwdKonfirm) {
            showMsg("error", "Konfirmasi password tidak cocok");
            return;
        }
        if (pwdBaru.length < 8) {
            showMsg("error", "Password baru minimal 8 karakter");
            return;
        }
        setLoading(true);
        try {
            await api.put("/profile/password", {
                password_lama: pwdLama,
                password_baru: pwdBaru,
            });
            showMsg("success", "Password berhasil diubah");
            setPwdLama(""); setPwdBaru(""); setPwdKonfirm("");
        } catch (err) {
            const detail = err.response?.data?.detail || "Gagal mengubah password";
            showMsg("error", detail);
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-lg mx-auto p-6 space-y-8">
            <h1 className="text-2xl font-bold">Pengaturan Akun</h1>

            {/* Alert */}
            {msg.text && (
                <div className={`p-3 rounded text-sm ${
                    msg.type === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                }`}>
                    {msg.text}
                </div>
            )}

            {/* Info akun */}
            <div className="bg-gray-50 rounded p-4 text-sm text-gray-600">
                <p><span className="font-medium">Email:</span> {profile.email}</p>
                <p><span className="font-medium">Role:</span> {profile.role}</p>
            </div>

            {/* Update nama */}
            <form onSubmit={handleUpdateNama} className="space-y-3">
                <h2 className="text-lg font-semibold">Ubah Nama</h2>
                <input
                    type="text"
                    value={nama}
                    onChange={e => setNama(e.target.value)}
                    placeholder="Nama lengkap"
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                    Simpan Nama
                </button>
            </form>

            {/* Update password */}
            <form onSubmit={handleUpdatePassword} className="space-y-3">
                <h2 className="text-lg font-semibold">Ubah Password</h2>
                <input
                    type="password"
                    value={pwdLama}
                    onChange={e => setPwdLama(e.target.value)}
                    placeholder="Password lama"
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
                />
                <input
                    type="password"
                    value={pwdBaru}
                    onChange={e => setPwdBaru(e.target.value)}
                    placeholder="Password baru (min. 8 karakter)"
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
                />
                <input
                    type="password"
                    value={pwdKonfirm}
                    onChange={e => setPwdKonfirm(e.target.value)}
                    placeholder="Konfirmasi password baru"
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                    Ubah Password
                </button>
            </form>
        </div>
    );
}
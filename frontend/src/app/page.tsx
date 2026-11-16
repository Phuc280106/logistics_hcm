"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, User, Lock, Eye, EyeOff, Truck, Building2, ShieldCheck, Phone } from "lucide-react";
import { apiFetch, UserSession } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"otp" | "staff">("staff");
  const [identifier, setIdentifier] = useState("0909000001");
  const [password, setPassword] = useState("123456");
  const [phone, setPhone] = useState("0909123456");
  const [otp, setOtp] = useState("123456");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function routeByRole(session: UserSession) {
    localStorage.setItem("fastpost_user", JSON.stringify(session));
    if (session.role === "Shipper") router.push("/shipper");
    else if (session.role === "Quay") router.push("/counter");
    else if (session.role === "QuanTri") router.push("/admin");
    else router.push("/customer");
  }

  async function handleStaffLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch<UserSession>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });
      routeByRole(data);
    } catch {
      // Fallback demo accounts if backend is not yet started
      if (identifier === "0909000001" && password === "123456") {
        routeByRole({ token: "demo", maNguoiDung: "ND_QUAY_01", hoTen: "Nguyễn Hoàng Anh", soDienThoai: "0909000001", role: "Quay", maNhanVien: "NV_QUAY_01", maBuuCuc: "BC_BENNGHE" });
      } else if (identifier === "0909000002" && password === "123456") {
        routeByRole({ token: "demo", maNguoiDung: "ND_SHIP_01", hoTen: "Phương Duy", soDienThoai: "0909000002", role: "Shipper", maNhanVien: "NV_SHIP_01", maBuuCuc: "BC_BENNGHE" });
      } else if (identifier === "0909000003" && password === "123456") {
        routeByRole({ token: "demo", maNguoiDung: "ND_ADMIN_01", hoTen: "Lê Minh Anh", soDienThoai: "0909000003", role: "QuanTri", maNhanVien: "NV_ADMIN_01", maBuuCuc: "KHO_Q1" });
      } else {
        setError("Sai thông tin đăng nhập hoặc chưa khởi động Backend");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch<UserSession>("/auth/otp-login", {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      });
      routeByRole(data);
    } catch {
      if (otp === "123456") {
        routeByRole({ token: "demo", maNguoiDung: "ND_KH_01", hoTen: "Trần Minh Đức", soDienThoai: phone, role: "KhachHang" });
      } else {
        setError("Mã OTP không hợp lệ (demo: 123456)");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Hero Panel (Navy) */}
      <div className="lg:w-[44%] bg-[#0F172A] text-white p-8 lg:p-12 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-[#FF5722] flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="font-bold text-xl tracking-wide">FASTPOST</div>
              <div className="text-[11px] tracking-widest text-slate-400">LOGISTICS</div>
            </div>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
            Hệ thống Quản lý
            <br />
            Vận chuyển &amp; Logistics
            <br />
            Hợp nhất
          </h1>
          <p className="text-slate-400 text-sm mb-10">
            Kết nối mọi vai trò. Đồng bộ mọi hành trình.
          </p>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 mb-8">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Truy cập nhanh vai trò (Demo)
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => { setTab("staff"); setIdentifier("0909000001"); setPassword("123456"); }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition"
              >
                <Building2 className="w-4 h-4 text-[#FF5722] shrink-0" />
                <div>
                  <div className="font-semibold">Nhân viên quầy</div>
                  <div className="text-slate-400 text-[11px]">0909000001</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => { setTab("staff"); setIdentifier("0909000002"); setPassword("123456"); }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition"
              >
                <Truck className="w-4 h-4 text-[#FF5722] shrink-0" />
                <div>
                  <div className="font-semibold">Shipper</div>
                  <div className="text-slate-400 text-[11px]">0909000002</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => { setTab("staff"); setIdentifier("0909000003"); setPassword("123456"); }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition"
              >
                <ShieldCheck className="w-4 h-4 text-[#FF5722] shrink-0" />
                <div>
                  <div className="font-semibold">Quản trị / Kho</div>
                  <div className="text-slate-400 text-[11px]">0909000003</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => { setTab("otp"); setPhone("0909123456"); setOtp("123456"); }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition"
              >
                <User className="w-4 h-4 text-[#FF5722] shrink-0" />
                <div>
                  <div className="font-semibold">Khách hàng (OTP)</div>
                  <div className="text-slate-400 text-[11px]">0909123456</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500">© 2026 FastPost Logistics HCM</div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-[#F8FAFC]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Đăng nhập hệ thống FastPost</h2>
          <p className="text-sm text-slate-500 mb-6">Chào mừng bạn trở lại. Vui lòng đăng nhập.</p>

          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setTab("otp"); setError(""); }}
              className={`py-2.5 text-sm font-semibold rounded-lg transition ${
                tab === "otp" ? "bg-[#FF5722] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Khách hàng (OTP)
            </button>
            <button
              type="button"
              onClick={() => { setTab("staff"); setError(""); }}
              className={`py-2.5 text-sm font-semibold rounded-lg transition ${
                tab === "staff" ? "bg-[#FF5722] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Nhân viên &amp; Shipper
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {tab === "staff" ? (
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Số điện thoại / Mã nhân viên
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                    placeholder="0909000001"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#FF5722] hover:bg-[#E64A19] text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-60"
              >
                {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mã OTP (Demo: 123456)</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm tracking-widest font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#FF5722] hover:bg-[#E64A19] text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-60"
              >
                {loading ? "Đang xác thực..." : "XÁC NHẬN OTP"}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-400 mt-6">
            Hệ thống tự động phân quyền giao diện theo tài khoản
          </p>
        </div>
        <p className="text-xs text-slate-400 mt-6">Bảo mật thông tin · Vận hành đồng bộ</p>
      </div>
    </div>
  );
}

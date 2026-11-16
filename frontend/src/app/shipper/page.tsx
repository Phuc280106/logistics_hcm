"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, MapPin, Phone, CheckCircle2, XCircle, Package, Wallet, User, LogOut, Navigation } from "lucide-react";
import { apiFetch, formatVnd, UserSession } from "@/lib/api";

interface DonHangItem {
  maVanDon: string;
  nguoiNhanTen: string;
  nguoiNhanSdt: string;
  diaChiGiaoChiTiet: string;
  phuongXaGiao: string;
  quanHuyenGiao: string;
  maGoiDichVu: string;
  tienCod: number;
  trangThai: string;
}

const DEMO_ORDERS: DonHangItem[] = [
  {
    maVanDon: "FP-98231",
    nguoiNhanTen: "Trần Thị Mai",
    nguoiNhanSdt: "0912345678",
    diaChiGiaoChiTiet: "45 Lê Duẩn",
    phuongXaGiao: "P. Bến Nghé",
    quanHuyenGiao: "Quận 1",
    maGoiDichVu: "GDV_HOATOC",
    tienCod: 450000,
    trangThai: "DangGiaoHang",
  },
  {
    maVanDon: "FP-98232",
    nguoiNhanTen: "Lê Hoàng Phúc",
    nguoiNhanSdt: "0903456789",
    diaChiGiaoChiTiet: "78 Hai Bà Trưng",
    phuongXaGiao: "P. Đa Kao",
    quanHuyenGiao: "Quận 1",
    maGoiDichVu: "GDV_TIEUCHUAN",
    tienCod: 0,
    trangThai: "SanSangGiao",
  },
];

export default function ShipperPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [orders, setOrders] = useState<DonHangItem[]>(DEMO_ORDERS);
  const [tab, setTab] = useState<"deliver" | "pickup" | "done">("deliver");
  const [online, setOnline] = useState(true);
  const [selected, setSelected] = useState<DonHangItem | null>(null);
  const [modalMode, setModalMode] = useState<"detail" | "pod" | "fail" | null>(null);
  const [receiverName, setReceiverName] = useState("");
  const [failReason, setFailReason] = useState("Khách không nghe máy");
  const [codWallet, setCodWallet] = useState(1250000);

  useEffect(() => {
    const raw = localStorage.getItem("fastpost_user");
    if (!raw) {
      router.push("/");
      return;
    }
    const parsed = JSON.parse(raw) as UserSession;
    setUser(parsed);

    apiFetch<DonHangItem[]>(`/don-hang?shipper=${parsed.maNhanVien || "NV_SHIP_01"}`)
      .then((data) => { if (data.length > 0) setOrders(data); })
      .catch(() => {});

    apiFetch<{ tongNoLuyKe: number }>(`/doi-soat/vi-cong-no/${parsed.maNhanVien || "NV_SHIP_01"}`)
      .then((vi) => setCodWallet(Number(vi.tongNoLuyKe)))
      .catch(() => {});
  }, [router]);

  async function handleConfirmPod() {
    if (!selected) return;
    try {
      await apiFetch(`/don-hang/${selected.maVanDon}/giao-thanh-cong`, {
        method: "POST",
        body: JSON.stringify({
          anhChupGoiHang: "pod-captured.jpg",
          toaDoGps: "10.7745,106.7035",
          tenNguoiKy: receiverName || selected.nguoiNhanTen,
          maNhanVien: user?.maNhanVien || "NV_SHIP_01",
        }),
      });
    } catch {}
    setOrders((prev) =>
      prev.map((o) => (o.maVanDon === selected.maVanDon ? { ...o, trangThai: "DaGiaoThanhCong" } : o))
    );
    setCodWallet((w) => w + Number(selected.tienCod || 0));
    setModalMode(null);
    setSelected(null);
  }

  async function handleReportFail() {
    if (!selected) return;
    try {
      await apiFetch(`/don-hang/${selected.maVanDon}/giao-that-bai`, {
        method: "POST",
        body: JSON.stringify({
          lyDoThatBai: failReason,
          maNhanVien: user?.maNhanVien || "NV_SHIP_01",
        }),
      });
    } catch {}
    setOrders((prev) =>
      prev.map((o) => (o.maVanDon === selected.maVanDon ? { ...o, trangThai: "ChoGiaoLai" } : o))
    );
    setModalMode(null);
    setSelected(null);
  }

  const activeDeliver = orders.filter((o) => o.trangThai === "DangGiaoHang" || o.trangThai === "SanSangGiao");
  const doneOrders = orders.filter((o) => o.trangThai === "DaGiaoThanhCong" || o.trangThai === "ChoGiaoLai");
  const listToShow = tab === "deliver" ? activeDeliver : tab === "done" ? doneOrders : [];
  const pct = Math.min(100, Math.round((codWallet / 3000000) * 100));

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-[430px] bg-[#F8FAFC] min-h-screen flex flex-col shadow-xl">
        {/* Header */}
        <header className="bg-white px-4 pt-4 pb-3 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FF5722] flex items-center justify-center">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-lg text-[#0F172A]">FastPost Driver</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">{user?.hoTen || "Phương Duy"}</span>
              <button
                onClick={() => { localStorage.removeItem("fastpost_user"); router.push("/"); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Danh sách ca phát</span>
            <button
              onClick={() => setOnline(!online)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                online
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${online ? "bg-emerald-500" : "bg-slate-400"}`} />
              {online ? "Đang nhận đơn" : "Tạm nghỉ"}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 space-y-4 overflow-y-auto pb-24">
          {/* Dark Navy Summary Card */}
          <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white rounded-2xl p-4 shadow-md">
            <div className="text-sm font-semibold text-slate-200 mb-3">
              Ca phát hôm nay - Đội xe Quận 1
            </div>
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{activeDeliver.length}</span>
                <span className="text-xs text-slate-300">Đơn cần giao</span>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">0</span>
                <span className="text-xs text-slate-300">Đơn cần lấy</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300">Ví COD hiện tại: <strong className="text-white">{formatVnd(codWallet)}</strong></span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                pct > 80 ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"
              }`}>
                {pct > 80 ? "Cảnh báo" : "An toàn"}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mb-1.5">
              <div className="h-full bg-[#FF5722] rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Hạn mức 3.000.000đ</span>
              <span>{pct}%</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="grid grid-cols-3 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTab("deliver")}
              className={`py-2 rounded-lg transition ${tab === "deliver" ? "bg-[#FF5722] text-white shadow-sm" : "text-slate-600"}`}
            >
              Cần giao ({activeDeliver.length})
            </button>
            <button
              onClick={() => setTab("pickup")}
              className={`py-2 rounded-lg transition ${tab === "pickup" ? "bg-[#FF5722] text-white shadow-sm" : "text-slate-600"}`}
            >
              Cần lấy (0)
            </button>
            <button
              onClick={() => setTab("done")}
              className={`py-2 rounded-lg transition ${tab === "done" ? "bg-[#FF5722] text-white shadow-sm" : "text-slate-600"}`}
            >
              Đã xong ({doneOrders.length})
            </button>
          </div>

          {/* Order Cards */}
          <div className="space-y-3">
            {listToShow.map((o) => (
              <div key={o.maVanDon} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="mb-2">
                  {o.maGoiDichVu === "GDV_HOATOC" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF5722] text-xs font-semibold">
                      <Zap className="w-3.5 h-3.5 fill-current" /> FastPost Hỏa Tốc
                    </span>
                  ) : (
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                      FastPost Tiêu Chuẩn
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 font-mono mb-0.5">#{o.maVanDon}</div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-base text-[#0F172A]">{o.nguoiNhanTen}</h3>
                  <span className="text-xs text-slate-500">{o.nguoiNhanSdt}</span>
                </div>
                <p className="text-xs text-slate-600 flex items-start gap-1.5 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  {o.diaChiGiaoChiTiet}, {o.phuongXaGiao}, {o.quanHuyenGiao}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-[11px] text-slate-400">Tiền thu hộ</div>
                    <div className="font-bold text-base text-[#0F172A]">{formatVnd(o.tienCod)}</div>
                  </div>
                  {tab === "deliver" ? (
                    <button
                      onClick={() => { setSelected(o); setModalMode("detail"); setReceiverName(o.nguoiNhanTen); }}
                      className="px-4 py-2 bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-semibold rounded-xl transition"
                    >
                      Bắt đầu giao →
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      {o.trangThai}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 w-full max-w-[430px] bg-white border-t border-slate-200 grid grid-cols-4 py-2 text-[11px] font-medium text-slate-500">
          <div className="flex flex-col items-center text-[#FF5722] font-semibold">
            <Package className="w-5 h-5 mb-0.5" /> Đơn hàng
          </div>
          <div className="flex flex-col items-center">
            <Navigation className="w-5 h-5 mb-0.5" /> Lộ trình
          </div>
          <div className="flex flex-col items-center">
            <Wallet className="w-5 h-5 mb-0.5" /> Ví tiền
          </div>
          <div className="flex flex-col items-center">
            <User className="w-5 h-5 mb-0.5" /> Cá nhân
          </div>
        </nav>

        {/* Modal for Order Detail / POD / Fail */}
        {selected && modalMode && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-[400px] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">
                  {modalMode === "detail" && `Chi tiết #${selected.maVanDon}`}
                  {modalMode === "pod" && `Xác thực giao hàng (POD)`}
                  {modalMode === "fail" && `Báo giao thất bại`}
                </h3>
                <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-700 text-sm">Đóng</button>
              </div>

              {modalMode === "detail" && (
                <>
                  <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-1">
                    <div><strong>Người nhận:</strong> {selected.nguoiNhanTen}</div>
                    <div className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selected.nguoiNhanSdt}</div>
                    <div><strong>Địa chỉ:</strong> {selected.diaChiGiaoChiTiet}, {selected.phuongXaGiao}, {selected.quanHuyenGiao}</div>
                    <div><strong>COD cần thu:</strong> <span className="text-[#FF5722] font-bold">{formatVnd(selected.tienCod)}</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setModalMode("fail")}
                      className="py-2.5 border border-red-200 bg-red-50 text-red-700 font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Thất bại
                    </button>
                    <button
                      onClick={() => setModalMode("pod")}
                      className="py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Giao xong (POD)
                    </button>
                  </div>
                </>
              )}

              {modalMode === "pod" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tên người ký nhận</label>
                    <input
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
                    GPS đã ghi nhận: 10.7745, 106.7035 · Đính kèm ảnh gói hàng
                  </div>
                  <button
                    onClick={handleConfirmPod}
                    className="w-full py-2.5 bg-[#FF5722] text-white font-semibold rounded-xl text-sm"
                  >
                    Xác nhận hoàn tất giao hàng
                  </button>
                </>
              )}

              {modalMode === "fail" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Lý do giao thất bại</label>
                    <select
                      value={failReason}
                      onChange={(e) => setFailReason(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    >
                      <option>Khách không nghe máy</option>
                      <option>Khách hẹn giao lại ngày khác</option>
                      <option>Sai địa chỉ / Khách từ chối nhận</option>
                    </select>
                  </div>
                  <button
                    onClick={handleReportFail}
                    className="w-full py-2.5 bg-red-600 text-white font-semibold rounded-xl text-sm"
                  >
                    Lưu báo cáo thất bại
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

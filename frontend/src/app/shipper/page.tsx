"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, MapPin, Phone, CheckCircle2, XCircle, Package, Wallet, User, LogOut, Navigation, ClipboardCheck, AlertCircle } from "lucide-react";
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
  soLanGiaoThatBai?: number;
}

interface PhieuXuatItem {
  maPhieuXuat: string;
  tongSoDon: number;
  tongTienCodPhaiThu: number;
  shipperDaXacNhan: boolean;
}

export default function ShipperPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [orders, setOrders] = useState<DonHangItem[]>([]);
  const [phieuXuatList, setPhieuXuatList] = useState<PhieuXuatItem[]>([]);
  const [tab, setTab] = useState<"deliver" | "pickup" | "done">("deliver");
  const [online, setOnline] = useState(true);
  const [selected, setSelected] = useState<DonHangItem | null>(null);
  const [modalMode, setModalMode] = useState<"detail" | "pod" | "fail" | null>(null);
  const [receiverName, setReceiverName] = useState("");
  const [failReason, setFailReason] = useState("Khách không nghe máy");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [failNote, setFailNote] = useState("");
  const [codWallet, setCodWallet] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("fastpost_user");
    if (!raw) {
      router.push("/");
      return;
    }
    const parsed = JSON.parse(raw) as UserSession;
    setUser(parsed);
    const shipperId = parsed.maNhanVien || "NV_SHIP_01";

    apiFetch<DonHangItem[]>(`/don-hang?shipper=${shipperId}`)
      .then((data) => setOrders(data))
      .catch(() => setErrorMsg("Chưa kết nối được Backend để tải danh sách đơn."));

    apiFetch<PhieuXuatItem[]>(`/kho/phieu-xuat?maShipper=${shipperId}`)
      .then((px) => setPhieuXuatList(px))
      .catch(() => {});

    apiFetch<{ tongNoLuyKe: number }>(`/doi-soat/vi-cong-no/${shipperId}`)
      .then((vi) => setCodWallet(Number(vi.tongNoLuyKe || 0)))
      .catch(() => {});
  }, [router]);

  async function handleConfirmPhieuXuat(maPhieuXuat: string) {
    setErrorMsg("");
    try {
      await apiFetch(`/kho/phieu-xuat/${maPhieuXuat}/xac-nhan`, { method: "POST" });
      setPhieuXuatList((prev) =>
        prev.map((p) => (p.maPhieuXuat === maPhieuXuat ? { ...p, shipperDaXacNhan: true } : p))
      );
      setOrders((prev) =>
        prev.map((o) => (o.trangThai === "SanSangGiao" ? { ...o, trangThai: "DangGiaoHang" } : o))
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi xác nhận phiếu xuất kho");
    }
  }

  async function handleConfirmPod() {
    if (!selected) return;
    setErrorMsg("");
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
      setOrders((prev) =>
        prev.map((o) => (o.maVanDon === selected.maVanDon ? { ...o, trangThai: "DaGiaoThanhCong" } : o))
      );
      setCodWallet((w) => w + Number(selected.tienCod || 0));
      setModalMode(null);
      setSelected(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi xác nhận giao hàng");
    }
  }

  async function handleReportFail() {
    if (!selected) return;
    setErrorMsg("");
    try {
      const updated = await apiFetch<DonHangItem>(`/don-hang/${selected.maVanDon}/giao-that-bai`, {
        method: "POST",
        body: JSON.stringify({
          lyDoThatBai: failReason,
          ngayHenGiaoLai: rescheduleDate ? `${rescheduleDate}:00` : null,
          ghiChu: failNote,
          maNhanVien: user?.maNhanVien || "NV_SHIP_01",
        }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.maVanDon === selected.maVanDon ? updated : o))
      );
      setModalMode(null);
      setSelected(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi báo giao thất bại");
    }
  }

  const pendingPhieuXuat = phieuXuatList.filter((p) => !p.shipperDaXacNhan);
  const activeDeliver = orders.filter((o) => o.trangThai === "DangGiaoHang" || o.trangThai === "SanSangGiao");
  const doneOrders = orders.filter((o) => o.trangThai === "DaGiaoThanhCong" || o.trangThai === "ChoGiaoLai" || o.trangThai === "ChoChuyenHoan");
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
              <span className="text-sm font-medium text-slate-700">{user?.hoTen || "Shipper"}</span>
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
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
            </div>
          )}

          {/* Pending Dispatch Handover Banner */}
          {pendingPhieuXuat.map((px) => (
            <div key={px.maPhieuXuat} className="bg-orange-50 border border-[#FF5722]/40 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="text-xs">
                <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-[#FF5722]" /> Phiếu xuất kho {px.maPhieuXuat}
                </div>
                <div className="text-slate-600">{px.tongSoDon} đơn · COD: {formatVnd(px.tongTienCodPhaiThu)}</div>
              </div>
              <button
                onClick={() => handleConfirmPhieuXuat(px.maPhieuXuat)}
                className="px-3 py-1.5 bg-[#FF5722] text-white text-xs font-semibold rounded-xl shrink-0"
              >
                Xác nhận nhận hàng
              </button>
            </div>
          ))}

          {/* Dark Navy Summary Card */}
          <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white rounded-2xl p-4 shadow-md">
            <div className="text-sm font-semibold text-slate-200 mb-3">
              Ca phát hôm nay · {user?.maBuuCuc || "TP.HCM"}
            </div>
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{activeDeliver.length}</span>
                <span className="text-xs text-slate-300">Đơn cần giao</span>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{doneOrders.length}</span>
                <span className="text-xs text-slate-300">Đã xử lý</span>
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
            {listToShow.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                Không có đơn hàng nào trong mục này.
              </div>
            ) : (
              listToShow.map((o) => (
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
              ))
            )}
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

        {/* Modal for Order Detail / POD / Fail + Reschedule */}
        {selected && modalMode && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-[400px] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">
                  {modalMode === "detail" && `Chi tiết #${selected.maVanDon}`}
                  {modalMode === "pod" && `Xác thực giao hàng (POD)`}
                  {modalMode === "fail" && `Báo giao thất bại & Hẹn giao lại`}
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
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Ngày giờ hẹn giao lại</label>
                    <input
                      type="datetime-local"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Ghi chú lịch hẹn</label>
                    <input
                      type="text"
                      value={failNote}
                      onChange={(e) => setFailNote(e.target.value)}
                      placeholder="Nhập ghi chú..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <button
                    onClick={handleReportFail}
                    className="w-full py-2.5 bg-red-600 text-white font-semibold rounded-xl text-sm"
                  >
                    Lưu lịch hẹn giao lại / Báo thất bại
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

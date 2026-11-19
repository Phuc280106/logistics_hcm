"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Package,
  Wallet,
  User,
  LogOut,
  Navigation,
  ClipboardCheck,
  AlertCircle,
  PenTool,
  RotateCcw,
} from "lucide-react";
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
  const [navTab, setNavTab] = useState<"orders" | "route" | "wallet" | "profile">("orders");
  const [settlementSlips, setSettlementSlips] = useState<
    { maDoiSoat: string; tongPhaiNop: number; soTienThucNop?: number; trangThai: string; ngayDoiSoat?: string }[]
  >([]);
  const [online, setOnline] = useState(true);
  const [selected, setSelected] = useState<DonHangItem | null>(null);
  const [modalMode, setModalMode] = useState<"detail" | "pod" | "fail" | "fail_pickup" | null>(null);
  const [receiverName, setReceiverName] = useState("");
  const [podPhotoName, setPodPhotoName] = useState("pod-hien-truong.jpg");
  const [gpsCoords, setGpsCoords] = useState("10.7745,106.7035");
  const [hasSigned, setHasSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  const [failReason, setFailReason] = useState("Khách không nghe máy");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [failNote, setFailNote] = useState("");
  const [codWallet, setCodWallet] = useState(0);
  const [walletLocked, setWalletLocked] = useState(false);
  const [settleMsg, setSettleMsg] = useState("");
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

    apiFetch<{ tongNoLuyKe: number; daKhoaNhanDon?: boolean }>(`/doi-soat/vi-cong-no/${shipperId}`)
      .then((vi) => {
        setCodWallet(Number(vi.tongNoLuyKe || 0));
        setWalletLocked(Boolean(vi.daKhoaNhanDon));
      })
      .catch(() => {});

    apiFetch<{ maDoiSoat: string; tongPhaiNop: number; soTienThucNop?: number; trangThai: string; ngayDoiSoat?: string }[]>(
      `/doi-soat/shipper?maShipper=${shipperId}`
    )
      .then((slips) => setSettlementSlips(slips))
      .catch(() => {});

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords(`${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`);
        },
        () => {}
      );
    }
  }, [router]);

  function startDraw(x: number, y: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawingRef.current = true;
    ctx.strokeStyle = "#0F172A";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function moveDraw(x: number, y: number) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSigned(true);
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  }

  async function handleConfirmPhieuXuat(maPhieuXuat: string) {
    setErrorMsg("");
    try {
      await apiFetch(`/kho/phieu-xuat/${maPhieuXuat}/xac-nhan`, { method: "POST" });
      setPhieuXuatList((prev) =>
        prev.map((p) => (p.maPhieuXuat === maPhieuXuat ? { ...p, shipperDaXacNhan: true } : p))
      );
      const shipperId = user?.maNhanVien || "NV_SHIP_01";
      const freshOrders = await apiFetch<DonHangItem[]>(`/don-hang?shipper=${shipperId}`);
      setOrders(freshOrders);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi xác nhận phiếu xuất kho");
    }
  }

  async function handleConfirmPod() {
    if (!selected) return;
    if (!hasSigned) {
      setErrorMsg("Vui lòng thu thập chữ ký điện tử người nhận trên khung ký tên (UC 5.3).");
      return;
    }
    setErrorMsg("");
    const sigData = canvasRef.current ? canvasRef.current.toDataURL("image/png") : "signed";
    try {
      await apiFetch(`/don-hang/${selected.maVanDon}/giao-thanh-cong`, {
        method: "POST",
        body: JSON.stringify({
          anhChupGoiHang: podPhotoName || "pod-captured.jpg",
          toaDoGps: gpsCoords,
          chuKyDienTu: sigData,
          tenNguoiKy: receiverName || selected.nguoiNhanTen,
          maNhanVien: user?.maNhanVien || "NV_SHIP_01",
        }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.maVanDon === selected.maVanDon ? { ...o, trangThai: "DaGiaoThanhCong" } : o))
      );
      const nextWallet = codWallet + Number(selected.tienCod || 0);
      setCodWallet(nextWallet);
      if (nextWallet >= 3000000) setWalletLocked(true);
      setHasSigned(false);
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

  async function handleConfirmPickup(maVanDon: string) {
    setErrorMsg("");
    try {
      await apiFetch(`/don-hang/${maVanDon}/lay-hang`, {
        method: "POST",
        body: JSON.stringify({ maNhanVien: user?.maNhanVien || "NV_SHIP_01" }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.maVanDon === maVanDon ? { ...o, trangThai: "DaLayHang" } : o))
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi xác nhận lấy hàng");
    }
  }

  async function handleRejectPickup(maVanDon: string) {
    setErrorMsg("");
    try {
      await apiFetch(`/don-hang/${maVanDon}/tu-choi-lay`, {
        method: "POST",
        body: JSON.stringify({ lyDo: "Shipper báo quá tải / sự cố xe trên App" }),
      });
      setOrders((prev) => prev.filter((o) => o.maVanDon !== maVanDon));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi từ chối đơn lấy");
    }
  }

  async function handleReportPickupFail() {
    if (!selected) return;
    setErrorMsg("");
    try {
      await apiFetch(`/don-hang/${selected.maVanDon}/lay-that-bai`, {
        method: "POST",
        body: JSON.stringify({
          maNhanVien: user?.maNhanVien || "NV_SHIP_01",
          lyDoThatBai: failReason,
          ngayHenGiaoLai: rescheduleDate || null,
          ghiChu: failNote || "Lên lịch lấy lại vào ca sau",
        }),
      });
      setOrders((prev) => prev.filter((o) => o.maVanDon !== selected.maVanDon));
      setModalMode(null);
      setSelected(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi báo lấy hàng thất bại");
    }
  }

  async function handleHandoverWarehouse(maVanDon: string, targetKho: string) {
    setErrorMsg("");
    try {
      await apiFetch(`/don-hang/${maVanDon}/nhap-kho`, {
        method: "POST",
        body: JSON.stringify({
          maBuuCuc: targetKho,
          maNhanVien: user?.maNhanVien || "NV_SHIP_01",
        }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.maVanDon === maVanDon ? { ...o, trangThai: "DaNhapKho" } : o))
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi bàn giao nhập kho");
    }
  }

  async function handleRedeliver(maVanDon: string) {
    setErrorMsg("");
    try {
      await apiFetch(`/don-hang/${maVanDon}/phat-lai`, {
        method: "POST",
        body: JSON.stringify({ maNhanVien: user?.maNhanVien || "NV_SHIP_01" }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.maVanDon === maVanDon ? { ...o, trangThai: "DangGiaoHang" } : o))
      );
      setTab("deliver");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi kích hoạt giao lại");
    }
  }

  async function handleRequestSettlement() {
    if (codWallet <= 0) return;
    setErrorMsg("");
    setSettleMsg("");
    try {
      const created = await apiFetch<{ maDoiSoat: string }>("/doi-soat/shipper", {
        method: "POST",
        body: JSON.stringify({
          maShipper: user?.maNhanVien || "NV_SHIP_01",
          maNhanVienQuay: "NV_QUAY_01",
          tongDonThanhCong: doneOrders.length,
          tongTienCod: codWallet,
          tongCuocMat: 0,
        }),
      });
      await apiFetch(`/doi-soat/shipper/${created.maDoiSoat}/gui-quay`, { method: "POST" });
      setSettleMsg(`Đã gửi phiếu nộp ${formatVnd(codWallet)} (${created.maDoiSoat}) — chờ Quầy/Admin khớp lệnh.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi gửi yêu cầu nộp tiền COD");
    }
  }

  const pendingPhieuXuat = phieuXuatList.filter((p) => !p.shipperDaXacNhan);
  const activeDeliver = orders.filter((o) => o.trangThai === "DangGiaoHang" || o.trangThai === "SanSangGiao");
  const pickupOrders = orders.filter(
    (o) => o.trangThai === "ChoPhanCongLay" || o.trangThai === "DaPhanCongLay" || o.trangThai === "DaLayHang"
  );
  const doneOrders = orders.filter((o) =>
    ["DaGiaoThanhCong", "DaQuyetToanCOD", "ChoGiaoLai", "ChoChuyenHoan", "DaChuyenHoan", "DaNhapKho"].includes(o.trangThai)
  );
  const listToShow = tab === "deliver" ? activeDeliver : tab === "pickup" ? pickupOrders : doneOrders;
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
            <span className="text-xs text-slate-500 font-medium">
              {navTab === "orders" && "Danh sách ca phát"}
              {navTab === "route" && "Lộ trình di chuyển"}
              {navTab === "wallet" && "Ví công nợ & Đối soát COD"}
              {navTab === "profile" && "Hồ sơ tài xế"}
            </span>
            <button
              onClick={() => !walletLocked && setOnline(!online)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                walletLocked
                  ? "bg-red-50 text-red-700 border-red-200"
                  : online
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${walletLocked ? "bg-red-500" : online ? "bg-emerald-500" : "bg-slate-400"}`} />
              {walletLocked ? "Bị khóa nhận đơn (Nợ COD)" : online ? "Đang nhận đơn" : "Tạm nghỉ"}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 space-y-4 overflow-y-auto pb-24">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
            </div>
          )}

          {navTab === "orders" && (
            <>
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
                walletLocked || pct > 80 ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"
              }`}>
                {walletLocked ? "Đã khóa nhận đơn" : pct > 80 ? "Cảnh báo" : "An toàn"}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mb-1.5">
              <div className="h-full bg-[#FF5722] rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Hạn mức 3.000.000đ / 24h</span>
              <span>{pct}%</span>
            </div>
            {codWallet > 0 && (
              <button
                onClick={handleRequestSettlement}
                className="mt-3 w-full py-2 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-semibold transition"
              >
                Nộp tiền COD về quầy ({formatVnd(codWallet)})
              </button>
            )}
            {settleMsg && (
              <div className="mt-2 text-[11px] text-emerald-300 bg-emerald-500/15 px-2.5 py-1.5 rounded-lg">
                {settleMsg}
              </div>
            )}
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
              Cần lấy ({pickupOrders.length})
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
                  <div className="mb-2 flex items-center justify-between">
                    {o.maGoiDichVu === "GDV_HOATOC" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF5722] text-xs font-semibold">
                        <Zap className="w-3.5 h-3.5 fill-current" /> FastPost Hỏa Tốc
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                        FastPost Tiêu Chuẩn
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-slate-500">{o.trangThai}</span>
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

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                    <div>
                      <div className="text-[11px] text-slate-400">Tiền thu hộ</div>
                      <div className="font-bold text-base text-[#0F172A]">{formatVnd(o.tienCod)}</div>
                    </div>
                    {tab === "deliver" ? (
                      o.trangThai === "SanSangGiao" && pendingPhieuXuat.length > 0 ? (
                        <span className="px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold rounded-xl">
                          Xác nhận PXK ở trên trước
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelected(o);
                            setModalMode("detail");
                            setReceiverName(o.nguoiNhanTen);
                            setHasSigned(false);
                          }}
                          className="px-4 py-2 bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-semibold rounded-xl transition"
                        >
                          Bắt đầu giao →
                        </button>
                      )
                    ) : tab === "pickup" ? (
                      o.trangThai === "DaLayHang" ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleHandoverWarehouse(o.maVanDon, "KHO_Q1")}
                            className="px-2.5 py-1.5 bg-emerald-600 text-white text-[11px] font-semibold rounded-lg"
                          >
                            Nhập KHO_Q1
                          </button>
                          <button
                            onClick={() => handleHandoverWarehouse(o.maVanDon, user?.maBuuCuc || "BC_BENNGHE")}
                            className="px-2.5 py-1.5 bg-[#0F172A] text-white text-[11px] font-semibold rounded-lg"
                          >
                            Nhập {user?.maBuuCuc || "BC_BENNGHE"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleRejectPickup(o.maVanDon)}
                            className="px-2 py-2 border border-red-200 bg-red-50 text-red-700 text-[11px] font-semibold rounded-xl"
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => {
                              setSelected(o);
                              setFailReason("Khách không nghe máy");
                              setRescheduleDate("");
                              setFailNote("");
                              setModalMode("fail_pickup");
                            }}
                            className="px-2 py-2 border border-amber-200 bg-amber-50 text-amber-800 text-[11px] font-semibold rounded-xl"
                          >
                            Lấy thất bại
                          </button>
                          <button
                            onClick={() => handleConfirmPickup(o.maVanDon)}
                            className="px-3 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
                          >
                            Đã lấy hàng
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {o.trangThai === "ChoGiaoLai" && (
                          <button
                            onClick={() => handleRedeliver(o.maVanDon)}
                            className="px-2.5 py-1.5 bg-[#FF5722] text-white text-[11px] font-semibold rounded-lg flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" /> Giao lại
                          </button>
                        )}
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                          {o.trangThai}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
            </>
          )}

          {navTab === "route" && (
            <div className="space-y-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Tọa độ GPS hiện tại</div>
                  <div className="font-mono text-sm font-bold text-[#0F172A]">{gpsCoords}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-orange-50 text-[#FF5722] text-xs font-semibold">
                  {pickupOrders.length + activeDeliver.length} điểm dừng
                </span>
              </div>

              {pickupOrders.length + activeDeliver.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-sm border border-slate-200">
                  Chưa có điểm dừng nào trong ca hiện tại.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {[...pickupOrders.map((o) => ({ ...o, _stopType: "Lấy hàng" as const })), ...activeDeliver.map((o) => ({ ...o, _stopType: "Giao hàng" as const }))].map((o, idx) => {
                    const fullAddr = `${o.diaChiGiaoChiTiet}, ${o.phuongXaGiao}, ${o.quanHuyenGiao}, TP.HCM`;
                    return (
                      <div key={o.maVanDon} className="bg-white rounded-2xl p-3.5 border border-slate-200 flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              o._stopType === "Lấy hàng" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-[#FF5722]"
                            }`}>
                              {o._stopType}
                            </span>
                            <span className="font-mono text-xs font-bold text-[#0F172A]">#{o.maVanDon}</span>
                          </div>
                          <div className="text-xs font-semibold text-slate-800 truncate">{o.nguoiNhanTen} · {o.nguoiNhanSdt}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{fullAddr}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddr)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1"
                            >
                              <Navigation className="w-3 h-3" /> Chỉ đường
                            </a>
                            <button
                              onClick={() => { setSelected(o); setModalMode("detail"); }}
                              className="px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF5722] text-[11px] font-semibold"
                            >
                              Chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {navTab === "wallet" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white rounded-2xl p-4 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Số dư công nợ COD đang giữ</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    walletLocked ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {walletLocked ? "Đang khóa nhận đơn" : "Hoạt động bình thường"}
                  </span>
                </div>
                <div className="text-3xl font-bold">{formatVnd(codWallet)}</div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF5722] rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Hạn mức: 3.000.000đ / 24h</span>
                  <span>{pct}%</span>
                </div>
                {codWallet > 0 && (
                  <button
                    onClick={handleRequestSettlement}
                    className="w-full py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-semibold transition"
                  >
                    Tạo phiếu nộp COD về quầy ({formatVnd(codWallet)})
                  </button>
                )}
                {settleMsg && (
                  <div className="text-[11px] text-emerald-300 bg-emerald-500/15 px-2.5 py-1.5 rounded-lg">
                    {settleMsg}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2.5">
                <h3 className="text-sm font-bold text-[#0F172A]">Lịch sử phiếu đối soát COD</h3>
                {settlementSlips.length === 0 ? (
                  <div className="text-xs text-slate-400 py-3 text-center">Chưa có phiếu đối soát nào.</div>
                ) : (
                  settlementSlips.map((s) => (
                    <div key={s.maDoiSoat} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-xs">
                      <div>
                        <div className="font-mono font-bold text-[#0F172A]">{s.maDoiSoat}</div>
                        <div className="text-slate-500">Phải nộp: {formatVnd(s.tongPhaiNop)}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {s.trangThai}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {navTab === "profile" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-[#FF5722] font-bold text-lg flex items-center justify-center">
                  {(user?.hoTen || "S").charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-[#0F172A]">{user?.hoTen || "Shipper"}</div>
                  <div className="text-xs text-slate-500">Mã NV: {user?.maNhanVien || "NV_SHIP_01"} · {user?.maBuuCuc || "BC_BENNGHE"}</div>
                  <div className="text-xs text-slate-500">SĐT: {user?.soDienThoai || "0909000002"}</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="text-lg font-bold text-[#0F172A]">{activeDeliver.length}</div>
                  <div className="text-[11px] text-slate-500">Đang giao</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="text-lg font-bold text-blue-600">{pickupOrders.length}</div>
                  <div className="text-[11px] text-slate-500">Cần lấy</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="text-lg font-bold text-emerald-600">{doneOrders.length}</div>
                  <div className="text-[11px] text-slate-500">Đã xử lý</div>
                </div>
              </div>

              <button
                onClick={() => { localStorage.removeItem("fastpost_user"); router.push("/"); }}
                className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 font-semibold text-sm flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Đăng xuất tài khoản
              </button>
            </div>
          )}
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 w-full max-w-[430px] bg-white border-t border-slate-200 grid grid-cols-4 py-2 text-[11px] font-medium text-slate-500">
          <button
            onClick={() => setNavTab("orders")}
            className={`flex flex-col items-center ${navTab === "orders" ? "text-[#FF5722] font-semibold" : "text-slate-500"}`}
          >
            <Package className="w-5 h-5 mb-0.5" /> Đơn hàng
          </button>
          <button
            onClick={() => setNavTab("route")}
            className={`flex flex-col items-center ${navTab === "route" ? "text-[#FF5722] font-semibold" : "text-slate-500"}`}
          >
            <Navigation className="w-5 h-5 mb-0.5" /> Lộ trình
          </button>
          <button
            onClick={() => setNavTab("wallet")}
            className={`flex flex-col items-center ${navTab === "wallet" ? "text-[#FF5722] font-semibold" : "text-slate-500"}`}
          >
            <Wallet className="w-5 h-5 mb-0.5" /> Ví tiền
          </button>
          <button
            onClick={() => setNavTab("profile")}
            className={`flex flex-col items-center ${navTab === "profile" ? "text-[#FF5722] font-semibold" : "text-slate-500"}`}
          >
            <User className="w-5 h-5 mb-0.5" /> Cá nhân
          </button>
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
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Ảnh kiện hàng tại điểm giao (Camera)</label>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setPodPhotoName(f.name);
                      }}
                      className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:font-semibold"
                    />
                    <div className="mt-1 text-[11px] text-emerald-700">
                      GPS Watermark: <strong>{gpsCoords}</strong> · File: {podPhotoName}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                        <PenTool className="w-3.5 h-3.5 text-[#FF5722]" /> Chữ ký điện tử người nhận *
                      </label>
                      <button type="button" onClick={clearSignature} className="text-[11px] text-slate-500 underline">
                        Xóa ký lại
                      </button>
                    </div>
                    <canvas
                      ref={canvasRef}
                      width={340}
                      height={110}
                      onMouseDown={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        startDraw(e.clientX - rect.left, e.clientY - rect.top);
                      }}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        moveDraw(e.clientX - rect.left, e.clientY - rect.top);
                      }}
                      onMouseUp={() => { drawingRef.current = false; }}
                      onMouseLeave={() => { drawingRef.current = false; }}
                      onTouchStart={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const t = e.touches[0];
                        startDraw(t.clientX - rect.left, t.clientY - rect.top);
                      }}
                      onTouchMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const t = e.touches[0];
                        moveDraw(t.clientX - rect.left, t.clientY - rect.top);
                      }}
                      onTouchEnd={() => { drawingRef.current = false; }}
                      className="w-full h-28 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-crosshair touch-none"
                    />
                  </div>
                  <button
                    onClick={handleConfirmPod}
                    className="w-full py-2.5 bg-[#FF5722] text-white font-semibold rounded-xl text-sm"
                  >
                    Lưu POD &amp; Hoàn tất giao hàng
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
                      <option value="Khách không nghe máy">Khách không nghe máy</option>
                      <option value="Khách hẹn giao lại ngày khác">Khách hẹn giao lại ngày khác</option>
                      <option value="Sai địa chỉ nhận hàng">Sai địa chỉ nhận hàng</option>
                      <option value="Khách từ chối nhận (Boom hàng)">Khách từ chối nhận (Boom hàng → Chuyển hoàn ngay)</option>
                    </select>
                  </div>
                  {!failReason.includes("từ chối") && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Ngày giờ hẹn giao lại</label>
                      <input
                        type="datetime-local"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Ghi chú lịch hẹn</label>
                    <input
                      type="text"
                      value={failNote}
                      onChange={(e) => setFailNote(e.target.value)}
                      placeholder="Ghi chú thực tế..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <button
                    onClick={handleReportFail}
                    className="w-full py-2.5 bg-red-600 text-white font-semibold rounded-xl text-sm"
                  >
                    Xác nhận báo thất bại
                  </button>
                </>
              )}

              {modalMode === "fail_pickup" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Lý do lấy hàng thất bại</label>
                    <select
                      value={failReason}
                      onChange={(e) => setFailReason(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    >
                      <option value="Khách không nghe máy">Khách không nghe máy (Lấy lại ca sau)</option>
                      <option value="Khách hẹn lấy lại ca sau">Khách hẹn lấy lại ca sau</option>
                      <option value="Khách báo hủy đơn">Khách báo hủy đơn (→ DaHuy)</option>
                    </select>
                  </div>
                  {!failReason.toLowerCase().includes("hủy") && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Ngày giờ hẹn lấy lại (ca sau)</label>
                      <input
                        type="datetime-local"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Ghi chú</label>
                    <input
                      type="text"
                      value={failNote}
                      onChange={(e) => setFailNote(e.target.value)}
                      placeholder="Ghi chú thực tế tại điểm lấy..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <button
                    onClick={handleReportPickupFail}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm"
                  >
                    Xác nhận lấy hàng thất bại
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

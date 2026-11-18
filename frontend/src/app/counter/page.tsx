"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, QrCode, Printer, Vault, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { apiFetch, formatVnd, UserSession } from "@/lib/api";
import { DISTRICT_NAMES, HCM_DISTRICTS } from "@/lib/hcmLocations";
import { isValidPhone, sanitizePhoneInput } from "@/lib/validation";

export default function CounterPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Order form state (empty initial values, user selects or types)
  const [senderPhone, setSenderPhone] = useState("");
  const [senderName, setSenderName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("Quận 1");
  const [ward, setWard] = useState(HCM_DISTRICTS["Quận 1"][0]);
  const [service, setService] = useState("GDV_TIEUCHUAN");
  const [weight, setWeight] = useState<number>(1);
  const [d, setD] = useState<number>(0);
  const [r, setR] = useState<number>(0);
  const [c, setC] = useState<number>(0);
  const [fragile, setFragile] = useState(false);
  const [cod, setCod] = useState<number>(0);
  const [nguoiTraCuoc, setNguoiTraCuoc] = useState<"NguoiGui" | "NguoiNhan">("NguoiGui");
  const [hinhThucThanhToan, setHinhThucThanhToan] = useState<"VietQR" | "TienMat">("VietQR");
  const [lookupPrintCode, setLookupPrintCode] = useState("");

  const [fee, setFee] = useState({
    trongLuongTinhCuoc: 1,
    cuocSan: 20000,
    cuocVuotCan: 0,
    phuPhi: 0,
    phiCod: 0,
    tongCuoc: 20000,
  });
  const [createdCode, setCreatedCode] = useState("");
  const [qrInfo, setQrInfo] = useState<{ maGiaoDichQr: string; qrUrl: string } | null>(null);

  // Cash close state
  const [tienCuocQuay, setTienCuocQuay] = useState<number>(0);
  const [tienShipperNop, setTienShipperNop] = useState<number>(0);
  const [tienThucKiemKe, setTienThucKiemKe] = useState<number>(0);
  const [closeMsg, setCloseMsg] = useState("");
  const [reprintReason, setReprintReason] = useState("");
  const [printLogs, setPrintLogs] = useState<{
    maNhatKy: string;
    maVanDon: string;
    maNhanVienQuay: string;
    thoiGianIn: string;
    soLanIn: number;
    loaiIn: string;
    lyDoInLai?: string;
  }[]>([]);

  async function loadPrintLogs() {
    try {
      const logs = await apiFetch<typeof printLogs>("/don-hang/in-tem/nhat-ky");
      setPrintLogs(logs);
    } catch {
      // ignore
    }
  }

  async function handleLookupForReprint() {
    if (!lookupPrintCode.trim()) return;
    setErrorMsg("");
    try {
      const res = await apiFetch<{
        donHang: {
          maVanDon: string;
          nguoiNhanTen: string;
          nguoiNhanSdt: string;
          diaChiGiaoChiTiet: string;
          phuongXaGiao: string;
          quanHuyenGiao: string;
          tienCod: number;
          trongLuongTinhCuoc: number;
          tongCuoc: number;
        };
      }>(`/don-hang/${lookupPrintCode.trim()}`);
      const dh = res.donHang;
      setCreatedCode(dh.maVanDon);
      setReceiverName(dh.nguoiNhanTen);
      setReceiverPhone(dh.nguoiNhanSdt);
      setAddress(dh.diaChiGiaoChiTiet);
      setWard(dh.phuongXaGiao);
      setDistrict(dh.quanHuyenGiao);
      setCod(Number(dh.tienCod || 0));
      setFee((prev) => ({ ...prev, trongLuongTinhCuoc: dh.trongLuongTinhCuoc, tongCuoc: Number(dh.tongCuoc || 0) }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không tìm thấy vận đơn để in lại");
    }
  }

  async function handlePrintLabel() {
    setErrorMsg("");
    if (createdCode) {
      const prevPrints = printLogs.filter((l) => l.maVanDon === createdCode).length;
      if (prevPrints > 0 && !reprintReason.trim()) {
        setErrorMsg("Vui lòng nhập lý do in lại tem mã vạch (VD: Tem rách / Mờ nét).");
        return;
      }
      try {
        await apiFetch(`/don-hang/${createdCode}/in-tem`, {
          method: "POST",
          body: JSON.stringify({
            maNhanVienQuay: user?.maNhanVien || "NV_QUAY_01",
            lyDoInLai: reprintReason || null,
          }),
        });
        setReprintReason("");
        await loadPrintLogs();
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Không thể in tem");
        return;
      }
    }
    window.print();
  }

  useEffect(() => {
    const raw = localStorage.getItem("fastpost_user");
    if (!raw) { router.push("/"); return; }
    setUser(JSON.parse(raw));
    loadPrintLogs();
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      apiFetch<typeof fee>("/don-hang/tinh-cuoc", {
        method: "POST",
        body: JSON.stringify({
          maGoiDichVu: service,
          trongLuongThuc: weight || 0,
          chieuDai: d || 0,
          chieuRong: r || 0,
          chieuCao: c || 0,
          laHangDeVo: fragile,
          tienCod: cod || 0,
        }),
      })
        .then((res) => setFee(res))
        .catch(() => {
          const vol = (d * r * c) / 6000;
          const cw = Math.max(weight || 0, vol);
          const hoaToc = service === "GDV_HOATOC";
          const cuocSan = hoaToc ? 35000 : 20000;
          const vuot = Math.max(0, cw - 1) * (hoaToc ? 15000 : 10000);
          const phuPhi = fragile ? 3000 : 0;
          const phiCod = 0;
          setFee({
            trongLuongTinhCuoc: Math.round(cw * 100) / 100,
            cuocSan,
            cuocVuotCan: Math.round(vuot),
            phuPhi,
            phiCod,
            tongCuoc: cuocSan + Math.round(vuot) + phuPhi + phiCod,
          });
        });
    }, 200);
    return () => clearTimeout(timer);
  }, [weight, d, r, c, fragile, cod, service]);

  function handleDistrictChange(newDistrict: string) {
    setDistrict(newDistrict);
    const wards = HCM_DISTRICTS[newDistrict] || [];
    setWard(wards[0] || "");
  }

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!isValidPhone(senderPhone)) {
      setErrorMsg("SĐT người gửi không hợp lệ (bắt buộc 10–11 chữ số, bắt đầu bằng 0).");
      return;
    }
    if (!isValidPhone(receiverPhone)) {
      setErrorMsg("SĐT người nhận không hợp lệ (bắt buộc 10–11 chữ số, bắt đầu bằng 0).");
      return;
    }
    if (weight <= 0) {
      setErrorMsg("Trọng lượng hàng hóa phải lớn hơn 0 kg.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch<{ maVanDon: string }>("/don-hang", {
        method: "POST",
        body: JSON.stringify({
          nguoiGuiSdt: senderPhone,
          nguoiNhanTen: receiverName,
          nguoiNhanSdt: receiverPhone,
          diaChiGiaoChiTiet: address,
          phuongXaGiao: ward,
          quanHuyenGiao: district,
          maGoiDichVu: service,
          trongLuongThuc: weight || 0.5,
          chieuDai: d || 0,
          chieuRong: r || 0,
          chieuCao: c || 0,
          laHangDeVo: fragile,
          tienCod: cod || 0,
          nguoiTraCuoc,
          hinhThucThanhToan,
          taiQuay: true,
        }),
      });
      setCreatedCode(res.maVanDon);
      if (nguoiTraCuoc === "NguoiGui" && hinhThucThanhToan === "VietQR") {
        try {
          const qrRes = await apiFetch<{ giaoDich: { maGiaoDichQr: string }; qrUrl: string }>(
            `/don-hang/${res.maVanDon}/vietqr`,
            { method: "POST" }
          );
          setQrInfo({ maGiaoDichQr: qrRes.giaoDich.maGiaoDichQr, qrUrl: qrRes.qrUrl });
        } catch {}
        setStep(2);
      } else {
        setStep(3);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể kết nối Backend để tạo đơn hàng");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCloseCash(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setCloseMsg("");
    try {
      await apiFetch("/doi-soat/chot-quy", {
        method: "POST",
        body: JSON.stringify({
          maBuuCuc: user?.maBuuCuc || "BC_BENNGHE",
          maNhanVienQuayLap: user?.maNhanVien || "NV_QUAY_01",
          tienCuocQuay,
          tienShipperNop,
          tienThucKiemKe,
          lyDoChenhLech: tienThucKiemKe === tienCuocQuay + tienShipperNop ? "Khớp sổ sách" : "Chênh lệch kiểm kê",
        }),
      });
      setCloseMsg("Đã lập biên bản chốt quỹ ca và khóa sổ thành công!");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể lưu biên bản chốt quỹ");
    }
  }

  function resetOrderForm() {
    setSenderPhone("");
    setSenderName("");
    setReceiverPhone("");
    setReceiverName("");
    setAddress("");
    setWeight(1);
    setD(0);
    setR(0);
    setC(0);
    setFragile(false);
    setCod(0);
    setCreatedCode("");
    setErrorMsg("");
    setStep(1);
  }

  const wards = HCM_DISTRICTS[district] || [];

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Dark Navy Sidebar */}
      <aside className="w-60 bg-[#0F172A] text-white flex flex-col justify-between p-4 shrink-0">
        <div>
          <div className="px-2 py-3 mb-6 border-b border-slate-800">
            <div className="font-bold text-lg tracking-wide">FASTPOST</div>
            <div className="text-[11px] text-slate-400">COUNTER POS</div>
          </div>
          <div className="text-[11px] text-slate-500 font-semibold uppercase px-2 mb-2">Nghiệp vụ tại quầy</div>
          <nav className="space-y-1.5 text-sm">
            {[
              { id: 1, label: "Lên đơn", icon: FilePlus2 },
              { id: 2, label: "Thu VietQR", icon: QrCode },
              { id: 3, label: "In tem", icon: Printer },
              { id: 4, label: "Chốt quỹ", icon: Vault },
            ].map((item) => {
              const Icon = item.icon;
              const active = step === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setErrorMsg(""); setStep(item.id as 1 | 2 | 3 | 4); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition ${
                    active ? "bg-[#FF5722] text-white" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 text-xs text-slate-400 space-y-2">
          <div>
            <div className="font-semibold text-slate-200">{user?.maBuuCuc || "BƯU CỤC"}</div>
            <div>Quầy giao dịch</div>
          </div>
          <button
            onClick={() => { localStorage.removeItem("fastpost_user"); router.push("/"); }}
            className="flex items-center gap-2 text-slate-400 hover:text-white pt-1"
          >
            <LogOut className="w-3.5 h-3.5" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div className="text-sm text-slate-500">Quầy giao dịch / <span className="text-[#0F172A] font-semibold">Nghiệp vụ #{step}</span></div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">● Sẵn sàng</span>
            <div className="text-right">
              <div className="text-sm font-semibold">{user?.hoTen || "Nhân viên quầy"}</div>
              <div className="text-xs text-slate-400">{user?.maNhanVien || "NV_QUAY"}</div>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-y-auto">
          {errorMsg && (
            <div className="max-w-6xl mx-auto mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleCreateOrder} className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Lên đơn tại quầy &amp; Tính cước</h1>
                  <p className="text-sm text-slate-500">Nhập thông tin người gửi, người nhận và gói hàng; cước phí được tính tự động.</p>
                </div>
                <button
                  type="button"
                  onClick={resetOrderForm}
                  className="px-4 py-2 text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-slate-700"
                >
                  Làm mới form
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                  {/* Người gửi */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <h2 className="font-bold text-base mb-4">1. Thông tin người gửi</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Số điện thoại *</label>
                        <input
                          required
                          type="tel"
                          inputMode="numeric"
                          pattern="0[0-9]{9,10}"
                          maxLength={11}
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(sanitizePhoneInput(e.target.value))}
                          placeholder="09xxxxxxxx"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Họ và tên *</label>
                        <input
                          required
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="Nhập tên người gửi / shop..."
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Người nhận */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <h2 className="font-bold text-base mb-4">2. Thông tin người nhận &amp; Địa chỉ giao (TP.HCM)</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Số điện thoại người nhận *</label>
                        <input
                          required
                          type="tel"
                          inputMode="numeric"
                          pattern="0[0-9]{9,10}"
                          maxLength={11}
                          value={receiverPhone}
                          onChange={(e) => setReceiverPhone(sanitizePhoneInput(e.target.value))}
                          placeholder="09xxxxxxxx"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Tên người nhận *</label>
                        <input
                          required
                          value={receiverName}
                          onChange={(e) => setReceiverName(e.target.value)}
                          placeholder="Nhập họ tên người nhận..."
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Số nhà, tên đường *</label>
                        <input
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="VD: 28 Nguyễn Huệ..."
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Quận / Huyện *</label>
                        <select
                          value={district}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                        >
                          {DISTRICT_NAMES.map((dist) => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Phường / Xã *</label>
                        <select
                          value={ward}
                          onChange={(e) => setWard(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                        >
                          {wards.map((w) => (
                            <option key={w} value={w}>{w}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Hàng hóa */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <h2 className="font-bold text-base mb-4">3. Thông tin hàng hóa &amp; Thu hộ</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Cân thực (kg) *</label>
                        <input
                          type="number"
                          min={0.1}
                          step="0.1"
                          required
                          value={weight || ""}
                          onChange={(e) => setWeight(Number(e.target.value || 0))}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Dài (cm)</label>
                        <input
                          type="number"
                          min={0}
                          value={d || ""}
                          placeholder="0"
                          onChange={(e) => setD(Number(e.target.value || 0))}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Rộng (cm)</label>
                        <input
                          type="number"
                          min={0}
                          value={r || ""}
                          placeholder="0"
                          onChange={(e) => setR(Number(e.target.value || 0))}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Cao (cm)</label>
                        <input
                          type="number"
                          min={0}
                          value={c || ""}
                          placeholder="0"
                          onChange={(e) => setC(Number(e.target.value || 0))}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 cursor-pointer">
                        <input type="checkbox" checked={fragile} onChange={(e) => setFragile(e.target.checked)} className="rounded accent-[#FF5722]" />
                        Hàng dễ vỡ (phụ phí +3.000đ)
                      </label>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Tiền thu hộ COD (VNĐ)</label>
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          value={cod || ""}
                          onChange={(e) => setCod(Number(e.target.value || 0))}
                          placeholder="Nhập tiền thu hộ (VD: 500000)"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fee Summary */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit space-y-4 sticky top-6">
                  <h2 className="font-bold text-lg">Bảng cước tự động</h2>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Gói dịch vụ</label>
                    <select value={service} onChange={(e) => setService(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium">
                      <option value="GDV_TIEUCHUAN">Giao tiêu chuẩn</option>
                      <option value="GDV_HOATOC">FastPost Hỏa Tốc</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Người trả cước</label>
                      <select value={nguoiTraCuoc} onChange={(e) => setNguoiTraCuoc(e.target.value as "NguoiGui" | "NguoiNhan")} className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium">
                        <option value="NguoiGui">Người gửi trả</option>
                        <option value="NguoiNhan">Người nhận trả</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Hình thức TT</label>
                      <select value={hinhThucThanhToan} onChange={(e) => setHinhThucThanhToan(e.target.value as "VietQR" | "TienMat")} className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium">
                        <option value="VietQR">VietQR động</option>
                        <option value="TienMat">Tiền mặt</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2.5 text-sm border-t border-slate-100 pt-3">
                    <div className="flex justify-between"><span className="text-slate-500">TL tính cước</span><span className="font-medium">{fee.trongLuongTinhCuoc} kg</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Cước sàn</span><span>{formatVnd(fee.cuocSan)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Vượt cân</span><span>{formatVnd(fee.cuocVuotCan)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Phụ phí</span><span>{formatVnd(fee.phuPhi)}</span></div>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex items-baseline justify-between">
                    <span className="font-bold">Tổng cước</span>
                    <span className="text-2xl font-bold text-[#0F172A]">{formatVnd(fee.tongCuoc)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-200/70 text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-[#0F172A]">
                      <span>Tiền thu hộ (COD):</span>
                      <span className="text-[#FF5722]">{formatVnd(cod)}</span>
                    </div>
                    <div className="text-slate-500">Tiền thu hộ không bao gồm trong tổng cước.</div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#FF5722] hover:bg-[#E64A19] text-white font-semibold rounded-xl transition disabled:opacity-60"
                  >
                    {submitting ? "Đang tạo đơn..." : "Tạo đơn & Thanh toán"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
              <h2 className="text-xl font-bold">Thanh toán VietQR động</h2>
              <p className="text-sm text-slate-500">Mã vận đơn: <strong>{createdCode ? `#${createdCode}` : "(Chưa có đơn mới)"}</strong></p>
              <div className="text-3xl font-bold text-[#FF5722]">{formatVnd(fee.tongCuoc)}</div>
              <div className="w-56 h-56 mx-auto bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden p-2">
                {qrInfo?.qrUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrInfo.qrUrl} alt="VietQR" className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-28 h-28 text-[#0F172A]" />
                )}
              </div>
              <p className="text-xs text-slate-500">Nội dung CK: <code>FASTPOST {createdCode}</code></p>
              <button
                onClick={async () => {
                  if (qrInfo?.maGiaoDichQr) {
                    try {
                      await apiFetch(`/don-hang/vietqr/${qrInfo.maGiaoDichQr}/xac-nhan`, { method: "POST" });
                    } catch {}
                  }
                  setStep(3);
                }}
                className="w-full py-3 bg-[#FF5722] text-white font-semibold rounded-xl"
              >
                Xác nhận đã thu tiền → In tem mã vạch
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl border border-slate-200 space-y-4">
              <h2 className="text-xl font-bold text-center">Xem trước &amp; In tem mã vạch</h2>
              <div className="flex gap-2">
                <input
                  value={lookupPrintCode}
                  onChange={(e) => setLookupPrintCode(e.target.value)}
                  placeholder="Tra cứu mã vận đơn để in lại tem (UC 3.3.3)..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
                <button type="button" onClick={handleLookupForReprint} className="px-3 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-semibold">
                  Tải đơn
                </button>
              </div>
              <div className="border-2 border-slate-900 rounded-xl p-5 space-y-2 text-sm">
                <div className="flex justify-between items-center font-bold border-b border-slate-300 pb-2">
                  <span>FASTPOST EXPRESS</span>
                  <div className="flex items-center gap-2">
                    {createdCode && printLogs.some((l) => l.maVanDon === createdCode) && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px]">BẢN IN LẠI</span>
                    )}
                    <span>{createdCode ? `#${createdCode}` : "#---"}</span>
                  </div>
                </div>
                {createdCode && (
                  <div className="py-1.5 text-center font-mono tracking-[0.25em] text-xs bg-slate-50 rounded border border-slate-200">
                    ||| |||| || ||| |||| ||| || {createdCode}
                  </div>
                )}
                <div><strong>Người nhận:</strong> {receiverName || "---"} ({receiverPhone || "---"})</div>
                <div><strong>Địa chỉ:</strong> {address || "---"}, {ward}, {district}</div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span>Thu hộ COD: <strong>{formatVnd(cod)}</strong></span>
                  <span>TL: {fee.trongLuongTinhCuoc} kg</span>
                </div>
              </div>
              <input
                value={reprintReason}
                onChange={(e) => setReprintReason(e.target.value)}
                placeholder="Lý do in lại (nếu là in lại tem)..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handlePrintLabel} className="py-2.5 border border-slate-300 rounded-xl font-semibold text-sm hover:bg-slate-50">
                  In tem ngay
                </button>
                <button onClick={resetOrderForm} className="py-2.5 bg-[#FF5722] text-white rounded-xl font-semibold text-sm">
                  Lên đơn mới
                </button>
              </div>
              {printLogs.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="text-xs font-semibold text-slate-600">Nhật ký in tem gần đây</div>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 text-xs">
                    {printLogs.slice(0, 8).map((log) => (
                      <div key={log.maNhatKy} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div>
                          <span className="font-semibold">#{log.maVanDon}</span> ·{" "}
                          <span className="text-slate-500">{log.loaiIn} (Lần {log.soLanIn})</span>
                          {log.lyDoInLai && <span className="text-slate-400"> — {log.lyDoInLai}</span>}
                        </div>
                        <span className="text-[11px] text-slate-400">{log.maNhanVienQuay}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <form onSubmit={handleCloseCash} className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h2 className="text-xl font-bold">Kiểm kê két tiền &amp; Chốt quỹ ca</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Tiền cước quầy (VNĐ)</label>
                  <input type="number" min={0} value={tienCuocQuay || ""} placeholder="0" onChange={(e) => setTienCuocQuay(Number(e.target.value || 0))} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Tiền Shipper nộp (VNĐ)</label>
                  <input type="number" min={0} value={tienShipperNop || ""} placeholder="0" onChange={(e) => setTienShipperNop(Number(e.target.value || 0))} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Tiền thực kiểm kê (VNĐ)</label>
                  <input type="number" min={0} value={tienThucKiemKe || ""} placeholder="0" onChange={(e) => setTienThucKiemKe(Number(e.target.value || 0))} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 flex justify-between text-sm">
                <span>Tổng sổ sách: <strong>{formatVnd(tienCuocQuay + tienShipperNop)}</strong></span>
                <span>Chênh lệch: <strong className="text-[#FF5722]">{formatVnd(tienThucKiemKe - (tienCuocQuay + tienShipperNop))}</strong></span>
              </div>
              {closeMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {closeMsg}
                </div>
              )}
              <button type="submit" className="w-full py-3 bg-[#FF5722] text-white font-semibold rounded-xl">
                Xác nhận chốt quỹ &amp; Khóa sổ ca
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

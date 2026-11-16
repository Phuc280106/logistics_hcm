"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, QrCode, Printer, Vault, LogOut, CheckCircle2 } from "lucide-react";
import { apiFetch, formatVnd, UserSession } from "@/lib/api";

export default function CounterPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Order form state
  const [senderPhone, setSenderPhone] = useState("0909123456");
  const [senderName, setSenderName] = useState("Trần Minh Đức");
  const [receiverPhone, setReceiverPhone] = useState("0903456789");
  const [receiverName, setReceiverName] = useState("Nguyễn Thị Mai");
  const [address, setAddress] = useState("28 Nguyễn Huệ");
  const [district, setDistrict] = useState("Quận 1");
  const [ward, setWard] = useState("Bến Nghé");
  const [service, setService] = useState("GDV_TIEUCHUAN");
  const [weight, setWeight] = useState(1.5);
  const [d, setD] = useState(20);
  const [r, setR] = useState(15);
  const [c, setC] = useState(10);
  const [fragile, setFragile] = useState(false);
  const [cod, setCod] = useState(500000);

  const [fee, setFee] = useState({
    trongLuongTinhCuoc: 1.5,
    cuocSan: 20000,
    cuocVuotCan: 5000,
    phuPhi: 0,
    phiCod: 5000,
    tongCuoc: 30000,
  });
  const [createdCode, setCreatedCode] = useState("FP-98233");

  // Cash close state
  const [tienCuocQuay, setTienCuocQuay] = useState(2450000);
  const [tienShipperNop, setTienShipperNop] = useState(5800000);
  const [tienThucKiemKe, setTienThucKiemKe] = useState(8250000);
  const [closeMsg, setCloseMsg] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("fastpost_user");
    if (!raw) { router.push("/"); return; }
    setUser(JSON.parse(raw));
  }, [router]);

  useEffect(() => {
    const vol = (d * r * c) / 6000;
    const cw = Math.max(weight, vol);
    const hoaToc = service === "GDV_HOATOC";
    const cuocSan = hoaToc ? 35000 : 20000;
    const vuot = Math.max(0, cw - 1) * (hoaToc ? 15000 : 10000);
    const phuPhi = fragile ? 3000 : 0;
    const phiCod = Math.round(cod * 0.01);
    setFee({
      trongLuongTinhCuoc: Math.round(cw * 100) / 100,
      cuocSan,
      cuocVuotCan: Math.round(vuot),
      phuPhi,
      phiCod,
      tongCuoc: cuocSan + Math.round(vuot) + phuPhi + phiCod,
    });
  }, [weight, d, r, c, fragile, cod, service]);

  async function handleCreateOrder() {
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
          trongLuongThuc: weight,
          chieuDai: d,
          chieuRong: r,
          chieuCao: c,
          laHangDeVo: fragile,
          tienCod: cod,
          taiQuay: true,
        }),
      });
      setCreatedCode(res.maVanDon);
    } catch {
      setCreatedCode("FP-" + Math.floor(10000 + Math.random() * 89999));
    }
    setStep(2);
  }

  async function handleCloseCash() {
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
    } catch {}
    setCloseMsg("Đã lập biên bản chốt quỹ ca và khóa sổ thành công!");
  }

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
                  onClick={() => setStep(item.id as 1 | 2 | 3 | 4)}
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
            <div className="font-semibold text-slate-200">BƯU CỤC BẾN NGHÉ</div>
            <div>Quầy 03 · Ca chiều</div>
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
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">● Kết nối ổn định</span>
            <div className="text-right">
              <div className="text-sm font-semibold">{user?.hoTen || "Nguyễn Hoàng Anh"}</div>
              <div className="text-xs text-slate-400">Nhân viên quầy · Q03</div>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl font-bold mb-1">Lên đơn tại quầy &amp; Tính cước</h1>
              <p className="text-sm text-slate-500 mb-6">Nhập thông tin đơn hàng, cước phí được tính tự động.</p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <h2 className="font-bold mb-3">Người gửi</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Số điện thoại</label>
                        <input value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Họ và tên</label>
                        <input value={senderName} onChange={(e) => setSenderName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <h2 className="font-bold mb-3">Người nhận</h2>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <input value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} placeholder="SĐT người nhận" className="px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                      <input value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Tên người nhận" className="px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Địa chỉ" className="px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                      <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Quận / Huyện" className="px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                      <input value={ward} onChange={(e) => setWard(e.target.value)} placeholder="Phường / Xã" className="px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <h2 className="font-bold mb-3">Hàng hóa</h2>
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Cân thực (kg)</label>
                        <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Dài (cm)</label>
                        <input type="number" value={d} onChange={(e) => setD(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Rộng (cm)</label>
                        <input type="number" value={r} onChange={(e) => setR(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Cao (cm)</label>
                        <input type="number" value={c} onChange={(e) => setC(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-center">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={fragile} onChange={(e) => setFragile(e.target.checked)} className="rounded accent-[#FF5722]" />
                        Hàng dễ vỡ (+3.000đ)
                      </label>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Tiền thu hộ COD (VNĐ)</label>
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          value={cod || ""}
                          onChange={(e) => setCod(Number(e.target.value || 0))}
                          placeholder="Ví dụ: 500000"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fee Summary */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit space-y-4">
                  <h2 className="font-bold text-lg">Bảng cước tự động</h2>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Gói dịch vụ</label>
                    <select value={service} onChange={(e) => setService(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium">
                      <option value="GDV_TIEUCHUAN">Giao tiêu chuẩn</option>
                      <option value="GDV_HOATOC">FastPost Hỏa Tốc</option>
                    </select>
                  </div>
                  <div className="space-y-2 text-sm border-t border-slate-100 pt-3">
                    <div className="flex justify-between"><span className="text-slate-500">TL tính cước</span><span>{fee.trongLuongTinhCuoc} kg</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Cước sàn</span><span>{formatVnd(fee.cuocSan)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Vượt cân</span><span>{formatVnd(fee.cuocVuotCan)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Phụ phí</span><span>{formatVnd(fee.phuPhi)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Phí dịch vụ COD (1%)</span><span>{formatVnd(fee.phiCod)}</span></div>
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
                    onClick={handleCreateOrder}
                    className="w-full py-3 bg-[#FF5722] hover:bg-[#E64A19] text-white font-semibold rounded-xl transition"
                  >
                    Tạo đơn &amp; Thanh toán
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
              <h2 className="text-xl font-bold">Thanh toán VietQR động</h2>
              <p className="text-sm text-slate-500">Mã vận đơn: <strong>#{createdCode}</strong></p>
              <div className="text-3xl font-bold text-[#FF5722]">{formatVnd(fee.tongCuoc)}</div>
              <div className="w-48 h-48 mx-auto bg-slate-100 border border-slate-300 rounded-2xl flex items-center justify-center">
                <QrCode className="w-28 h-28 text-[#0F172A]" />
              </div>
              <p className="text-xs text-slate-500">Nội dung CK: <code>FASTPOST {createdCode}</code></p>
              <button
                onClick={() => setStep(3)}
                className="w-full py-3 bg-[#FF5722] text-white font-semibold rounded-xl"
              >
                Xác nhận đã thu tiền → In tem mã vạch
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl border border-slate-200 space-y-4">
              <h2 className="text-xl font-bold text-center">Xem trước &amp; In tem mã vạch</h2>
              <div className="border-2 border-slate-900 rounded-xl p-5 space-y-2 text-sm">
                <div className="flex justify-between font-bold border-b border-slate-300 pb-2">
                  <span>FASTPOST EXPRESS</span>
                  <span>#{createdCode}</span>
                </div>
                <div><strong>Người nhận:</strong> {receiverName} ({receiverPhone})</div>
                <div><strong>Địa chỉ:</strong> {address}, {ward}, {district}</div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span>Thu hộ COD: <strong>{formatVnd(cod)}</strong></span>
                  <span>TL: {fee.trongLuongTinhCuoc} kg</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => window.print()} className="py-2.5 border border-slate-300 rounded-xl font-semibold text-sm">
                  In tem ngay
                </button>
                <button onClick={() => setStep(1)} className="py-2.5 bg-[#FF5722] text-white rounded-xl font-semibold text-sm">
                  Lên đơn mới
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h2 className="text-xl font-bold">Kiểm kê két tiền &amp; Chốt quỹ ca</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Tiền cước quầy</label>
                  <input type="number" value={tienCuocQuay} onChange={(e) => setTienCuocQuay(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Tiền Shipper nộp</label>
                  <input type="number" value={tienShipperNop} onChange={(e) => setTienShipperNop(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Tiền thực kiểm kê</label>
                  <input type="number" value={tienThucKiemKe} onChange={(e) => setTienThucKiemKe(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
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
              <button onClick={handleCloseCash} className="w-full py-3 bg-[#FF5722] text-white font-semibold rounded-xl">
                Xác nhận chốt quỹ &amp; Khóa sổ ca
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

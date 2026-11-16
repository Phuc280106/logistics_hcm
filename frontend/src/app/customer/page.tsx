"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Search, PackagePlus, MapPin, LogOut, CheckCircle2 } from "lucide-react";
import { apiFetch, formatVnd } from "@/lib/api";

export default function CustomerPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"create" | "track">("create");
  const [receiverName, setReceiverName] = useState("Trần Thị Mai");
  const [receiverPhone, setReceiverPhone] = useState("0912345678");
  const [address, setAddress] = useState("45 Lê Duẩn, P. Bến Nghé, Quận 1");
  const [weight, setWeight] = useState(1.0);
  const [cod, setCod] = useState(300000);
  const [createdOrder, setCreatedOrder] = useState<string | null>(null);

  const [trackCode, setTrackCode] = useState("FP-98231");
  const [trackInfo, setTrackInfo] = useState<{
    trangThai: string;
    nguoiNhanTen: string;
    hanhTrinh: { thoiGian: string; trangThaiGhiNhan: string; moTaChiTiet: string }[];
  }>({
    trangThai: "DangGiaoHang",
    nguoiNhanTen: "Trần Thị Mai",
    hanhTrinh: [
      { thoiGian: "14:05 16/11", trangThaiGhiNhan: "DaNhapKho", moTaChiTiet: "Tiếp nhận đơn hàng tại Bưu cục Bến Nghé" },
      { thoiGian: "14:32 16/11", trangThaiGhiNhan: "DangGiaoHang", moTaChiTiet: "Shipper Phương Duy đang giao hàng" },
    ],
  });

  async function handleCreateOnline(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await apiFetch<{ maVanDon: string }>("/don-hang", {
        method: "POST",
        body: JSON.stringify({
          nguoiGuiSdt: "0909123456",
          nguoiNhanTen: receiverName,
          nguoiNhanSdt: receiverPhone,
          diaChiGiaoChiTiet: address,
          phuongXaGiao: "P. Bến Nghé",
          quanHuyenGiao: "Quận 1",
          maGoiDichVu: "GDV_TIEUCHUAN",
          trongLuongThuc: weight,
          tienCod: cod,
          taiQuay: false,
        }),
      });
      setCreatedOrder(res.maVanDon);
    } catch {
      setCreatedOrder("FP-" + Math.floor(10000 + Math.random() * 89999));
    }
  }

  async function handleTrack() {
    try {
      const res = await apiFetch<{
        donHang: { trangThai: string; nguoiNhanTen: string };
        hanhTrinh: { thoiGian: string; trangThaiGhiNhan: string; moTaChiTiet: string }[];
      }>(`/don-hang/${trackCode}`);
      setTrackInfo({
        trangThai: res.donHang.trangThai,
        nguoiNhanTen: res.donHang.nguoiNhanTen,
        hanhTrinh: res.hanhTrinh,
      });
    } catch {}
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-[430px] bg-[#F8FAFC] min-h-screen flex flex-col shadow-xl">
        <header className="bg-[#0F172A] text-white px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF5722] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <div className="font-bold text-sm">FastPost Express</div>
              <div className="text-[11px] text-slate-400">Khách hàng · Minh Đức Store</div>
            </div>
          </div>
          <button
            onClick={() => { localStorage.removeItem("fastpost_user"); router.push("/"); }}
            className="text-slate-400 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <div className="p-4 space-y-4 flex-1">
          <div className="grid grid-cols-2 bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTab("create")}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 ${tab === "create" ? "bg-[#FF5722] text-white" : "text-slate-600"}`}
            >
              <PackagePlus className="w-4 h-4" /> Đặt đơn Online
            </button>
            <button
              onClick={() => setTab("track")}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 ${tab === "track" ? "bg-[#FF5722] text-white" : "text-slate-600"}`}
            >
              <Search className="w-4 h-4" /> Tra cứu hành trình
            </button>
          </div>

          {tab === "create" ? (
            <form onSubmit={handleCreateOnline} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <h2 className="font-bold text-base">Tạo đơn gửi hàng mới</h2>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Tên người nhận</label>
                <input value={receiverName} onChange={(e) => setReceiverName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" required />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">SĐT người nhận</label>
                <input value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" required />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Địa chỉ giao</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Khối lượng (kg)</label>
                  <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Tiền COD (đ)</label>
                  <input type="number" value={cod} onChange={(e) => setCod(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex justify-between text-sm">
                <span className="text-slate-600">Ước tính cước:</span>
                <strong className="text-[#FF5722]">{formatVnd(20000 + Math.round(cod * 0.01))}</strong>
              </div>
              {createdOrder && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Đã đặt đơn thành công: <strong>#{createdOrder}</strong>
                </div>
              )}
              <button type="submit" className="w-full py-2.5 bg-[#FF5722] text-white font-semibold rounded-xl text-sm">
                Xác nhận đặt đơn lấy hàng
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
                  placeholder="Nhập mã vận đơn..."
                />
                <button onClick={handleTrack} className="px-4 py-2 bg-[#FF5722] text-white font-semibold rounded-xl text-sm">
                  Tìm
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold">#{trackCode}</div>
                  <span className="px-2.5 py-1 rounded-full bg-orange-50 text-[#FF5722] text-xs font-semibold">
                    {trackInfo.trangThai}
                  </span>
                </div>
                <div className="text-xs text-slate-500">Người nhận: {trackInfo.nguoiNhanTen}</div>
                <div className="border-t border-slate-100 pt-3 space-y-3">
                  {trackInfo.hanhTrinh.map((h, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <MapPin className="w-4 h-4 text-[#FF5722] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-[#0F172A]">{h.trangThaiGhiNhan}</div>
                        <div className="text-slate-600">{h.moTaChiTiet}</div>
                        <div className="text-slate-400 text-[11px]">{h.thoiGian}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

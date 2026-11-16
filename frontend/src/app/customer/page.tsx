"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Search, PackagePlus, MapPin, LogOut, CheckCircle2, AlertCircle, BookUser, Trash2, Landmark } from "lucide-react";
import { apiFetch, formatVnd, UserSession } from "@/lib/api";
import { DISTRICT_NAMES, HCM_DISTRICTS } from "@/lib/hcmLocations";

interface SoDiaChiItem {
  maDiaChi: string;
  maKhachHang: string;
  tenNguoiNhan: string;
  soDienThoai: string;
  diaChiChiTiet: string;
  phuongXa: string;
  quanHuyen: string;
  laMacDinh: boolean;
}

interface TaiKhoanNganHangItem {
  maTkNganHang: string;
  maKhachHang: string;
  maNganHangDm: string;
  soTaiKhoan: string;
  tenChuTaiKhoan: string;
  laMacDinhCod: boolean;
}

interface NganHangItem {
  maNganHangDm: string;
  tenNganHang: string;
  tenVietTat: string;
}

export default function CustomerPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [tab, setTab] = useState<"create" | "track" | "address">("create");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("Quận 1");
  const [ward, setWard] = useState(HCM_DISTRICTS["Quận 1"][0]);
  const [service, setService] = useState("GDV_TIEUCHUAN");
  const [weight, setWeight] = useState<number>(1);
  const [cod, setCod] = useState<number>(0);
  const [createdOrder, setCreatedOrder] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [trackCode, setTrackCode] = useState("");
  const [trackInfo, setTrackInfo] = useState<{
    maVanDon: string;
    trangThai: string;
    nguoiNhanTen: string;
    hanhTrinh: { thoiGian: string; trangThaiGhiNhan: string; moTaChiTiet: string }[];
  } | null>(null);

  const [addresses, setAddresses] = useState<SoDiaChiItem[]>([]);
  const [newAddrName, setNewAddrName] = useState("");
  const [newAddrPhone, setNewAddrPhone] = useState("");
  const [newAddrDetail, setNewAddrDetail] = useState("");
  const [newAddrDistrict, setNewAddrDistrict] = useState("Quận 1");
  const [newAddrWard, setNewAddrWard] = useState(HCM_DISTRICTS["Quận 1"][0]);

  const [bankAccounts, setBankAccounts] = useState<TaiKhoanNganHangItem[]>([]);
  const [banks, setBanks] = useState<NganHangItem[]>([]);
  const [newBankId, setNewBankId] = useState("NH_VCB");
  const [newBankAcc, setNewBankAcc] = useState("");
  const [newBankOwner, setNewBankOwner] = useState("");

  async function loadAddressBook(maKh: string) {
    try {
      const [addrRes, accRes, bankRes] = await Promise.all([
        apiFetch<SoDiaChiItem[]>(`/khach-hang/${maKh}/dia-chi`),
        apiFetch<TaiKhoanNganHangItem[]>(`/khach-hang/${maKh}/ngan-hang`),
        apiFetch<NganHangItem[]>(`/danh-muc/ngan-hang`),
      ]);
      setAddresses(addrRes);
      setBankAccounts(accRes);
      setBanks(bankRes);
      if (bankRes.length > 0 && !bankRes.some((b) => b.maNganHangDm === newBankId)) {
        setNewBankId(bankRes[0].maNganHangDm);
      }
    } catch {
      // ignore if not customer role
    }
  }

  useEffect(() => {
    const raw = localStorage.getItem("fastpost_user");
    if (!raw) { router.push("/"); return; }
    const u: UserSession = JSON.parse(raw);
    setUser(u);
    if (u.maNguoiDung) {
      loadAddressBook(u.maNguoiDung);
    }
  }, [router]);

  function applySavedAddress(addr: SoDiaChiItem) {
    setReceiverName(addr.tenNguoiNhan);
    setReceiverPhone(addr.soDienThoai);
    setAddress(addr.diaChiChiTiet);
    setDistrict(addr.quanHuyen);
    setWard(addr.phuongXa);
    setTab("create");
  }

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.maNguoiDung) return;
    setErrorMsg("");
    try {
      await apiFetch(`/khach-hang/${user.maNguoiDung}/dia-chi`, {
        method: "POST",
        body: JSON.stringify({
          tenNguoiNhan: newAddrName,
          soDienThoai: newAddrPhone,
          diaChiChiTiet: newAddrDetail,
          quanHuyen: newAddrDistrict,
          phuongXa: newAddrWard,
          laMacDinh: addresses.length === 0,
        }),
      });
      setNewAddrName("");
      setNewAddrPhone("");
      setNewAddrDetail("");
      await loadAddressBook(user.maNguoiDung);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể thêm địa chỉ");
    }
  }

  async function handleDeleteAddress(maDiaChi: string) {
    if (!user?.maNguoiDung) return;
    try {
      await apiFetch(`/khach-hang/dia-chi/${maDiaChi}`, { method: "DELETE" });
      await loadAddressBook(user.maNguoiDung);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể xóa địa chỉ");
    }
  }

  async function handleAddBank(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.maNguoiDung) return;
    setErrorMsg("");
    try {
      await apiFetch(`/khach-hang/${user.maNguoiDung}/ngan-hang`, {
        method: "POST",
        body: JSON.stringify({
          maNganHangDm: newBankId,
          soTaiKhoan: newBankAcc,
          tenChuTaiKhoan: newBankOwner,
          laMacDinhCod: bankAccounts.length === 0,
        }),
      });
      setNewBankAcc("");
      setNewBankOwner("");
      await loadAddressBook(user.maNguoiDung);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể thêm tài khoản ngân hàng");
    }
  }

  async function handleDeleteBank(maTkNganHang: string) {
    if (!user?.maNguoiDung) return;
    try {
      await apiFetch(`/khach-hang/ngan-hang/${maTkNganHang}`, { method: "DELETE" });
      await loadAddressBook(user.maNguoiDung);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể xóa tài khoản ngân hàng");
    }
  }

  function handleDistrictChange(newDistrict: string) {
    setDistrict(newDistrict);
    const wards = HCM_DISTRICTS[newDistrict] || [];
    setWard(wards[0] || "");
  }

  async function handleCreateOnline(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setCreatedOrder(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ maVanDon: string }>("/don-hang", {
        method: "POST",
        body: JSON.stringify({
          nguoiGuiSdt: user?.soDienThoai || "",
          nguoiNhanTen: receiverName,
          nguoiNhanSdt: receiverPhone,
          diaChiGiaoChiTiet: address,
          phuongXaGiao: ward,
          quanHuyenGiao: district,
          maGoiDichVu: service,
          trongLuongThuc: weight || 0.5,
          tienCod: cod || 0,
          taiQuay: false,
        }),
      });
      setCreatedOrder(res.maVanDon);
      setReceiverName("");
      setReceiverPhone("");
      setAddress("");
      setCod(0);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể kết nối máy chủ để đặt đơn");
    } finally {
      setLoading(false);
    }
  }

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!trackCode.trim()) return;
    setErrorMsg("");
    setTrackInfo(null);
    try {
      const res = await apiFetch<{
        donHang: { maVanDon: string; trangThai: string; nguoiNhanTen: string };
        hanhTrinh: { thoiGian: string; trangThaiGhiNhan: string; moTaChiTiet: string }[];
      }>(`/don-hang/${trackCode.trim()}`);
      setTrackInfo({
        maVanDon: res.donHang.maVanDon,
        trangThai: res.donHang.trangThai,
        nguoiNhanTen: res.donHang.nguoiNhanTen,
        hanhTrinh: res.hanhTrinh,
      });
    } catch {
      setErrorMsg(`Không tìm thấy vận đơn "${trackCode.trim()}" hoặc chưa kết nối Backend.`);
    }
  }

  const baseFee = service === "GDV_HOATOC" ? 35000 : 20000;
  const weightFee = Math.max(0, (weight || 0) - 1) * (service === "GDV_HOATOC" ? 15000 : 10000);
  const codFee = Math.round((cod || 0) * 0.01);
  const estTotal = baseFee + weightFee + codFee;
  const wards = HCM_DISTRICTS[district] || [];

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
              <div className="text-[11px] text-slate-400">{user?.hoTen || "Khách hàng"}</div>
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
          <div className="grid grid-cols-3 bg-slate-200/80 p-1 rounded-xl text-[11px] font-semibold">
            <button
              onClick={() => { setTab("create"); setErrorMsg(""); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1 ${tab === "create" ? "bg-[#FF5722] text-white" : "text-slate-600"}`}
            >
              <PackagePlus className="w-3.5 h-3.5" /> Đặt đơn
            </button>
            <button
              onClick={() => { setTab("track"); setErrorMsg(""); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1 ${tab === "track" ? "bg-[#FF5722] text-white" : "text-slate-600"}`}
            >
              <Search className="w-3.5 h-3.5" /> Tra cứu
            </button>
            <button
              onClick={() => { setTab("address"); setErrorMsg(""); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1 ${tab === "address" ? "bg-[#FF5722] text-white" : "text-slate-600"}`}
            >
              <BookUser className="w-3.5 h-3.5" /> Sổ địa chỉ
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
            </div>
          )}

          {tab === "create" ? (
            <form onSubmit={handleCreateOnline} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base">Tạo đơn gửi hàng mới</h2>
                {addresses.length > 0 && (
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const found = addresses.find((a) => a.maDiaChi === e.target.value);
                      if (found) applySavedAddress(found);
                    }}
                    className="text-[11px] px-2 py-1 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 max-w-[160px]"
                  >
                    <option value="" disabled>Chọn từ sổ địa chỉ...</option>
                    {addresses.map((a) => (
                      <option key={a.maDiaChi} value={a.maDiaChi}>
                        {a.tenNguoiNhan} ({a.quanHuyen})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tên người nhận *</label>
                <input value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Nhập họ tên người nhận..." className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">SĐT người nhận *</label>
                <input value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} placeholder="Nhập số điện thoại..." className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Quận / Huyện *</label>
                  <select value={district} onChange={(e) => handleDistrictChange(e.target.value)} className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-sm">
                    {DISTRICT_NAMES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phường / Xã *</label>
                  <select value={ward} onChange={(e) => setWard(e.target.value)} className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-sm">
                    {wards.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Địa chỉ chi tiết *</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, tên đường..." className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Gói dịch vụ</label>
                <select value={service} onChange={(e) => setService(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm">
                  <option value="GDV_TIEUCHUAN">Giao tiêu chuẩn</option>
                  <option value="GDV_HOATOC">FastPost Hỏa Tốc</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Khối lượng (kg)</label>
                  <input type="number" min={0.1} step="0.1" value={weight || ""} onChange={(e) => setWeight(Number(e.target.value || 0))} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tiền thu hộ COD (đ)</label>
                  <input type="number" min={0} step={1000} value={cod || ""} placeholder="0" onChange={(e) => setCod(Number(e.target.value || 0))} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex justify-between text-sm">
                <span className="text-slate-600">Ước tính cước:</span>
                <strong className="text-[#FF5722]">{formatVnd(estTotal)}</strong>
              </div>
              {createdOrder && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Đã đặt đơn thành công: <strong>#{createdOrder}</strong>
                </div>
              )}
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#FF5722] text-white font-semibold rounded-xl text-sm disabled:opacity-60">
                {loading ? "Đang gửi..." : "Xác nhận đặt đơn lấy hàng"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleTrack} className="flex gap-2">
                <input
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
                  placeholder="Nhập mã vận đơn (VD: FP-98231)..."
                />
                <button type="submit" className="px-4 py-2 bg-[#FF5722] text-white font-semibold rounded-xl text-sm">
                  Tìm
                </button>
              </form>
              {trackInfo ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold">#{trackInfo.maVanDon}</div>
                    <span className="px-2.5 py-1 rounded-full bg-orange-50 text-[#FF5722] text-xs font-semibold">
                      {trackInfo.trangThai}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">Người nhận: {trackInfo.nguoiNhanTen}</div>
                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    {trackInfo.hanhTrinh.length === 0 ? (
                      <div className="text-xs text-slate-400">Chưa có lịch sử hành trình.</div>
                    ) : (
                      trackInfo.hanhTrinh.map((h, i) => (
                        <div key={i} className="flex gap-3 text-xs">
                          <MapPin className="w-4 h-4 text-[#FF5722] shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-[#0F172A]">{h.trangThaiGhiNhan}</div>
                            <div className="text-slate-600">{h.moTaChiTiet}</div>
                            <div className="text-slate-400 text-[11px]">{h.thoiGian}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-400">
                  Nhập mã vận đơn để xem hành trình giao hàng theo thời gian thực.
                </div>
              )}
            </div>
          )}

          {tab === "address" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <h2 className="font-bold text-sm flex items-center gap-1.5">
                  <BookUser className="w-4 h-4 text-[#FF5722]" /> Sổ địa chỉ người nhận
                </h2>
                {addresses.length === 0 ? (
                  <div className="text-xs text-slate-400">Chưa có địa chỉ nào được lưu.</div>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((a) => (
                      <div key={a.maDiaChi} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-2 text-xs">
                        <div>
                          <div className="font-semibold text-[#0F172A]">
                            {a.tenNguoiNhan} · {a.soDienThoai}
                          </div>
                          <div className="text-slate-600">{a.diaChiChiTiet}, {a.phuongXa}, {a.quanHuyen}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => applySavedAddress(a)}
                            className="px-2 py-1 bg-[#FF5722] text-white rounded-lg text-[11px] font-semibold"
                          >
                            Dùng
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(a.maDiaChi)}
                            className="p-1 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleAddAddress} className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-xs font-semibold text-slate-700">Thêm địa chỉ mới</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={newAddrName} onChange={(e) => setNewAddrName(e.target.value)} placeholder="Tên người nhận" className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs" required />
                    <input value={newAddrPhone} onChange={(e) => setNewAddrPhone(e.target.value)} placeholder="Số điện thoại" className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs" required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newAddrDistrict}
                      onChange={(e) => {
                        const d = e.target.value;
                        setNewAddrDistrict(d);
                        setNewAddrWard((HCM_DISTRICTS[d] || [])[0] || "");
                      }}
                      className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      {DISTRICT_NAMES.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select value={newAddrWard} onChange={(e) => setNewAddrWard(e.target.value)} className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white">
                      {(HCM_DISTRICTS[newAddrDistrict] || []).map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                  <input value={newAddrDetail} onChange={(e) => setNewAddrDetail(e.target.value)} placeholder="Số nhà, tên đường..." className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs" required />
                  <button type="submit" className="w-full py-2 bg-[#0F172A] text-white rounded-xl text-xs font-semibold">
                    Lưu vào sổ địa chỉ
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <h2 className="font-bold text-sm flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-[#FF5722]" /> Tài khoản ngân hàng nhận COD
                </h2>
                {bankAccounts.length === 0 ? (
                  <div className="text-xs text-slate-400">Chưa có tài khoản ngân hàng nào.</div>
                ) : (
                  <div className="space-y-2">
                    {bankAccounts.map((acc) => {
                      const bank = banks.find((b) => b.maNganHangDm === acc.maNganHangDm);
                      return (
                        <div key={acc.maTkNganHang} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-[#0F172A]">{bank ? bank.tenVietTat : acc.maNganHangDm} · {acc.soTaiKhoan}</div>
                            <div className="text-slate-500">{acc.tenChuTaiKhoan}</div>
                          </div>
                          <button type="button" onClick={() => handleDeleteBank(acc.maTkNganHang)} className="p-1 text-slate-400 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <form onSubmit={handleAddBank} className="pt-2 border-t border-slate-100 space-y-2">
                  <select value={newBankId} onChange={(e) => setNewBankId(e.target.value)} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white">
                    {banks.map((b) => <option key={b.maNganHangDm} value={b.maNganHangDm}>{b.tenVietTat} - {b.tenNganHang}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={newBankAcc} onChange={(e) => setNewBankAcc(e.target.value)} placeholder="Số tài khoản" className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs" required />
                    <input value={newBankOwner} onChange={(e) => setNewBankOwner(e.target.value)} placeholder="Tên chủ TK" className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs" required />
                  </div>
                  <button type="submit" className="w-full py-2 bg-[#0F172A] text-white rounded-xl text-xs font-semibold">
                    Thêm tài khoản nhận COD
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

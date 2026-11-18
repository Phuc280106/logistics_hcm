"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Search,
  PackagePlus,
  MapPin,
  LogOut,
  CheckCircle2,
  AlertCircle,
  BookUser,
  Trash2,
  Landmark,
  UserCheck,
  Star,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { apiFetch, formatVnd, UserSession } from "@/lib/api";
import { DISTRICT_NAMES, HCM_DISTRICTS } from "@/lib/hcmLocations";
import { isValidPhone, sanitizePhoneInput } from "@/lib/validation";

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

interface MyOrderItem {
  maVanDon: string;
  nguoiNhanTen: string;
  quanHuyenGiao: string;
  tongCuoc: number;
  tienCod: number;
  trangThai: string;
  ngayTao?: string;
}

interface PodDetail {
  maPod: string;
  anhChupGoiHang: string;
  toaDoGps?: string;
  thoiGianChup?: string;
  chuKyDienTu?: string;
  tenNguoiKy?: string;
}

export default function CustomerPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [tab, setTab] = useState<"create" | "track" | "address" | "profile">("create");

  // UC 3.1 Create Order fields
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("Quận 1");
  const [ward, setWard] = useState(HCM_DISTRICTS["Quận 1"][0]);
  const [service, setService] = useState("GDV_TIEUCHUAN");
  const [weight, setWeight] = useState<number>(1);
  const [chieuDai, setChieuDai] = useState<number>(20);
  const [chieuRong, setChieuRong] = useState<number>(15);
  const [chieuCao, setChieuCao] = useState<number>(10);
  const [fragile, setFragile] = useState(false);
  const [cod, setCod] = useState<number>(0);
  const [nguoiTraCuoc, setNguoiTraCuoc] = useState<"NguoiGui" | "NguoiNhan">("NguoiGui");
  const [hinhThucThanhToan, setHinhThucThanhToan] = useState<"TienMat" | "VietQR">("TienMat");
  const [createdOrder, setCreatedOrder] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [noticeMsg, setNoticeMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // UC 3.4 Track & My Orders
  const [myOrders, setMyOrders] = useState<MyOrderItem[]>([]);
  const [trackCode, setTrackCode] = useState("");
  const [trackInfo, setTrackInfo] = useState<{
    maVanDon: string;
    trangThai: string;
    nguoiNhanTen: string;
    hanhTrinh: { thoiGian: string; trangThaiGhiNhan: string; moTaChiTiet: string }[];
    pod?: PodDetail | null;
  } | null>(null);

  // UC 2.3 & UC 2.4 Address Book & Bank Accounts
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

  // UC 2.2 Profile state
  const [profName, setProfName] = useState("");
  const [profEmail, setProfEmail] = useState("");
  const [profShop, setProfShop] = useState("");
  const [profType, setProfType] = useState("CaNhan");
  const [isShadow, setIsShadow] = useState(false);

  async function loadCustomerData(maKh: string) {
    try {
      const [addrRes, accRes, bankRes, ordersRes, profRes] = await Promise.all([
        apiFetch<SoDiaChiItem[]>(`/khach-hang/${maKh}/dia-chi`).catch(() => []),
        apiFetch<TaiKhoanNganHangItem[]>(`/khach-hang/${maKh}/ngan-hang`).catch(() => []),
        apiFetch<NganHangItem[]>(`/danh-muc/ngan-hang`).catch(() => []),
        apiFetch<MyOrderItem[]>(`/don-hang/khach-hang/${maKh}`).catch(() => []),
        apiFetch<{
          hoTen: string;
          email: string;
          tenShop: string;
          loaiKhachHang: string;
          laTaiKhoanNgam: boolean;
        }>(`/khach-hang/${maKh}/ho-so`).catch(() => null),
      ]);
      setAddresses(addrRes);
      setBankAccounts(accRes);
      setBanks(bankRes);
      setMyOrders(ordersRes);
      if (bankRes.length > 0 && !bankRes.some((b) => b.maNganHangDm === newBankId)) {
        setNewBankId(bankRes[0].maNganHangDm);
      }
      if (profRes) {
        setProfName(profRes.hoTen || "");
        setProfEmail(profRes.email || "");
        setProfShop(profRes.tenShop || "");
        setProfType(profRes.loaiKhachHang || "CaNhan");
        setIsShadow(Boolean(profRes.laTaiKhoanNgam));
      }
    } catch {
      // ignore offline
    }
  }

  useEffect(() => {
    const raw = localStorage.getItem("fastpost_user");
    if (!raw) { router.push("/"); return; }
    const u: UserSession = JSON.parse(raw);
    setUser(u);
    setProfName(u.hoTen || "");
    if (u.maNguoiDung) {
      loadCustomerData(u.maNguoiDung);
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

  function handleDistrictChange(newDistrict: string) {
    setDistrict(newDistrict);
    const wards = HCM_DISTRICTS[newDistrict] || [];
    setWard(wards[0] || "");
  }

  async function handleCreateOnline(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setCreatedOrder(null);
    if (!isValidPhone(receiverPhone)) {
      setErrorMsg("SĐT người nhận không hợp lệ (bắt buộc 10–11 chữ số, bắt đầu bằng 0).");
      return;
    }
    if (weight <= 0) {
      setErrorMsg("Trọng lượng hàng hóa phải lớn hơn 0 kg.");
      return;
    }
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
          chieuDai: chieuDai || 0,
          chieuRong: chieuRong || 0,
          chieuCao: chieuCao || 0,
          laHangDeVo: fragile,
          tienCod: cod || 0,
          nguoiTraCuoc,
          hinhThucThanhToan,
          taiQuay: false,
        }),
      });
      setCreatedOrder(res.maVanDon);
      setReceiverName("");
      setReceiverPhone("");
      setAddress("");
      setCod(0);
      if (user?.maNguoiDung) await loadCustomerData(user.maNguoiDung);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể kết nối máy chủ để đặt đơn");
    } finally {
      setLoading(false);
    }
  }

  async function fetchTrackCode(code: string) {
    setErrorMsg("");
    setTrackInfo(null);
    try {
      const res = await apiFetch<{
        donHang: { maVanDon: string; trangThai: string; nguoiNhanTen: string };
        hanhTrinh: { thoiGian: string; trangThaiGhiNhan: string; moTaChiTiet: string }[];
        pod?: PodDetail | null;
      }>(`/don-hang/${code.trim()}`);
      setTrackInfo({
        maVanDon: res.donHang.maVanDon,
        trangThai: res.donHang.trangThai,
        nguoiNhanTen: res.donHang.nguoiNhanTen,
        hanhTrinh: res.hanhTrinh,
        pod: res.pod || null,
      });
    } catch {
      setErrorMsg(`Không tìm thấy vận đơn "${code.trim()}" hoặc chưa kết nối Backend.`);
    }
  }

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!trackCode.trim()) return;
    await fetchTrackCode(trackCode.trim());
  }

  async function handleCancelOrder(maVanDon: string) {
    setErrorMsg("");
    try {
      await apiFetch(`/don-hang/${maVanDon}/huy`, {
        method: "POST",
        body: JSON.stringify({ lyDo: "Khách hàng hủy trực tuyến trên App" }),
      });
      setNoticeMsg(`Đã hủy đơn hàng #${maVanDon}`);
      if (user?.maNguoiDung) await loadCustomerData(user.maNguoiDung);
      if (trackInfo?.maVanDon === maVanDon) await fetchTrackCode(maVanDon);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể hủy đơn");
    }
  }

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.maNguoiDung) return;
    setErrorMsg("");
    if (!isValidPhone(newAddrPhone)) {
      setErrorMsg("Số điện thoại địa chỉ không hợp lệ (bắt buộc 10–11 chữ số, bắt đầu bằng 0).");
      return;
    }
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
      await loadCustomerData(user.maNguoiDung);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể thêm địa chỉ");
    }
  }

  async function handleSetDefaultAddress(maDiaChi: string) {
    if (!user?.maNguoiDung) return;
    try {
      const updated = await apiFetch<SoDiaChiItem[]>(`/khach-hang/${user.maNguoiDung}/dia-chi/${maDiaChi}/mac-dinh`, {
        method: "PUT",
      });
      setAddresses(updated);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể đặt địa chỉ mặc định");
    }
  }

  async function handleDeleteAddress(maDiaChi: string) {
    if (!user?.maNguoiDung) return;
    try {
      await apiFetch(`/khach-hang/dia-chi/${maDiaChi}`, { method: "DELETE" });
      await loadCustomerData(user.maNguoiDung);
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
      await loadCustomerData(user.maNguoiDung);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể thêm tài khoản ngân hàng");
    }
  }

  async function handleSetDefaultBank(maTkNganHang: string) {
    if (!user?.maNguoiDung) return;
    try {
      const updated = await apiFetch<TaiKhoanNganHangItem[]>(`/khach-hang/${user.maNguoiDung}/ngan-hang/${maTkNganHang}/mac-dinh`, {
        method: "PUT",
      });
      setBankAccounts(updated);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể đặt TK mặc định");
    }
  }

  async function handleDeleteBank(maTkNganHang: string) {
    if (!user?.maNguoiDung) return;
    try {
      await apiFetch(`/khach-hang/ngan-hang/${maTkNganHang}`, { method: "DELETE" });
      await loadCustomerData(user.maNguoiDung);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể xóa tài khoản ngân hàng");
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.maNguoiDung) return;
    setErrorMsg("");
    setNoticeMsg("");
    try {
      const updated = await apiFetch<{ hoTen: string; laTaiKhoanNgam: boolean }>(`/khach-hang/${user.maNguoiDung}/ho-so`, {
        method: "PUT",
        body: JSON.stringify({
          hoTen: profName,
          email: profEmail,
          tenShop: profShop,
          loaiKhachHang: profType,
        }),
      });
      const nextSession = { ...user, hoTen: updated.hoTen };
      setUser(nextSession);
      setIsShadow(Boolean(updated.laTaiKhoanNgam));
      localStorage.setItem("fastpost_user", JSON.stringify(nextSession));
      setNoticeMsg("Đã cập nhật hồ sơ khách hàng thành công!");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi cập nhật hồ sơ");
    }
  }

  const [estTotal, setEstTotal] = useState<number>(20000);

  useEffect(() => {
    const timer = setTimeout(() => {
      apiFetch<{ tongCuoc: number }>("/don-hang/tinh-cuoc", {
        method: "POST",
        body: JSON.stringify({
          maGoiDichVu: service,
          trongLuongThuc: weight || 0.5,
          chieuDai: chieuDai || 0,
          chieuRong: chieuRong || 0,
          chieuCao: chieuCao || 0,
          laHangDeVo: fragile,
          tienCod: cod || 0,
        }),
      })
        .then((res) => setEstTotal(Number(res.tongCuoc || 0)))
        .catch(() => {
          const vol = ((chieuDai || 0) * (chieuRong || 0) * (chieuCao || 0)) / 6000;
          const cw = Math.max(weight || 0, vol);
          const baseFee = service === "GDV_HOATOC" ? 35000 : 20000;
          const weightFee = Math.max(0, cw - 1) * (service === "GDV_HOATOC" ? 15000 : 10000);
          const fragFee = fragile ? 3000 : 0;
          setEstTotal(baseFee + Math.round(weightFee) + fragFee);
        });
    }, 200);
    return () => clearTimeout(timer);
  }, [service, weight, chieuDai, chieuRong, chieuCao, fragile, cod]);

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
              <div className="text-[11px] text-slate-400">{user?.hoTen || "Khách hàng"} · {user?.soDienThoai}</div>
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
          <div className="grid grid-cols-4 bg-slate-200/80 p-1 rounded-xl text-[11px] font-semibold">
            <button
              onClick={() => { setTab("create"); setErrorMsg(""); setNoticeMsg(""); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1 ${tab === "create" ? "bg-[#FF5722] text-white" : "text-slate-600"}`}
            >
              <PackagePlus className="w-3.5 h-3.5" /> Đặt đơn
            </button>
            <button
              onClick={() => { setTab("track"); setErrorMsg(""); setNoticeMsg(""); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1 ${tab === "track" ? "bg-[#FF5722] text-white" : "text-slate-600"}`}
            >
              <Search className="w-3.5 h-3.5" /> Đơn ({myOrders.length})
            </button>
            <button
              onClick={() => { setTab("address"); setErrorMsg(""); setNoticeMsg(""); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1 ${tab === "address" ? "bg-[#FF5722] text-white" : "text-slate-600"}`}
            >
              <BookUser className="w-3.5 h-3.5" /> Sổ ĐC
            </button>
            <button
              onClick={() => { setTab("profile"); setErrorMsg(""); setNoticeMsg(""); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1 ${tab === "profile" ? "bg-[#FF5722] text-white" : "text-slate-600"}`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Hồ sơ
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
            </div>
          )}
          {noticeMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {noticeMsg}
            </div>
          )}

          {tab === "create" && (
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
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="0[0-9]{9,10}"
                  maxLength={11}
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(sanitizePhoneInput(e.target.value))}
                  placeholder="09xxxxxxxx"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  required
                />
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
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gói dịch vụ</label>
                  <select value={service} onChange={(e) => setService(e.target.value)} className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs">
                    <option value="GDV_TIEUCHUAN">Giao tiêu chuẩn</option>
                    <option value="GDV_HOATOC">FastPost Hỏa Tốc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Khối lượng (kg)</label>
                  <input type="number" min={0.1} step="0.1" value={weight || ""} onChange={(e) => setWeight(Number(e.target.value || 0))} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Dài (cm)</label>
                  <input type="number" min={0} value={chieuDai || ""} onChange={(e) => setChieuDai(Number(e.target.value || 0))} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Rộng (cm)</label>
                  <input type="number" min={0} value={chieuRong || ""} onChange={(e) => setChieuRong(Number(e.target.value || 0))} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Cao (cm)</label>
                  <input type="number" min={0} value={chieuCao || ""} onChange={(e) => setChieuCao(Number(e.target.value || 0))} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5 items-center">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 cursor-pointer">
                  <input type="checkbox" checked={fragile} onChange={(e) => setFragile(e.target.checked)} className="accent-[#FF5722]" />
                  Hàng dễ vỡ (+3.000đ)
                </label>
                <div>
                  <input type="number" min={0} step={1000} value={cod || ""} placeholder="Tiền COD (đ)" onChange={(e) => setCod(Number(e.target.value || 0))} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Người trả cước</label>
                  <select value={nguoiTraCuoc} onChange={(e) => setNguoiTraCuoc(e.target.value as "NguoiGui" | "NguoiNhan")} className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs">
                    <option value="NguoiGui">Người gửi trả</option>
                    <option value="NguoiNhan">Người nhận trả</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Phương thức TT</label>
                  <select value={hinhThucThanhToan} onChange={(e) => setHinhThucThanhToan(e.target.value as "TienMat" | "VietQR")} className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs">
                    <option value="TienMat">Tiền mặt</option>
                    <option value="VietQR">Chuyển khoản VietQR</option>
                  </select>
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
          )}

          {tab === "track" && (
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

              {trackInfo && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold">#{trackInfo.maVanDon}</div>
                    <span className="px-2.5 py-1 rounded-full bg-orange-50 text-[#FF5722] text-xs font-semibold">
                      {trackInfo.trangThai}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">Người nhận: {trackInfo.nguoiNhanTen}</div>
                  {trackInfo.pod && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
                      <div className="font-semibold text-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Bằng chứng POD đã xác thực
                      </div>
                      <div className="text-emerald-700">Người ký: <strong>{trackInfo.pod.tenNguoiKy}</strong> · GPS: {trackInfo.pod.toaDoGps}</div>
                      {trackInfo.pod.chuKyDienTu && trackInfo.pod.chuKyDienTu.startsWith("data:image/") && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={trackInfo.pod.chuKyDienTu} alt="Chữ ký điện tử" className="h-16 bg-white rounded border border-emerald-200 p-1" />
                      )}
                    </div>
                  )}
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
              )}

              {/* UC 3.4 step 6: Đơn hàng của tôi */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5">
                <h3 className="font-bold text-sm">Đơn hàng của tôi ({myOrders.length})</h3>
                {myOrders.length === 0 ? (
                  <div className="text-xs text-slate-400 py-2">Chưa có đơn hàng nào thuộc tài khoản này.</div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {myOrders.map((o) => {
                      const canCancel = ["MoiTao", "ChoPhanCongLay", "DaPhanCongLay"].includes(o.trangThai);
                      return (
                        <div key={o.maVanDon} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => { setTrackCode(o.maVanDon); fetchTrackCode(o.maVanDon); }}
                            className="text-left flex-1"
                          >
                            <div className="font-bold text-[#0F172A]">#{o.maVanDon} · {o.nguoiNhanTen}</div>
                            <div className="text-slate-500">Cước: {formatVnd(o.tongCuoc)} · COD: {formatVnd(o.tienCod)}</div>
                          </button>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[#FF5722] font-semibold text-[11px]">
                              {o.trangThai}
                            </span>
                            {canCancel && (
                              <button
                                type="button"
                                onClick={() => handleCancelOrder(o.maVanDon)}
                                title="Hủy đơn"
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
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
                          <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                            {a.tenNguoiNhan} · {a.soDienThoai}
                            {a.laMacDinh && <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px]">Mặc định</span>}
                          </div>
                          <div className="text-slate-600">{a.diaChiChiTiet}, {a.phuongXa}, {a.quanHuyen}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!a.laMacDinh && (
                            <button type="button" onClick={() => handleSetDefaultAddress(a.maDiaChi)} title="Đặt mặc định" className="p-1 text-amber-500 hover:bg-amber-50 rounded">
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
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
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="0[0-9]{9,10}"
                      maxLength={11}
                      value={newAddrPhone}
                      onChange={(e) => setNewAddrPhone(sanitizePhoneInput(e.target.value))}
                      placeholder="Số điện thoại (09xxxxxxxx)"
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                      required
                    />
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
                            <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                              {bank ? bank.tenVietTat : acc.maNganHangDm} · {acc.soTaiKhoan}
                              {acc.laMacDinhCod && <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px]">Mặc định COD</span>}
                            </div>
                            <div className="text-slate-500">{acc.tenChuTaiKhoan}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            {!acc.laMacDinhCod && (
                              <button type="button" onClick={() => handleSetDefaultBank(acc.maTkNganHang)} title="Đặt mặc định nhận COD" className="p-1 text-amber-500 hover:bg-amber-50 rounded">
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button type="button" onClick={() => handleDeleteBank(acc.maTkNganHang)} className="p-1 text-slate-400 hover:text-red-600">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

          {/* UC 2.2: Hồ sơ cá nhân / Shop */}
          {tab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base">Hồ sơ định danh Khách hàng</h2>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${isShadow ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {isShadow ? "Tài khoản ngầm" : "Đã kích hoạt"}
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Số điện thoại định danh</label>
                <input value={user?.soDienThoai || ""} disabled className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Họ và tên *</label>
                <input value={profName} onChange={(e) => setProfName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Loại khách hàng</label>
                  <select value={profType} onChange={(e) => setProfType(e.target.value)} className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs">
                    <option value="CaNhan">Cá nhân</option>
                    <option value="Shop">Chủ Shop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tên Shop (nếu có)</label>
                  <input value={profShop} onChange={(e) => setProfShop(e.target.value)} placeholder="VD: Thời trang Minh Đức" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email nhận bảng kê COD</label>
                <input type="email" value={profEmail} onChange={(e) => setProfEmail(e.target.value)} placeholder="shop@example.com" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#FF5722] text-white font-semibold rounded-xl text-sm">
                Lưu cập nhật hồ sơ
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

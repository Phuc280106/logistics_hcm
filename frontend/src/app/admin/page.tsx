"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Warehouse,
  Wallet,
  BarChart3,
  ScanBarcode,
  AlertTriangle,
  LogOut,
  CheckCircle2,
  Truck,
  MapPin,
  RotateCcw,
  PackageCheck,
  AlertCircle,
  Database,
} from "lucide-react";
import { apiFetch, formatVnd, UserSession } from "@/lib/api";
import { DISTRICT_NAMES, HCM_DISTRICTS } from "@/lib/hcmLocations";

interface ManifestItem {
  maManifest: string;
  maBuuCucDi: string;
  maBuuCucDen: string;
  tongSoKien: number;
  trangThai: string;
}

interface ChiTietManifestItem {
  maManifest: string;
  maVanDon: string;
  daQuetNhap: boolean;
}

interface BienBanItem {
  maBienBan: string;
  maVanDon: string;
  loaiBatThuong: string;
  moTa: string;
  phuongAnXuLy?: string;
  trangThaiDuyet: string;
}

interface PhieuXuatItem {
  maPhieuXuat: string;
  maBuuCuc: string;
  maShipper: string;
  tongSoDon: number;
  tongTienCodPhaiThu: number;
  shipperDaXacNhan: boolean;
}

interface TieuTuyenItem {
  maTieuTuyen: string;
  maTuyen: string;
  maShipper: string;
  tenTieuTuyen: string;
}

interface PhieuDoiSoatItem {
  maDoiSoat: string;
  maShipper: string;
  tongDonThanhCong: number;
  tongPhaiNop: number;
  soTienThucNop: number;
  soTienThieu: number;
  trangThai: string;
}

interface KpiItem {
  maKpi: string;
  maShipper: string;
  kyDanhGia: string;
  tyLeGiaoThanhCong: number;
  tyLeDungHenSla: number;
  sanLuongDonBinhQuan: number;
  xepLoai: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [section, setSection] = useState<"warehouse" | "dispatch" | "finance" | "sla" | "catalog">("warehouse");
  const [notice, setNotice] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Master Data (Nhóm 3)
  const [vungTuyenList, setVungTuyenList] = useState<{ maVungTuyen: string; tenVungTuyen: string; moTa?: string }[]>([]);
  const [goiDichVuList, setGoiDichVuList] = useState<{ maGoiDichVu: string; tenGoiDichVu: string; moTa?: string }[]>([]);
  const [loaiHangList, setLoaiHangList] = useState<{ maLoaiHang: string; tenLoaiHang: string; moTa?: string }[]>([]);
  const [nganHangList, setNganHangList] = useState<{ maNganHangDm: string; tenNganHang: string; tenVietTat: string }[]>([]);
  const [tuyenList, setTuyenList] = useState<{ maTuyen: string; maBuuCuc: string; tenTuyen: string; loaiTuyen: string }[]>([]);
  const [khachHangList, setKhachHangList] = useState<{ maNguoiDung: string; tenShop?: string; loaiKhachHang: string; laTaiKhoanNgam: boolean }[]>([]);
  const [newBcId, setNewBcId] = useState("");
  const [newBcName, setNewBcName] = useState("");
  const [newBcAddr, setNewBcAddr] = useState("");
  const [newBcType, setNewBcType] = useState("BuuCuc");
  const [newGdvId, setNewGdvId] = useState("");
  const [newGdvName, setNewGdvName] = useState("");

  // 1. Warehouse & Manifest state
  const [buuCucList, setBuuCucList] = useState<{ maBuuCuc: string; tenBuuCuc: string; loaiKho: string }[]>([]);
  const [khoDi, setKhoDi] = useState("KHO_Q1");
  const [khoDen, setKhoDen] = useState("BC_BENNGHE");
  const [donChoKho, setDonChoKho] = useState<{ maVanDon: string; nguoiNhanTen: string; quanHuyenGiao: string; phuongXaGiao: string }[]>([]);
  const [manifests, setManifests] = useState<ManifestItem[]>([]);
  const [scanCode, setScanCode] = useState("");
  const [inspectManifest, setInspectManifest] = useState<string | null>(null);
  const [inspectItems, setInspectItems] = useState<ChiTietManifestItem[]>([]);

  // Incident state
  const [incidentTab, setIncidentTab] = useState<"create" | "list">("create");
  const [incidentCode, setIncidentCode] = useState("");
  const [incidentType, setIncidentType] = useState<"Rach" | "Vo">("Rach");
  const [incidentDesc, setIncidentDesc] = useState("");
  const [incidents, setIncidents] = useState<BienBanItem[]>([]);

  // 2. Dispatch (Xuất kho, Tuyến, Chuyển hoàn)
  const [phieuXuatList, setPhieuXuatList] = useState<PhieuXuatItem[]>([]);
  const [pxShipper, setPxShipper] = useState("NV_SHIP_01");
  const [pxCodes, setPxCodes] = useState("");

  const [subRoutes, setSubRoutes] = useState<TieuTuyenItem[]>([]);
  const [ttName, setTtName] = useState("");
  const [ttShipper, setTtShipper] = useState("NV_SHIP_01");
  const [ttDistrict, setTtDistrict] = useState("Quận 1");
  const [ttWard, setTtWard] = useState(HCM_DISTRICTS["Quận 1"][0]);

  const [returnOrders, setReturnOrders] = useState<{ maVanDon: string; nguoiNhanTen: string; soLanGiaoThatBai: number; trangThai: string }[]>([]);

  // 3. Finance & SLA
  const [financeTab, setFinanceTab] = useState<"shipper" | "shop" | "pricing">("shipper");
  const [slips, setSlips] = useState<PhieuDoiSoatItem[]>([]);
  const [actualCash, setActualCash] = useState<Record<string, number>>({});
  const [kyList, setKyList] = useState<{ maKy: string; loaiKyThanhToan: string; trangThai: string }[]>([]);
  const [bangKeList, setBangKeList] = useState<{ maBangKe: string; maKhachHang: string; tongCod: number; tongCuocTru: number; thucTra: number; trangThaiThanhToan: string }[]>([]);
  const [thamSoList, setThamSoList] = useState<{ maThamSo: string; tenThamSo: string; giaTri: string }[]>([]);
  const [chiTietGia, setChiTietGia] = useState<{ maBangGia: string; maVungTuyen: string; maGoiDichVu: string; cuocSan: number; donGiaVuotMoiKg: number; phuPhiDeVo: number; tyLePhiCod: number }[]>([]);
  const [baoCaoList, setBaoCaoList] = useState<{ maBaoCao: string; maBuuCuc: string; doanhThuCuoc: number; tienCodTrungChuyen: number; tongSanLuongDon: number; tyLeTienMat: number; tyLeVietQr: number }[]>([]);
  const [kpiList, setKpiList] = useState<KpiItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("fastpost_user");
    if (!raw) { router.push("/"); return; }
    setUser(JSON.parse(raw));

    apiFetch<ManifestItem[]>("/manifest").then(setManifests).catch(() => setErrorMsg("Chưa kết nối Backend để tải dữ liệu thực."));
    apiFetch<{ maBuuCuc: string; tenBuuCuc: string; loaiKho: string }[]>("/kho/buu-cuc").then((bcs) => {
      setBuuCucList(bcs);
      if (bcs.length >= 2) {
        setKhoDi(bcs[0].maBuuCuc);
        setKhoDen(bcs[1].maBuuCuc);
      }
    }).catch(() => {});
    apiFetch<BienBanItem[]>("/manifest/bien-ban-bat-thuong").then(setIncidents).catch(() => {});
    apiFetch<PhieuXuatItem[]>("/kho/phieu-xuat").then(setPhieuXuatList).catch(() => {});
    apiFetch<{ tieuTuyenList: TieuTuyenItem[] }>("/kho/tuyen").then((d) => setSubRoutes(d.tieuTuyenList || [])).catch(() => {});
    apiFetch<{ maVanDon: string; nguoiNhanTen: string; soLanGiaoThatBai: number; trangThai: string }[]>("/don-hang?status=ChoChuyenHoan").then(setReturnOrders).catch(() => {});
    apiFetch<PhieuDoiSoatItem[]>("/doi-soat/shipper").then(setSlips).catch(() => {});
    apiFetch<{ maKy: string; loaiKyThanhToan: string; trangThai: string }[]>("/tai-chinh/ky-quyet-toan").then((kys) => {
      setKyList(kys);
      if (kys.length > 0) {
        apiFetch<typeof bangKeList>(`/tai-chinh/ky-quyet-toan/${kys[0].maKy}/bang-ke`).then(setBangKeList).catch(() => {});
      }
    }).catch(() => {});
    apiFetch<{ maThamSo: string; tenThamSo: string; giaTri: string }[]>("/tai-chinh/tham-so").then(setThamSoList).catch(() => {});
    apiFetch<{ chiTiet: typeof chiTietGia }>("/tai-chinh/bang-gia").then((d) => setChiTietGia(d.chiTiet || [])).catch(() => {});
    apiFetch<typeof baoCaoList>("/tai-chinh/bao-cao-doanh-thu").then(setBaoCaoList).catch(() => {});
    apiFetch<{ kpiList: KpiItem[] }>("/doi-soat/bao-cao-sla").then((d) => setKpiList(d.kpiList || [])).catch(() => {});
    apiFetch<typeof vungTuyenList>("/danh-muc/vung-tuyen").then(setVungTuyenList).catch(() => {});
    apiFetch<typeof goiDichVuList>("/danh-muc/goi-dich-vu").then(setGoiDichVuList).catch(() => {});
    apiFetch<typeof loaiHangList>("/danh-muc/loai-hang-hoa").then(setLoaiHangList).catch(() => {});
    apiFetch<typeof nganHangList>("/danh-muc/ngan-hang").then(setNganHangList).catch(() => {});
    apiFetch<typeof tuyenList>("/danh-muc/tuyen-giao-hang").then(setTuyenList).catch(() => {});
    apiFetch<typeof khachHangList>("/khach-hang").then(setKhachHangList).catch(() => {});
  }, [router]);

  useEffect(() => {
    if (!khoDi) return;
    apiFetch<{ maVanDon: string; nguoiNhanTen: string; quanHuyenGiao: string; phuongXaGiao: string }[]>(
      `/kho/don-cho-luan-chuyen?maBuuCuc=${khoDi}`
    )
      .then(setDonChoKho)
      .catch(() => setDonChoKho([]));
  }, [khoDi]);

  function handleDistrictChange(newDistrict: string) {
    setTtDistrict(newDistrict);
    const wards = HCM_DISTRICTS[newDistrict] || [];
    setTtWard(wards[0] || "");
  }

  async function handleCreateManifest() {
    setErrorMsg("");
    try {
      const m = await apiFetch<ManifestItem>("/manifest", {
        method: "POST",
        body: JSON.stringify({ maBuuCucDi: khoDi, maBuuCucDen: khoDen, maNhanVienLap: user?.maNhanVien || "NV_ADMIN_01" }),
      });
      setManifests((prev) => [m, ...prev]);
      setNotice(`Đã tạo Manifest mới: ${m.maManifest} (${khoDi} → ${khoDen})`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi tạo Manifest");
    }
  }

  async function handleScanToManifest(maManifest: string, overrideCode?: string) {
    const code = (overrideCode ?? scanCode).trim();
    if (!code) return;
    setErrorMsg("");
    try {
      const updated = await apiFetch<ManifestItem>(`/manifest/${maManifest}/quet-gom-don`, {
        method: "POST",
        body: JSON.stringify({ maVanDon: code }),
      });
      setManifests((prev) => prev.map((m) => (m.maManifest === maManifest ? updated : m)));
      setDonChoKho((prev) => prev.filter((d) => d.maVanDon !== code));
      setNotice(`Đã quét gom đơn ${code} vào ${maManifest}`);
      if (!overrideCode) setScanCode("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi quét gom đơn");
    }
  }

  async function handleManifestTransition(maManifest: string, action: string) {
    setErrorMsg("");
    try {
      const updated = await apiFetch<ManifestItem>(`/manifest/${maManifest}/chuyen-trang-thai?action=${action}`, {
        method: "POST",
      });
      setManifests((prev) => prev.map((m) => (m.maManifest === maManifest ? updated : m)));
      if (action === "batDauKiemNhan") openInspectModal(maManifest);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi chuyển trạng thái Manifest");
    }
  }

  async function openInspectModal(maManifest: string) {
    setInspectManifest(maManifest);
    try {
      const res = await apiFetch<{ chiTiet: ChiTietManifestItem[] }>(`/manifest/${maManifest}`);
      setInspectItems(res.chiTiet || []);
    } catch {}
  }

  async function handleScanInspectItem(maVanDon: string) {
    if (!inspectManifest) return;
    try {
      await apiFetch(`/manifest/${inspectManifest}/quet-kien`, {
        method: "POST",
        body: JSON.stringify({ maVanDon }),
      });
      setInspectItems((prev) => prev.map((i) => (i.maVanDon === maVanDon ? { ...i, daQuetNhap: true } : i)));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi quét kiện");
    }
  }

  async function handleCompleteReceiving() {
    if (!inspectManifest) return;
    try {
      const updated = await apiFetch<ManifestItem>(`/manifest/${inspectManifest}/kiem-nhan-hoan-tat`, {
        method: "POST",
      });
      setManifests((prev) => prev.map((m) => (m.maManifest === inspectManifest ? updated : m)));
      setNotice(`Đã hoàn tất kiểm nhận ${inspectManifest} → ${updated.trangThai}`);
      setInspectManifest(null);
      apiFetch<BienBanItem[]>("/manifest/bien-ban-bat-thuong").then(setIncidents).catch(() => {});
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi hoàn tất kiểm nhận");
    }
  }

  async function handleSaveIncident(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    try {
      const bb = await apiFetch<BienBanItem>("/manifest/bien-ban-bat-thuong", {
        method: "POST",
        body: JSON.stringify({
          maVanDon: incidentCode,
          loaiBatThuong: incidentType === "Rach" ? "RachBaoBi" : "VoHang",
          moTa: incidentDesc,
          maNhanVienKho: user?.maNhanVien || "NV_ADMIN_01",
        }),
      });
      setIncidents((prev) => [bb, ...prev]);
      setNotice(`Đã lưu biên bản bất thường cho đơn #${incidentCode}`);
      setIncidentCode("");
      setIncidentDesc("");
      setIncidentTab("list");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi lưu biên bản bất thường");
    }
  }

  async function handleApproveIncident(maBienBan: string, phuongAnXuLy: string) {
    try {
      const updated = await apiFetch<BienBanItem>(`/manifest/bien-ban-bat-thuong/${maBienBan}/duyet`, {
        method: "POST",
        body: JSON.stringify({ maQuanLyDuyet: user?.maNhanVien || "NV_ADMIN_01", phuongAnXuLy }),
      });
      setIncidents((prev) => prev.map((b) => (b.maBienBan === maBienBan ? updated : b)));
      setNotice(`Đã duyệt biên bản ${maBienBan} (${phuongAnXuLy})`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi duyệt biên bản");
    }
  }

  async function handleCreatePhieuXuat(e: React.FormEvent) {
    e.preventDefault();
    const codes = pxCodes.split(",").map((s) => s.trim()).filter(Boolean);
    if (codes.length === 0) return;
    setErrorMsg("");
    try {
      const px = await apiFetch<PhieuXuatItem>("/kho/phieu-xuat", {
        method: "POST",
        body: JSON.stringify({
          maBuuCuc: "BC_BENNGHE",
          maNhanVienKho: user?.maNhanVien || "NV_ADMIN_01",
          maShipper: pxShipper,
          dsMaVanDon: codes,
          ghiChu: "Xuất kho giao ca",
        }),
      });
      setPhieuXuatList((prev) => [px, ...prev]);
      setNotice(`Đã tạo phiếu xuất kho ${px.maPhieuXuat} cho ${pxShipper}`);
      setPxCodes("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi tạo phiếu xuất kho");
    }
  }

  async function handleCreateSubRoute(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    try {
      const res = await apiFetch<{ tieuTuyen: TieuTuyenItem }>("/kho/tieu-tuyen", {
        method: "POST",
        body: JSON.stringify({
          maTuyen: "TUYEN_Q1",
          tenTieuTuyen: ttName || `Tiểu tuyến ${ttWard}`,
          maShipper: ttShipper,
          quanHuyen: ttDistrict,
          phuongXa: ttWard,
        }),
      });
      setSubRoutes((prev) => [...prev, res.tieuTuyen]);
      setTtName("");
      setNotice(`Đã thêm tiểu tuyến (${ttWard}, ${ttDistrict}) cho ${ttShipper}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi thêm tiểu tuyến");
    }
  }

  async function handleConfirmReturn(maVanDon: string) {
    try {
      await apiFetch(`/don-hang/${maVanDon}/xac-nhan-hoan`, { method: "POST" });
      setReturnOrders((prev) => prev.map((o) => (o.maVanDon === maVanDon ? { ...o, trangThai: "DaChuyenHoan" } : o)));
      setNotice(`Đã xác nhận chuyển hoàn đơn #${maVanDon} về cho người gửi`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi xác nhận chuyển hoàn");
    }
  }

  async function handleReconcile(slip: PhieuDoiSoatItem) {
    const val = actualCash[slip.maDoiSoat] ?? slip.tongPhaiNop;
    try {
      const updated = await apiFetch<PhieuDoiSoatItem>(`/doi-soat/shipper/${slip.maDoiSoat}/doi-soat`, {
        method: "POST",
        body: JSON.stringify({ soTienThucNop: val }),
      });
      setSlips((prev) => prev.map((s) => (s.maDoiSoat === slip.maDoiSoat ? updated : s)));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi khớp lệnh đối soát");
    }
  }

  const ttWards = HCM_DISTRICTS[ttDistrict] || [];

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col justify-between p-4 shrink-0">
        <div>
          <div className="px-2 py-3 mb-6 border-b border-slate-800">
            <div className="font-bold text-lg tracking-wide">FASTPOST</div>
            <div className="text-[11px] text-slate-400">LOGISTICS</div>
          </div>
          <div className="text-[11px] text-slate-500 font-semibold uppercase px-2 mb-2">Trung tâm vận hành</div>
          <nav className="space-y-1.5 text-sm">
            {[
              { id: "warehouse", label: "Kho & Manifest", icon: Warehouse },
              { id: "dispatch", label: "Xuất kho & Phân tuyến", icon: Truck },
              { id: "finance", label: "Tài chính & COD", icon: Wallet },
              { id: "sla", label: "Quản trị & SLA", icon: BarChart3 },
              { id: "catalog", label: "Danh mục & Bưu cục", icon: Database },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setErrorMsg(""); setSection(item.id as "warehouse" | "dispatch" | "finance" | "sla" | "catalog"); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition ${
                    section === item.id ? "bg-[#FF5722] text-white" : "text-slate-300 hover:bg-slate-800"
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
            <div className="font-semibold text-slate-200">{user?.maBuuCuc || "HCM HUB"}</div>
            <div>Quản trị vận hành</div>
          </div>
          <button
            onClick={() => { localStorage.removeItem("fastpost_user"); router.push("/"); }}
            className="flex items-center gap-2 text-slate-400 hover:text-white pt-1"
          >
            <LogOut className="w-3.5 h-3.5" /> Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div className="text-sm text-slate-500">Quản trị vận hành / <span className="text-[#0F172A] font-semibold">HCM Hub</span></div>
          <div className="text-right">
            <div className="text-sm font-semibold">{user?.hoTen || "Quản trị viên"}</div>
            <div className="text-xs text-slate-400">{user?.maNhanVien || "ADMIN"}</div>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
            </div>
          )}

          {notice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center justify-between">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {notice}</span>
              <button onClick={() => setNotice("")} className="text-xs underline">Đóng</button>
            </div>
          )}

          {section === "warehouse" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <h1 className="text-2xl font-bold">Quản lý Kho &amp; Luân chuyển Manifest</h1>
                  <p className="text-sm text-slate-500">Chọn tuyến kho gửi → kho nhận, quét gom đơn và kiểm nhận chi tiết từng kiện tại kho đích.</p>
                </div>

                {/* Chọn Kho đi -> Kho đến & Tạo Manifest */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Kho / Bưu cục gửi</label>
                      <select
                        value={khoDi}
                        onChange={(e) => setKhoDi(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
                      >
                        {buuCucList.length === 0 ? (
                          <option value={khoDi}>{khoDi}</option>
                        ) : (
                          buuCucList.map((b) => (
                            <option key={b.maBuuCuc} value={b.maBuuCuc}>{b.tenBuuCuc} ({b.maBuuCuc})</option>
                          ))
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Kho / Bưu cục nhận</label>
                      <select
                        value={khoDen}
                        onChange={(e) => setKhoDen(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
                      >
                        {buuCucList.length === 0 ? (
                          <option value={khoDen}>{khoDen}</option>
                        ) : (
                          buuCucList.map((b) => (
                            <option key={b.maBuuCuc} value={b.maBuuCuc}>{b.tenBuuCuc} ({b.maBuuCuc})</option>
                          ))
                        )}
                      </select>
                    </div>
                    <button
                      onClick={handleCreateManifest}
                      className="px-4 py-2.5 bg-[#FF5722] hover:bg-[#E64A19] text-white text-sm font-semibold rounded-xl"
                    >
                      + Tạo Manifest luân chuyển
                    </button>
                  </div>

                  {/* Đơn đang nằm tại kho gửi để chọn nhanh */}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                      Đơn đang lưu tại {khoDi} chờ luân chuyển ({donChoKho.length})
                    </div>
                    {donChoKho.length === 0 ? (
                      <div className="text-xs text-slate-400">Không có đơn trạng thái DaNhapKho tại {khoDi}.</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {donChoKho.map((d) => (
                          <button
                            key={d.maVanDon}
                            type="button"
                            disabled={!manifests[0] || manifests[0].trangThai !== "DangKhoiTao"}
                            onClick={() => manifests[0] && handleScanToManifest(manifests[0].maManifest, d.maVanDon)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-[#FF5722] border border-slate-200 text-xs font-medium transition disabled:opacity-50"
                            title={`Giao tới ${d.phuongXaGiao}, ${d.quanHuyenGiao}`}
                          >
                            + #{d.maVanDon} ({d.quanHuyenGiao})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Barcode Scan Box */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="text-sm font-bold mb-3 flex items-center gap-2">
                    <ScanBarcode className="w-4 h-4 text-[#FF5722]" /> Quét mã vận đơn gom vào Manifest {manifests[0] ? `(${manifests[0].maManifest})` : ""}
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={scanCode}
                      onChange={(e) => setScanCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && manifests[0] && handleScanToManifest(manifests[0].maManifest)}
                      placeholder="Quét hoặc nhập mã vận đơn..."
                      className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                    />
                    <button
                      onClick={() => manifests[0] && handleScanToManifest(manifests[0].maManifest)}
                      disabled={!manifests[0]}
                      className="px-4 py-2.5 bg-[#0F172A] text-white text-sm font-semibold rounded-xl disabled:opacity-50"
                    >
                      Gom đơn
                    </button>
                  </div>
                </div>

                {/* Manifest Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 font-bold">Danh sách Manifest trung chuyển</div>
                  {manifests.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-400">Chưa có Manifest nào. Bấm &quot;+ Tạo Manifest&quot; để bắt đầu.</div>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3">Mã Manifest</th>
                          <th className="px-4 py-3">Tuyến</th>
                          <th className="px-4 py-3">Số kiện</th>
                          <th className="px-4 py-3">Trạng thái</th>
                          <th className="px-4 py-3">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {manifests.map((m) => (
                          <tr key={m.maManifest}>
                            <td className="px-4 py-3 font-semibold">{m.maManifest}</td>
                            <td className="px-4 py-3 text-slate-600">{m.maBuuCucDi} → {m.maBuuCucDen}</td>
                            <td className="px-4 py-3">{m.tongSoKien}</td>
                            <td className="px-4 py-3">
                              <span className="px-2.5 py-1 rounded-full bg-orange-50 text-[#FF5722] text-xs font-semibold">
                                {m.trangThai}
                              </span>
                            </td>
                            <td className="px-4 py-3 space-x-2">
                              {m.trangThai === "DangKhoiTao" && (
                                <button onClick={() => handleManifestTransition(m.maManifest, "niemPhong")} className="text-xs px-2.5 py-1 bg-slate-900 text-white rounded-lg">Niêm phong</button>
                              )}
                              {m.trangThai === "DaNiemPhong" && (
                                <button onClick={() => handleManifestTransition(m.maManifest, "xuatXe")} className="text-xs px-2.5 py-1 bg-[#FF5722] text-white rounded-lg">Xuất xe</button>
                              )}
                              {m.trangThai === "DangVanChuyen" && (
                                <button onClick={() => handleManifestTransition(m.maManifest, "denKhoDich")} className="text-xs px-2.5 py-1 bg-emerald-600 text-white rounded-lg">Đến kho đích</button>
                              )}
                              {m.trangThai === "DaDenKhoDich" && (
                                <button onClick={() => handleManifestTransition(m.maManifest, "batDauKiemNhan")} className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded-lg">Cắt seal &amp; Kiểm nhận</button>
                              )}
                              {m.trangThai === "DangKiemNhan" && (
                                <button onClick={() => openInspectModal(m.maManifest)} className="text-xs px-2.5 py-1 bg-indigo-600 text-white rounded-lg">Quét kiện đến</button>
                              )}
                              {m.trangThai === "PhatSinhBatThuong" && (
                                <button onClick={() => handleManifestTransition(m.maManifest, "duyetXuLy")} className="text-xs px-2.5 py-1 bg-amber-600 text-white rounded-lg">Duyệt xử lý</button>
                              )}
                              {m.trangThai === "DaXuLyChenhLech" && (
                                <button onClick={() => handleManifestTransition(m.maManifest, "dongHoSo")} className="text-xs px-2.5 py-1 bg-emerald-700 text-white rounded-lg">Đóng hồ sơ</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Detailed Receiving Panel */}
                {inspectManifest && (
                  <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-indigo-950 flex items-center gap-2">
                        <PackageCheck className="w-5 h-5 text-indigo-600" /> Kiểm nhận chi tiết kiện hàng — {inspectManifest}
                      </h3>
                      <button onClick={() => setInspectManifest(null)} className="text-xs text-slate-500">Đóng</button>
                    </div>
                    <div className="space-y-2">
                      {inspectItems.map((item) => (
                        <div key={item.maVanDon} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-sm">
                          <span className="font-semibold">#{item.maVanDon}</span>
                          {item.daQuetNhap ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">✓ Đã quét nhận</span>
                          ) : (
                            <button
                              onClick={() => handleScanInspectItem(item.maVanDon)}
                              className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
                            >
                              Quét nhận kiện này
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleCompleteReceiving}
                      className="w-full py-2.5 bg-[#FF5722] text-white font-semibold rounded-xl text-sm"
                    >
                      Hoàn tất kiểm nhận (Tự động kiểm tra đủ/thiếu kiện)
                    </button>
                  </div>
                )}
              </div>

              {/* Incident Create & Approval Panel */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 h-fit space-y-4">
                <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setIncidentTab("create")}
                    className={`py-2 rounded-lg ${incidentTab === "create" ? "bg-[#FF5722] text-white" : "text-slate-600"}`}
                  >
                    Lập biên bản
                  </button>
                  <button
                    onClick={() => setIncidentTab("list")}
                    className={`py-2 rounded-lg ${incidentTab === "list" ? "bg-[#FF5722] text-white" : "text-slate-600"}`}
                  >
                    Duyệt xử lý ({incidents.length})
                  </button>
                </div>

                {incidentTab === "create" ? (
                  <form onSubmit={handleSaveIncident} className="space-y-3">
                    <h2 className="font-bold text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#FF5722]" /> Lập biên bản bất thường
                    </h2>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Mã vận đơn *</label>
                      <input required value={incidentCode} onChange={(e) => setIncidentCode(e.target.value)} placeholder="Nhập mã vận đơn..." className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Tình trạng hàng hóa</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setIncidentType("Rach")} className={`py-2 rounded-xl border text-sm font-medium ${incidentType === "Rach" ? "border-[#FF5722] bg-orange-50 text-[#FF5722]" : "border-slate-200"}`}>Rách</button>
                        <button type="button" onClick={() => setIncidentType("Vo")} className={`py-2 rounded-xl border text-sm font-medium ${incidentType === "Vo" ? "border-[#FF5722] bg-orange-50 text-[#FF5722]" : "border-slate-200"}`}>Vỡ</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Mô tả hiện trạng *</label>
                      <textarea required rows={3} value={incidentDesc} onChange={(e) => setIncidentDesc(e.target.value)} placeholder="Mô tả chi tiết tình trạng..." className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-[#FF5722] text-white font-semibold rounded-xl text-sm">
                      Lưu biên bản
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto">
                    {incidents.length === 0 ? (
                      <div className="text-center text-xs text-slate-400 py-6">Chưa có biên bản bất thường nào.</div>
                    ) : (
                      incidents.map((bb) => (
                        <div key={bb.maBienBan} className="p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                          <div className="flex justify-between font-bold">
                            <span>#{bb.maVanDon} ({bb.loaiBatThuong})</span>
                            <span className={bb.trangThaiDuyet === "DaDuyet" ? "text-emerald-600" : "text-amber-600"}>{bb.trangThaiDuyet}</span>
                          </div>
                          <p className="text-slate-600">{bb.moTa}</p>
                          {bb.trangThaiDuyet === "ChoXuLy" ? (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                onClick={() => handleApproveIncident(bb.maBienBan, "DongGoiLai")}
                                className="py-1.5 bg-slate-900 text-white rounded-lg font-semibold"
                              >
                                Đóng gói lại
                              </button>
                              <button
                                onClick={() => handleApproveIncident(bb.maBienBan, "BoiThuong")}
                                className="py-1.5 bg-red-600 text-white rounded-lg font-semibold"
                              >
                                Đền bù / Bồi thường
                              </button>
                            </div>
                          ) : (
                            <div className="text-emerald-700 font-medium">Phương án: {bb.phuongAnXuLy}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {section === "dispatch" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Xuất kho Shipper, Phân tuyến &amp; Chuyển hoàn</h1>
                <p className="text-sm text-slate-500">Bàn giao đơn xuất kho theo ca, cấu hình tiểu tuyến tự động theo Quận/Phường và xử lý đơn hoàn.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Xuất kho bàn giao Shipper */}
                <form onSubmit={handleCreatePhieuXuat} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#FF5722]" /> Lập Phiếu xuất kho cho Shipper
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Shipper nhận bàn giao *</label>
                      <input required value={pxShipper} onChange={(e) => setPxShipper(e.target.value)} placeholder="Mã Shipper..." className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Danh sách mã vận đơn *</label>
                      <input required value={pxCodes} onChange={(e) => setPxCodes(e.target.value)} placeholder="VD: FP-98232, FP-98233" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-[#FF5722] text-white font-semibold rounded-xl text-sm">
                    Tạo phiếu xuất kho &amp; Gán Shipper
                  </button>

                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase">Phiếu xuất kho</div>
                    {phieuXuatList.length === 0 ? (
                      <div className="text-xs text-slate-400 py-2">Chưa có phiếu xuất kho nào.</div>
                    ) : (
                      phieuXuatList.map((px) => (
                        <div key={px.maPhieuXuat} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold">{px.maPhieuXuat} · Shipper: {px.maShipper}</div>
                            <div className="text-slate-500">{px.tongSoDon} đơn · COD phải thu: {formatVnd(px.tongTienCodPhaiThu)}</div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full font-semibold ${px.shipperDaXacNhan ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {px.shipperDaXacNhan ? "Shipper đã nhận" : "Chờ Shipper xác nhận"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </form>

                {/* 2. Quản lý Tuyến & Tiểu tuyến */}
                <form onSubmit={handleCreateSubRoute} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#FF5722]" /> Quản lý Tiểu tuyến &amp; Tự động phân đơn
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Tên tiểu tuyến *</label>
                      <input required value={ttName} onChange={(e) => setTtName(e.target.value)} placeholder="VD: Tiểu tuyến Tân Định" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Mã Shipper phụ trách *</label>
                      <input required value={ttShipper} onChange={(e) => setTtShipper(e.target.value)} placeholder="VD: NV_SHIP_01" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Quận / Huyện *</label>
                      <select value={ttDistrict} onChange={(e) => handleDistrictChange(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm">
                        {DISTRICT_NAMES.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Phường / Xã *</label>
                      <select value={ttWard} onChange={(e) => setTtWard(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm">
                        {ttWards.map((w) => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-[#0F172A] text-white font-semibold rounded-xl text-sm">
                    + Thêm Tiểu tuyến địa bàn
                  </button>

                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase">Danh sách tiểu tuyến đang hoạt động</div>
                    {subRoutes.length === 0 ? (
                      <div className="text-xs text-slate-400 py-2">Chưa có tiểu tuyến nào.</div>
                    ) : (
                      subRoutes.map((tt) => (
                        <div key={tt.maTieuTuyen} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold">{tt.tenTieuTuyen} ({tt.maTieuTuyen})</div>
                            <div className="text-slate-500">Tuyến: {tt.maTuyen}</div>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF5722] font-semibold">
                            Shipper: {tt.maShipper}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </form>
              </div>

              {/* 3. Xử lý Chuyển hoàn */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-[#FF5722]" /> Quản lý Đơn Chờ chuyển hoàn (Giao thất bại ≥ 3 lần)
                </h2>
                {returnOrders.length === 0 ? (
                  <div className="text-xs text-slate-400 py-3">Hiện không có đơn nào chờ chuyển hoàn.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {returnOrders.map((ro) => (
                      <div key={ro.maVanDon} className="py-3 flex items-center justify-between text-sm">
                        <div>
                          <span className="font-bold">#{ro.maVanDon}</span> — Người nhận: {ro.nguoiNhanTen} (Thất bại {ro.soLanGiaoThatBai} lần)
                        </div>
                        {ro.trangThai === "ChoChuyenHoan" ? (
                          <button
                            onClick={() => handleConfirmReturn(ro.maVanDon)}
                            className="px-3 py-1.5 bg-[#FF5722] text-white text-xs font-semibold rounded-xl"
                          >
                            Xác nhận đã hoàn về người gửi
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            Đã chuyển hoàn (DaChuyenHoan)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {section === "finance" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold">Tài chính, Đối soát &amp; Bảng giá</h1>
                  <p className="text-sm text-slate-500">Đối soát COD Shipper, quyết toán COD cho Shop và cấu hình bảng giá động.</p>
                </div>
                <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
                  <button onClick={() => setFinanceTab("shipper")} className={`px-3 py-2 rounded-lg ${financeTab === "shipper" ? "bg-[#FF5722] text-white" : "text-slate-600"}`}>Đối soát Shipper</button>
                  <button onClick={() => setFinanceTab("shop")} className={`px-3 py-2 rounded-lg ${financeTab === "shop" ? "bg-[#FF5722] text-white" : "text-slate-600"}`}>Quyết toán Shop</button>
                  <button onClick={() => setFinanceTab("pricing")} className={`px-3 py-2 rounded-lg ${financeTab === "pricing" ? "bg-[#FF5722] text-white" : "text-slate-600"}`}>Bảng giá &amp; Tham số</button>
                </div>
              </div>

              {financeTab === "shipper" && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  {slips.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-400">Chưa có phiếu đối soát nào.</div>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3">Mã phiếu</th>
                          <th className="px-4 py-3">Shipper</th>
                          <th className="px-4 py-3">Phải nộp</th>
                          <th className="px-4 py-3">Thực nộp</th>
                          <th className="px-4 py-3">Còn thiếu</th>
                          <th className="px-4 py-3">Trạng thái</th>
                          <th className="px-4 py-3">Đối soát</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {slips.map((s) => (
                          <tr key={s.maDoiSoat}>
                            <td className="px-4 py-3 font-semibold">{s.maDoiSoat}</td>
                            <td className="px-4 py-3">{s.maShipper}</td>
                            <td className="px-4 py-3 font-medium">{formatVnd(s.tongPhaiNop)}</td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                defaultValue={s.soTienThucNop || s.tongPhaiNop}
                                onChange={(e) => setActualCash({ ...actualCash, [s.maDoiSoat]: Number(e.target.value) })}
                                className="w-32 px-2 py-1 border border-slate-300 rounded-lg text-sm"
                              />
                            </td>
                            <td className="px-4 py-3 text-red-600 font-semibold">{formatVnd(s.soTienThieu)}</td>
                            <td className="px-4 py-3">
                              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">{s.trangThai}</span>
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => handleReconcile(s)} className="px-3 py-1.5 bg-[#FF5722] text-white text-xs font-semibold rounded-lg">
                                Khớp lệnh
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {financeTab === "shop" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="text-sm">Tổng hợp các đơn giao thành công (`DaGiaoThanhCong`) để chuyển trả COD cho Shop.</div>
                    <button
                      onClick={async () => {
                        try {
                          const res = await apiFetch<{ ky: { maKy: string; loaiKyThanhToan: string; trangThai: string }; bangKeList: typeof bangKeList }>("/tai-chinh/ky-quyet-toan", {
                            method: "POST",
                            body: JSON.stringify({ maQuanLyLap: user?.maNhanVien || "NV_ADMIN_01", loaiKyThanhToan: "Tuan" }),
                          });
                          setKyList((prev) => [res.ky, ...prev]);
                          setBangKeList(res.bangKeList);
                          setNotice(`Đã tạo kỳ quyết toán ${res.ky.maKy}`);
                        } catch (err) {
                          setErrorMsg(err instanceof Error ? err.message : "Lỗi tạo kỳ quyết toán");
                        }
                      }}
                      className="px-4 py-2 bg-[#FF5722] text-white text-xs font-semibold rounded-xl shrink-0"
                    >
                      + Tạo kỳ quyết toán COD
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 font-bold text-sm">Bảng kê quyết toán Shop ({kyList[0]?.maKy || "Chưa có kỳ"})</div>
                    {bangKeList.length === 0 ? (
                      <div className="p-8 text-center text-sm text-slate-400">Chưa có bảng kê quyết toán Shop nào.</div>
                    ) : (
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                          <tr>
                            <th className="px-4 py-3">Mã bảng kê</th>
                            <th className="px-4 py-3">Khách hàng</th>
                            <th className="px-4 py-3">Tổng COD</th>
                            <th className="px-4 py-3">Cước khấu trừ</th>
                            <th className="px-4 py-3">Thực trả Shop</th>
                            <th className="px-4 py-3">Trạng thái</th>
                            <th className="px-4 py-3">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bangKeList.map((bk) => (
                            <tr key={bk.maBangKe}>
                              <td className="px-4 py-3 font-semibold">{bk.maBangKe}</td>
                              <td className="px-4 py-3">{bk.maKhachHang}</td>
                              <td className="px-4 py-3">{formatVnd(bk.tongCod)}</td>
                              <td className="px-4 py-3 text-slate-500">{formatVnd(bk.tongCuocTru)}</td>
                              <td className="px-4 py-3 font-bold text-[#FF5722]">{formatVnd(bk.thucTra)}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${bk.trangThaiThanhToan === "DaThanhToan" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                  {bk.trangThaiThanhToan}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {bk.trangThaiThanhToan !== "DaThanhToan" && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        const updated = await apiFetch<typeof bk>(`/tai-chinh/bang-ke/${bk.maBangKe}/thanh-toan`, {
                                          method: "POST",
                                          body: JSON.stringify({}),
                                        });
                                        setBangKeList((prev) => prev.map((x) => (x.maBangKe === bk.maBangKe ? updated : x)));
                                        setNotice(`Đã chuyển khoản quyết toán ${bk.maBangKe}`);
                                      } catch {}
                                    }}
                                    className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg"
                                  >
                                    Xác nhận chuyển khoản
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {financeTab === "pricing" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                    <h2 className="font-bold text-base">Chi tiết Bảng giá cước đang áp dụng</h2>
                    {chiTietGia.length === 0 ? (
                      <div className="text-xs text-slate-400">Chưa tải được bảng giá từ Backend.</div>
                    ) : (
                      <div className="space-y-2 text-xs">
                        {chiTietGia.map((ct) => (
                          <div key={`${ct.maVungTuyen}-${ct.maGoiDichVu}`} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                            <div>
                              <div className="font-bold">{ct.maVungTuyen} · {ct.maGoiDichVu}</div>
                              <div className="text-slate-500">Sàn: {formatVnd(ct.cuocSan)} · Vượt: {formatVnd(ct.donGiaVuotMoiKg)}/kg · COD: {ct.tyLePhiCod * 100}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                    <h2 className="font-bold text-base">Tham số hệ thống (tham_so)</h2>
                    {thamSoList.length === 0 ? (
                      <div className="text-xs text-slate-400">Chưa tải được tham số từ Backend.</div>
                    ) : (
                      <div className="space-y-2 text-xs">
                        {thamSoList.map((ts) => (
                          <div key={ts.maThamSo} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center gap-3">
                            <div>
                              <div className="font-bold">{ts.tenThamSo}</div>
                              <div className="text-slate-400">{ts.maThamSo}</div>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-mono font-bold">{ts.giaTri}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {section === "sla" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Quản trị Doanh thu &amp; Báo cáo SLA</h1>
                  <p className="text-sm text-slate-500">Tổng hợp doanh thu thực tế từ đơn hàng và giám sát KPI đội ngũ Shipper.</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const bc = await apiFetch<typeof baoCaoList[0]>("/tai-chinh/bao-cao-doanh-thu", {
                        method: "POST",
                        body: JSON.stringify({ maBuuCuc: user?.maBuuCuc || "BC_BENNGHE" }),
                      });
                      setBaoCaoList((prev) => [bc, ...prev]);
                      setNotice(`Đã tổng hợp báo cáo doanh thu ${bc.maBaoCao}`);
                    } catch (err) {
                      setErrorMsg(err instanceof Error ? err.message : "Lỗi tổng hợp báo cáo");
                    }
                  }}
                  className="px-4 py-2.5 bg-[#FF5722] text-white text-xs font-semibold rounded-xl"
                >
                  + Tổng hợp Báo cáo Doanh thu
                </button>
              </div>

              {baoCaoList.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs text-slate-500">Doanh thu cước</div>
                    <div className="text-2xl font-bold text-[#0F172A] mt-1">{formatVnd(baoCaoList[0].doanhThuCuoc)}</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs text-slate-500">COD luân chuyển</div>
                    <div className="text-2xl font-bold text-[#FF5722] mt-1">{formatVnd(baoCaoList[0].tienCodTrungChuyen)}</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs text-slate-500">Tổng sản lượng đơn</div>
                    <div className="text-2xl font-bold text-[#0F172A] mt-1">{baoCaoList[0].tongSanLuongDon} đơn</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs text-slate-500">Tỷ lệ Tiền mặt / VietQR</div>
                    <div className="text-lg font-bold text-[#0F172A] mt-1">{baoCaoList[0].tyLeTienMat}% / {baoCaoList[0].tyLeVietQr}%</div>
                  </div>
                </div>
              )}

              {kpiList.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-400">
                  Chưa có dữ liệu đánh giá KPI từ Backend.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {kpiList.map((k) => (
                    <div key={k.maKpi} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base">{k.maShipper}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-[#FF5722] text-xs font-bold">Hạng {k.xepLoai}</span>
                      </div>
                      <div className="text-xs text-slate-500">Kỳ đánh giá: {k.kyDanhGia}</div>
                      <div className="pt-2 border-t border-slate-100 text-sm space-y-1">
                        <div className="flex justify-between"><span className="text-slate-500">Giao thành công:</span><strong>{k.tyLeGiaoThanhCong}%</strong></div>
                        <div className="flex justify-between"><span className="text-slate-500">Đúng hẹn SLA:</span><strong>{k.tyLeDungHenSla}%</strong></div>
                        <div className="flex justify-between"><span className="text-slate-500">Sản lượng TB:</span><strong>{k.sanLuongDonBinhQuan} đơn/ngày</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === "catalog" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Quản lý Danh mục &amp; Master Data</h1>
                <p className="text-sm text-slate-500">Bưu cục/Kho, Tuyến giao hàng, Gói dịch vụ, Vùng tuyến, Loại hàng, Ngân hàng và Khách hàng.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bưu cục / Kho */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h2 className="font-bold text-base">Bưu cục &amp; Kho ({buuCucList.length})</h2>
                  <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
                    {buuCucList.map((b) => (
                      <div key={b.maBuuCuc} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-[#0F172A]">{b.tenBuuCuc}</div>
                          <div className="text-slate-500">{b.maBuuCuc}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[#FF5722] font-semibold">{b.loaiKho}</span>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setErrorMsg("");
                      try {
                        await apiFetch("/danh-muc/buu-cuc", {
                          method: "POST",
                          body: JSON.stringify({
                            maBuuCuc: newBcId,
                            tenBuuCuc: newBcName,
                            loaiKho: newBcType,
                            diaChi: newBcAddr,
                            soDuQuyKet: 0,
                            trangThaiHoatDong: "HoatDong",
                          }),
                        });
                        const list = await apiFetch<typeof buuCucList>("/danh-muc/buu-cuc");
                        setBuuCucList(list);
                        setNewBcId("");
                        setNewBcName("");
                        setNewBcAddr("");
                        setNotice(`Đã lưu bưu cục ${newBcId}`);
                      } catch (err) {
                        setErrorMsg(err instanceof Error ? err.message : "Lỗi lưu bưu cục");
                      }
                    }}
                    className="pt-3 border-t border-slate-100 space-y-2"
                  >
                    <div className="grid grid-cols-3 gap-2">
                      <input value={newBcId} onChange={(e) => setNewBcId(e.target.value)} placeholder="Mã BC (VD: BC_Q3)" className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs" required />
                      <input value={newBcName} onChange={(e) => setNewBcName(e.target.value)} placeholder="Tên bưu cục" className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs" required />
                      <select value={newBcType} onChange={(e) => setNewBcType(e.target.value)} className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white">
                        <option value="BuuCuc">Bưu cục</option>
                        <option value="KhoTong">Kho tổng</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <input value={newBcAddr} onChange={(e) => setNewBcAddr(e.target.value)} placeholder="Địa chỉ..." className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs" required />
                      <button type="submit" className="px-3 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold">Lưu</button>
                    </div>
                  </form>
                </div>

                {/* Gói dịch vụ & Vùng tuyến */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h2 className="font-bold text-base">Gói dịch vụ ({goiDichVuList.length}) &amp; Vùng tuyến ({vungTuyenList.length})</h2>
                  <div className="space-y-2 text-xs">
                    {goiDichVuList.map((g) => (
                      <div key={g.maGoiDichVu} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                        <span className="font-semibold">{g.tenGoiDichVu}</span>
                        <span className="text-slate-500">{g.maGoiDichVu}</span>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setErrorMsg("");
                      try {
                        await apiFetch("/danh-muc/goi-dich-vu", {
                          method: "POST",
                          body: JSON.stringify({ maGoiDichVu: newGdvId, tenGoiDichVu: newGdvName, moTa: "" }),
                        });
                        setGoiDichVuList(await apiFetch<typeof goiDichVuList>("/danh-muc/goi-dich-vu"));
                        setNewGdvId("");
                        setNewGdvName("");
                        setNotice(`Đã lưu gói dịch vụ ${newGdvId}`);
                      } catch (err) {
                        setErrorMsg(err instanceof Error ? err.message : "Lỗi lưu gói dịch vụ");
                      }
                    }}
                    className="flex gap-2 pt-2 border-t border-slate-100"
                  >
                    <input value={newGdvId} onChange={(e) => setNewGdvId(e.target.value)} placeholder="Mã gói (VD: GDV_TIETKIEM)" className="w-40 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs" required />
                    <input value={newGdvName} onChange={(e) => setNewGdvName(e.target.value)} placeholder="Tên gói dịch vụ" className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs" required />
                    <button type="submit" className="px-3 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold">Lưu</button>
                  </form>
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                    {vungTuyenList.map((v) => (
                      <span key={v.maVungTuyen} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                        {v.maVungTuyen}: {v.tenVungTuyen}
                      </span>
                    ))}
                    {loaiHangList.map((l) => (
                      <span key={l.maLoaiHang} className="px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF5722] font-medium">
                        {l.tenLoaiHang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tuyến giao hàng & Ngân hàng */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                  <h2 className="font-bold text-base">Tuyến giao hàng ({tuyenList.length}) &amp; Ngân hàng ({nganHangList.length})</h2>
                  <div className="space-y-1.5 text-xs">
                    {tuyenList.map((t) => (
                      <div key={t.maTuyen} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                        <span className="font-semibold">{t.tenTuyen} ({t.maTuyen})</span>
                        <span className="text-slate-500">{t.maBuuCuc} · {t.loaiTuyen}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                    {nganHangList.map((nh) => (
                      <span key={nh.maNganHangDm} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold">
                        {nh.tenVietTat} — {nh.tenNganHang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Khách hàng / Shop */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                  <h2 className="font-bold text-base">Danh sách Khách hàng / Shop ({khachHangList.length})</h2>
                  <div className="space-y-1.5 text-xs max-h-56 overflow-y-auto">
                    {khachHangList.map((kh) => (
                      <div key={kh.maNguoiDung} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-[#0F172A]">{kh.tenShop || kh.maNguoiDung}</div>
                          <div className="text-slate-500">ID: {kh.maNguoiDung}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">{kh.loaiKhachHang}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

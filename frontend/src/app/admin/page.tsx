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
} from "lucide-react";
import { apiFetch, formatVnd, UserSession } from "@/lib/api";

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

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [section, setSection] = useState<"warehouse" | "dispatch" | "finance" | "sla">("warehouse");
  const [notice, setNotice] = useState("");

  // 1. Warehouse & Manifest state
  const [manifests, setManifests] = useState<ManifestItem[]>([
    { maManifest: "MF-Q1-151126", maBuuCucDi: "KHO_Q1", maBuuCucDen: "BC_BENNGHE", tongSoKien: 2, trangThai: "DangKhoiTao" },
  ]);
  const [scanCode, setScanCode] = useState("");
  const [inspectManifest, setInspectManifest] = useState<string | null>(null);
  const [inspectItems, setInspectItems] = useState<ChiTietManifestItem[]>([
    { maManifest: "MF-Q1-151126", maVanDon: "FP-98231", daQuetNhap: true },
    { maManifest: "MF-Q1-151126", maVanDon: "FP-98233", daQuetNhap: false },
  ]);

  // Incident state
  const [incidentTab, setIncidentTab] = useState<"create" | "list">("create");
  const [incidentCode, setIncidentCode] = useState("FP-98236");
  const [incidentType, setIncidentType] = useState<"Rach" | "Vo">("Rach");
  const [incidentDesc, setIncidentDesc] = useState("Bao bì bị rách ở góc, cần kiểm tra hàng hóa trước khi tiếp tục bàn giao.");
  const [incidents, setIncidents] = useState<BienBanItem[]>([
    { maBienBan: "BB-001", maVanDon: "FP-98236", loaiBatThuong: "RachBaoBi", moTa: "Bao bì rách góc phải", trangThaiDuyet: "ChoXuLy" },
  ]);

  // 2. Dispatch (Xuất kho, Tuyến, Chuyển hoàn)
  const [phieuXuatList, setPhieuXuatList] = useState<PhieuXuatItem[]>([
    { maPhieuXuat: "PXK-10234", maBuuCuc: "BC_BENNGHE", maShipper: "NV_SHIP_01", tongSoDon: 2, tongTienCodPhaiThu: 450000, shipperDaXacNhan: false },
  ]);
  const [pxShipper, setPxShipper] = useState("NV_SHIP_01");
  const [pxCodes, setPxCodes] = useState("FP-98232, FP-98233");

  const [subRoutes, setSubRoutes] = useState<TieuTuyenItem[]>([
    { maTieuTuyen: "TT_BENGHE", maTuyen: "TUYEN_Q1", maShipper: "NV_SHIP_01", tenTieuTuyen: "Tiểu tuyến Bến Nghé - Đa Kao" },
  ]);
  const [ttName, setTtName] = useState("Tiểu tuyến Tân Định");
  const [ttShipper, setTtShipper] = useState("NV_SHIP_01");
  const [ttDistrict, setTtDistrict] = useState("Quận 1");
  const [ttWard, setTtWard] = useState("P. Tân Định");

  const [returnOrders, setReturnOrders] = useState<{ maVanDon: string; nguoiNhanTen: string; soLanGiaoThatBai: number; trangThai: string }[]>([
    { maVanDon: "FP-98239", nguoiNhanTen: "Lê Quốc Bảo", soLanGiaoThatBai: 3, trangThai: "ChoChuyenHoan" },
  ]);

  // 3. Finance
  const [slips, setSlips] = useState<PhieuDoiSoatItem[]>([
    { maDoiSoat: "PDS-20261115-01", maShipper: "NV_SHIP_01", tongDonThanhCong: 5, tongPhaiNop: 1250000, soTienThucNop: 1250000, soTienThieu: 0, trangThai: "DaKhoaSo" },
  ]);
  const [actualCash, setActualCash] = useState<Record<string, number>>({});

  useEffect(() => {
    const raw = localStorage.getItem("fastpost_user");
    if (!raw) { router.push("/"); return; }
    setUser(JSON.parse(raw));

    apiFetch<ManifestItem[]>("/manifest").then((d) => { if (d.length > 0) setManifests(d); }).catch(() => {});
    apiFetch<BienBanItem[]>("/manifest/bien-ban-bat-thuong").then((d) => { if (d.length > 0) setIncidents(d); }).catch(() => {});
    apiFetch<PhieuXuatItem[]>("/kho/phieu-xuat").then((d) => { if (d.length > 0) setPhieuXuatList(d); }).catch(() => {});
    apiFetch<{ tieuTuyenList: TieuTuyenItem[] }>("/kho/tuyen").then((d) => { if (d.tieuTuyenList?.length > 0) setSubRoutes(d.tieuTuyenList); }).catch(() => {});
    apiFetch<PhieuDoiSoatItem[]>("/doi-soat/shipper").then((d) => { if (d.length > 0) setSlips(d); }).catch(() => {});
  }, [router]);

  async function handleCreateManifest() {
    try {
      const m = await apiFetch<ManifestItem>("/manifest", {
        method: "POST",
        body: JSON.stringify({ maBuuCucDi: "KHO_Q1", maBuuCucDen: "BC_BENNGHE", maNhanVienLap: user?.maNhanVien || "NV_ADMIN_01" }),
      });
      setManifests((prev) => [m, ...prev]);
      setNotice(`Đã tạo Manifest mới: ${m.maManifest}`);
    } catch {
      const m: ManifestItem = {
        maManifest: "MF-Q1-" + Math.floor(1000 + Math.random() * 8999),
        maBuuCucDi: "KHO_Q1",
        maBuuCucDen: "BC_BENNGHE",
        tongSoKien: 0,
        trangThai: "DangKhoiTao",
      };
      setManifests((prev) => [m, ...prev]);
      setNotice(`Đã tạo Manifest mới: ${m.maManifest}`);
    }
  }

  async function handleScanToManifest(maManifest: string) {
    if (!scanCode.trim()) return;
    try {
      const updated = await apiFetch<ManifestItem>(`/manifest/${maManifest}/quet-gom-don`, {
        method: "POST",
        body: JSON.stringify({ maVanDon: scanCode.trim() }),
      });
      setManifests((prev) => prev.map((m) => (m.maManifest === maManifest ? updated : m)));
    } catch {
      setManifests((prev) => prev.map((m) => (m.maManifest === maManifest ? { ...m, tongSoKien: m.tongSoKien + 1 } : m)));
    }
    setNotice(`Đã quét gom đơn ${scanCode.trim()} vào ${maManifest}`);
    setScanCode("");
  }

  async function handleManifestTransition(maManifest: string, action: string) {
    try {
      const updated = await apiFetch<ManifestItem>(`/manifest/${maManifest}/chuyen-trang-thai?action=${action}`, {
        method: "POST",
      });
      setManifests((prev) => prev.map((m) => (m.maManifest === maManifest ? updated : m)));
    } catch {
      const nextMap: Record<string, string> = {
        niemPhong: "DaNiemPhong",
        xuatXe: "DangVanChuyen",
        denKhoDich: "DaDenKhoDich",
        batDauKiemNhan: "DangKiemNhan",
        duyetXuLy: "DaXuLyChenhLech",
        dongHoSo: "HoanTatNhapKho",
      };
      setManifests((prev) => prev.map((m) => (m.maManifest === maManifest ? { ...m, trangThai: nextMap[action] || m.trangThai } : m)));
    }
    if (action === "batDauKiemNhan") {
      openInspectModal(maManifest);
    }
  }

  async function openInspectModal(maManifest: string) {
    setInspectManifest(maManifest);
    try {
      const res = await apiFetch<{ chiTiet: ChiTietManifestItem[] }>(`/manifest/${maManifest}`);
      if (res.chiTiet) setInspectItems(res.chiTiet);
    } catch {}
  }

  async function handleScanInspectItem(maVanDon: string) {
    if (!inspectManifest) return;
    try {
      await apiFetch(`/manifest/${inspectManifest}/quet-kien`, {
        method: "POST",
        body: JSON.stringify({ maVanDon }),
      });
    } catch {}
    setInspectItems((prev) => prev.map((i) => (i.maVanDon === maVanDon ? { ...i, daQuetNhap: true } : i)));
  }

  async function handleCompleteReceiving() {
    if (!inspectManifest) return;
    try {
      const updated = await apiFetch<ManifestItem>(`/manifest/${inspectManifest}/kiem-nhan-hoan-tat`, {
        method: "POST",
      });
      setManifests((prev) => prev.map((m) => (m.maManifest === inspectManifest ? updated : m)));
      setNotice(`Đã hoàn tất kiểm nhận ${inspectManifest} → ${updated.trangThai}`);
    } catch {
      const allScanned = inspectItems.every((i) => i.daQuetNhap);
      const nextState = allScanned ? "HoanTatNhapKho" : "PhatSinhBatThuong";
      setManifests((prev) => prev.map((m) => (m.maManifest === inspectManifest ? { ...m, trangThai: nextState } : m)));
      if (!allScanned) {
        setIncidents((prev) => [
          {
            maBienBan: "BB-" + Math.floor(100 + Math.random() * 899),
            maVanDon: inspectItems.find((i) => !i.daQuetNhap)?.maVanDon || "FP-98233",
            loaiBatThuong: "ThieuKienManifest",
            moTa: `Thiếu kiện khi kiểm nhận Manifest ${inspectManifest}`,
            trangThaiDuyet: "ChoXuLy",
          },
          ...prev,
        ]);
      }
      setNotice(`Kết quả kiểm nhận ${inspectManifest}: ${nextState}`);
    }
    setInspectManifest(null);
  }

  async function handleSaveIncident() {
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
    } catch {
      setIncidents((prev) => [
        {
          maBienBan: "BB-" + Math.floor(100 + Math.random() * 899),
          maVanDon: incidentCode,
          loaiBatThuong: incidentType === "Rach" ? "RachBaoBi" : "VoHang",
          moTa: incidentDesc,
          trangThaiDuyet: "ChoXuLy",
        },
        ...prev,
      ]);
    }
    setNotice(`Đã lưu biên bản bất thường cho đơn #${incidentCode}`);
    setIncidentTab("list");
  }

  async function handleApproveIncident(maBienBan: string, phuongAnXuLy: string) {
    try {
      const updated = await apiFetch<BienBanItem>(`/manifest/bien-ban-bat-thuong/${maBienBan}/duyet`, {
        method: "POST",
        body: JSON.stringify({ maQuanLyDuyet: user?.maNhanVien || "NV_ADMIN_01", phuongAnXuLy }),
      });
      setIncidents((prev) => prev.map((b) => (b.maBienBan === maBienBan ? updated : b)));
    } catch {
      setIncidents((prev) =>
        prev.map((b) => (b.maBienBan === maBienBan ? { ...b, phuongAnXuLy, trangThaiDuyet: "DaDuyet" } : b))
      );
    }
    setNotice(`Đã duyệt biên bản ${maBienBan} (${phuongAnXuLy})`);
  }

  async function handleCreatePhieuXuat() {
    const codes = pxCodes.split(",").map((s) => s.trim()).filter(Boolean);
    if (codes.length === 0) return;
    try {
      const px = await apiFetch<PhieuXuatItem>("/kho/phieu-xuat", {
        method: "POST",
        body: JSON.stringify({
          maBuuCuc: "BC_BENNGHE",
          maNhanVienKho: user?.maNhanVien || "NV_ADMIN_01",
          maShipper: pxShipper,
          dsMaVanDon: codes,
          ghiChu: "Xuất kho giao ca sáng",
        }),
      });
      setPhieuXuatList((prev) => [px, ...prev]);
      setNotice(`Đã tạo phiếu xuất kho ${px.maPhieuXuat} cho ${pxShipper}`);
    } catch {
      const px: PhieuXuatItem = {
        maPhieuXuat: "PXK-" + Math.floor(10000 + Math.random() * 89999),
        maBuuCuc: "BC_BENNGHE",
        maShipper: pxShipper,
        tongSoDon: codes.length,
        tongTienCodPhaiThu: 500000,
        shipperDaXacNhan: false,
      };
      setPhieuXuatList((prev) => [px, ...prev]);
      setNotice(`Đã tạo phiếu xuất kho ${px.maPhieuXuat} cho ${pxShipper}`);
    }
  }

  async function handleCreateSubRoute() {
    try {
      const res = await apiFetch<{ tieuTuyen: TieuTuyenItem }>("/kho/tieu-tuyen", {
        method: "POST",
        body: JSON.stringify({
          maTuyen: "TUYEN_Q1",
          tenTieuTuyen: ttName,
          maShipper: ttShipper,
          quanHuyen: ttDistrict,
          phuongXa: ttWard,
        }),
      });
      setSubRoutes((prev) => [...prev, res.tieuTuyen]);
    } catch {
      setSubRoutes((prev) => [
        ...prev,
        { maTieuTuyen: "TT-" + Math.floor(100 + Math.random() * 899), maTuyen: "TUYEN_Q1", maShipper: ttShipper, tenTieuTuyen: `${ttName} (${ttWard})` },
      ]);
    }
    setNotice(`Đã thêm tiểu tuyến ${ttName} (${ttWard}, ${ttDistrict}) cho ${ttShipper}`);
  }

  async function handleConfirmReturn(maVanDon: string) {
    try {
      await apiFetch(`/don-hang/${maVanDon}/xac-nhan-hoan`, { method: "POST" });
    } catch {}
    setReturnOrders((prev) => prev.map((o) => (o.maVanDon === maVanDon ? { ...o, trangThai: "DaChuyenHoan" } : o)));
    setNotice(`Đã xác nhận chuyển hoàn đơn #${maVanDon} về cho người gửi`);
  }

  async function handleReconcile(slip: PhieuDoiSoatItem) {
    const val = actualCash[slip.maDoiSoat] ?? slip.tongPhaiNop;
    try {
      const updated = await apiFetch<PhieuDoiSoatItem>(`/doi-soat/shipper/${slip.maDoiSoat}/doi-soat`, {
        method: "POST",
        body: JSON.stringify({ soTienThucNop: val }),
      });
      setSlips((prev) => prev.map((s) => (s.maDoiSoat === slip.maDoiSoat ? updated : s)));
    } catch {
      const status = val === slip.tongPhaiNop ? "DaKhopTien" : val < slip.tongPhaiNop ? "PhatSinhCongNo" : "DangKiemDem";
      setSlips((prev) => prev.map((s) => (s.maDoiSoat === slip.maDoiSoat ? { ...s, soTienThucNop: val, soTienThieu: Math.max(0, s.tongPhaiNop - val), trangThai: status } : s)));
    }
  }

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
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id as "warehouse" | "dispatch" | "finance" | "sla")}
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
            <div className="font-semibold text-slate-200">KHU VỰC HỒ CHÍ MINH</div>
            <div>Kho trung chuyển Quận 1</div>
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
            <div className="text-sm font-semibold">{user?.hoTen || "Lê Minh Anh"}</div>
            <div className="text-xs text-slate-400">Quản trị viên</div>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-y-auto space-y-6">
          {notice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center justify-between">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {notice}</span>
              <button onClick={() => setNotice("")} className="text-xs underline">Đóng</button>
            </div>
          )}

          {section === "warehouse" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Quản lý Kho &amp; Manifest</h1>
                    <p className="text-sm text-slate-500">Quét mã gom đơn, luân chuyển và kiểm nhận chi tiết từng kiện tại kho đích.</p>
                  </div>
                  <button
                    onClick={handleCreateManifest}
                    className="px-4 py-2.5 bg-[#FF5722] hover:bg-[#E64A19] text-white text-sm font-semibold rounded-xl"
                  >
                    + Tạo Manifest
                  </button>
                </div>

                {/* Barcode Scan Box */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="text-sm font-bold mb-3 flex items-center gap-2">
                    <ScanBarcode className="w-4 h-4 text-[#FF5722]" /> Quét mã vận đơn gom vào Manifest ({manifests[0]?.maManifest})
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={scanCode}
                      onChange={(e) => setScanCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && manifests[0] && handleScanToManifest(manifests[0].maManifest)}
                      placeholder="Quét hoặc nhập mã vận đơn (vd: FP-98232)..."
                      className="flex-1 px-4 py-2.5 border border-[#FF5722]/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30"
                    />
                    <button
                      onClick={() => manifests[0] && handleScanToManifest(manifests[0].maManifest)}
                      className="px-4 py-2.5 bg-[#0F172A] text-white text-sm font-semibold rounded-xl"
                    >
                      Gom đơn
                    </button>
                  </div>
                </div>

                {/* Manifest Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 font-bold">Danh sách Manifest trung chuyển</div>
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
                </div>

                {/* Detailed Receiving Modal/Panel */}
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
                  <>
                    <h2 className="font-bold text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#FF5722]" /> Lập biên bản bất thường
                    </h2>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Mã vận đơn</label>
                      <input value={incidentCode} onChange={(e) => setIncidentCode(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Tình trạng hàng hóa</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setIncidentType("Rach")} className={`py-2 rounded-xl border text-sm font-medium ${incidentType === "Rach" ? "border-[#FF5722] bg-orange-50 text-[#FF5722]" : "border-slate-200"}`}>Rách</button>
                        <button onClick={() => setIncidentType("Vo")} className={`py-2 rounded-xl border text-sm font-medium ${incidentType === "Vo" ? "border-[#FF5722] bg-orange-50 text-[#FF5722]" : "border-slate-200"}`}>Vỡ</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Mô tả hiện trạng</label>
                      <textarea rows={3} value={incidentDesc} onChange={(e) => setIncidentDesc(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                    </div>
                    <button onClick={handleSaveIncident} className="w-full py-2.5 bg-[#FF5722] text-white font-semibold rounded-xl text-sm">
                      Lưu biên bản
                    </button>
                  </>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto">
                    {incidents.map((bb) => (
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
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {section === "dispatch" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Xuất kho Shipper, Phân tuyến &amp; Chuyển hoàn</h1>
                <p className="text-sm text-slate-500">Bàn giao đơn xuất kho theo ca, cấu hình tiểu tuyến tự động và xử lý đơn hoàn.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Xuất kho bàn giao Shipper */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#FF5722]" /> Lập Phiếu xuất kho cho Shipper
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Shipper nhận bàn giao</label>
                      <input value={pxShipper} onChange={(e) => setPxShipper(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Danh sách mã vận đơn (phẩy)</label>
                      <input value={pxCodes} onChange={(e) => setPxCodes(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                    </div>
                  </div>
                  <button onClick={handleCreatePhieuXuat} className="w-full py-2.5 bg-[#FF5722] text-white font-semibold rounded-xl text-sm">
                    Tạo phiếu xuất kho &amp; Gán Shipper
                  </button>

                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase">Phiếu xuất kho gần đây</div>
                    {phieuXuatList.map((px) => (
                      <div key={px.maPhieuXuat} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold">{px.maPhieuXuat} · Shipper: {px.maShipper}</div>
                          <div className="text-slate-500">{px.tongSoDon} đơn · COD phải thu: {formatVnd(px.tongTienCodPhaiThu)}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full font-semibold ${px.shipperDaXacNhan ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {px.shipperDaXacNhan ? "Shipper đã nhận" : "Chờ Shipper xác nhận"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Quản lý Tuyến & Tiểu tuyến */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#FF5722]" /> Quản lý Tiểu tuyến &amp; Tự động phân đơn
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <input value={ttName} onChange={(e) => setTtName(e.target.value)} placeholder="Tên tiểu tuyến" className="px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                    <input value={ttShipper} onChange={(e) => setTtShipper(e.target.value)} placeholder="Mã Shipper" className="px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                    <input value={ttDistrict} onChange={(e) => setTtDistrict(e.target.value)} placeholder="Quận / Huyện" className="px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                    <input value={ttWard} onChange={(e) => setTtWard(e.target.value)} placeholder="Phường / Xã" className="px-3 py-2 border border-slate-300 rounded-xl text-sm" />
                  </div>
                  <button onClick={handleCreateSubRoute} className="w-full py-2.5 bg-[#0F172A] text-white font-semibold rounded-xl text-sm">
                    + Thêm Tiểu tuyến địa bàn
                  </button>

                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase">Danh sách tiểu tuyến đang hoạt động</div>
                    {subRoutes.map((tt) => (
                      <div key={tt.maTieuTuyen} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold">{tt.tenTieuTuyen} ({tt.maTieuTuyen})</div>
                          <div className="text-slate-500">Tuyến: {tt.maTuyen}</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF5722] font-semibold">
                          Shipper: {tt.maShipper}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Xử lý Chuyển hoàn */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-[#FF5722]" /> Quản lý Đơn Chờ chuyển hoàn (Giao thất bại ≥ 3 lần)
                </h2>
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
              </div>
            </div>
          )}

          {section === "finance" && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold">Tài chính &amp; Đối soát COD Shipper</h1>
                <p className="text-sm text-slate-500">Kiểm đếm tiền nộp cuối ca, ghi nhận ví công nợ và khóa sổ phiếu đối soát.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
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
              </div>
            </div>
          )}

          {section === "sla" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Quản trị &amp; Báo cáo SLA</h1>
                <p className="text-sm text-slate-500">Giám sát hiệu suất giao hàng đúng hẹn và KPI đội ngũ Shipper HCM.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Tỷ lệ giao thành công</div>
                  <div className="text-3xl font-bold text-[#0F172A]">97.5%</div>
                  <div className="text-xs text-emerald-600 mt-1">Đạt chuẩn SLA (&gt; 95%)</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Đúng hẹn SLA</div>
                  <div className="text-3xl font-bold text-[#0F172A]">95.0%</div>
                  <div className="text-xs text-slate-500 mt-1">Kỳ đánh giá 2026-11</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Xếp loại Shipper tiêu biểu</div>
                  <div className="text-3xl font-bold text-[#FF5722]">Hạng A</div>
                  <div className="text-xs text-slate-500 mt-1">Phương Duy · 28 đơn/ngày</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

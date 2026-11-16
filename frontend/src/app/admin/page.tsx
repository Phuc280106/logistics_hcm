"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Warehouse, Wallet, BarChart3, ScanBarcode, AlertTriangle, LogOut, CheckCircle2 } from "lucide-react";
import { apiFetch, formatVnd, UserSession } from "@/lib/api";

interface ManifestItem {
  maManifest: string;
  maBuuCucDi: string;
  maBuuCucDen: string;
  tongSoKien: number;
  trangThai: string;
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
  const [section, setSection] = useState<"warehouse" | "finance" | "sla">("warehouse");

  // Warehouse & Manifest state
  const [manifests, setManifests] = useState<ManifestItem[]>([
    { maManifest: "MF-Q1-151126", maBuuCucDi: "KHO_Q1", maBuuCucDen: "BC_BENNGHE", tongSoKien: 2, trangThai: "DangKhoiTao" },
  ]);
  const [scanCode, setScanCode] = useState("");
  const [incidentCode, setIncidentCode] = useState("FP-98236");
  const [incidentType, setIncidentType] = useState<"Rach" | "Vo">("Rach");
  const [incidentDesc, setIncidentDesc] = useState("Bao bì bị rách ở góc, cần kiểm tra hàng hóa trước khi tiếp tục bàn giao.");
  const [notice, setNotice] = useState("");

  // Finance & Reconciliation state
  const [slips, setSlips] = useState<PhieuDoiSoatItem[]>([
    { maDoiSoat: "PDS-20261115-01", maShipper: "NV_SHIP_01", tongDonThanhCong: 5, tongPhaiNop: 1250000, soTienThucNop: 1250000, soTienThieu: 0, trangThai: "DaKhoaSo" },
  ]);
  const [actualCash, setActualCash] = useState<Record<string, number>>({});

  useEffect(() => {
    const raw = localStorage.getItem("fastpost_user");
    if (!raw) { router.push("/"); return; }
    setUser(JSON.parse(raw));

    apiFetch<ManifestItem[]>("/manifest").then((d) => { if (d.length > 0) setManifests(d); }).catch(() => {});
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
        hoanTatDu: "HoanTatNhapKho",
      };
      setManifests((prev) => prev.map((m) => (m.maManifest === maManifest ? { ...m, trangThai: nextMap[action] || m.trangThai } : m)));
    }
  }

  async function handleSaveIncident() {
    try {
      await apiFetch("/manifest/bien-ban-bat-thuong", {
        method: "POST",
        body: JSON.stringify({
          maVanDon: incidentCode,
          loaiBatThuong: incidentType === "Rach" ? "RachBaoBi" : "VoHang",
          moTa: incidentDesc,
          maNhanVienKho: user?.maNhanVien || "NV_ADMIN_01",
        }),
      });
    } catch {}
    setNotice(`Đã lưu biên bản bất thường cho đơn #${incidentCode}`);
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
              { id: "finance", label: "Tài chính & COD", icon: Wallet },
              { id: "sla", label: "Quản trị & SLA", icon: BarChart3 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id as "warehouse" | "finance" | "sla")}
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
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {notice}
            </div>
          )}

          {section === "warehouse" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Quản lý Kho &amp; Manifest</h1>
                    <p className="text-sm text-slate-500">Quét mã, quản lý nhập xuất và bảng kê trung chuyển.</p>
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
                              <button onClick={() => handleManifestTransition(m.maManifest, "batDauKiemNhan")} className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded-lg">Kiểm nhận</button>
                            )}
                            {m.trangThai === "DangKiemNhan" && (
                              <button onClick={() => handleManifestTransition(m.maManifest, "hoanTatDu")} className="text-xs px-2.5 py-1 bg-emerald-700 text-white rounded-lg">Hoàn tất</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Incident Form */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 h-fit space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#FF5722]" /> Lập biên bản bất thường
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

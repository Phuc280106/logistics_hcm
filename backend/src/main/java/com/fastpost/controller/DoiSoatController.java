package com.fastpost.controller;

import com.fastpost.entity.*;
import com.fastpost.repository.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/doi-soat")
public class DoiSoatController {
    private static final BigDecimal DEBT_LIMIT = BigDecimal.valueOf(3_000_000);

    private final PhieuDoiSoatShipperRepository phieuRepo;
    private final ViCongNoShipperRepository viRepo;
    private final ShipperRepository shipperRepo;
    private final BienBanChotQuyRepository chotQuyRepo;
    private final DanhGiaKpiRepository kpiRepo;
    private final BuuCucRepository buuCucRepo;
    private final DonHangRepository donHangRepo;
    private final LichSuHanhTrinhRepository lichSuRepo;

    public DoiSoatController(
            PhieuDoiSoatShipperRepository phieuRepo,
            ViCongNoShipperRepository viRepo,
            ShipperRepository shipperRepo,
            BienBanChotQuyRepository chotQuyRepo,
            DanhGiaKpiRepository kpiRepo,
            BuuCucRepository buuCucRepo,
            DonHangRepository donHangRepo,
            LichSuHanhTrinhRepository lichSuRepo) {
        this.phieuRepo = phieuRepo;
        this.viRepo = viRepo;
        this.shipperRepo = shipperRepo;
        this.chotQuyRepo = chotQuyRepo;
        this.kpiRepo = kpiRepo;
        this.buuCucRepo = buuCucRepo;
        this.donHangRepo = donHangRepo;
        this.lichSuRepo = lichSuRepo;
    }

    public record CreateDoiSoatRequest(String maShipper, String maNhanVienQuay, Integer tongDonThanhCong, BigDecimal tongTienCod, BigDecimal tongCuocMat) {}
    public record KhopLenhRequest(BigDecimal soTienThucNop) {}
    public record NopBuNoRequest(BigDecimal soTienBu) {}
    public record ChotQuyRequest(String maBuuCuc, String maNhanVienQuayLap, BigDecimal tienCuocQuay, BigDecimal tienShipperNop, BigDecimal tienThucKiemKe, String lyDoChenhLech) {}

    @GetMapping("/shipper")
    public List<PhieuDoiSoatShipper> listPhieu(@RequestParam(required = false) String maShipper) {
        if (maShipper != null && !maShipper.isBlank()) {
            return phieuRepo.findByMaShipperOrderByNgayDoiSoatDesc(maShipper);
        }
        return phieuRepo.findAllByOrderByNgayDoiSoatDesc();
    }

    @GetMapping("/vi-cong-no/{maShipper}")
    @Transactional
    public ResponseEntity<?> getViCongNo(@PathVariable String maShipper) {
        return viRepo.findByMaShipper(maShipper)
                .map(vi -> {
                    // UC 6.2: tự động khóa nếu giữ nợ quá 24h hoặc vượt 3.000.000đ
                    boolean over24h = vi.getTongNoLuyKe().compareTo(BigDecimal.ZERO) > 0
                            && vi.getThoiDiemPhatSinhNo() != null
                            && vi.getThoiDiemPhatSinhNo().isBefore(LocalDateTime.now().minusHours(24));
                    boolean overLimit = vi.getTongNoLuyKe().compareTo(DEBT_LIMIT) >= 0;
                    if ((over24h || overLimit) && !Boolean.TRUE.equals(vi.getDaKhoaNhanDon())) {
                        vi.setDaKhoaNhanDon(true);
                        viRepo.save(vi);
                        shipperRepo.findById(maShipper).ifPresent(s -> {
                            s.setTrangThaiNhanDon("KhoaTamThoi");
                            shipperRepo.save(s);
                        });
                    }
                    return ResponseEntity.ok(vi);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/mo-khoa/{maShipper}")
    @Transactional
    public ResponseEntity<?> unlockShipper(@PathVariable String maShipper) {
        return viRepo.findByMaShipper(maShipper).map(vi -> {
            if (vi.getTongNoLuyKe().compareTo(BigDecimal.ZERO) > 0) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Không thể mở khóa: Shipper vẫn còn dư nợ " + vi.getTongNoLuyKe() + "đ"));
            }
            vi.setDaKhoaNhanDon(false);
            vi.setThoiDiemPhatSinhNo(null);
            viRepo.save(vi);
            shipperRepo.findById(maShipper).ifPresent(s -> {
                s.setTrangThaiNhanDon("SanSang");
                shipperRepo.save(s);
            });
            return ResponseEntity.ok(Map.of("maShipper", maShipper, "message", "Đã mở khóa quyền nhận đơn cho Shipper"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/shipper")
    @Transactional
    public PhieuDoiSoatShipper taoPhieu(@RequestBody CreateDoiSoatRequest req) {
        String shipperId = req.maShipper() != null ? req.maShipper() : "NV_SHIP_01";
        List<DonHang> delivered = donHangRepo.findByMaShipperOrderByNgayTaoDesc(shipperId).stream()
                .filter(d -> "DaGiaoThanhCong".equals(d.getTrangThai()))
                .toList();

        int count = req.tongDonThanhCong() != null ? req.tongDonThanhCong() : delivered.size();
        BigDecimal cod = req.tongTienCod() != null ? req.tongTienCod()
                : delivered.stream().map(d -> d.getTienCod() != null ? d.getTienCod() : BigDecimal.ZERO)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal cuoc = req.tongCuocMat() != null ? req.tongCuocMat() : BigDecimal.ZERO;

        PhieuDoiSoatShipper p = new PhieuDoiSoatShipper();
        p.setMaDoiSoat("PDS-" + System.currentTimeMillis());
        p.setMaShipper(shipperId);
        p.setMaNhanVienQuay(req.maNhanVienQuay() != null ? req.maNhanVienQuay() : "NV_QUAY_01");
        p.setTongDonThanhCong(count);
        p.setTongTienCod(cod);
        p.setTongCuocMat(cuoc);
        p.setTongPhaiNop(cod.add(cuoc));
        p.setTrangThai("MoiKhoiTao");
        return phieuRepo.save(p);
    }

    @PostMapping("/shipper/{maDoiSoat}/gui-quay")
    @Transactional
    public ResponseEntity<?> guiQuay(@PathVariable String maDoiSoat) {
        return phieuRepo.findById(maDoiSoat).map(p -> {
            p.setTrangThai("ChoKiemDem");
            return ResponseEntity.ok(phieuRepo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/shipper/{maDoiSoat}/tiep-nhan")
    @Transactional
    public ResponseEntity<?> tiepNhan(@PathVariable String maDoiSoat) {
        return phieuRepo.findById(maDoiSoat).map(p -> {
            p.setTrangThai("DangKiemDem");
            return ResponseEntity.ok(phieuRepo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/shipper/{maDoiSoat}/doi-soat")
    @Transactional
    public ResponseEntity<?> doiSoat(@PathVariable String maDoiSoat, @RequestBody KhopLenhRequest req) {
        return phieuRepo.findById(maDoiSoat).map(p -> {
            BigDecimal thucNop = req.soTienThucNop() != null ? req.soTienThucNop() : BigDecimal.ZERO;
            BigDecimal phaiNop = p.getTongPhaiNop() != null ? p.getTongPhaiNop() : BigDecimal.ZERO;
            p.setSoTienThucNop(thucNop);

            // State Diagram PhieuDoiSoatShipper pe-4: ThucNop > PhaiNop -> giữ DangKiemDem để đếm lại
            int cmp = thucNop.compareTo(phaiNop);
            if (cmp > 0) {
                p.setTrangThai("DangKiemDem");
                return ResponseEntity.ok(phieuRepo.save(p));
            }

            ViCongNoShipper vi = viRepo.findByMaShipper(p.getMaShipper()).orElseGet(() -> {
                ViCongNoShipper created = new ViCongNoShipper();
                created.setMaVi("VI-" + p.getMaShipper());
                created.setMaShipper(p.getMaShipper());
                created.setTongNoLuyKe(BigDecimal.ZERO);
                return created;
            });

            BigDecimal newDebt = vi.getTongNoLuyKe().subtract(thucNop).max(BigDecimal.ZERO);
            if (cmp < 0 && newDebt.compareTo(BigDecimal.ZERO) == 0) {
                newDebt = phaiNop.subtract(thucNop);
            }
            vi.setTongNoLuyKe(newDebt);

            boolean over24h = newDebt.compareTo(BigDecimal.ZERO) > 0
                    && vi.getThoiDiemPhatSinhNo() != null
                    && vi.getThoiDiemPhatSinhNo().isBefore(LocalDateTime.now().minusHours(24));

            if (newDebt.compareTo(BigDecimal.ZERO) == 0) {
                vi.setDaKhoaNhanDon(false);
                vi.setThoiDiemPhatSinhNo(null);
                shipperRepo.findById(p.getMaShipper()).ifPresent(s -> {
                    s.setTrangThaiNhanDon("SanSang");
                    shipperRepo.save(s);
                });
            } else {
                if (vi.getThoiDiemPhatSinhNo() == null) {
                    vi.setThoiDiemPhatSinhNo(LocalDateTime.now());
                }
                if (newDebt.compareTo(DEBT_LIMIT) >= 0 || over24h) {
                    vi.setDaKhoaNhanDon(true);
                    shipperRepo.findById(p.getMaShipper()).ifPresent(s -> {
                        s.setTrangThaiNhanDon("KhoaTamThoi");
                        shipperRepo.save(s);
                    });
                }
            }
            viRepo.save(vi);

            if (cmp == 0) {
                p.setSoTienThieu(BigDecimal.ZERO);
                p.setTrangThai("DaKhopTien");
            } else {
                BigDecimal thieu = phaiNop.subtract(thucNop);
                p.setSoTienThieu(thieu);
                p.setTrangThai((newDebt.compareTo(DEBT_LIMIT) >= 0 || over24h) ? "KhoaTaiKhoanShipper" : "PhatSinhCongNo");
            }
            return ResponseEntity.ok(phieuRepo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/shipper/{maDoiSoat}/nop-bu-no")
    @Transactional
    public ResponseEntity<?> nopBuNo(@PathVariable String maDoiSoat, @RequestBody NopBuNoRequest req) {
        return phieuRepo.findById(maDoiSoat).map(p -> {
            BigDecimal bu = req.soTienBu();
            p.setSoTienThieu(p.getSoTienThieu().subtract(bu).max(BigDecimal.ZERO));
            viRepo.findByMaShipper(p.getMaShipper()).ifPresent(vi -> {
                vi.setTongNoLuyKe(vi.getTongNoLuyKe().subtract(bu).max(BigDecimal.ZERO));
                if (vi.getTongNoLuyKe().compareTo(BigDecimal.ZERO) == 0) {
                    vi.setDaKhoaNhanDon(false);
                    vi.setThoiDiemPhatSinhNo(null);
                    shipperRepo.findById(p.getMaShipper()).ifPresent(s -> {
                        s.setTrangThaiNhanDon("SanSang");
                        shipperRepo.save(s);
                    });
                }
                viRepo.save(vi);
            });
            p.setTrangThai("DaThuHoiNo");
            return ResponseEntity.ok(phieuRepo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/shipper/{maDoiSoat}/chot-phieu")
    @Transactional
    public ResponseEntity<?> chotPhieu(@PathVariable String maDoiSoat) {
        return phieuRepo.findById(maDoiSoat).map(p -> {
            p.setTrangThai("DaKhoaSo");
            return ResponseEntity.ok(phieuRepo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/chot-quy")
    public List<BienBanChotQuy> listChotQuy() {
        return chotQuyRepo.findAllByOrderByNgayChotDesc();
    }

    @PostMapping("/chot-quy")
    @Transactional
    public BienBanChotQuy chotQuy(@RequestBody ChotQuyRequest req) {
        BienBanChotQuy bb = new BienBanChotQuy();
        bb.setMaBienBanQuy("BBQ-" + System.currentTimeMillis());
        bb.setMaBuuCuc(req.maBuuCuc() != null ? req.maBuuCuc() : "BC_BENNGHE");
        bb.setMaNhanVienQuayLap(req.maNhanVienQuayLap() != null ? req.maNhanVienQuayLap() : "NV_QUAY_01");
        BigDecimal cuocQuay = req.tienCuocQuay() != null ? req.tienCuocQuay() : BigDecimal.ZERO;
        BigDecimal shipperNop = req.tienShipperNop() != null ? req.tienShipperNop() : BigDecimal.ZERO;
        BigDecimal soSach = cuocQuay.add(shipperNop);
        BigDecimal thucKe = req.tienThucKiemKe() != null ? req.tienThucKiemKe() : soSach;
        bb.setTienCuocQuay(cuocQuay);
        bb.setTienShipperNop(shipperNop);
        bb.setTongTienSoSach(soSach);
        bb.setTienThucKiemKe(thucKe);
        bb.setChenhLech(thucKe.subtract(soSach));
        bb.setLyDoChenhLech(req.lyDoChenhLech());
        bb.setDaKhoaSo(true);
        BienBanChotQuy saved = chotQuyRepo.save(bb);

        buuCucRepo.findById(bb.getMaBuuCuc()).ifPresent(bc -> {
            BigDecimal current = bc.getSoDuQuyKet() != null ? bc.getSoDuQuyKet() : BigDecimal.ZERO;
            bc.setSoDuQuyKet(current.add(thucKe));
            buuCucRepo.save(bc);
        });
        return saved;
    }

    // UC 7.2: Cảnh báo tồn kho > 24h & đơn trễ cam kết SLA > 48h
    @GetMapping("/canh-bao-sla")
    public Map<String, Object> getSlaAlerts() {
        LocalDateTime now = LocalDateTime.now();
        List<DonHang> all = donHangRepo.findAllByOrderByNgayTaoDesc();

        List<Map<String, Object>> tonKhoQua24h = new ArrayList<>();
        List<Map<String, Object>> treSlaQua48h = new ArrayList<>();
        List<DonHang> donSuCo = new ArrayList<>();

        Set<String> closedStates = Set.of("DaGiaoThanhCong", "DaQuyetToanCOD", "DaChuyenHoan", "DaBoiThuong", "DaHuy");
        Set<String> inStockStates = Set.of("DaNhapKho", "SanSangGiao", "ChoLuanChuyenHub", "TamGiuChoXuLy");

        for (DonHang dh : all) {
            if ("TamGiuChoXuLy".equals(dh.getTrangThai()) || "ChoChuyenHoan".equals(dh.getTrangThai())) {
                donSuCo.add(dh);
            }
            if (dh.getNgayTao() == null || closedStates.contains(dh.getTrangThai())) continue;

            long hours = Duration.between(dh.getNgayTao(), now).toHours();
            if (inStockStates.contains(dh.getTrangThai()) && hours >= 24) {
                tonKhoQua24h.add(Map.of(
                        "maVanDon", dh.getMaVanDon(),
                        "maBuuCucHienTai", dh.getMaBuuCucHienTai() != null ? dh.getMaBuuCucHienTai() : "",
                        "trangThai", dh.getTrangThai(),
                        "soGioTon", hours,
                        "nguoiNhanTen", dh.getNguoiNhanTen()
                ));
            }
            long slaHours = "GDV_HOATOC".equals(dh.getMaGoiDichVu()) ? 12 : 48;
            if (hours >= slaHours) {
                treSlaQua48h.add(Map.of(
                        "maVanDon", dh.getMaVanDon(),
                        "maShipper", dh.getMaShipper() != null ? dh.getMaShipper() : "Chưa gán",
                        "maGoiDichVu", dh.getMaGoiDichVu(),
                        "trangThai", dh.getTrangThai(),
                        "soGioTre", hours - slaHours,
                        "nguoiNhanTen", dh.getNguoiNhanTen()
                ));
            }
        }

        return Map.of(
                "tonKhoQua24h", tonKhoQua24h,
                "treSlaQua48h", treSlaQua48h,
                "donSuCo", donSuCo
        );
    }

    @PostMapping("/canh-bao-sla/{maVanDon}/uu-tien")
    @Transactional
    public ResponseEntity<?> prioritizeOrder(@PathVariable String maVanDon, @RequestBody(required = false) Map<String, String> body) {
        return donHangRepo.findById(maVanDon).map(dh -> {
            String shipperId = body != null && body.get("maShipper") != null ? body.get("maShipper") : "NV_SHIP_01";
            dh.setMaShipper(shipperId);
            if ("DaNhapKho".equals(dh.getTrangThai()) || "ChoGiaoLai".equals(dh.getTrangThai())) {
                dh.setTrangThai("SanSangGiao");
            }
            donHangRepo.save(dh);

            LichSuHanhTrinh ls = new LichSuHanhTrinh();
            ls.setMaHanhTrinh("HT-" + UUID.randomUUID().toString().substring(0, 8));
            ls.setMaVanDon(maVanDon);
            ls.setMaBuuCuc(dh.getMaBuuCucHienTai());
            ls.setMaNhanVienThucHien("NV_ADMIN_01");
            ls.setThoiGian(LocalDateTime.now());
            ls.setTrangThaiGhiNhan(dh.getTrangThai());
            ls.setMoTaChiTiet("Quản lý can thiệp cảnh báo SLA: Điều phối ưu tiên giao ngay cho " + shipperId);
            lichSuRepo.save(ls);
            return ResponseEntity.ok(dh);
        }).orElse(ResponseEntity.notFound().build());
    }

    // UC 7.3: Tổng hợp KPI nhân sự tự động từ dữ liệu đơn hàng thực tế
    @PostMapping("/kpi/tong-hop")
    @Transactional
    public List<DanhGiaKpi> calculateAllKpi() {
        String ky = LocalDate.now().toString().substring(0, 7); // YYYY-MM
        List<Shipper> shippers = shipperRepo.findAll();
        List<DanhGiaKpi> savedList = new ArrayList<>();

        for (Shipper sp : shippers) {
            List<DonHang> orders = donHangRepo.findByMaShipperOrderByNgayTaoDesc(sp.getMaNhanVien());
            int total = orders.size();
            long success = orders.stream()
                    .filter(o -> "DaGiaoThanhCong".equals(o.getTrangThai()) || "DaQuyetToanCOD".equals(o.getTrangThai()))
                    .count();
            long onTime = orders.stream()
                    .filter(o -> ("DaGiaoThanhCong".equals(o.getTrangThai()) || "DaQuyetToanCOD".equals(o.getTrangThai()))
                            && o.getSoLanGiaoThatBai() == 0)
                    .count();

            double successRate = total == 0 ? 100.0 : Math.round((success * 1000.0) / total) / 10.0;
            double slaRate = success == 0 ? 100.0 : Math.round((onTime * 1000.0) / success) / 10.0;
            int avgPerDay = Math.max(1, total);
            double score = Math.round((successRate * 0.6 + slaRate * 0.4) * 10.0) / 10.0;
            String rank = score >= 90 ? "A" : (score >= 85 ? "B" : "C");

            sp.setTiLeGiaoThanhCong(successRate);
            shipperRepo.save(sp);

            DanhGiaKpi kpi = new DanhGiaKpi();
            kpi.setMaKpi("KPI_" + sp.getMaNhanVien() + "_" + ky.replace("-", ""));
            kpi.setMaShipper(sp.getMaNhanVien());
            kpi.setKyDanhGia(ky);
            kpi.setTyLeGiaoThanhCong(successRate);
            kpi.setTyLeDungHenSla(slaRate);
            kpi.setSanLuongDonBinhQuan(avgPerDay);
            kpi.setDiemTongKet(score);
            kpi.setXepLoai(rank);
            savedList.add(kpiRepo.save(kpi));
        }
        return savedList;
    }

    @GetMapping("/kpi/xuat-csv")
    public ResponseEntity<byte[]> exportKpiCsv() {
        StringBuilder sb = new StringBuilder("\uFEFFMaKPI,MaShipper,KyDanhGia,TyLeGiaoThanhCong(%),TyLeDungHenSLA(%),SanLuongTB,DiemTongKet,XepLoai\n");
        for (DanhGiaKpi k : kpiRepo.findAll()) {
            sb.append(String.format("%s,%s,%s,%.1f,%.1f,%d,%.1f,%s\n",
                    k.getMaKpi(), k.getMaShipper(), k.getKyDanhGia(),
                    k.getTyLeGiaoThanhCong(), k.getTyLeDungHenSla(),
                    k.getSanLuongDonBinhQuan(), k.getDiemTongKet(), k.getXepLoai()));
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bang_diem_kpi_shipper.csv\"")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(sb.toString().getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/bao-cao-sla")
    public Map<String, Object> getSlaReport() {
        return Map.of(
                "kpiList", kpiRepo.findAll(),
                "shippers", shipperRepo.findAll()
        );
    }
}

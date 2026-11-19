package com.fastpost.controller;

import com.fastpost.entity.*;
import com.fastpost.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/kho")
public class KhoGiaoVanController {
    private final PhieuXuatKhoRepository phieuXuatRepo;
    private final ChiTietPhieuXuatRepository ctPhieuXuatRepo;
    private final DonHangRepository donHangRepo;
    private final LichSuHanhTrinhRepository lichSuRepo;
    private final TuyenGiaoHangRepository tuyenRepo;
    private final TieuTuyenRepository tieuTuyenRepo;
    private final ChiTietTieuTuyenRepository ctTieuTuyenRepo;
    private final BuuCucRepository buuCucRepo;
    private final ViCongNoShipperRepository viRepo;
    private final ShipperRepository shipperRepo;
    private final ThamSoRepository thamSoRepo;

    public KhoGiaoVanController(
            PhieuXuatKhoRepository phieuXuatRepo,
            ChiTietPhieuXuatRepository ctPhieuXuatRepo,
            DonHangRepository donHangRepo,
            LichSuHanhTrinhRepository lichSuRepo,
            TuyenGiaoHangRepository tuyenRepo,
            TieuTuyenRepository tieuTuyenRepo,
            ChiTietTieuTuyenRepository ctTieuTuyenRepo,
            BuuCucRepository buuCucRepo,
            ViCongNoShipperRepository viRepo,
            ShipperRepository shipperRepo,
            ThamSoRepository thamSoRepo) {
        this.phieuXuatRepo = phieuXuatRepo;
        this.ctPhieuXuatRepo = ctPhieuXuatRepo;
        this.donHangRepo = donHangRepo;
        this.lichSuRepo = lichSuRepo;
        this.tuyenRepo = tuyenRepo;
        this.tieuTuyenRepo = tieuTuyenRepo;
        this.ctTieuTuyenRepo = ctTieuTuyenRepo;
        this.buuCucRepo = buuCucRepo;
        this.viRepo = viRepo;
        this.shipperRepo = shipperRepo;
        this.thamSoRepo = thamSoRepo;
    }

    @GetMapping("/buu-cuc")
    public List<BuuCuc> listBuuCuc() {
        return buuCucRepo.findAll();
    }

    @GetMapping("/don-cho-luan-chuyen")
    public List<DonHang> listDonChoLuanChuyen(@RequestParam String maBuuCuc) {
        return donHangRepo.findByMaBuuCucHienTaiAndTrangThaiOrderByNgayTaoDesc(maBuuCuc, "DaNhapKho");
    }

    public record CreatePhieuXuatRequest(
            String maBuuCuc,
            String maNhanVienKho,
            String maShipper,
            List<String> dsMaVanDon,
            String ghiChu) {}

    public record CreateTieuTuyenRequest(
            String maTuyen,
            String tenTieuTuyen,
            String maShipper,
            String quanHuyen,
            String phuongXa) {}

    // 1. Xuất kho bàn giao Shipper
    @GetMapping("/phieu-xuat")
    public List<PhieuXuatKho> listPhieuXuat(@RequestParam(required = false) String maShipper) {
        if (maShipper != null && !maShipper.isBlank()) {
            return phieuXuatRepo.findByMaShipperOrderByThoiGianXuatDesc(maShipper);
        }
        return phieuXuatRepo.findAllByOrderByThoiGianXuatDesc();
    }

    @GetMapping("/phieu-xuat/{maPhieuXuat}")
    public ResponseEntity<?> getPhieuXuatDetail(@PathVariable String maPhieuXuat) {
        return phieuXuatRepo.findById(maPhieuXuat)
                .map(px -> ResponseEntity.ok(Map.of(
                        "phieuXuat", px,
                        "chiTiet", ctPhieuXuatRepo.findByMaPhieuXuat(maPhieuXuat)
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/phieu-xuat")
    @Transactional
    public ResponseEntity<?> createPhieuXuat(@RequestBody CreatePhieuXuatRequest req) {
        List<String> codes = req.dsMaVanDon() != null ? req.dsMaVanDon() : List.of();
        if (codes.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Danh sách đơn xuất kho không được trống"));
        }

        String shipperId = req.maShipper() != null ? req.maShipper() : "NV_SHIP_01";
        BigDecimal debtLimit = thamSoRepo.findById("HAN_MUC_NO_SHIPPER")
                .map(t -> new BigDecimal(t.getGiaTri()))
                .orElse(BigDecimal.valueOf(3_000_000));

        // UC 5.1 branch 4a & UC 6.2: Kiểm tra công nợ Shipper (> 3tr hoặc nợ quá 24h hoặc đang khóa nhận đơn)
        Optional<ViCongNoShipper> viOpt = viRepo.findByMaShipper(shipperId);
        if (viOpt.isPresent()) {
            ViCongNoShipper vi = viOpt.get();
            boolean over24h = vi.getTongNoLuyKe().compareTo(BigDecimal.ZERO) > 0
                    && vi.getThoiDiemPhatSinhNo() != null
                    && vi.getThoiDiemPhatSinhNo().isBefore(LocalDateTime.now().minusHours(24));
            boolean overLimit = vi.getTongNoLuyKe().compareTo(debtLimit) >= 0;
            if (Boolean.TRUE.equals(vi.getDaKhoaNhanDon()) || overLimit || over24h) {
                vi.setDaKhoaNhanDon(true);
                viRepo.save(vi);
                shipperRepo.findById(shipperId).ifPresent(s -> {
                    s.setTrangThaiNhanDon("KhoaTamThoi");
                    shipperRepo.save(s);
                });
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Từ chối bàn giao: Shipper " + shipperId + " đang bị khóa nhận đơn do vi phạm công nợ COD (" + vi.getTongNoLuyKe() + "đ)"));
            }
        }

        // UC 4.4 branch 5b: Chỉ cho phép xuất kho đơn đang DaNhapKho hoặc ChoGiaoLai
        for (String code : codes) {
            Optional<DonHang> dhCheck = donHangRepo.findById(code.trim());
            if (dhCheck.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy vận đơn: " + code.trim()));
            }
            String st = dhCheck.get().getTrangThai();
            if (!"DaNhapKho".equals(st) && !"ChoGiaoLai".equals(st)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Từ chối xuất kho: Đơn " + code.trim() + " đang ở trạng thái " + st + " (chỉ xuất kho đơn đang DaNhapKho hoặc ChoGiaoLai)"));
            }
        }

        String maPhieu = "PXK-" + (10000 + new Random().nextInt(89999));
        BigDecimal totalCod = BigDecimal.ZERO;
        int validCount = 0;

        // Lưu PhieuXuatKho trước để thỏa khóa ngoại FK từ chi_tiet_phieu_xuat -> phieu_xuat_kho
        PhieuXuatKho px = new PhieuXuatKho();
        px.setMaPhieuXuat(maPhieu);
        px.setMaBuuCuc(req.maBuuCuc() != null ? req.maBuuCuc() : "BC_BENNGHE");
        px.setMaNhanVienKho(req.maNhanVienKho() != null ? req.maNhanVienKho() : "NV_ADMIN_01");
        px.setMaShipper(shipperId);
        px.setTongSoDon(0);
        px.setTongTienCodPhaiThu(BigDecimal.ZERO);
        px.setShipperDaXacNhan(false);
        phieuXuatRepo.saveAndFlush(px);

        for (String code : codes) {
            Optional<DonHang> dhOpt = donHangRepo.findById(code.trim());
            if (dhOpt.isPresent()) {
                DonHang dh = dhOpt.get();
                totalCod = totalCod.add(dh.getTienCod() != null ? dh.getTienCod() : BigDecimal.ZERO);
                dh.setMaShipper(shipperId);
                dh.setTrangThai("SanSangGiao");
                donHangRepo.save(dh);

                ChiTietPhieuXuat ct = new ChiTietPhieuXuat();
                ct.setMaPhieuXuat(maPhieu);
                ct.setMaVanDon(dh.getMaVanDon());
                ct.setGhiChuBanGiao(req.ghiChu());
                ctPhieuXuatRepo.save(ct);

                addHistory(dh.getMaVanDon(), px.getMaBuuCuc(), px.getMaNhanVienKho(), "SanSangGiao",
                        "Đã lập phiếu xuất kho " + maPhieu + " bàn giao cho Shipper " + shipperId);
                validCount++;
            }
        }

        px.setTongSoDon(validCount);
        px.setTongTienCodPhaiThu(totalCod);
        return ResponseEntity.ok(phieuXuatRepo.save(px));
    }

    @PostMapping("/phieu-xuat/{maPhieuXuat}/xac-nhan")
    @Transactional
    public ResponseEntity<?> shipperConfirmPhieuXuat(@PathVariable String maPhieuXuat) {
        return phieuXuatRepo.findById(maPhieuXuat).map(px -> {
            if (Boolean.TRUE.equals(px.getShipperDaXacNhan())) {
                return ResponseEntity.ok(px);
            }
            px.setShipperDaXacNhan(true);
            phieuXuatRepo.save(px);

            List<ChiTietPhieuXuat> items = ctPhieuXuatRepo.findByMaPhieuXuat(maPhieuXuat);
            for (ChiTietPhieuXuat item : items) {
                donHangRepo.findById(item.getMaVanDon()).ifPresent(dh -> {
                    if ("SanSangGiao".equals(dh.getTrangThai())) {
                        dh.setTrangThai("DangGiaoHang");
                        donHangRepo.save(dh);
                        addHistory(dh.getMaVanDon(), px.getMaBuuCuc(), px.getMaShipper(), "DangGiaoHang",
                                "Shipper đã xác nhận nhận hàng từ phiếu xuất " + maPhieuXuat + " và bắt đầu đi giao");
                    }
                });
            }
            return ResponseEntity.ok(px);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 2. Quản lý Tuyến & Tiểu tuyến
    @GetMapping("/tuyen")
    public Map<String, Object> listRoutes() {
        return Map.of(
                "tuyenList", tuyenRepo.findAll(),
                "tieuTuyenList", tieuTuyenRepo.findAll(),
                "chiTietDiaBan", ctTieuTuyenRepo.findAll()
        );
    }

    @PostMapping("/tieu-tuyen")
    @Transactional
    public Map<String, Object> createSubRoute(@RequestBody CreateTieuTuyenRequest req) {
        String maTuyen = req.maTuyen() != null && !req.maTuyen().isBlank() ? req.maTuyen() : "TUYEN_Q1";
        if (tuyenRepo.findById(maTuyen).isEmpty()) {
            TuyenGiaoHang t = new TuyenGiaoHang();
            t.setMaTuyen(maTuyen);
            t.setMaBuuCuc("BC_BENNGHE");
            t.setTenTuyen("Tuyến " + req.quanHuyen());
            t.setLoaiTuyen("NoiThanh");
            tuyenRepo.saveAndFlush(t);
        }

        TieuTuyen tt = new TieuTuyen();
        tt.setMaTieuTuyen("TT-" + (100 + new Random().nextInt(899)));
        tt.setMaTuyen(maTuyen);
        tt.setMaShipper(req.maShipper());
        tt.setTenTieuTuyen(req.tenTieuTuyen());
        tieuTuyenRepo.saveAndFlush(tt);

        ChiTietTieuTuyen ct = new ChiTietTieuTuyen();
        ct.setMaTieuTuyen(tt.getMaTieuTuyen());
        ct.setQuanHuyen(req.quanHuyen());
        ct.setPhuongXa(req.phuongXa());
        ctTieuTuyenRepo.save(ct);

        return Map.of("tieuTuyen", tt, "diaBan", ct);
    }

    private void addHistory(String maVanDon, String maBuuCuc, String maNv, String trangThai, String moTa) {
        LichSuHanhTrinh ls = new LichSuHanhTrinh();
        ls.setMaHanhTrinh("HT-" + UUID.randomUUID().toString().substring(0, 8));
        ls.setMaVanDon(maVanDon);
        ls.setMaBuuCuc(maBuuCuc);
        ls.setMaNhanVienThucHien(maNv);
        ls.setThoiGian(LocalDateTime.now());
        ls.setTrangThaiGhiNhan(trangThai);
        ls.setMoTaChiTiet(moTa);
        lichSuRepo.save(ls);
    }
}

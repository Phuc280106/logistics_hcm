package com.fastpost.controller;

import com.fastpost.entity.*;
import com.fastpost.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/don-hang")
public class DonHangController {
    private final DonHangRepository donHangRepo;
    private final LichSuHanhTrinhRepository lichSuRepo;
    private final BangChungGiaoHangRepository podRepo;
    private final GiaoDichVietQrRepository qrRepo;
    private final LichHenGiaoLaiRepository lichHenRepo;
    private final ChiTietTieuTuyenRepository ctTieuTuyenRepo;
    private final TieuTuyenRepository tieuTuyenRepo;
    private final ThamSoRepository thamSoRepo;
    private final BangGiaCuocRepository bangGiaRepo;
    private final ChiTietBangGiaRepository ctBangGiaRepo;

    public DonHangController(
            DonHangRepository donHangRepo,
            LichSuHanhTrinhRepository lichSuRepo,
            BangChungGiaoHangRepository podRepo,
            GiaoDichVietQrRepository qrRepo,
            LichHenGiaoLaiRepository lichHenRepo,
            ChiTietTieuTuyenRepository ctTieuTuyenRepo,
            TieuTuyenRepository tieuTuyenRepo,
            ThamSoRepository thamSoRepo,
            BangGiaCuocRepository bangGiaRepo,
            ChiTietBangGiaRepository ctBangGiaRepo) {
        this.donHangRepo = donHangRepo;
        this.lichSuRepo = lichSuRepo;
        this.podRepo = podRepo;
        this.qrRepo = qrRepo;
        this.lichHenRepo = lichHenRepo;
        this.ctTieuTuyenRepo = ctTieuTuyenRepo;
        this.tieuTuyenRepo = tieuTuyenRepo;
        this.thamSoRepo = thamSoRepo;
        this.bangGiaRepo = bangGiaRepo;
        this.ctBangGiaRepo = ctBangGiaRepo;
    }

    public record FeeCalcRequest(
            String maGoiDichVu,
            Double trongLuongThuc,
            Double chieuDai,
            Double chieuRong,
            Double chieuCao,
            Boolean laHangDeVo,
            BigDecimal tienCod) {}

    public record CreateOrderRequest(
            String nguoiGuiSdt,
            String nguoiNhanTen,
            String nguoiNhanSdt,
            String diaChiGiaoChiTiet,
            String phuongXaGiao,
            String quanHuyenGiao,
            String maGoiDichVu,
            Double trongLuongThuc,
            Double chieuDai,
            Double chieuRong,
            Double chieuCao,
            Boolean laHangDeVo,
            BigDecimal tienCod,
            String nguoiTraCuoc,
            String hinhThucThanhToan,
            Boolean taiQuay) {}

    public record PodRequest(String anhChupGoiHang, String toaDoGps, String tenNguoiKy, String maNhanVien) {}
    public record FailDeliveryRequest(String lyDoThatBai, String ngayHenGiaoLai, String ghiChu, String maNhanVien) {}

    @GetMapping
    public List<DonHang> listAll(@RequestParam(required = false) String shipper,
                                 @RequestParam(required = false) String status) {
        if (shipper != null && !shipper.isBlank()) {
            return donHangRepo.findByMaShipperOrderByNgayTaoDesc(shipper);
        }
        if (status != null && !status.isBlank()) {
            return donHangRepo.findByTrangThaiOrderByNgayTaoDesc(status);
        }
        return donHangRepo.findAllByOrderByNgayTaoDesc();
    }

    @GetMapping("/{maVanDon}")
    public ResponseEntity<?> getDetail(@PathVariable String maVanDon) {
        return donHangRepo.findById(maVanDon)
                .map(dh -> ResponseEntity.ok(Map.of(
                        "donHang", dh,
                        "hanhTrinh", lichSuRepo.findByMaVanDonOrderByThoiGianAsc(maVanDon),
                        "lichHenGiaoLai", lichHenRepo.findByMaVanDonOrderByLanGiaoThuAsc(maVanDon)
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/tinh-cuoc")
    public Map<String, Object> calculateFee(@RequestBody FeeCalcRequest req) {
        double heSoQuyDoi = thamSoRepo.findById("TS_HESO_QUYDOI")
                .map(ts -> Double.parseDouble(ts.getGiaTri()))
                .orElse(6000.0);

        double weight = req.trongLuongThuc() != null ? req.trongLuongThuc() : 0.5;
        double d = req.chieuDai() != null ? req.chieuDai() : 0;
        double r = req.chieuRong() != null ? req.chieuRong() : 0;
        double c = req.chieuCao() != null ? req.chieuCao() : 0;
        double volWeight = (d * r * c) / heSoQuyDoi;
        double chargeableWeight = Math.max(weight, volWeight);

        String maGoi = req.maGoiDichVu() != null ? req.maGoiDichVu() : "GDV_TIEUCHUAN";
        boolean hoaToc = "GDV_HOATOC".equals(maGoi);

        BigDecimal cuocSan = hoaToc ? BigDecimal.valueOf(35000) : BigDecimal.valueOf(20000);
        double khoiLuongSan = 1.0;
        BigDecimal donGiaVuot = hoaToc ? BigDecimal.valueOf(15000) : BigDecimal.valueOf(10000);
        BigDecimal phuPhiDeVo = BigDecimal.valueOf(3000);
        double tyLeCod = 0.01;

        Optional<BangGiaCuoc> bgOpt = bangGiaRepo.findFirstByDangKichHoatTrueOrderByNgayHieuLucDesc();
        if (bgOpt.isPresent()) {
            Optional<ChiTietBangGia> ctOpt = ctBangGiaRepo.findById(
                    new ChiTietBangGiaId(bgOpt.get().getMaBangGia(), "VT_NOITINH", maGoi));
            if (ctOpt.isPresent()) {
                ChiTietBangGia ct = ctOpt.get();
                cuocSan = ct.getCuocSan();
                khoiLuongSan = ct.getKhoiLuongSanKg();
                donGiaVuot = ct.getDonGiaVuotMoiKg();
                phuPhiDeVo = ct.getPhuPhiDeVo();
                tyLeCod = ct.getTyLePhiCod();
            }
        }

        double vuotKg = Math.max(0, chargeableWeight - khoiLuongSan);
        BigDecimal cuocVuotCan = donGiaVuot.multiply(BigDecimal.valueOf(Math.ceil(vuotKg * 2) / 2.0))
                .setScale(0, RoundingMode.HALF_UP);
        BigDecimal phuPhi = Boolean.TRUE.equals(req.laHangDeVo()) ? phuPhiDeVo : BigDecimal.ZERO;
        BigDecimal cod = req.tienCod() != null ? req.tienCod() : BigDecimal.ZERO;
        BigDecimal phiCod = cod.multiply(BigDecimal.valueOf(tyLeCod)).setScale(0, RoundingMode.HALF_UP);
        BigDecimal tongCuoc = cuocSan.add(cuocVuotCan).add(phuPhi).add(phiCod);

        return Map.of(
                "trongLuongTinhCuoc", Math.round(chargeableWeight * 100.0) / 100.0,
                "cuocSan", cuocSan,
                "cuocVuotCan", cuocVuotCan,
                "phuPhi", phuPhi,
                "phiCod", phiCod,
                "tongCuoc", tongCuoc
        );
    }

    @PostMapping
    @Transactional
    public ResponseEntity<DonHang> createOrder(@RequestBody CreateOrderRequest req) {
        Map<String, Object> fee = calculateFee(new FeeCalcRequest(
                req.maGoiDichVu(), req.trongLuongThuc(), req.chieuDai(), req.chieuRong(),
                req.chieuCao(), req.laHangDeVo(), req.tienCod()));

        // Tự động phân công Shipper theo tiểu tuyến (quận/huyện + phường/xã)
        String assignedShipper = ctTieuTuyenRepo
                .findFirstByQuanHuyenIgnoreCaseAndPhuongXaIgnoreCase(
                        req.quanHuyenGiao() != null ? req.quanHuyenGiao() : "",
                        req.phuongXaGiao() != null ? req.phuongXaGiao() : "")
                .flatMap(ct -> tieuTuyenRepo.findById(ct.getMaTieuTuyen()))
                .map(TieuTuyen::getMaShipper)
                .orElse("NV_SHIP_01");

        DonHang dh = new DonHang();
        String code = "FP-" + (10000 + new Random().nextInt(89999));
        dh.setMaVanDon(code);
        dh.setMaKhachHang("ND_KH_01");
        dh.setMaBuuCucHienTai("BC_BENNGHE");
        dh.setMaShipper(assignedShipper);
        dh.setMaGoiDichVu(req.maGoiDichVu() != null ? req.maGoiDichVu() : "GDV_TIEUCHUAN");
        dh.setMaLoaiHang(Boolean.TRUE.equals(req.laHangDeVo()) ? "LHH_DEVO" : "LHH_THUONG");
        dh.setNguoiGuiSdt(req.nguoiGuiSdt());
        dh.setNguoiNhanTen(req.nguoiNhanTen());
        dh.setNguoiNhanSdt(req.nguoiNhanSdt());
        dh.setDiaChiGiaoChiTiet(req.diaChiGiaoChiTiet());
        dh.setPhuongXaGiao(req.phuongXaGiao());
        dh.setQuanHuyenGiao(req.quanHuyenGiao());
        dh.setTrongLuongThuc(req.trongLuongThuc() != null ? req.trongLuongThuc() : 1.0);
        dh.setChieuDai(req.chieuDai() != null ? req.chieuDai() : 0.0);
        dh.setChieuRong(req.chieuRong() != null ? req.chieuRong() : 0.0);
        dh.setChieuCao(req.chieuCao() != null ? req.chieuCao() : 0.0);
        dh.setTrongLuongTinhCuoc((Double) fee.get("trongLuongTinhCuoc"));
        dh.setLaHangDeVo(Boolean.TRUE.equals(req.laHangDeVo()));
        dh.setTienCod(req.tienCod() != null ? req.tienCod() : BigDecimal.ZERO);
        dh.setNguoiTraCuoc(req.nguoiTraCuoc() != null ? req.nguoiTraCuoc() : "NguoiGui");
        dh.setHinhThucThanhToan(req.hinhThucThanhToan() != null ? req.hinhThucThanhToan() : "TienMat");
        dh.setCuocSan((BigDecimal) fee.get("cuocSan"));
        dh.setCuocVuotCan((BigDecimal) fee.get("cuocVuotCan"));
        dh.setPhuPhi((BigDecimal) fee.get("phuPhi"));
        dh.setPhiCod((BigDecimal) fee.get("phiCod"));
        dh.setTongCuoc((BigDecimal) fee.get("tongCuoc"));
        dh.setTrangThai(Boolean.TRUE.equals(req.taiQuay()) ? "DaNhapKho" : "ChoPhanCongLay");

        donHangRepo.save(dh);
        addHistory(code, "BC_BENNGHE", "NV_QUAY_01", dh.getTrangThai(),
                Boolean.TRUE.equals(req.taiQuay())
                        ? "Tạo đơn tại quầy Bưu cục Bến Nghé (Gán tiểu tuyến: " + assignedShipper + ")"
                        : "Khách hàng đặt đơn Online (Gán tiểu tuyến: " + assignedShipper + ")");
        return ResponseEntity.ok(dh);
    }

    @PostMapping("/{maVanDon}/vietqr")
    @Transactional
    public ResponseEntity<?> createVietQr(@PathVariable String maVanDon) {
        return donHangRepo.findById(maVanDon).map(dh -> {
            GiaoDichVietQr qr = new GiaoDichVietQr();
            qr.setMaGiaoDichQr("QR-" + System.currentTimeMillis());
            qr.setMaVanDon(maVanDon);
            qr.setSoTien(dh.getTongCuoc());
            qr.setNoiDungChuyenKhoan("FASTPOST " + maVanDon);
            qr.setTrangThai("ChoThanhToan");
            qrRepo.save(qr);
            String qrUrl = "https://img.vietqr.io/image/VCB-0071001234567-compact2.png?amount="
                    + dh.getTongCuoc().longValue()
                    + "&addInfo=" + ("FASTPOST+" + maVanDon);
            return ResponseEntity.ok(Map.of("giaoDich", qr, "qrUrl", qrUrl));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/vietqr/{maGiaoDichQr}/xac-nhan")
    @Transactional
    public ResponseEntity<?> confirmVietQr(@PathVariable String maGiaoDichQr) {
        return qrRepo.findById(maGiaoDichQr).map(qr -> {
            qr.setTrangThai("DaThanhToan");
            qr.setThoiGianXacNhan(LocalDateTime.now());
            qr.setMaGiaoDichNganHang("VCB" + System.currentTimeMillis());
            qrRepo.save(qr);
            return ResponseEntity.ok(qr);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{maVanDon}/giao-thanh-cong")
    @Transactional
    public ResponseEntity<?> confirmDelivery(@PathVariable String maVanDon, @RequestBody PodRequest req) {
        return donHangRepo.findById(maVanDon).map(dh -> {
            dh.setTrangThai("DaGiaoThanhCong");
            donHangRepo.save(dh);

            BangChungGiaoHang pod = new BangChungGiaoHang();
            pod.setMaPod("POD-" + System.currentTimeMillis());
            pod.setMaVanDon(maVanDon);
            pod.setAnhChupGoiHang(req.anhChupGoiHang() != null ? req.anhChupGoiHang() : "pod-demo.jpg");
            pod.setToaDoGps(req.toaDoGps() != null ? req.toaDoGps() : "10.7745,106.7035");
            pod.setTenNguoiKy(req.tenNguoiKy() != null ? req.tenNguoiKy() : dh.getNguoiNhanTen());
            podRepo.save(pod);

            addHistory(maVanDon, dh.getMaBuuCucHienTai(), req.maNhanVien(), "DaGiaoThanhCong",
                    "Giao hàng thành công cho " + pod.getTenNguoiKy());
            return ResponseEntity.ok(dh);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{maVanDon}/giao-that-bai")
    @Transactional
    public ResponseEntity<?> failDelivery(@PathVariable String maVanDon, @RequestBody FailDeliveryRequest req) {
        return donHangRepo.findById(maVanDon).map(dh -> {
            int fails = dh.getSoLanGiaoThatBai() + 1;
            dh.setSoLanGiaoThatBai(fails);
            dh.setTrangThai(fails >= 3 ? "ChoChuyenHoan" : "ChoGiaoLai");
            donHangRepo.save(dh);

            LichHenGiaoLai lh = new LichHenGiaoLai();
            lh.setMaLichHen("LH-" + System.currentTimeMillis());
            lh.setMaVanDon(maVanDon);
            lh.setLanGiaoThu(fails);
            lh.setLyDoThatBai(req.lyDoThatBai() != null ? req.lyDoThatBai() : "Khách không nghe máy");
            if (req.ngayHenGiaoLai() != null && !req.ngayHenGiaoLai().isBlank()) {
                try {
                    lh.setNgayHenGiaoLai(LocalDateTime.parse(req.ngayHenGiaoLai()));
                } catch (Exception ignored) {
                    lh.setNgayHenGiaoLai(LocalDateTime.now().plusDays(1));
                }
            } else {
                lh.setNgayHenGiaoLai(LocalDateTime.now().plusDays(1));
            }
            lh.setGhiChu(req.ghiChu());
            lichHenRepo.save(lh);

            addHistory(maVanDon, dh.getMaBuuCucHienTai(), req.maNhanVien(), dh.getTrangThai(),
                    "Giao thất bại lần " + fails + ": " + lh.getLyDoThatBai()
                            + (fails >= 3 ? " (Chuyển sang Chờ chuyển hoàn)" : " (Đã tạo lịch hẹn giao lại)"));
            return ResponseEntity.ok(dh);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{maVanDon}/xac-nhan-hoan")
    @Transactional
    public ResponseEntity<?> confirmReturn(@PathVariable String maVanDon) {
        return donHangRepo.findById(maVanDon).map(dh -> {
            dh.setTrangThai("DaChuyenHoan");
            donHangRepo.save(dh);
            addHistory(maVanDon, dh.getMaBuuCucHienTai(), "NV_ADMIN_01", "DaChuyenHoan",
                    "Đã hoàn trả đơn hàng về cho người gửi thành công");
            return ResponseEntity.ok(dh);
        }).orElse(ResponseEntity.notFound().build());
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

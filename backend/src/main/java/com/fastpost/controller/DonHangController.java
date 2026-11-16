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

    public DonHangController(
            DonHangRepository donHangRepo,
            LichSuHanhTrinhRepository lichSuRepo,
            BangChungGiaoHangRepository podRepo,
            GiaoDichVietQrRepository qrRepo) {
        this.donHangRepo = donHangRepo;
        this.lichSuRepo = lichSuRepo;
        this.podRepo = podRepo;
        this.qrRepo = qrRepo;
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
    public record FailDeliveryRequest(String lyDoThatBai, String maNhanVien) {}

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
                        "hanhTrinh", lichSuRepo.findByMaVanDonOrderByThoiGianAsc(maVanDon)
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/tinh-cuoc")
    public Map<String, Object> calculateFee(@RequestBody FeeCalcRequest req) {
        double weight = req.trongLuongThuc() != null ? req.trongLuongThuc() : 0.5;
        double d = req.chieuDai() != null ? req.chieuDai() : 0;
        double r = req.chieuRong() != null ? req.chieuRong() : 0;
        double c = req.chieuCao() != null ? req.chieuCao() : 0;
        double volWeight = (d * r * c) / 6000.0;
        double chargeableWeight = Math.max(weight, volWeight);

        boolean hoaToc = "GDV_HOATOC".equals(req.maGoiDichVu());
        BigDecimal cuocSan = hoaToc ? BigDecimal.valueOf(35000) : BigDecimal.valueOf(20000);
        BigDecimal donGiaVuot = hoaToc ? BigDecimal.valueOf(15000) : BigDecimal.valueOf(10000);

        double vuotKg = Math.max(0, chargeableWeight - 1.0);
        BigDecimal cuocVuotCan = donGiaVuot.multiply(BigDecimal.valueOf(Math.ceil(vuotKg * 2) / 2.0))
                .setScale(0, RoundingMode.HALF_UP);
        BigDecimal phuPhi = Boolean.TRUE.equals(req.laHangDeVo()) ? BigDecimal.valueOf(3000) : BigDecimal.ZERO;
        BigDecimal cod = req.tienCod() != null ? req.tienCod() : BigDecimal.ZERO;
        BigDecimal phiCod = cod.multiply(BigDecimal.valueOf(0.01)).setScale(0, RoundingMode.HALF_UP);
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

        DonHang dh = new DonHang();
        String code = "FP-" + (10000 + new Random().nextInt(89999));
        dh.setMaVanDon(code);
        dh.setMaKhachHang("ND_KH_01");
        dh.setMaBuuCucHienTai("BC_BENNGHE");
        dh.setMaShipper("NV_SHIP_01");
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
                        ? "Tạo đơn tại quầy Bưu cục Bến Nghé"
                        : "Khách hàng đặt đơn Online");
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

            addHistory(maVanDon, dh.getMaBuuCucHienTai(), req.maNhanVien(), dh.getTrangThai(),
                    "Giao thất bại lần " + fails + ": " + req.lyDoThatBai());
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

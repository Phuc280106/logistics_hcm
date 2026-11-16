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
@RequestMapping("/api/tai-chinh")
public class TaiChinhController {
    private final ThamSoRepository thamSoRepo;
    private final BangGiaCuocRepository bangGiaRepo;
    private final ChiTietBangGiaRepository ctBangGiaRepo;
    private final KyQuyetToanCodRepository kyRepo;
    private final BangKeQuyetToanShopRepository bangKeRepo;
    private final BaoCaoDoanhThuRepository baoCaoRepo;
    private final DonHangRepository donHangRepo;

    public TaiChinhController(
            ThamSoRepository thamSoRepo,
            BangGiaCuocRepository bangGiaRepo,
            ChiTietBangGiaRepository ctBangGiaRepo,
            KyQuyetToanCodRepository kyRepo,
            BangKeQuyetToanShopRepository bangKeRepo,
            BaoCaoDoanhThuRepository baoCaoRepo,
            DonHangRepository donHangRepo) {
        this.thamSoRepo = thamSoRepo;
        this.bangGiaRepo = bangGiaRepo;
        this.ctBangGiaRepo = ctBangGiaRepo;
        this.kyRepo = kyRepo;
        this.bangKeRepo = bangKeRepo;
        this.baoCaoRepo = baoCaoRepo;
        this.donHangRepo = donHangRepo;
    }

    public record UpdateThamSoRequest(String giaTri) {}
    public record UpdateBangGiaRequest(String maBangGia, String maVungTuyen, String maGoiDichVu,
                                       BigDecimal cuocSan, Double khoiLuongSanKg, BigDecimal donGiaVuotMoiKg,
                                       BigDecimal phuPhiDeVo, Double tyLePhiCod) {}
    public record CreateKyRequest(String maQuanLyLap, String loaiKyThanhToan) {}
    public record PayBangKeRequest(String maGiaoDichNganHang) {}
    public record CreateBaoCaoRequest(String maBuuCuc) {}

    // 1. Tham số hệ thống
    @GetMapping("/tham-so")
    public List<ThamSo> listThamSo() {
        return thamSoRepo.findAll();
    }

    @PutMapping("/tham-so/{maThamSo}")
    @Transactional
    public ResponseEntity<?> updateThamSo(@PathVariable String maThamSo, @RequestBody UpdateThamSoRequest req) {
        return thamSoRepo.findById(maThamSo).map(ts -> {
            ts.setGiaTri(req.giaTri());
            return ResponseEntity.ok(thamSoRepo.save(ts));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 2. Bảng giá cước
    @GetMapping("/bang-gia")
    public Map<String, Object> getActiveBangGia() {
        Optional<BangGiaCuoc> bgOpt = bangGiaRepo.findFirstByDangKichHoatTrueOrderByNgayHieuLucDesc();
        if (bgOpt.isEmpty()) {
            return Map.of("bangGia", null, "chiTiet", List.of());
        }
        BangGiaCuoc bg = bgOpt.get();
        return Map.of(
                "bangGia", bg,
                "chiTiet", ctBangGiaRepo.findByMaBangGia(bg.getMaBangGia())
        );
    }

    @PutMapping("/bang-gia")
    @Transactional
    public ResponseEntity<?> updateChiTietBangGia(@RequestBody UpdateBangGiaRequest req) {
        ChiTietBangGiaId id = new ChiTietBangGiaId(req.maBangGia(), req.maVungTuyen(), req.maGoiDichVu());
        return ctBangGiaRepo.findById(id).map(ct -> {
            if (req.cuocSan() != null) ct.setCuocSan(req.cuocSan());
            if (req.khoiLuongSanKg() != null) ct.setKhoiLuongSanKg(req.khoiLuongSanKg());
            if (req.donGiaVuotMoiKg() != null) ct.setDonGiaVuotMoiKg(req.donGiaVuotMoiKg());
            if (req.phuPhiDeVo() != null) ct.setPhuPhiDeVo(req.phuPhiDeVo());
            if (req.tyLePhiCod() != null) ct.setTyLePhiCod(req.tyLePhiCod());
            return ResponseEntity.ok(ctBangGiaRepo.save(ct));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 3. Quyết toán COD Shop
    @GetMapping("/ky-quyet-toan")
    public List<KyQuyetToanCod> listKy() {
        return kyRepo.findAllByOrderByTuNgayDesc();
    }

    @GetMapping("/ky-quyet-toan/{maKy}/bang-ke")
    public List<BangKeQuyetToanShop> listBangKeByKy(@PathVariable String maKy) {
        return bangKeRepo.findByMaKy(maKy);
    }

    @PostMapping("/ky-quyet-toan")
    @Transactional
    public Map<String, Object> createKyQuyetToan(@RequestBody CreateKyRequest req) {
        KyQuyetToanCod ky = new KyQuyetToanCod();
        ky.setMaKy("KY-" + System.currentTimeMillis());
        ky.setMaQuanLyLap(req.maQuanLyLap() != null ? req.maQuanLyLap() : "NV_ADMIN_01");
        ky.setLoaiKyThanhToan(req.loaiKyThanhToan() != null ? req.loaiKyThanhToan() : "Tuan");
        ky.setTuNgay(LocalDateTime.now().minusDays(7));
        ky.setDenNgay(LocalDateTime.now());
        ky.setTrangThai("DangXuLy");
        kyRepo.save(ky);

        List<DonHang> delivered = donHangRepo.findByTrangThaiOrderByNgayTaoDesc("DaGiaoThanhCong");
        Map<String, List<DonHang>> byShop = new HashMap<>();
        for (DonHang dh : delivered) {
            byShop.computeIfAbsent(dh.getMaKhachHang(), k -> new ArrayList<>()).add(dh);
        }

        List<BangKeQuyetToanShop> bangKeList = new ArrayList<>();
        for (Map.Entry<String, List<DonHang>> entry : byShop.entrySet()) {
            BigDecimal sumCod = BigDecimal.ZERO;
            BigDecimal sumCuoc = BigDecimal.ZERO;
            for (DonHang dh : entry.getValue()) {
                sumCod = sumCod.add(dh.getTienCod() != null ? dh.getTienCod() : BigDecimal.ZERO);
                sumCuoc = sumCuoc.add(dh.getTongCuoc() != null ? dh.getTongCuoc() : BigDecimal.ZERO);
            }
            BangKeQuyetToanShop bk = new BangKeQuyetToanShop();
            bk.setMaBangKe("BK-" + entry.getKey() + "-" + (100 + new Random().nextInt(899)));
            bk.setMaKy(ky.getMaKy());
            bk.setMaKhachHang(entry.getKey());
            bk.setTongCod(sumCod);
            bk.setTongCuocTru(sumCuoc);
            bk.setThucTra(sumCod.subtract(sumCuoc));
            bk.setTrangThaiThanhToan("ChoThanhToan");
            bangKeRepo.save(bk);
            bangKeList.add(bk);
        }
        return Map.of("ky", ky, "bangKeList", bangKeList);
    }

    @PostMapping("/bang-ke/{maBangKe}/thanh-toan")
    @Transactional
    public ResponseEntity<?> payBangKe(@PathVariable String maBangKe, @RequestBody PayBangKeRequest req) {
        return bangKeRepo.findById(maBangKe).map(bk -> {
            bk.setTrangThaiThanhToan("DaThanhToan");
            bk.setMaGiaoDichNganHang(req.maGiaoDichNganHang() != null ? req.maGiaoDichNganHang() : "FT" + System.currentTimeMillis());
            return ResponseEntity.ok(bangKeRepo.save(bk));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 4. Báo cáo Doanh thu thật từ bảng don_hang
    @GetMapping("/bao-cao-doanh-thu")
    public List<BaoCaoDoanhThu> listBaoCao() {
        return baoCaoRepo.findAllByOrderByDenNgayDesc();
    }

    @PostMapping("/bao-cao-doanh-thu")
    @Transactional
    public BaoCaoDoanhThu generateBaoCao(@RequestBody CreateBaoCaoRequest req) {
        List<DonHang> all = donHangRepo.findAll();
        BigDecimal doanhThu = BigDecimal.ZERO;
        BigDecimal codTotal = BigDecimal.ZERO;
        int cashCount = 0;
        int qrCount = 0;

        for (DonHang dh : all) {
            doanhThu = doanhThu.add(dh.getTongCuoc() != null ? dh.getTongCuoc() : BigDecimal.ZERO);
            codTotal = codTotal.add(dh.getTienCod() != null ? dh.getTienCod() : BigDecimal.ZERO);
            if ("VietQR".equalsIgnoreCase(dh.getHinhThucThanhToan())) qrCount++;
            else cashCount++;
        }

        int total = all.size();
        double cashPct = total == 0 ? 0.0 : Math.round((cashCount * 1000.0) / total) / 10.0;
        double qrPct = total == 0 ? 0.0 : Math.round((qrCount * 1000.0) / total) / 10.0;

        BaoCaoDoanhThu bc = new BaoCaoDoanhThu();
        bc.setMaBaoCao("BC-" + System.currentTimeMillis());
        bc.setMaBuuCuc(req.maBuuCuc() != null ? req.maBuuCuc() : "BC_BENNGHE");
        bc.setTuNgay(LocalDateTime.now().minusDays(30));
        bc.setDenNgay(LocalDateTime.now());
        bc.setDoanhThuCuoc(doanhThu);
        bc.setTienCodTrungChuyen(codTotal);
        bc.setTongSanLuongDon(total);
        bc.setTyLeTienMat(cashPct);
        bc.setTyLeVietQr(qrPct);
        return baoCaoRepo.save(bc);
    }
}

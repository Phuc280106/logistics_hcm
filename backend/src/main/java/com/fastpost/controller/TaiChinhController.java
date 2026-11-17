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
    private final TaiKhoanNganHangRepository tkNganHangRepo;
    private final LichSuHanhTrinhRepository lichSuRepo;

    public TaiChinhController(
            ThamSoRepository thamSoRepo,
            BangGiaCuocRepository bangGiaRepo,
            ChiTietBangGiaRepository ctBangGiaRepo,
            KyQuyetToanCodRepository kyRepo,
            BangKeQuyetToanShopRepository bangKeRepo,
            BaoCaoDoanhThuRepository baoCaoRepo,
            DonHangRepository donHangRepo,
            TaiKhoanNganHangRepository tkNganHangRepo,
            LichSuHanhTrinhRepository lichSuRepo) {
        this.thamSoRepo = thamSoRepo;
        this.bangGiaRepo = bangGiaRepo;
        this.ctBangGiaRepo = ctBangGiaRepo;
        this.kyRepo = kyRepo;
        this.bangKeRepo = bangKeRepo;
        this.baoCaoRepo = baoCaoRepo;
        this.donHangRepo = donHangRepo;
        this.tkNganHangRepo = tkNganHangRepo;
        this.lichSuRepo = lichSuRepo;
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

    // 2. Bảng giá cước (UC 1.4)
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
        // UC 1.4 branch 8a: không cho phép đơn giá hoặc khối lượng âm
        if ((req.cuocSan() != null && req.cuocSan().compareTo(BigDecimal.ZERO) < 0)
                || (req.donGiaVuotMoiKg() != null && req.donGiaVuotMoiKg().compareTo(BigDecimal.ZERO) < 0)
                || (req.khoiLuongSanKg() != null && req.khoiLuongSanKg() <= 0)
                || (req.phuPhiDeVo() != null && req.phuPhiDeVo().compareTo(BigDecimal.ZERO) < 0)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Đơn giá cước và nấc khối lượng phải lớn hơn hoặc bằng 0"));
        }
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

    // 3. Quyết toán COD Shop (UC 6.3)
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
        ky.setLoaiKyThanhToan(req.loaiKyThanhToan() != null ? req.loaiKyThanhToan() : "T2_T4_T6");
        ky.setTuNgay(LocalDateTime.now().minusDays(7));
        ky.setDenNgay(LocalDateTime.now());
        ky.setTrangThai("DangXuLy");
        kyRepo.save(ky);

        List<DonHang> delivered = donHangRepo.findByTrangThaiOrderByNgayTaoDesc("DaGiaoThanhCong");
        Map<String, List<DonHang>> byShop = new LinkedHashMap<>();
        for (DonHang dh : delivered) {
            byShop.computeIfAbsent(dh.getMaKhachHang(), k -> new ArrayList<>()).add(dh);
        }

        List<BangKeQuyetToanShop> bangKeList = new ArrayList<>();
        for (Map.Entry<String, List<DonHang>> entry : byShop.entrySet()) {
            String maKh = entry.getKey();
            BigDecimal sumCod = BigDecimal.ZERO;
            BigDecimal sumCuoc = BigDecimal.ZERO;
            for (DonHang dh : entry.getValue()) {
                sumCod = sumCod.add(dh.getTienCod() != null ? dh.getTienCod() : BigDecimal.ZERO);
                if ("NguoiGui".equalsIgnoreCase(dh.getNguoiTraCuoc())) {
                    sumCuoc = sumCuoc.add(dh.getTongCuoc() != null ? dh.getTongCuoc() : BigDecimal.ZERO);
                }
            }
            BigDecimal thucTra = sumCod.subtract(sumCuoc);

            List<TaiKhoanNganHang> banks = tkNganHangRepo.findByMaKhachHangOrderByLaMacDinhCodDesc(maKh);
            String maTk = banks.isEmpty() ? null : banks.get(0).getMaTkNganHang();

            BangKeQuyetToanShop bk = new BangKeQuyetToanShop();
            bk.setMaBangKe("BK-" + maKh + "-" + (100 + new Random().nextInt(899)));
            bk.setMaKy(ky.getMaKy());
            bk.setMaKhachHang(maKh);
            bk.setMaTaiKhoanNganHang(maTk);
            bk.setTongCod(sumCod);
            bk.setTongCuocTru(sumCuoc);
            bk.setThucTra(thucTra);
            // UC 6.3 branch 3a & 4a
            if (thucTra.compareTo(BigDecimal.ZERO) < 0) {
                bk.setTrangThaiThanhToan("NoCuocKySau");
            } else if (maTk == null) {
                bk.setTrangThaiThanhToan("ChoBoSungTK");
            } else {
                bk.setTrangThaiThanhToan("ChoThanhToan");
            }
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
            BangKeQuyetToanShop saved = bangKeRepo.save(bk);

            // State Diagram DonHang biến cố 22 quyetToanCOD(): DaGiaoThanhCong -> DaQuyetToanCOD
            List<DonHang> shopOrders = donHangRepo.findByMaKhachHangOrderByNgayTaoDesc(bk.getMaKhachHang());
            for (DonHang dh : shopOrders) {
                if ("DaGiaoThanhCong".equals(dh.getTrangThai())) {
                    dh.setTrangThai("DaQuyetToanCOD");
                    donHangRepo.save(dh);

                    LichSuHanhTrinh ls = new LichSuHanhTrinh();
                    ls.setMaHanhTrinh("HT-" + UUID.randomUUID().toString().substring(0, 8));
                    ls.setMaVanDon(dh.getMaVanDon());
                    ls.setMaBuuCuc(dh.getMaBuuCucHienTai());
                    ls.setMaNhanVienThucHien("NV_ADMIN_01");
                    ls.setThoiGian(LocalDateTime.now());
                    ls.setTrangThaiGhiNhan("DaQuyetToanCOD");
                    ls.setMoTaChiTiet("Đã chuyển khoản quyết toán COD về tài khoản Shop (Mã GD: " + saved.getMaGiaoDichNganHang() + ")");
                    lichSuRepo.save(ls);
                }
            }

            // Nếu toàn bộ bảng kê trong kỳ đã xử lý -> đóng kỳ quyết toán
            boolean allDone = bangKeRepo.findByMaKy(bk.getMaKy()).stream()
                    .allMatch(x -> "DaThanhToan".equals(x.getTrangThaiThanhToan()) || "NoCuocKySau".equals(x.getTrangThaiThanhToan()));
            if (allDone) {
                kyRepo.findById(bk.getMaKy()).ifPresent(ky -> {
                    ky.setTrangThai("DaHoanTat");
                    kyRepo.save(ky);
                });
            }

            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ky-quyet-toan/{maKy}/xuat-csv")
    public ResponseEntity<byte[]> exportBangKeCsv(@PathVariable String maKy) {
        StringBuilder sb = new StringBuilder("\uFEFFMaBangKe,MaKy,MaKhachHang,MaTKNganHang,SoTaiKhoan,ChuTaiKhoan,TongCOD,TongCuocTru,ThucTra,TrangThai,MaGDNganHang\n");
        for (BangKeQuyetToanShop bk : bangKeRepo.findByMaKy(maKy)) {
            String stk = "";
            String chuTk = "";
            if (bk.getMaTaiKhoanNganHang() != null) {
                Optional<TaiKhoanNganHang> tkOpt = tkNganHangRepo.findById(bk.getMaTaiKhoanNganHang());
                if (tkOpt.isPresent()) {
                    stk = tkOpt.get().getSoTaiKhoan();
                    chuTk = tkOpt.get().getTenChuTaiKhoan();
                }
            }
            sb.append(String.format("%s,%s,%s,%s,%s,\"%s\",%s,%s,%s,%s,%s\n",
                    bk.getMaBangKe(), bk.getMaKy(), bk.getMaKhachHang(),
                    bk.getMaTaiKhoanNganHang() != null ? bk.getMaTaiKhoanNganHang() : "",
                    stk, chuTk, bk.getTongCod(), bk.getTongCuocTru(), bk.getThucTra(),
                    bk.getTrangThaiThanhToan(),
                    bk.getMaGiaoDichNganHang() != null ? bk.getMaGiaoDichNganHang() : ""));
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"lenh_chuyen_khoan_cod_" + maKy + ".csv\"")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(sb.toString().getBytes(StandardCharsets.UTF_8));
    }

    // 4. Báo cáo Doanh thu thật từ bảng don_hang (UC 7.1)
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
            if ("DaHuy".equals(dh.getTrangThai())) continue;
            doanhThu = doanhThu.add(dh.getTongCuoc() != null ? dh.getTongCuoc() : BigDecimal.ZERO);
            codTotal = codTotal.add(dh.getTienCod() != null ? dh.getTienCod() : BigDecimal.ZERO);
            if ("VietQR".equalsIgnoreCase(dh.getHinhThucThanhToan())) qrCount++;
            else cashCount++;
        }

        int total = cashCount + qrCount;
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

    @GetMapping("/bao-cao-doanh-thu/xuat-csv")
    public ResponseEntity<byte[]> exportBaoCaoCsv() {
        StringBuilder sb = new StringBuilder("\uFEFFMaBaoCao,MaBuuCuc,TuNgay,DenNgay,DoanhThuCuoc,TienCODTrungChuyen,TongSanLuongDon,TyLeTienMat(%),TyLeVietQR(%)\n");
        for (BaoCaoDoanhThu bc : baoCaoRepo.findAllByOrderByDenNgayDesc()) {
            sb.append(String.format("%s,%s,%s,%s,%s,%s,%d,%.1f,%.1f\n",
                    bc.getMaBaoCao(), bc.getMaBuuCuc(), bc.getTuNgay(), bc.getDenNgay(),
                    bc.getDoanhThuCuoc(), bc.getTienCodTrungChuyen(), bc.getTongSanLuongDon(),
                    bc.getTyLeTienMat(), bc.getTyLeVietQr()));
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bao_cao_doanh_thu_fastpost.csv\"")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(sb.toString().getBytes(StandardCharsets.UTF_8));
    }
}

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
    private final NhatKyInTemRepository nhatKyInTemRepo;
    private final ViCongNoShipperRepository viRepo;
    private final ShipperRepository shipperRepo;
    private final NguoiDungRepository nguoiDungRepo;
    private final KhachHangRepository khachHangRepo;

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
            ChiTietBangGiaRepository ctBangGiaRepo,
            NhatKyInTemRepository nhatKyInTemRepo,
            ViCongNoShipperRepository viRepo,
            ShipperRepository shipperRepo,
            NguoiDungRepository nguoiDungRepo,
            KhachHangRepository khachHangRepo) {
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
        this.nhatKyInTemRepo = nhatKyInTemRepo;
        this.viRepo = viRepo;
        this.shipperRepo = shipperRepo;
        this.nguoiDungRepo = nguoiDungRepo;
        this.khachHangRepo = khachHangRepo;
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

    public record PodRequest(String anhChupGoiHang, String toaDoGps, String chuKyDienTu, String tenNguoiKy, String maNhanVien) {}
    public record FailDeliveryRequest(String lyDoThatBai, String ngayHenGiaoLai, String ghiChu, String maNhanVien) {}

    @GetMapping
    public List<DonHang> listAll(@RequestParam(required = false) String shipper,
                                 @RequestParam(required = false) String status,
                                 @RequestParam(required = false) String khachHang) {
        if (shipper != null && !shipper.isBlank()) {
            return donHangRepo.findByMaShipperOrderByNgayTaoDesc(shipper);
        }
        if (khachHang != null && !khachHang.isBlank()) {
            return donHangRepo.findByMaKhachHangOrderByNgayTaoDesc(khachHang);
        }
        if (status != null && !status.isBlank()) {
            return donHangRepo.findByTrangThaiOrderByNgayTaoDesc(status);
        }
        return donHangRepo.findAllByOrderByNgayTaoDesc();
    }

    @GetMapping("/khach-hang/{maKhachHang}")
    public List<DonHang> listByCustomer(@PathVariable String maKhachHang) {
        Map<String, DonHang> merged = new LinkedHashMap<>();
        for (DonHang dh : donHangRepo.findByMaKhachHangOrderByNgayTaoDesc(maKhachHang)) {
            merged.put(dh.getMaVanDon(), dh);
        }
        nguoiDungRepo.findById(maKhachHang).ifPresent(nd -> {
            for (DonHang dh : donHangRepo.findByNguoiGuiSdtOrderByNgayTaoDesc(nd.getSoDienThoai())) {
                merged.putIfAbsent(dh.getMaVanDon(), dh);
            }
        });
        return new ArrayList<>(merged.values());
    }

    @GetMapping("/{maVanDon}")
    public ResponseEntity<?> getDetail(@PathVariable String maVanDon) {
        return donHangRepo.findById(maVanDon)
                .map(dh -> {
                    Map<String, Object> body = new LinkedHashMap<>();
                    body.put("donHang", dh);
                    body.put("hanhTrinh", lichSuRepo.findByMaVanDonOrderByThoiGianAsc(maVanDon));
                    body.put("lichHenGiaoLai", lichHenRepo.findByMaVanDonOrderByLanGiaoThuAsc(maVanDon));
                    body.put("pod", podRepo.findByMaVanDon(maVanDon).orElse(null));
                    return ResponseEntity.ok(body);
                })
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
        BigDecimal phiCod = BigDecimal.ZERO;
        BigDecimal tongCuoc = cuocSan.add(cuocVuotCan).add(phuPhi);

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

        // Tự động tra cứu khách gửi theo SĐT hoặc khởi tạo Tài khoản ngầm (Shadow Account - UC 3.2)
        String sdtGui = (req.nguoiGuiSdt() != null && !req.nguoiGuiSdt().isBlank()) ? req.nguoiGuiSdt().trim() : "0909123456";
        NguoiDung senderUser = nguoiDungRepo.findBySoDienThoai(sdtGui).orElseGet(() -> {
            NguoiDung created = new NguoiDung();
            created.setMaNguoiDung("ND_KH_" + System.currentTimeMillis());
            created.setSoDienThoai(sdtGui);
            created.setHoTen("Khách gửi " + sdtGui);
            created.setEmail(sdtGui + "@shadow.fastpost.vn");
            created.setTrangThai("Active");
            return nguoiDungRepo.save(created);
        });
        KhachHang senderKh = khachHangRepo.findById(senderUser.getMaNguoiDung()).orElseGet(() -> {
            KhachHang kh = new KhachHang();
            kh.setMaNguoiDung(senderUser.getMaNguoiDung());
            kh.setLoaiKhachHang("CaNhan");
            kh.setLaTaiKhoanNgam(true);
            return khachHangRepo.save(kh);
        });

        // Tự động phân công Shipper theo tiểu tuyến (nếu Shipper không bị khóa nợ COD - UC 5.1)
        String candidateShipper = ctTieuTuyenRepo
                .findFirstByQuanHuyenIgnoreCaseAndPhuongXaIgnoreCase(
                        req.quanHuyenGiao() != null ? req.quanHuyenGiao() : "",
                        req.phuongXaGiao() != null ? req.phuongXaGiao() : "")
                .flatMap(ct -> tieuTuyenRepo.findById(ct.getMaTieuTuyen()))
                .map(TieuTuyen::getMaShipper)
                .orElse("NV_SHIP_01");
        boolean locked = viRepo.findByMaShipper(candidateShipper)
                .map(vi -> Boolean.TRUE.equals(vi.getDaKhoaNhanDon()))
                .orElse(false);
        String assignedShipper = locked ? null : candidateShipper;

        DonHang dh = new DonHang();
        String code = "FP-" + (10000 + new Random().nextInt(89999));
        dh.setMaVanDon(code);
        dh.setMaKhachHang(senderKh.getMaNguoiDung());
        dh.setMaBuuCucHienTai("BC_BENNGHE");
        dh.setMaShipper(assignedShipper);
        dh.setMaGoiDichVu(req.maGoiDichVu() != null ? req.maGoiDichVu() : "GDV_TIEUCHUAN");
        dh.setMaLoaiHang(Boolean.TRUE.equals(req.laHangDeVo()) ? "LHH_DEVO" : "LHH_THUONG");
        dh.setNguoiGuiSdt(sdtGui);
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

            BangChungGiaoHang pod = podRepo.findByMaVanDon(maVanDon).orElseGet(() -> {
                BangChungGiaoHang created = new BangChungGiaoHang();
                created.setMaPod("POD-" + System.currentTimeMillis());
                created.setMaVanDon(maVanDon);
                return created;
            });
            pod.setAnhChupGoiHang(req.anhChupGoiHang() != null ? req.anhChupGoiHang() : "pod-demo.jpg");
            pod.setToaDoGps(req.toaDoGps() != null ? req.toaDoGps() : "10.7745,106.7035");
            pod.setChuKyDienTu(req.chuKyDienTu());
            pod.setTenNguoiKy(req.tenNguoiKy() != null ? req.tenNguoiKy() : dh.getNguoiNhanTen());
            podRepo.save(pod);

            addHistory(maVanDon, dh.getMaBuuCucHienTai(), req.maNhanVien(), "DaGiaoThanhCong",
                    "Giao hàng thành công cho " + pod.getTenNguoiKy());

            if (dh.getTienCod() != null && dh.getTienCod().compareTo(BigDecimal.ZERO) > 0) {
                String shipperId = req.maNhanVien() != null ? req.maNhanVien() : dh.getMaShipper();
                if (shipperId != null) {
                    BigDecimal debtLimit = thamSoRepo.findById("HAN_MUC_NO_SHIPPER")
                            .map(t -> new BigDecimal(t.getGiaTri()))
                            .orElse(BigDecimal.valueOf(3_000_000));
                    viRepo.findByMaShipper(shipperId).ifPresent(vi -> {
                        if (vi.getTongNoLuyKe().compareTo(BigDecimal.ZERO) == 0) {
                            vi.setThoiDiemPhatSinhNo(LocalDateTime.now());
                        }
                        BigDecimal newDebt = vi.getTongNoLuyKe().add(dh.getTienCod());
                        vi.setTongNoLuyKe(newDebt);
                        if (newDebt.compareTo(debtLimit) >= 0) {
                            vi.setDaKhoaNhanDon(true);
                            shipperRepo.findById(shipperId).ifPresent(s -> {
                                s.setTrangThaiNhanDon("KhoaTamThoi");
                                shipperRepo.save(s);
                            });
                        }
                        viRepo.save(vi);
                    });
                }
            }
            return ResponseEntity.ok(dh);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{maVanDon}/lay-hang")
    @Transactional
    public ResponseEntity<?> confirmPickup(@PathVariable String maVanDon, @RequestBody(required = false) Map<String, String> body) {
        return donHangRepo.findById(maVanDon).map(dh -> {
            String shipperId = body != null && body.get("maNhanVien") != null ? body.get("maNhanVien") : dh.getMaShipper();
            dh.setTrangThai("DaLayHang");
            if (shipperId != null) dh.setMaShipper(shipperId);
            donHangRepo.save(dh);
            addHistory(maVanDon, dh.getMaBuuCucHienTai(), shipperId != null ? shipperId : "NV_SHIP_01", "DaLayHang",
                    "Shipper đã lấy hàng từ người gửi");
            return ResponseEntity.ok(dh);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{maVanDon}/nhap-kho")
    @Transactional
    public ResponseEntity<?> receiveToWarehouse(@PathVariable String maVanDon, @RequestBody(required = false) Map<String, String> body) {
        return donHangRepo.findById(maVanDon).map(dh -> {
            String buuCuc = body != null && body.get("maBuuCuc") != null ? body.get("maBuuCuc") : dh.getMaBuuCucHienTai();
            String nv = body != null && body.get("maNhanVien") != null ? body.get("maNhanVien") : "NV_QUAY_01";
            dh.setTrangThai("DaNhapKho");
            if (buuCuc != null) dh.setMaBuuCucHienTai(buuCuc);
            donHangRepo.save(dh);
            addHistory(maVanDon, buuCuc, nv, "DaNhapKho",
                    "Đơn hàng đã nhập kho bưu cục " + buuCuc);
            return ResponseEntity.ok(dh);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{maVanDon}/huy")
    @Transactional
    public ResponseEntity<?> cancelOrder(@PathVariable String maVanDon, @RequestBody(required = false) Map<String, String> body) {
        return donHangRepo.findById(maVanDon).map(dh -> {
            if (!List.of("MoiTao", "ChoPhanCongLay", "DaPhanCongLay").contains(dh.getTrangThai())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Chỉ có thể hủy đơn khi chưa lấy hàng (trạng thái hiện tại: " + dh.getTrangThai() + ")"));
            }
            dh.setTrangThai("DaHuy");
            dh.setMaShipper(null);
            donHangRepo.save(dh);
            String lyDo = body != null && body.get("lyDo") != null ? body.get("lyDo") : "Khách hàng yêu cầu hủy đơn";
            addHistory(maVanDon, dh.getMaBuuCucHienTai(), "NV_QUAY_01", "DaHuy", "Đã hủy đơn hàng: " + lyDo);
            return ResponseEntity.ok(dh);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{maVanDon}/phan-cong-lay")
    @Transactional
    public ResponseEntity<?> assignPickup(@PathVariable String maVanDon, @RequestBody Map<String, String> body) {
        String shipperId = body.getOrDefault("maShipper", "NV_SHIP_01");
        boolean locked = viRepo.findByMaShipper(shipperId)
                .map(vi -> Boolean.TRUE.equals(vi.getDaKhoaNhanDon()))
                .orElse(false);
        if (locked) {
            return ResponseEntity.badRequest().body(Map.of("message", "Shipper " + shipperId + " đang bị khóa công nợ COD, không thể phân công"));
        }
        return donHangRepo.findById(maVanDon).map(dh -> {
            dh.setMaShipper(shipperId);
            dh.setTrangThai("DaPhanCongLay");
            donHangRepo.save(dh);
            addHistory(maVanDon, dh.getMaBuuCucHienTai(), "NV_ADMIN_01", "DaPhanCongLay",
                    "Đã phân công Shipper " + shipperId + " đi lấy hàng");
            return ResponseEntity.ok(dh);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{maVanDon}/tu-choi-lay")
    @Transactional
    public ResponseEntity<?> rejectPickup(@PathVariable String maVanDon, @RequestBody(required = false) Map<String, String> body) {
        return donHangRepo.findById(maVanDon).map(dh -> {
            String oldShipper = dh.getMaShipper() != null ? dh.getMaShipper() : "NV_SHIP_01";
            String lyDo = body != null && body.get("lyDo") != null ? body.get("lyDo") : "Sự cố phương tiện / Quá tải";
            dh.setMaShipper(null);
            dh.setTrangThai("ChoPhanCongLay");
            donHangRepo.save(dh);
            addHistory(maVanDon, dh.getMaBuuCucHienTai(), oldShipper, "ChoPhanCongLay",
                    "Shipper " + oldShipper + " từ chối lệnh lấy hàng (" + lyDo + ") — chờ điều phối lại");
            return ResponseEntity.ok(dh);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{maVanDon}/lay-that-bai")
    @Transactional
    public ResponseEntity<?> failPickup(@PathVariable String maVanDon, @RequestBody FailDeliveryRequest req) {
        return donHangRepo.findById(maVanDon).map(dh -> {
            String shipperId = req.maNhanVien() != null ? req.maNhanVien()
                    : (dh.getMaShipper() != null ? dh.getMaShipper() : "NV_SHIP_01");
            String lyDo = req.lyDoThatBai() != null && !req.lyDoThatBai().isBlank()
                    ? req.lyDoThatBai()
                    : "Khách không nghe máy";
            boolean khachBaoHuy = lyDo.toLowerCase().contains("hủy");

            if (khachBaoHuy) {
                dh.setTrangThai("DaHuy");
                dh.setMaShipper(null);
                donHangRepo.save(dh);
                addHistory(maVanDon, dh.getMaBuuCucHienTai(), shipperId, "DaHuy",
                        "Lấy hàng thất bại (" + lyDo + ") — Đã hủy đơn theo yêu cầu khách");
                return ResponseEntity.ok(dh);
            }

            dh.setMaShipper(null);
            dh.setTrangThai("ChoPhanCongLay");
            donHangRepo.save(dh);

            LocalDateTime henCaSau = LocalDateTime.now().plusHours(4);
            if (req.ngayHenGiaoLai() != null && !req.ngayHenGiaoLai().isBlank()) {
                try {
                    henCaSau = LocalDateTime.parse(req.ngayHenGiaoLai());
                } catch (Exception ignored) {
                }
            }

            LichHenGiaoLai lh = new LichHenGiaoLai();
            lh.setMaLichHen("LH-LAY-" + System.currentTimeMillis());
            lh.setMaVanDon(maVanDon);
            lh.setLanGiaoThu(0);
            lh.setLyDoThatBai(lyDo);
            lh.setNgayHenGiaoLai(henCaSau);
            lh.setGhiChu(req.ghiChu() != null && !req.ghiChu().isBlank() ? req.ghiChu() : "Hẹn lấy lại vào ca sau");
            lichHenRepo.save(lh);

            addHistory(maVanDon, dh.getMaBuuCucHienTai(), shipperId, "ChoPhanCongLay",
                    "Lấy hàng thất bại (" + lyDo + ") — Đã lên lịch lấy lại vào ca sau (" + henCaSau + ")");
            return ResponseEntity.ok(dh);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{maVanDon}/giao-that-bai")
    @Transactional
    public ResponseEntity<?> failDelivery(@PathVariable String maVanDon, @RequestBody FailDeliveryRequest req) {
        return donHangRepo.findById(maVanDon).map(dh -> {
            int fails = dh.getSoLanGiaoThatBai() + 1;
            dh.setSoLanGiaoThatBai(fails);
            String lyDo = req.lyDoThatBai() != null ? req.lyDoThatBai() : "Khách không nghe máy";
            boolean khachTuChoi = lyDo.toLowerCase().contains("từ chối") || lyDo.toLowerCase().contains("boom");
            boolean chuyenHoan = fails >= 3 || khachTuChoi;
            dh.setTrangThai(chuyenHoan ? "ChoChuyenHoan" : "ChoGiaoLai");
            donHangRepo.save(dh);

            LichHenGiaoLai lh = new LichHenGiaoLai();
            lh.setMaLichHen("LH-" + System.currentTimeMillis());
            lh.setMaVanDon(maVanDon);
            lh.setLanGiaoThu(fails);
            lh.setLyDoThatBai(lyDo);
            if (!chuyenHoan) {
                if (req.ngayHenGiaoLai() != null && !req.ngayHenGiaoLai().isBlank()) {
                    try {
                        lh.setNgayHenGiaoLai(LocalDateTime.parse(req.ngayHenGiaoLai()));
                    } catch (Exception ignored) {
                        lh.setNgayHenGiaoLai(LocalDateTime.now().plusDays(1));
                    }
                } else {
                    lh.setNgayHenGiaoLai(LocalDateTime.now().plusDays(1));
                }
            }
            lh.setGhiChu(req.ghiChu());
            lichHenRepo.save(lh);

            addHistory(maVanDon, dh.getMaBuuCucHienTai(), req.maNhanVien(), dh.getTrangThai(),
                    "Giao thất bại lần " + fails + ": " + lyDo
                            + (chuyenHoan ? " (Chuyển thẳng sang Chờ chuyển hoàn)" : " (Đã tạo lịch hẹn giao lại)"));
            return ResponseEntity.ok(dh);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{maVanDon}/phat-lai")
    @Transactional
    public ResponseEntity<?> redeliverOrder(@PathVariable String maVanDon, @RequestBody(required = false) Map<String, String> body) {
        return donHangRepo.findById(maVanDon).map(dh -> {
            String shipperId = body != null && body.get("maNhanVien") != null ? body.get("maNhanVien") : dh.getMaShipper();
            dh.setTrangThai("DangGiaoHang");
            if (shipperId != null) dh.setMaShipper(shipperId);
            donHangRepo.save(dh);
            addHistory(maVanDon, dh.getMaBuuCucHienTai(), shipperId != null ? shipperId : "NV_SHIP_01", "DangGiaoHang",
                    "Đưa đơn Chờ giao lại vào ca phát tiếp theo");
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

    public record InTemRequest(String maNhanVienQuay, String loaiIn, String lyDoInLai) {}

    @GetMapping("/in-tem/nhat-ky")
    public List<NhatKyInTem> listRecentInTem() {
        return nhatKyInTemRepo.findTop20ByOrderByThoiGianInDesc();
    }

    @GetMapping("/{maVanDon}/in-tem")
    public List<NhatKyInTem> listInTemByOrder(@PathVariable String maVanDon) {
        return nhatKyInTemRepo.findByMaVanDonOrderByThoiGianInDesc(maVanDon);
    }

    @PostMapping("/{maVanDon}/in-tem")
    public ResponseEntity<?> logInTem(@PathVariable String maVanDon, @RequestBody(required = false) InTemRequest req) {
        Optional<DonHang> dhOpt = donHangRepo.findById(maVanDon);
        if (dhOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy vận đơn " + maVanDon));
        }
        DonHang dh = dhOpt.get();
        long existingCount = nhatKyInTemRepo.countByMaVanDon(maVanDon);

        // UC 3.3.3 branch 6a & 6b: kiểm tra điều kiện in lại tem
        if (existingCount > 0) {
            if (List.of("DangGiaoHang", "DaGiaoThanhCong", "DaQuyetToanCOD", "DaHuy", "DaChuyenHoan").contains(dh.getTrangThai())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Từ chối in lại tem: Kiện hàng đã xuất kho hoặc đã đóng (" + dh.getTrangThai() + ")"));
            }
            if (existingCount >= 4) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Từ chối in lại tem: Đã vượt quá số lần in lại tối đa cho phép (3 lần in lại)"));
            }
        }

        NhatKyInTem log = new NhatKyInTem();
        log.setMaNhatKy("IN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        log.setMaVanDon(maVanDon);
        log.setMaNhanVienQuay(req != null && req.maNhanVienQuay() != null ? req.maNhanVienQuay() : "NV_QUAY_01");
        log.setThoiGianIn(LocalDateTime.now());
        log.setSoLanIn((int) existingCount + 1);
        log.setLoaiIn(req != null && req.loaiIn() != null ? req.loaiIn() : (existingCount == 0 ? "IN_MOI" : "IN_LAI"));
        log.setLyDoInLai(req != null ? req.lyDoInLai() : null);
        return ResponseEntity.ok(nhatKyInTemRepo.save(log));
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

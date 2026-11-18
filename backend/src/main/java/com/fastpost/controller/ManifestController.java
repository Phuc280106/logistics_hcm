package com.fastpost.controller;

import com.fastpost.entity.*;
import com.fastpost.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/manifest")
public class ManifestController {
    private final ManifestRepository manifestRepo;
    private final ChiTietManifestRepository chiTietRepo;
    private final BienBanBatThuongRepository bienBanRepo;
    private final DonHangRepository donHangRepo;
    private final LichSuHanhTrinhRepository lichSuRepo;

    public ManifestController(
            ManifestRepository manifestRepo,
            ChiTietManifestRepository chiTietRepo,
            BienBanBatThuongRepository bienBanRepo,
            DonHangRepository donHangRepo,
            LichSuHanhTrinhRepository lichSuRepo) {
        this.manifestRepo = manifestRepo;
        this.chiTietRepo = chiTietRepo;
        this.bienBanRepo = bienBanRepo;
        this.donHangRepo = donHangRepo;
        this.lichSuRepo = lichSuRepo;
    }

    public record CreateManifestRequest(String maBuuCucDi, String maBuuCucDen, String maNhanVienLap) {}
    public record ScanRequest(String maVanDon) {}
    public record IncidentRequest(String maVanDon, String loaiBatThuong, Double canNangThucTe, String moTa, String maNhanVienKho) {}
    public record ApproveIncidentRequest(String maQuanLyDuyet, String phuongAnXuLy) {}

    @GetMapping
    public List<Manifest> listAll() {
        return manifestRepo.findAllByOrderByNgayLapDesc();
    }

    @GetMapping("/{maManifest}")
    public ResponseEntity<?> getDetail(@PathVariable String maManifest) {
        return manifestRepo.findById(maManifest)
                .map(m -> ResponseEntity.ok(Map.of(
                        "manifest", m,
                        "chiTiet", chiTietRepo.findByMaManifest(maManifest)
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody CreateManifestRequest req) {
        String khoDi = req.maBuuCucDi() != null ? req.maBuuCucDi() : "KHO_Q1";
        String khoDen = req.maBuuCucDen() != null ? req.maBuuCucDen() : "BC_BENNGHE";
        if (khoDi.equals(khoDen)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Kho đi và Kho đến không được trùng nhau"));
        }
        Manifest m = new Manifest();
        m.setMaManifest("MF-" + (1000 + new Random().nextInt(8999)));
        m.setMaBuuCucDi(khoDi);
        m.setMaBuuCucDen(khoDen);
        m.setMaNhanVienLap(req.maNhanVienLap() != null ? req.maNhanVienLap() : "NV_ADMIN_01");
        m.setTrangThai("DangKhoiTao");
        m.setTongSoKien(0);
        return ResponseEntity.ok(manifestRepo.save(m));
    }

    @PostMapping("/{maManifest}/quet-gom-don")
    @Transactional
    public ResponseEntity<?> quetGomDon(@PathVariable String maManifest, @RequestBody ScanRequest req) {
        return manifestRepo.findById(maManifest).map(m -> {
            if (!"DangKhoiTao".equals(m.getTrangThai())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Chỉ có thể gom đơn khi Manifest đang khởi tạo"));
            }
            ChiTietManifest ct = new ChiTietManifest();
            ct.setMaManifest(maManifest);
            ct.setMaVanDon(req.maVanDon());
            ct.setDaQuetNhap(false);
            chiTietRepo.save(ct);

            donHangRepo.findById(req.maVanDon()).ifPresent(dh -> {
                dh.setTrangThai("ChoLuanChuyenHub");
                donHangRepo.save(dh);
            });

            m.setTongSoKien(chiTietRepo.findByMaManifest(maManifest).size());
            manifestRepo.save(m);
            return ResponseEntity.ok(m);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{maManifest}/chuyen-trang-thai")
    @Transactional
    public ResponseEntity<?> transition(@PathVariable String maManifest, @RequestParam String action) {
        return manifestRepo.findById(maManifest).map(m -> {
            switch (action) {
                case "niemPhong" -> {
                    if (m.getTongSoKien() <= 0) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Cần ít nhất 1 kiện hàng để niêm phong"));
                    }
                    m.setTrangThai("DaNiemPhong");
                }
                case "moLaiBangKe" -> m.setTrangThai("DangKhoiTao");
                case "xuatXe" -> {
                    m.setTrangThai("DangVanChuyen");
                    List<ChiTietManifest> items = chiTietRepo.findByMaManifest(maManifest);
                    for (ChiTietManifest item : items) {
                        LichSuHanhTrinh ls = new LichSuHanhTrinh();
                        ls.setMaHanhTrinh("HT-" + UUID.randomUUID().toString().substring(0, 8));
                        ls.setMaVanDon(item.getMaVanDon());
                        ls.setMaBuuCuc(m.getMaBuuCucDi());
                        ls.setMaNhanVienThucHien(m.getMaNhanVienLap());
                        ls.setTrangThaiGhiNhan("DangLuanChuyen");
                        ls.setMoTaChiTiet("Đơn hàng đang trên xe trung chuyển từ " + m.getMaBuuCucDi() + " đến " + m.getMaBuuCucDen() + " (Manifest " + maManifest + ")");
                        lichSuRepo.save(ls);
                    }
                }
                case "denKhoDich" -> m.setTrangThai("DaDenKhoDich");
                case "batDauKiemNhan" -> m.setTrangThai("DangKiemNhan");
                case "hoanTatDu" -> m.setTrangThai("HoanTatNhapKho");
                case "hoanTatBatThuong" -> m.setTrangThai("PhatSinhBatThuong");
                case "duyetXuLy" -> m.setTrangThai("DaXuLyChenhLech");
                case "dongHoSo" -> m.setTrangThai("HoanTatNhapKho");
                case "huyManifest" -> m.setTrangThai("DaHuy");
                default -> {
                    return ResponseEntity.badRequest().body(Map.of("message", "Action không hợp lệ: " + action));
                }
            }
            return ResponseEntity.ok(manifestRepo.save(m));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{maManifest}/quet-kien")
    @Transactional
    public ResponseEntity<?> quetKien(@PathVariable String maManifest, @RequestBody ScanRequest req) {
        ChiTietManifestId id = new ChiTietManifestId(maManifest, req.maVanDon());
        return chiTietRepo.findById(id).map(ct -> {
            ct.setDaQuetNhap(true);
            ct.setThoiGianQuet(LocalDateTime.now());
            return ResponseEntity.ok(chiTietRepo.save(ct));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{maManifest}/kiem-nhan-hoan-tat")
    @Transactional
    public ResponseEntity<?> completeReceiving(@PathVariable String maManifest) {
        return manifestRepo.findById(maManifest).map(m -> {
            List<ChiTietManifest> items = chiTietRepo.findByMaManifest(maManifest);
            List<ChiTietManifest> missing = items.stream().filter(i -> !Boolean.TRUE.equals(i.getDaQuetNhap())).toList();

            if (missing.isEmpty()) {
                m.setTrangThai("HoanTatNhapKho");
                for (ChiTietManifest item : items) {
                    donHangRepo.findById(item.getMaVanDon()).ifPresent(dh -> {
                        dh.setMaBuuCucHienTai(m.getMaBuuCucDen());
                        dh.setTrangThai("DaNhapKho");
                        donHangRepo.save(dh);

                        LichSuHanhTrinh ls = new LichSuHanhTrinh();
                        ls.setMaHanhTrinh("HT-" + UUID.randomUUID().toString().substring(0, 8));
                        ls.setMaVanDon(dh.getMaVanDon());
                        ls.setMaBuuCuc(m.getMaBuuCucDen());
                        ls.setMaNhanVienThucHien(m.getMaNhanVienLap());
                        ls.setTrangThaiGhiNhan("DaNhapKho");
                        ls.setMoTaChiTiet("Đã kiểm nhận nhập kho đích " + m.getMaBuuCucDen() + " từ Manifest " + maManifest);
                        lichSuRepo.save(ls);
                    });
                }
            } else {
                m.setTrangThai("PhatSinhBatThuong");
                for (ChiTietManifest miss : missing) {
                    BienBanBatThuong bb = new BienBanBatThuong();
                    bb.setMaBienBan("BB-" + System.currentTimeMillis() + "-" + miss.getMaVanDon());
                    bb.setMaVanDon(miss.getMaVanDon());
                    bb.setMaNhanVienKhoLap(m.getMaNhanVienLap());
                    bb.setLoaiBatThuong("ThieuKienManifest");
                    bb.setHinhAnhBangChung("missing-manifest.jpg");
                    bb.setMoTa("Thiếu kiện khi kiểm nhận Manifest " + maManifest + " tại kho đích " + m.getMaBuuCucDen());
                    bb.setTrangThaiDuyet("ChoXuLy");
                    bienBanRepo.save(bb);
                }
            }
            return ResponseEntity.ok(manifestRepo.save(m));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/bien-ban-bat-thuong")
    @Transactional
    public ResponseEntity<?> createIncident(@RequestBody IncidentRequest req) {
        if (req.maVanDon() == null || req.maVanDon().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập mã vận đơn."));
        }
        String maVanDon = req.maVanDon().trim();
        var dhOpt = donHangRepo.findById(maVanDon);
        if (dhOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Không tìm thấy mã vận đơn \"" + maVanDon + "\". Vui lòng nhập đúng mã vận đơn (VD: FP-98233), không nhập mã Manifest (MF-...)."));
        }

        DonHang dh = dhOpt.get();
        dh.setTrangThai("TamGiuChoXuLy");
        donHangRepo.save(dh);

        BienBanBatThuong bb = new BienBanBatThuong();
        bb.setMaBienBan("BB-" + System.currentTimeMillis());
        bb.setMaVanDon(maVanDon);
        bb.setMaNhanVienKhoLap(req.maNhanVienKho() != null ? req.maNhanVienKho() : "NV_ADMIN_01");
        bb.setLoaiBatThuong(req.loaiBatThuong() != null ? req.loaiBatThuong() : "RachBaoBi");
        bb.setCanNangThucTe(req.canNangThucTe());
        bb.setHinhAnhBangChung("incident-demo.jpg");
        bb.setMoTa(req.moTa());
        bb.setTrangThaiDuyet("ChoXuLy");

        return ResponseEntity.ok(bienBanRepo.save(bb));
    }

    @PostMapping("/bien-ban-bat-thuong/{maBienBan}/duyet")
    @Transactional
    public ResponseEntity<?> approveIncident(@PathVariable String maBienBan, @RequestBody ApproveIncidentRequest req) {
        return bienBanRepo.findById(maBienBan).map(bb -> {
            bb.setMaQuanLyDuyet(req.maQuanLyDuyet() != null ? req.maQuanLyDuyet() : "NV_ADMIN_01");
            bb.setPhuongAnXuLy(req.phuongAnXuLy());
            bb.setTrangThaiDuyet("DaDuyet");
            bienBanRepo.save(bb);

            donHangRepo.findById(bb.getMaVanDon()).ifPresent(dh -> {
                if ("BoiThuong".equalsIgnoreCase(req.phuongAnXuLy())) {
                    dh.setTrangThai("DaBoiThuong");
                } else if ("TraLaiKienHang".equalsIgnoreCase(req.phuongAnXuLy())
                        || "ChuyenHoan".equalsIgnoreCase(req.phuongAnXuLy())) {
                    dh.setTrangThai("ChoChuyenHoan");
                } else {
                    dh.setTrangThai("DaNhapKho");
                }
                donHangRepo.save(dh);

                LichSuHanhTrinh ls = new LichSuHanhTrinh();
                ls.setMaHanhTrinh("HT-" + UUID.randomUUID().toString().substring(0, 8));
                ls.setMaVanDon(dh.getMaVanDon());
                ls.setMaBuuCuc(dh.getMaBuuCucHienTai());
                ls.setMaNhanVienThucHien(bb.getMaQuanLyDuyet());
                ls.setTrangThaiGhiNhan(dh.getTrangThai());
                ls.setMoTaChiTiet("Đã duyệt biên bản bất thường " + maBienBan + " - Phương án: " + req.phuongAnXuLy());
                lichSuRepo.save(ls);
            });

            return ResponseEntity.ok(bb);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/bien-ban-bat-thuong")
    public List<BienBanBatThuong> listIncidents() {
        return bienBanRepo.findAll();
    }
}

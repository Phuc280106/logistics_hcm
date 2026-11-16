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

    public ManifestController(
            ManifestRepository manifestRepo,
            ChiTietManifestRepository chiTietRepo,
            BienBanBatThuongRepository bienBanRepo) {
        this.manifestRepo = manifestRepo;
        this.chiTietRepo = chiTietRepo;
        this.bienBanRepo = bienBanRepo;
    }

    public record CreateManifestRequest(String maBuuCucDi, String maBuuCucDen, String maNhanVienLap) {}
    public record ScanRequest(String maVanDon) {}
    public record IncidentRequest(String maVanDon, String loaiBatThuong, String moTa, String maNhanVienKho) {}

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
    public Manifest create(@RequestBody CreateManifestRequest req) {
        Manifest m = new Manifest();
        m.setMaManifest("MF-Q1-" + (1000 + new Random().nextInt(8999)));
        m.setMaBuuCucDi(req.maBuuCucDi() != null ? req.maBuuCucDi() : "KHO_Q1");
        m.setMaBuuCucDen(req.maBuuCucDen() != null ? req.maBuuCucDen() : "BC_BENNGHE");
        m.setMaNhanVienLap(req.maNhanVienLap() != null ? req.maNhanVienLap() : "NV_ADMIN_01");
        m.setTrangThai("DangKhoiTao");
        m.setTongSoKien(0);
        return manifestRepo.save(m);
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
                case "xuatXe" -> m.setTrangThai("DangVanChuyen");
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

    @PostMapping("/bien-ban-bat-thuong")
    @Transactional
    public BienBanBatThuong createIncident(@RequestBody IncidentRequest req) {
        BienBanBatThuong bb = new BienBanBatThuong();
        bb.setMaBienBan("BB-" + System.currentTimeMillis());
        bb.setMaVanDon(req.maVanDon());
        bb.setMaNhanVienKhoLap(req.maNhanVienKho() != null ? req.maNhanVienKho() : "NV_ADMIN_01");
        bb.setLoaiBatThuong(req.loaiBatThuong() != null ? req.loaiBatThuong() : "RachVo");
        bb.setHinhAnhBangChung("incident-demo.jpg");
        bb.setMoTa(req.moTa());
        bb.setTrangThaiDuyet("ChoXuLy");
        return bienBanRepo.save(bb);
    }

    @GetMapping("/bien-ban-bat-thuong")
    public List<BienBanBatThuong> listIncidents() {
        return bienBanRepo.findAll();
    }
}

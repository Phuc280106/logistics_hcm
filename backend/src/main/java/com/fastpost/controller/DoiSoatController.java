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
@RequestMapping("/api/doi-soat")
public class DoiSoatController {
    private static final BigDecimal DEBT_LIMIT = BigDecimal.valueOf(3_000_000);

    private final PhieuDoiSoatShipperRepository phieuRepo;
    private final ViCongNoShipperRepository viRepo;
    private final ShipperRepository shipperRepo;
    private final BienBanChotQuyRepository chotQuyRepo;
    private final DanhGiaKpiRepository kpiRepo;
    private final BuuCucRepository buuCucRepo;

    public DoiSoatController(
            PhieuDoiSoatShipperRepository phieuRepo,
            ViCongNoShipperRepository viRepo,
            ShipperRepository shipperRepo,
            BienBanChotQuyRepository chotQuyRepo,
            DanhGiaKpiRepository kpiRepo,
            BuuCucRepository buuCucRepo) {
        this.phieuRepo = phieuRepo;
        this.viRepo = viRepo;
        this.shipperRepo = shipperRepo;
        this.chotQuyRepo = chotQuyRepo;
        this.kpiRepo = kpiRepo;
        this.buuCucRepo = buuCucRepo;
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
    public ResponseEntity<ViCongNoShipper> getVi(@PathVariable String maShipper) {
        return viRepo.findByMaShipper(maShipper)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/shipper")
    @Transactional
    public PhieuDoiSoatShipper taoPhieu(@RequestBody CreateDoiSoatRequest req) {
        PhieuDoiSoatShipper p = new PhieuDoiSoatShipper();
        p.setMaDoiSoat("PDS-" + System.currentTimeMillis());
        p.setMaShipper(req.maShipper() != null ? req.maShipper() : "NV_SHIP_01");
        p.setMaNhanVienQuay(req.maNhanVienQuay() != null ? req.maNhanVienQuay() : "NV_QUAY_01");
        p.setTongDonThanhCong(req.tongDonThanhCong() != null ? req.tongDonThanhCong() : 0);
        BigDecimal cod = req.tongTienCod() != null ? req.tongTienCod() : BigDecimal.ZERO;
        BigDecimal cuoc = req.tongCuocMat() != null ? req.tongCuocMat() : BigDecimal.ZERO;
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
            BigDecimal thucNop = req.soTienThucNop();
            BigDecimal phaiNop = p.getTongPhaiNop();
            p.setSoTienThucNop(thucNop);

            int cmp = thucNop.compareTo(phaiNop);
            if (cmp == 0) {
                p.setSoTienThieu(BigDecimal.ZERO);
                p.setTrangThai("DaKhopTien");
            } else if (cmp > 0) {
                // Nop du -> giu nguyen DangKiemDem de dem lai
                p.setTrangThai("DangKiemDem");
            } else {
                BigDecimal thieu = phaiNop.subtract(thucNop);
                p.setSoTienThieu(thieu);
                ViCongNoShipper vi = viRepo.findByMaShipper(p.getMaShipper()).orElseGet(() -> {
                    ViCongNoShipper created = new ViCongNoShipper();
                    created.setMaVi("VI-" + p.getMaShipper());
                    created.setMaShipper(p.getMaShipper());
                    return created;
                });
                vi.setTongNoLuyKe(vi.getTongNoLuyKe().add(thieu));
                if (vi.getThoiDiemPhatSinhNo() == null) {
                    vi.setThoiDiemPhatSinhNo(LocalDateTime.now());
                }
                if (vi.getTongNoLuyKe().compareTo(DEBT_LIMIT) > 0) {
                    vi.setDaKhoaNhanDon(true);
                    p.setTrangThai("KhoaTaiKhoanShipper");
                } else {
                    p.setTrangThai("PhatSinhCongNo");
                }
                viRepo.save(vi);
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

    @GetMapping("/bao-cao-sla")
    public Map<String, Object> getSlaReport() {
        return Map.of(
                "kpiList", kpiRepo.findAll(),
                "shippers", shipperRepo.findAll()
        );
    }
}

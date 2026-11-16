package com.fastpost.controller;

import com.fastpost.entity.KhachHang;
import com.fastpost.entity.SoDiaChi;
import com.fastpost.entity.TaiKhoanNganHang;
import com.fastpost.repository.KhachHangRepository;
import com.fastpost.repository.SoDiaChiRepository;
import com.fastpost.repository.TaiKhoanNganHangRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/khach-hang")
public class KhachHangController {

    private final KhachHangRepository khachHangRepo;
    private final SoDiaChiRepository soDiaChiRepo;
    private final TaiKhoanNganHangRepository tkNganHangRepo;

    public KhachHangController(
            KhachHangRepository khachHangRepo,
            SoDiaChiRepository soDiaChiRepo,
            TaiKhoanNganHangRepository tkNganHangRepo) {
        this.khachHangRepo = khachHangRepo;
        this.soDiaChiRepo = soDiaChiRepo;
        this.tkNganHangRepo = tkNganHangRepo;
    }

    @GetMapping
    public List<KhachHang> listKhachHang() {
        return khachHangRepo.findAll();
    }

    @GetMapping("/{maKhachHang}/dia-chi")
    public List<SoDiaChi> listDiaChi(@PathVariable String maKhachHang) {
        return soDiaChiRepo.findByMaKhachHangOrderByLaMacDinhDesc(maKhachHang);
    }

    @PostMapping("/{maKhachHang}/dia-chi")
    public ResponseEntity<?> addDiaChi(
            @PathVariable String maKhachHang,
            @RequestBody SoDiaChi req) {
        if (!khachHangRepo.existsById(maKhachHang)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy khách hàng: " + maKhachHang));
        }
        req.setMaDiaChi("DC_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        req.setMaKhachHang(maKhachHang);
        return ResponseEntity.ok(soDiaChiRepo.save(req));
    }

    @DeleteMapping("/dia-chi/{maDiaChi}")
    public ResponseEntity<?> deleteDiaChi(@PathVariable String maDiaChi) {
        if (!soDiaChiRepo.existsById(maDiaChi)) {
            return ResponseEntity.notFound().build();
        }
        soDiaChiRepo.deleteById(maDiaChi);
        return ResponseEntity.ok(Map.of("deleted", maDiaChi));
    }

    @GetMapping("/{maKhachHang}/ngan-hang")
    public List<TaiKhoanNganHang> listNganHang(@PathVariable String maKhachHang) {
        return tkNganHangRepo.findByMaKhachHangOrderByLaMacDinhCodDesc(maKhachHang);
    }

    @PostMapping("/{maKhachHang}/ngan-hang")
    public ResponseEntity<?> addNganHang(
            @PathVariable String maKhachHang,
            @RequestBody TaiKhoanNganHang req) {
        if (!khachHangRepo.existsById(maKhachHang)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy khách hàng: " + maKhachHang));
        }
        req.setMaTkNganHang("TK_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        req.setMaKhachHang(maKhachHang);
        return ResponseEntity.ok(tkNganHangRepo.save(req));
    }

    @DeleteMapping("/ngan-hang/{maTkNganHang}")
    public ResponseEntity<?> deleteNganHang(@PathVariable String maTkNganHang) {
        if (!tkNganHangRepo.existsById(maTkNganHang)) {
            return ResponseEntity.notFound().build();
        }
        tkNganHangRepo.deleteById(maTkNganHang);
        return ResponseEntity.ok(Map.of("deleted", maTkNganHang));
    }
}

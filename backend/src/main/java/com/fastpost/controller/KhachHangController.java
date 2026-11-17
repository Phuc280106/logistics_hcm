package com.fastpost.controller;

import com.fastpost.entity.KhachHang;
import com.fastpost.entity.NguoiDung;
import com.fastpost.entity.SoDiaChi;
import com.fastpost.entity.TaiKhoanNganHang;
import com.fastpost.repository.KhachHangRepository;
import com.fastpost.repository.NguoiDungRepository;
import com.fastpost.repository.SoDiaChiRepository;
import com.fastpost.repository.TaiKhoanNganHangRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/khach-hang")
public class KhachHangController {

    private final KhachHangRepository khachHangRepo;
    private final NguoiDungRepository nguoiDungRepo;
    private final SoDiaChiRepository soDiaChiRepo;
    private final TaiKhoanNganHangRepository tkNganHangRepo;

    public KhachHangController(
            KhachHangRepository khachHangRepo,
            NguoiDungRepository nguoiDungRepo,
            SoDiaChiRepository soDiaChiRepo,
            TaiKhoanNganHangRepository tkNganHangRepo) {
        this.khachHangRepo = khachHangRepo;
        this.nguoiDungRepo = nguoiDungRepo;
        this.soDiaChiRepo = soDiaChiRepo;
        this.tkNganHangRepo = tkNganHangRepo;
    }

    public record UpdateHoSoRequest(String hoTen, String email, String tenShop, String loaiKhachHang) {}

    @GetMapping
    public List<KhachHang> listKhachHang() {
        return khachHangRepo.findAll();
    }

    @GetMapping("/{maKhachHang}/ho-so")
    public ResponseEntity<?> getHoSo(@PathVariable String maKhachHang) {
        Optional<NguoiDung> ndOpt = nguoiDungRepo.findById(maKhachHang);
        if (ndOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        NguoiDung nd = ndOpt.get();
        KhachHang kh = khachHangRepo.findById(maKhachHang).orElseGet(() -> {
            KhachHang c = new KhachHang();
            c.setMaNguoiDung(maKhachHang);
            c.setLoaiKhachHang("CaNhan");
            c.setLaTaiKhoanNgam(false);
            c.setNgayKichHoat(LocalDateTime.now());
            return khachHangRepo.save(c);
        });
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("maKhachHang", maKhachHang);
        res.put("hoTen", nd.getHoTen());
        res.put("soDienThoai", nd.getSoDienThoai());
        res.put("email", nd.getEmail() != null ? nd.getEmail() : "");
        res.put("tenShop", kh.getTenShop() != null ? kh.getTenShop() : "");
        res.put("loaiKhachHang", kh.getLoaiKhachHang());
        res.put("laTaiKhoanNgam", kh.isLaTaiKhoanNgam());
        res.put("ngayKichHoat", kh.getNgayKichHoat());
        return ResponseEntity.ok(res);
    }

    @PutMapping("/{maKhachHang}/ho-so")
    @Transactional
    public ResponseEntity<?> updateHoSo(@PathVariable String maKhachHang, @RequestBody UpdateHoSoRequest req) {
        Optional<NguoiDung> ndOpt = nguoiDungRepo.findById(maKhachHang);
        if (ndOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy tài khoản người dùng"));
        }
        if (req.email() != null && !req.email().isBlank() && !req.email().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Định dạng email không hợp lệ"));
        }

        NguoiDung nd = ndOpt.get();
        if (req.hoTen() != null && !req.hoTen().isBlank()) nd.setHoTen(req.hoTen().trim());
        nd.setEmail(req.email() != null && !req.email().isBlank() ? req.email().trim() : null);
        nguoiDungRepo.save(nd);

        KhachHang kh = khachHangRepo.findById(maKhachHang).orElseGet(() -> {
            KhachHang c = new KhachHang();
            c.setMaNguoiDung(maKhachHang);
            c.setLoaiKhachHang("CaNhan");
            return c;
        });
        kh.setTenShop(req.tenShop() != null && !req.tenShop().isBlank() ? req.tenShop().trim() : null);
        if (req.loaiKhachHang() != null && !req.loaiKhachHang().isBlank()) {
            kh.setLoaiKhachHang(req.loaiKhachHang());
        } else if (kh.getTenShop() != null) {
            kh.setLoaiKhachHang("Shop");
        }
        if (kh.isLaTaiKhoanNgam()) {
            kh.setLaTaiKhoanNgam(false);
            kh.setNgayKichHoat(LocalDateTime.now());
        }
        khachHangRepo.save(kh);
        return getHoSo(maKhachHang);
    }

    @GetMapping("/{maKhachHang}/dia-chi")
    public List<SoDiaChi> listDiaChi(@PathVariable String maKhachHang) {
        return soDiaChiRepo.findByMaKhachHangOrderByLaMacDinhDesc(maKhachHang);
    }

    @PostMapping("/{maKhachHang}/dia-chi")
    @Transactional
    public ResponseEntity<?> addDiaChi(
            @PathVariable String maKhachHang,
            @RequestBody SoDiaChi req) {
        ensureKhachHangRecord(maKhachHang);
        if (req.isLaMacDinh()) {
            for (SoDiaChi item : soDiaChiRepo.findByMaKhachHangOrderByLaMacDinhDesc(maKhachHang)) {
                if (item.isLaMacDinh()) {
                    item.setLaMacDinh(false);
                    soDiaChiRepo.save(item);
                }
            }
        }
        req.setMaDiaChi("DC_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        req.setMaKhachHang(maKhachHang);
        return ResponseEntity.ok(soDiaChiRepo.save(req));
    }

    @PutMapping("/{maKhachHang}/dia-chi/{maDiaChi}/mac-dinh")
    @Transactional
    public ResponseEntity<?> setDefaultDiaChi(@PathVariable String maKhachHang, @PathVariable String maDiaChi) {
        List<SoDiaChi> list = soDiaChiRepo.findByMaKhachHangOrderByLaMacDinhDesc(maKhachHang);
        boolean found = false;
        for (SoDiaChi item : list) {
            boolean match = item.getMaDiaChi().equals(maDiaChi);
            if (match) found = true;
            item.setLaMacDinh(match);
            soDiaChiRepo.save(item);
        }
        if (!found) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(soDiaChiRepo.findByMaKhachHangOrderByLaMacDinhDesc(maKhachHang));
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
    @Transactional
    public ResponseEntity<?> addNganHang(
            @PathVariable String maKhachHang,
            @RequestBody TaiKhoanNganHang req) {
        ensureKhachHangRecord(maKhachHang);
        if (req.isLaMacDinhCod()) {
            for (TaiKhoanNganHang item : tkNganHangRepo.findByMaKhachHangOrderByLaMacDinhCodDesc(maKhachHang)) {
                if (item.isLaMacDinhCod()) {
                    item.setLaMacDinhCod(false);
                    tkNganHangRepo.save(item);
                }
            }
        }
        req.setMaTkNganHang("TK_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        req.setMaKhachHang(maKhachHang);
        return ResponseEntity.ok(tkNganHangRepo.save(req));
    }

    @PutMapping("/{maKhachHang}/ngan-hang/{maTkNganHang}/mac-dinh")
    @Transactional
    public ResponseEntity<?> setDefaultNganHang(@PathVariable String maKhachHang, @PathVariable String maTkNganHang) {
        List<TaiKhoanNganHang> list = tkNganHangRepo.findByMaKhachHangOrderByLaMacDinhCodDesc(maKhachHang);
        boolean found = false;
        for (TaiKhoanNganHang item : list) {
            boolean match = item.getMaTkNganHang().equals(maTkNganHang);
            if (match) found = true;
            item.setLaMacDinhCod(match);
            tkNganHangRepo.save(item);
        }
        if (!found) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(tkNganHangRepo.findByMaKhachHangOrderByLaMacDinhCodDesc(maKhachHang));
    }

    @DeleteMapping("/ngan-hang/{maTkNganHang}")
    public ResponseEntity<?> deleteNganHang(@PathVariable String maTkNganHang) {
        if (!tkNganHangRepo.existsById(maTkNganHang)) {
            return ResponseEntity.notFound().build();
        }
        tkNganHangRepo.deleteById(maTkNganHang);
        return ResponseEntity.ok(Map.of("deleted", maTkNganHang));
    }

    private void ensureKhachHangRecord(String maKhachHang) {
        if (!khachHangRepo.existsById(maKhachHang) && nguoiDungRepo.existsById(maKhachHang)) {
            KhachHang kh = new KhachHang();
            kh.setMaNguoiDung(maKhachHang);
            kh.setLoaiKhachHang("CaNhan");
            kh.setLaTaiKhoanNgam(false);
            kh.setNgayKichHoat(LocalDateTime.now());
            khachHangRepo.save(kh);
        }
    }
}

package com.fastpost.controller;

import com.fastpost.entity.*;
import com.fastpost.repository.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/danh-muc")
public class DanhMucController {

    private final VungTuyenRepository vungTuyenRepo;
    private final GoiDichVuRepository goiDichVuRepo;
    private final LoaiHangHoaRepository loaiHangHoaRepo;
    private final NganHangRepository nganHangRepo;
    private final BuuCucRepository buuCucRepo;
    private final TuyenGiaoHangRepository tuyenRepo;
    private final DonHangRepository donHangRepo;

    public DanhMucController(
            VungTuyenRepository vungTuyenRepo,
            GoiDichVuRepository goiDichVuRepo,
            LoaiHangHoaRepository loaiHangHoaRepo,
            NganHangRepository nganHangRepo,
            BuuCucRepository buuCucRepo,
            TuyenGiaoHangRepository tuyenRepo,
            DonHangRepository donHangRepo) {
        this.vungTuyenRepo = vungTuyenRepo;
        this.goiDichVuRepo = goiDichVuRepo;
        this.loaiHangHoaRepo = loaiHangHoaRepo;
        this.nganHangRepo = nganHangRepo;
        this.buuCucRepo = buuCucRepo;
        this.tuyenRepo = tuyenRepo;
        this.donHangRepo = donHangRepo;
    }

    @GetMapping("/vung-tuyen")
    public List<VungTuyen> listVungTuyen() {
        return vungTuyenRepo.findAll();
    }

    @PostMapping("/vung-tuyen")
    public VungTuyen saveVungTuyen(@RequestBody VungTuyen req) {
        return vungTuyenRepo.save(req);
    }

    @GetMapping("/goi-dich-vu")
    public List<GoiDichVu> listGoiDichVu() {
        return goiDichVuRepo.findAll();
    }

    @PostMapping("/goi-dich-vu")
    public GoiDichVu saveGoiDichVu(@RequestBody GoiDichVu req) {
        return goiDichVuRepo.save(req);
    }

    @GetMapping("/loai-hang-hoa")
    public List<LoaiHangHoa> listLoaiHangHoa() {
        return loaiHangHoaRepo.findAll();
    }

    @PostMapping("/loai-hang-hoa")
    public LoaiHangHoa saveLoaiHangHoa(@RequestBody LoaiHangHoa req) {
        return loaiHangHoaRepo.save(req);
    }

    @GetMapping("/ngan-hang")
    public List<NganHang> listNganHang() {
        return nganHangRepo.findAll();
    }

    @PostMapping("/ngan-hang")
    public NganHang saveNganHang(@RequestBody NganHang req) {
        return nganHangRepo.save(req);
    }

    @GetMapping("/buu-cuc")
    public List<BuuCuc> listBuuCuc() {
        return buuCucRepo.findAll();
    }

    @PostMapping("/buu-cuc")
    public ResponseEntity<?> saveBuuCuc(@RequestBody BuuCuc req) {
        String blockMsg = validateBuuCucStatus(req.getMaBuuCuc(), req.getTrangThaiHoatDong());
        if (blockMsg != null) {
            return ResponseEntity.badRequest().body(Map.of("message", blockMsg));
        }
        return ResponseEntity.ok(buuCucRepo.save(req));
    }

    @PutMapping("/buu-cuc/{maBuuCuc}")
    public ResponseEntity<?> updateBuuCuc(@PathVariable String maBuuCuc, @RequestBody BuuCuc req) {
        return buuCucRepo.findById(maBuuCuc).map(existing -> {
            String nextStatus = req.getTrangThaiHoatDong() != null ? req.getTrangThaiHoatDong() : existing.getTrangThaiHoatDong();
            String blockMsg = validateBuuCucStatus(maBuuCuc, nextStatus);
            if (blockMsg != null) {
                return ResponseEntity.badRequest().body(Map.of("message", blockMsg));
            }
            if (req.getTenBuuCuc() != null && !req.getTenBuuCuc().isBlank()) existing.setTenBuuCuc(req.getTenBuuCuc());
            if (req.getLoaiKho() != null && !req.getLoaiKho().isBlank()) existing.setLoaiKho(req.getLoaiKho());
            if (req.getDiaChi() != null && !req.getDiaChi().isBlank()) existing.setDiaChi(req.getDiaChi());
            if (req.getToaDoGps() != null) existing.setToaDoGps(req.getToaDoGps());
            existing.setTrangThaiHoatDong(nextStatus);
            return ResponseEntity.ok(buuCucRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/buu-cuc/{maBuuCuc}")
    public ResponseEntity<?> deleteBuuCuc(@PathVariable String maBuuCuc) {
        if (!buuCucRepo.existsById(maBuuCuc)) {
            return ResponseEntity.notFound().build();
        }
        long tonKho = donHangRepo.countByMaBuuCucHienTaiAndTrangThaiIn(
                maBuuCuc, List.of("DaNhapKho", "SanSangGiao", "TamGiuChoXuLy", "ChoLuanChuyenHub"));
        if (tonKho > 0) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Không thể xóa bưu cục đang còn " + tonKho + " kiện hàng tồn kho"));
        }
        try {
            buuCucRepo.deleteById(maBuuCuc);
            return ResponseEntity.ok(Map.of("deleted", maBuuCuc));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Không thể xóa bưu cục đang có dữ liệu liên kết (đơn hàng, nhân viên, tuyến hoặc manifest). Hãy chuyển sang Tạm ngưng."));
        }
    }

    private String validateBuuCucStatus(String maBuuCuc, String status) {
        if ("TamNgung".equalsIgnoreCase(status) && maBuuCuc != null) {
            long tonKho = donHangRepo.countByMaBuuCucHienTaiAndTrangThaiIn(
                    maBuuCuc, List.of("DaNhapKho", "SanSangGiao", "TamGiuChoXuLy", "ChoLuanChuyenHub"));
            if (tonKho > 0) {
                return "Không thể tạm ngưng bưu cục đang còn " + tonKho + " kiện hàng tồn kho";
            }
        }
        return null;
    }

    @GetMapping("/tuyen-giao-hang")
    public List<TuyenGiaoHang> listTuyen() {
        return tuyenRepo.findAll();
    }

    @PostMapping("/tuyen-giao-hang")
    public TuyenGiaoHang saveTuyen(@RequestBody TuyenGiaoHang req) {
        return tuyenRepo.save(req);
    }
}

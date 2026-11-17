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
@RequestMapping("/api/nhan-su")
public class NhanSuController {

    private final NguoiDungRepository nguoiDungRepo;
    private final NhanVienRepository nhanVienRepo;
    private final NhanVienQuayRepository nvQuayRepo;
    private final ShipperRepository shipperRepo;
    private final ViCongNoShipperRepository viRepo;
    private final DonHangRepository donHangRepo;

    public NhanSuController(
            NguoiDungRepository nguoiDungRepo,
            NhanVienRepository nhanVienRepo,
            NhanVienQuayRepository nvQuayRepo,
            ShipperRepository shipperRepo,
            ViCongNoShipperRepository viRepo,
            DonHangRepository donHangRepo) {
        this.nguoiDungRepo = nguoiDungRepo;
        this.nhanVienRepo = nhanVienRepo;
        this.nvQuayRepo = nvQuayRepo;
        this.shipperRepo = shipperRepo;
        this.viRepo = viRepo;
        this.donHangRepo = donHangRepo;
    }

    public record CreateStaffRequest(
            String maNhanVien,
            String hoTen,
            String soDienThoai,
            String email,
            String matKhau,
            String maBuuCuc,
            String loaiNhanVien,
            String bienSoXe) {}

    public record UpdateStaffRequest(String maBuuCuc, String trangThai, String hoTen) {}

    @GetMapping
    public List<Map<String, Object>> listStaff() {
        List<NhanVien> staffList = nhanVienRepo.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (NhanVien nv : staffList) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("maNhanVien", nv.getMaNhanVien());
            row.put("maNguoiDung", nv.getMaNguoiDung());
            row.put("maBuuCuc", nv.getMaBuuCuc());
            row.put("loaiNhanVien", nv.getLoaiNhanVien());
            row.put("ngayVaoLam", nv.getNgayVaoLam());

            nguoiDungRepo.findById(nv.getMaNguoiDung()).ifPresent(nd -> {
                row.put("hoTen", nd.getHoTen());
                row.put("soDienThoai", nd.getSoDienThoai());
                row.put("email", nd.getEmail());
                row.put("trangThai", nd.getTrangThai());
            });

            shipperRepo.findById(nv.getMaNhanVien()).ifPresent(sp -> {
                row.put("bienSoXe", sp.getBienSoXe());
                row.put("trangThaiNhanDon", sp.getTrangThaiNhanDon());
            });

            viRepo.findByMaShipper(nv.getMaNhanVien()).ifPresent(vi -> {
                row.put("tongNoLuyKe", vi.getTongNoLuyKe());
                row.put("daKhoaNhanDon", vi.getDaKhoaNhanDon());
            });

            result.add(row);
        }
        return result;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createStaff(@RequestBody CreateStaffRequest req) {
        if (req.soDienThoai() == null || req.soDienThoai().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Số điện thoại không được để trống"));
        }
        if (nguoiDungRepo.findBySoDienThoai(req.soDienThoai().trim()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Số điện thoại đã tồn tại trên hệ thống"));
        }
        if (req.email() != null && !req.email().isBlank() && nguoiDungRepo.existsByEmail(req.email().trim())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email đã tồn tại trên hệ thống"));
        }

        String maNv = (req.maNhanVien() != null && !req.maNhanVien().isBlank())
                ? req.maNhanVien().trim().toUpperCase()
                : "NV_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        if (nhanVienRepo.existsById(maNv)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã nhân viên đã tồn tại: " + maNv));
        }

        String tempPass = (req.matKhau() != null && !req.matKhau().isBlank()) ? req.matKhau() : "123456";
        String maNd = "ND_" + maNv;

        NguoiDung nd = new NguoiDung();
        nd.setMaNguoiDung(maNd);
        nd.setHoTen(req.hoTen() != null && !req.hoTen().isBlank() ? req.hoTen() : maNv);
        nd.setSoDienThoai(req.soDienThoai().trim());
        nd.setEmail(req.email() != null && !req.email().isBlank() ? req.email().trim() : null);
        nd.setMatKhau(tempPass);
        nd.setTrangThai("Active");
        nguoiDungRepo.save(nd);

        String role = req.loaiNhanVien() != null ? req.loaiNhanVien() : "Quay";
        NhanVien nv = new NhanVien();
        nv.setMaNhanVien(maNv);
        nv.setMaNguoiDung(maNd);
        nv.setMaBuuCuc(req.maBuuCuc() != null ? req.maBuuCuc() : "BC_BENNGHE");
        nv.setLoaiNhanVien(role);
        nv.setNgayVaoLam(LocalDateTime.now());
        nhanVienRepo.save(nv);

        if ("Quay".equalsIgnoreCase(role)) {
            nvQuayRepo.save(new NhanVienQuay(maNv));
        } else if ("Shipper".equalsIgnoreCase(role)) {
            Shipper sp = new Shipper();
            sp.setMaNhanVien(maNv);
            sp.setBienSoXe(req.bienSoXe() != null && !req.bienSoXe().isBlank() ? req.bienSoXe() : "59-A1 999.99");
            sp.setTrangThaiNhanDon("SanSang");
            sp.setTiLeGiaoThanhCong(100.0);
            shipperRepo.save(sp);

            ViCongNoShipper vi = new ViCongNoShipper();
            vi.setMaVi("VI_" + maNv);
            vi.setMaShipper(maNv);
            vi.setTongNoLuyKe(BigDecimal.ZERO);
            vi.setDaKhoaNhanDon(false);
            viRepo.save(vi);
        }

        return ResponseEntity.ok(Map.of(
                "maNhanVien", maNv,
                "maNguoiDung", maNd,
                "matKhauTam", tempPass,
                "message", "Tạo tài khoản nhân sự thành công"
        ));
    }

    @PutMapping("/{maNhanVien}")
    @Transactional
    public ResponseEntity<?> updateOrTransferStaff(
            @PathVariable String maNhanVien,
            @RequestBody UpdateStaffRequest req) {
        Optional<NhanVien> nvOpt = nhanVienRepo.findById(maNhanVien);
        if (nvOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        NhanVien nv = nvOpt.get();

        boolean changingBuuCuc = req.maBuuCuc() != null && !req.maBuuCuc().equals(nv.getMaBuuCuc());
        boolean locking = req.trangThai() != null && "Locked".equalsIgnoreCase(req.trangThai());

        // UC 1.1 branch 5b: từ chối điều chuyển/khóa nếu còn đơn chưa giao hoặc còn nợ COD
        if (changingBuuCuc || locking) {
            long activeOrders = donHangRepo.countByMaShipperAndTrangThaiIn(
                    maNhanVien, List.of("DaPhanCongLay", "DaLayHang", "SanSangGiao", "DangGiaoHang", "ChoGiaoLai"));
            if (activeOrders > 0) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Từ chối điều chuyển/khóa: Nhân sự đang giữ " + activeOrders + " đơn hàng chưa hoàn tất"));
            }
            BigDecimal debt = viRepo.findByMaShipper(maNhanVien)
                    .map(ViCongNoShipper::getTongNoLuyKe)
                    .orElse(BigDecimal.ZERO);
            if (debt.compareTo(BigDecimal.ZERO) > 0) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Từ chối điều chuyển/khóa: Shipper còn nợ tiền COD chưa tất toán (" + debt + "đ)"));
            }
        }

        if (req.maBuuCuc() != null && !req.maBuuCuc().isBlank()) {
            nv.setMaBuuCuc(req.maBuuCuc());
            nhanVienRepo.save(nv);
        }

        nguoiDungRepo.findById(nv.getMaNguoiDung()).ifPresent(nd -> {
            if (req.hoTen() != null && !req.hoTen().isBlank()) nd.setHoTen(req.hoTen());
            if (req.trangThai() != null && !req.trangThai().isBlank()) nd.setTrangThai(req.trangThai());
            nguoiDungRepo.save(nd);
        });

        return ResponseEntity.ok(Map.of("maNhanVien", maNhanVien, "message", "Đã cập nhật thông tin nhân sự"));
    }

    @PostMapping("/{maNhanVien}/cap-lai-mat-khau")
    @Transactional
    public ResponseEntity<?> resetPassword(@PathVariable String maNhanVien) {
        return nhanVienRepo.findById(maNhanVien).map(nv -> {
            String tempPass = "FP@" + (100000 + new Random().nextInt(899999));
            nguoiDungRepo.findById(nv.getMaNguoiDung()).ifPresent(nd -> {
                nd.setMatKhau(tempPass);
                nguoiDungRepo.save(nd);
            });
            return ResponseEntity.ok(Map.of(
                    "maNhanVien", maNhanVien,
                    "matKhauTam", tempPass,
                    "message", "Cấp lại mật khẩu tạm thời thành công"
            ));
        }).orElse(ResponseEntity.notFound().build());
    }
}

package com.fastpost.controller;

import com.fastpost.config.JwtUtil;
import com.fastpost.entity.KhachHang;
import com.fastpost.entity.NguoiDung;
import com.fastpost.entity.NhanVien;
import com.fastpost.repository.KhachHangRepository;
import com.fastpost.repository.NguoiDungRepository;
import com.fastpost.repository.NhanVienRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final NguoiDungRepository nguoiDungRepo;
    private final NhanVienRepository nhanVienRepo;
    private final KhachHangRepository khachHangRepo;
    private final JwtUtil jwtUtil;

    public AuthController(
            NguoiDungRepository nguoiDungRepo,
            NhanVienRepository nhanVienRepo,
            KhachHangRepository khachHangRepo,
            JwtUtil jwtUtil) {
        this.nguoiDungRepo = nguoiDungRepo;
        this.nhanVienRepo = nhanVienRepo;
        this.khachHangRepo = khachHangRepo;
        this.jwtUtil = jwtUtil;
    }

    public record StaffLoginRequest(String identifier, String password) {}
    public record OtpLoginRequest(String phone, String otp) {}

    @PostMapping("/login")
    public ResponseEntity<?> loginStaff(@RequestBody StaffLoginRequest req) {
        Optional<NguoiDung> userOpt = nguoiDungRepo.findBySoDienThoai(req.identifier());
        if (userOpt.isEmpty()) {
            Optional<NhanVien> nvOpt = nhanVienRepo.findById(req.identifier());
            if (nvOpt.isPresent()) {
                userOpt = nguoiDungRepo.findById(nvOpt.get().getMaNguoiDung());
            }
        }
        if (userOpt.isEmpty() || !req.password().equals(userOpt.get().getMatKhau())) {
            return ResponseEntity.status(401).body(Map.of("message", "Sai thông tin đăng nhập hoặc mật khẩu"));
        }

        NguoiDung user = userOpt.get();
        if ("Locked".equalsIgnoreCase(user.getTrangThai()) || "Khoa".equalsIgnoreCase(user.getTrangThai())) {
            return ResponseEntity.status(403).body(Map.of("message", "Tài khoản nhân sự đã bị khóa bởi Quản trị viên"));
        }

        String role = "KhachHang";
        String maNhanVien = null;
        String maBuuCuc = null;

        Optional<NhanVien> nvOpt = nhanVienRepo.findByMaNguoiDung(user.getMaNguoiDung());
        if (nvOpt.isPresent()) {
            role = nvOpt.get().getLoaiNhanVien();
            maNhanVien = nvOpt.get().getMaNhanVien();
            maBuuCuc = nvOpt.get().getMaBuuCuc();
        }

        String token = jwtUtil.generateToken(user.getMaNguoiDung(), role);
        return ResponseEntity.ok(Map.of(
                "token", token,
                "maNguoiDung", user.getMaNguoiDung(),
                "hoTen", user.getHoTen(),
                "soDienThoai", user.getSoDienThoai(),
                "role", role,
                "maNhanVien", maNhanVien != null ? maNhanVien : "",
                "maBuuCuc", maBuuCuc != null ? maBuuCuc : ""
        ));
    }

    @PostMapping("/otp-login")
    @Transactional
    public ResponseEntity<?> loginCustomerOtp(@RequestBody OtpLoginRequest req) {
        String phone = req.phone() != null ? req.phone().trim() : "";
        if (!phone.matches("^0\\d{9,10}$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Số điện thoại không đúng định dạng (10 chữ số bắt đầu bằng 0)"));
        }
        if (!"123456".equals(req.otp())) {
            return ResponseEntity.status(401).body(Map.of("message", "Mã OTP không hợp lệ hoặc đã hết hạn (demo: 123456)"));
        }

        NguoiDung user = nguoiDungRepo.findBySoDienThoai(phone)
                .orElseGet(() -> {
                    NguoiDung created = new NguoiDung();
                    created.setMaNguoiDung("ND_KH_" + System.currentTimeMillis());
                    created.setSoDienThoai(phone);
                    created.setHoTen("Khách hàng " + phone);
                    created.setTrangThai("Active");
                    return nguoiDungRepo.save(created);
                });

        // UC 2.1 branch 8a & UC 2.2: Tạo hồ sơ KhachHang hoặc kích hoạt Shadow Account (la_tai_khoan_ngam -> false)
        KhachHang kh = khachHangRepo.findById(user.getMaNguoiDung()).orElseGet(() -> {
            KhachHang createdKh = new KhachHang();
            createdKh.setMaNguoiDung(user.getMaNguoiDung());
            createdKh.setLoaiKhachHang("CaNhan");
            createdKh.setLaTaiKhoanNgam(false);
            createdKh.setNgayKichHoat(LocalDateTime.now());
            return khachHangRepo.save(createdKh);
        });
        if (kh.isLaTaiKhoanNgam()) {
            kh.setLaTaiKhoanNgam(false);
            kh.setNgayKichHoat(LocalDateTime.now());
            khachHangRepo.save(kh);
        }

        String token = jwtUtil.generateToken(user.getMaNguoiDung(), "KhachHang");
        return ResponseEntity.ok(Map.of(
                "token", token,
                "maNguoiDung", user.getMaNguoiDung(),
                "hoTen", user.getHoTen(),
                "soDienThoai", user.getSoDienThoai(),
                "role", "KhachHang"
        ));
    }
}

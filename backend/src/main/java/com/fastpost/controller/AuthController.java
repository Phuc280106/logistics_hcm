package com.fastpost.controller;

import com.fastpost.config.JwtUtil;
import com.fastpost.entity.NguoiDung;
import com.fastpost.entity.NhanVien;
import com.fastpost.repository.NguoiDungRepository;
import com.fastpost.repository.NhanVienRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final NguoiDungRepository nguoiDungRepo;
    private final NhanVienRepository nhanVienRepo;
    private final JwtUtil jwtUtil;

    public AuthController(NguoiDungRepository nguoiDungRepo, NhanVienRepository nhanVienRepo, JwtUtil jwtUtil) {
        this.nguoiDungRepo = nguoiDungRepo;
        this.nhanVienRepo = nhanVienRepo;
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
    public ResponseEntity<?> loginCustomerOtp(@RequestBody OtpLoginRequest req) {
        if (!"123456".equals(req.otp())) {
            return ResponseEntity.status(401).body(Map.of("message", "Mã OTP không hợp lệ (demo: 123456)"));
        }
        NguoiDung user = nguoiDungRepo.findBySoDienThoai(req.phone())
                .orElseGet(() -> {
                    NguoiDung created = new NguoiDung();
                    created.setMaNguoiDung("ND_KH_" + System.currentTimeMillis());
                    created.setSoDienThoai(req.phone());
                    created.setHoTen("Khách hàng " + req.phone());
                    created.setTrangThai("Active");
                    return nguoiDungRepo.save(created);
                });
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

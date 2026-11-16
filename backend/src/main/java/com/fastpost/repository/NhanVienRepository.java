package com.fastpost.repository;

import com.fastpost.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface NhanVienRepository extends JpaRepository<NhanVien, String> {
    Optional<NhanVien> findByMaNguoiDung(String maNguoiDung);
}

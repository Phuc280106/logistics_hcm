package com.fastpost.repository;

import com.fastpost.entity.TaiKhoanNganHang;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaiKhoanNganHangRepository extends JpaRepository<TaiKhoanNganHang, String> {
    List<TaiKhoanNganHang> findByMaKhachHangOrderByLaMacDinhCodDesc(String maKhachHang);
}

package com.fastpost.repository;

import com.fastpost.entity.SoDiaChi;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SoDiaChiRepository extends JpaRepository<SoDiaChi, String> {
    List<SoDiaChi> findByMaKhachHangOrderByLaMacDinhDesc(String maKhachHang);
}

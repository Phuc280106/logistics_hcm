package com.fastpost.repository;

import com.fastpost.entity.BangChungGiaoHang;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BangChungGiaoHangRepository extends JpaRepository<BangChungGiaoHang, String> {
    Optional<BangChungGiaoHang> findByMaVanDon(String maVanDon);
}

package com.fastpost.repository;

import com.fastpost.entity.LichSuHanhTrinh;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LichSuHanhTrinhRepository extends JpaRepository<LichSuHanhTrinh, String> {
    List<LichSuHanhTrinh> findByMaVanDonOrderByThoiGianAsc(String maVanDon);
}

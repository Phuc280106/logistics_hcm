package com.fastpost.repository;

import com.fastpost.entity.LichHenGiaoLai;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LichHenGiaoLaiRepository extends JpaRepository<LichHenGiaoLai, String> {
    List<LichHenGiaoLai> findByMaVanDonOrderByLanGiaoThuAsc(String maVanDon);
}

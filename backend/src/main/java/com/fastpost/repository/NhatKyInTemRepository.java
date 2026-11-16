package com.fastpost.repository;

import com.fastpost.entity.NhatKyInTem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NhatKyInTemRepository extends JpaRepository<NhatKyInTem, String> {
    List<NhatKyInTem> findByMaVanDonOrderByThoiGianInDesc(String maVanDon);
    List<NhatKyInTem> findTop20ByOrderByThoiGianInDesc();
    long countByMaVanDon(String maVanDon);
}

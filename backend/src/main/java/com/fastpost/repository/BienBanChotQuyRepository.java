package com.fastpost.repository;

import com.fastpost.entity.BienBanChotQuy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BienBanChotQuyRepository extends JpaRepository<BienBanChotQuy, String> {
    List<BienBanChotQuy> findAllByOrderByNgayChotDesc();
}

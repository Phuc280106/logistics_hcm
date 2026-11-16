package com.fastpost.repository;

import com.fastpost.entity.BangKeQuyetToanShop;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BangKeQuyetToanShopRepository extends JpaRepository<BangKeQuyetToanShop, String> {
    List<BangKeQuyetToanShop> findByMaKy(String maKy);
}

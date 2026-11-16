package com.fastpost.repository;

import com.fastpost.entity.BaoCaoDoanhThu;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BaoCaoDoanhThuRepository extends JpaRepository<BaoCaoDoanhThu, String> {
    List<BaoCaoDoanhThu> findAllByOrderByDenNgayDesc();
}

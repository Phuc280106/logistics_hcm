package com.fastpost.repository;

import com.fastpost.entity.ChiTietTieuTuyen;
import com.fastpost.entity.ChiTietTieuTuyenId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChiTietTieuTuyenRepository extends JpaRepository<ChiTietTieuTuyen, ChiTietTieuTuyenId> {
    List<ChiTietTieuTuyen> findByMaTieuTuyen(String maTieuTuyen);
    Optional<ChiTietTieuTuyen> findFirstByQuanHuyenIgnoreCaseAndPhuongXaIgnoreCase(String quanHuyen, String phuongXa);
}

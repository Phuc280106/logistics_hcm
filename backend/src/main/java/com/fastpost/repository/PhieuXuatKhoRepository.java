package com.fastpost.repository;

import com.fastpost.entity.PhieuXuatKho;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PhieuXuatKhoRepository extends JpaRepository<PhieuXuatKho, String> {
    List<PhieuXuatKho> findAllByOrderByThoiGianXuatDesc();
    List<PhieuXuatKho> findByMaShipperOrderByThoiGianXuatDesc(String maShipper);
}

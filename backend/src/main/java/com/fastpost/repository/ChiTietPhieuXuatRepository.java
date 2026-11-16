package com.fastpost.repository;

import com.fastpost.entity.ChiTietPhieuXuat;
import com.fastpost.entity.ChiTietPhieuXuatId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChiTietPhieuXuatRepository extends JpaRepository<ChiTietPhieuXuat, ChiTietPhieuXuatId> {
    List<ChiTietPhieuXuat> findByMaPhieuXuat(String maPhieuXuat);
}

package com.fastpost.repository;

import com.fastpost.entity.ChiTietBangGia;
import com.fastpost.entity.ChiTietBangGiaId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChiTietBangGiaRepository extends JpaRepository<ChiTietBangGia, ChiTietBangGiaId> {
    List<ChiTietBangGia> findByMaBangGia(String maBangGia);
}

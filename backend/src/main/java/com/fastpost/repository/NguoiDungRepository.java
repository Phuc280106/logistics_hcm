package com.fastpost.repository;

import com.fastpost.entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface NguoiDungRepository extends JpaRepository<NguoiDung, String> {
    Optional<NguoiDung> findBySoDienThoai(String soDienThoai);
    boolean existsByEmail(String email);
}

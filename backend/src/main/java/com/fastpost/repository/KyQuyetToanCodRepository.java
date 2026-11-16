package com.fastpost.repository;

import com.fastpost.entity.KyQuyetToanCod;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface KyQuyetToanCodRepository extends JpaRepository<KyQuyetToanCod, String> {
    List<KyQuyetToanCod> findAllByOrderByTuNgayDesc();
}

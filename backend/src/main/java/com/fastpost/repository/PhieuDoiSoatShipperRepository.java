package com.fastpost.repository;

import com.fastpost.entity.PhieuDoiSoatShipper;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PhieuDoiSoatShipperRepository extends JpaRepository<PhieuDoiSoatShipper, String> {
    List<PhieuDoiSoatShipper> findAllByOrderByNgayDoiSoatDesc();
    List<PhieuDoiSoatShipper> findByMaShipperOrderByNgayDoiSoatDesc(String maShipper);
}

package com.fastpost.repository;

import com.fastpost.entity.DonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DonHangRepository extends JpaRepository<DonHang, String> {
    List<DonHang> findByMaShipperOrderByNgayTaoDesc(String maShipper);
    List<DonHang> findByMaKhachHangOrderByNgayTaoDesc(String maKhachHang);
    List<DonHang> findByTrangThaiOrderByNgayTaoDesc(String trangThai);
    List<DonHang> findAllByOrderByNgayTaoDesc();
}

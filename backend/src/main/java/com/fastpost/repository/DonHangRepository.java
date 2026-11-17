package com.fastpost.repository;

import com.fastpost.entity.DonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;

public interface DonHangRepository extends JpaRepository<DonHang, String> {
    List<DonHang> findByMaShipperOrderByNgayTaoDesc(String maShipper);
    List<DonHang> findByMaKhachHangOrderByNgayTaoDesc(String maKhachHang);
    List<DonHang> findByNguoiGuiSdtOrderByNgayTaoDesc(String nguoiGuiSdt);
    List<DonHang> findByTrangThaiOrderByNgayTaoDesc(String trangThai);
    List<DonHang> findByMaBuuCucHienTaiAndTrangThaiOrderByNgayTaoDesc(String maBuuCucHienTai, String trangThai);
    long countByMaBuuCucHienTaiAndTrangThaiIn(String maBuuCucHienTai, Collection<String> trangThais);
    long countByMaShipperAndTrangThaiIn(String maShipper, Collection<String> trangThais);
    List<DonHang> findAllByOrderByNgayTaoDesc();
}

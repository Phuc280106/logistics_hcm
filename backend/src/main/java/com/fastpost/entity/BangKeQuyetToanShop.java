package com.fastpost.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "bang_ke_quyet_toan_shop")
public class BangKeQuyetToanShop {
    @Id
    @Column(name = "ma_bang_ke", length = 50)
    private String maBangKe;

    @Column(name = "ma_ky", length = 50, nullable = false)
    private String maKy;

    @Column(name = "ma_khach_hang", length = 50, nullable = false)
    private String maKhachHang;

    @Column(name = "ma_tai_khoan_ngan_hang", length = 50)
    private String maTaiKhoanNganHang;

    @Column(name = "tong_cod", precision = 18, scale = 2, nullable = false)
    private BigDecimal tongCod = BigDecimal.ZERO;

    @Column(name = "tong_cuoc_tru", precision = 18, scale = 2, nullable = false)
    private BigDecimal tongCuocTru = BigDecimal.ZERO;

    @Column(name = "thuc_tra", precision = 18, scale = 2, nullable = false)
    private BigDecimal thucTra = BigDecimal.ZERO;

    @Column(name = "trang_thai_thanh_toan", length = 50, nullable = false)
    private String trangThaiThanhToan;

    @Column(name = "ma_giao_dich_ngan_hang", length = 100)
    private String maGiaoDichNganHang;

    public String getMaBangKe() { return maBangKe; }
    public void setMaBangKe(String maBangKe) { this.maBangKe = maBangKe; }
    public String getMaKy() { return maKy; }
    public void setMaKy(String maKy) { this.maKy = maKy; }
    public String getMaKhachHang() { return maKhachHang; }
    public void setMaKhachHang(String maKhachHang) { this.maKhachHang = maKhachHang; }
    public String getMaTaiKhoanNganHang() { return maTaiKhoanNganHang; }
    public void setMaTaiKhoanNganHang(String maTaiKhoanNganHang) { this.maTaiKhoanNganHang = maTaiKhoanNganHang; }
    public BigDecimal getTongCod() { return tongCod; }
    public void setTongCod(BigDecimal tongCod) { this.tongCod = tongCod; }
    public BigDecimal getTongCuocTru() { return tongCuocTru; }
    public void setTongCuocTru(BigDecimal tongCuocTru) { this.tongCuocTru = tongCuocTru; }
    public BigDecimal getThucTra() { return thucTra; }
    public void setThucTra(BigDecimal thucTra) { this.thucTra = thucTra; }
    public String getTrangThaiThanhToan() { return trangThaiThanhToan; }
    public void setTrangThaiThanhToan(String trangThaiThanhToan) { this.trangThaiThanhToan = trangThaiThanhToan; }
    public String getMaGiaoDichNganHang() { return maGiaoDichNganHang; }
    public void setMaGiaoDichNganHang(String maGiaoDichNganHang) { this.maGiaoDichNganHang = maGiaoDichNganHang; }
}

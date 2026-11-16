package com.fastpost.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "phieu_xuat_kho")
public class PhieuXuatKho {
    @Id
    @Column(name = "ma_phieu_xuat", length = 50)
    private String maPhieuXuat;

    @Column(name = "ma_buu_cuc", length = 50, nullable = false)
    private String maBuuCuc;

    @Column(name = "ma_nhan_vien_kho", length = 50, nullable = false)
    private String maNhanVienKho;

    @Column(name = "ma_shipper", length = 50, nullable = false)
    private String maShipper;

    @Column(name = "thoi_gian_xuat", nullable = false)
    private LocalDateTime thoiGianXuat = LocalDateTime.now();

    @Column(name = "tong_so_don", nullable = false)
    private Integer tongSoDon = 0;

    @Column(name = "tong_tien_cod_phai_thu", precision = 18, scale = 2, nullable = false)
    private BigDecimal tongTienCodPhaiThu = BigDecimal.ZERO;

    @Column(name = "shipper_da_xac_nhan", nullable = false)
    private Boolean shipperDaXacNhan = false;

    public String getMaPhieuXuat() { return maPhieuXuat; }
    public void setMaPhieuXuat(String maPhieuXuat) { this.maPhieuXuat = maPhieuXuat; }
    public String getMaBuuCuc() { return maBuuCuc; }
    public void setMaBuuCuc(String maBuuCuc) { this.maBuuCuc = maBuuCuc; }
    public String getMaNhanVienKho() { return maNhanVienKho; }
    public void setMaNhanVienKho(String maNhanVienKho) { this.maNhanVienKho = maNhanVienKho; }
    public String getMaShipper() { return maShipper; }
    public void setMaShipper(String maShipper) { this.maShipper = maShipper; }
    public LocalDateTime getThoiGianXuat() { return thoiGianXuat; }
    public void setThoiGianXuat(LocalDateTime thoiGianXuat) { this.thoiGianXuat = thoiGianXuat; }
    public Integer getTongSoDon() { return tongSoDon; }
    public void setTongSoDon(Integer tongSoDon) { this.tongSoDon = tongSoDon; }
    public BigDecimal getTongTienCodPhaiThu() { return tongTienCodPhaiThu; }
    public void setTongTienCodPhaiThu(BigDecimal tongTienCodPhaiThu) { this.tongTienCodPhaiThu = tongTienCodPhaiThu; }
    public Boolean getShipperDaXacNhan() { return shipperDaXacNhan; }
    public void setShipperDaXacNhan(Boolean shipperDaXacNhan) { this.shipperDaXacNhan = shipperDaXacNhan; }
}

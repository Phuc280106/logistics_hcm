package com.fastpost.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "buu_cuc")
public class BuuCuc {
    @Id
    @Column(name = "ma_buu_cuc", length = 50)
    private String maBuuCuc;

    @Column(name = "ten_buu_cuc", length = 150, nullable = false, unique = true)
    private String tenBuuCuc;

    @Column(name = "loai_kho", length = 50, nullable = false)
    private String loaiKho;

    @Column(name = "dia_chi", nullable = false)
    private String diaChi;

    @Column(name = "toa_do_gps", length = 100)
    private String toaDoGps;

    @Column(name = "so_du_quy_ket", precision = 18, scale = 2, nullable = false)
    private BigDecimal soDuQuyKet = BigDecimal.ZERO;

    @Column(name = "trang_thai_hoat_dong", length = 50, nullable = false)
    private String trangThaiHoatDong;

    public String getMaBuuCuc() { return maBuuCuc; }
    public void setMaBuuCuc(String maBuuCuc) { this.maBuuCuc = maBuuCuc; }
    public String getTenBuuCuc() { return tenBuuCuc; }
    public void setTenBuuCuc(String tenBuuCuc) { this.tenBuuCuc = tenBuuCuc; }
    public String getLoaiKho() { return loaiKho; }
    public void setLoaiKho(String loaiKho) { this.loaiKho = loaiKho; }
    public String getDiaChi() { return diaChi; }
    public void setDiaChi(String diaChi) { this.diaChi = diaChi; }
    public String getToaDoGps() { return toaDoGps; }
    public void setToaDoGps(String toaDoGps) { this.toaDoGps = toaDoGps; }
    public BigDecimal getSoDuQuyKet() { return soDuQuyKet; }
    public void setSoDuQuyKet(BigDecimal soDuQuyKet) { this.soDuQuyKet = soDuQuyKet; }
    public String getTrangThaiHoatDong() { return trangThaiHoatDong; }
    public void setTrangThaiHoatDong(String trangThaiHoatDong) { this.trangThaiHoatDong = trangThaiHoatDong; }
}

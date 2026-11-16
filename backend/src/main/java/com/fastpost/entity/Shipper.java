package com.fastpost.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "shipper")
public class Shipper {
    @Id
    @Column(name = "ma_nhan_vien", length = 50)
    private String maNhanVien;

    @Column(name = "bien_so_xe", length = 30)
    private String bienSoXe;

    @Column(name = "trang_thai_nhan_don", length = 50, nullable = false)
    private String trangThaiNhanDon;

    @Column(name = "ti_le_giao_thanh_cong", nullable = false)
    private Double tiLeGiaoThanhCong = 100.0;

    public String getMaNhanVien() { return maNhanVien; }
    public void setMaNhanVien(String maNhanVien) { this.maNhanVien = maNhanVien; }
    public String getBienSoXe() { return bienSoXe; }
    public void setBienSoXe(String bienSoXe) { this.bienSoXe = bienSoXe; }
    public String getTrangThaiNhanDon() { return trangThaiNhanDon; }
    public void setTrangThaiNhanDon(String trangThaiNhanDon) { this.trangThaiNhanDon = trangThaiNhanDon; }
    public Double getTiLeGiaoThanhCong() { return tiLeGiaoThanhCong; }
    public void setTiLeGiaoThanhCong(Double tiLeGiaoThanhCong) { this.tiLeGiaoThanhCong = tiLeGiaoThanhCong; }
}

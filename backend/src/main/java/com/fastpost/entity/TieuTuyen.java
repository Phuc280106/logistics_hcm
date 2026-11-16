package com.fastpost.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tieu_tuyen")
public class TieuTuyen {
    @Id
    @Column(name = "ma_tieu_tuyen", length = 50)
    private String maTieuTuyen;

    @Column(name = "ma_tuyen", length = 50, nullable = false)
    private String maTuyen;

    @Column(name = "ma_shipper", length = 50)
    private String maShipper;

    @Column(name = "ten_tieu_tuyen", length = 150, nullable = false)
    private String tenTieuTuyen;

    public String getMaTieuTuyen() { return maTieuTuyen; }
    public void setMaTieuTuyen(String maTieuTuyen) { this.maTieuTuyen = maTieuTuyen; }
    public String getMaTuyen() { return maTuyen; }
    public void setMaTuyen(String maTuyen) { this.maTuyen = maTuyen; }
    public String getMaShipper() { return maShipper; }
    public void setMaShipper(String maShipper) { this.maShipper = maShipper; }
    public String getTenTieuTuyen() { return tenTieuTuyen; }
    public void setTenTieuTuyen(String tenTieuTuyen) { this.tenTieuTuyen = tenTieuTuyen; }
}

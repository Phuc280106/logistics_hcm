package com.fastpost.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "chi_tiet_tieu_tuyen")
@IdClass(ChiTietTieuTuyenId.class)
public class ChiTietTieuTuyen {
    @Id
    @Column(name = "ma_tieu_tuyen", length = 50)
    private String maTieuTuyen;

    @Id
    @Column(name = "quan_huyen", length = 100)
    private String quanHuyen;

    @Id
    @Column(name = "phuong_xa", length = 100)
    private String phuongXa;

    public String getMaTieuTuyen() { return maTieuTuyen; }
    public void setMaTieuTuyen(String maTieuTuyen) { this.maTieuTuyen = maTieuTuyen; }
    public String getQuanHuyen() { return quanHuyen; }
    public void setQuanHuyen(String quanHuyen) { this.quanHuyen = quanHuyen; }
    public String getPhuongXa() { return phuongXa; }
    public void setPhuongXa(String phuongXa) { this.phuongXa = phuongXa; }
}

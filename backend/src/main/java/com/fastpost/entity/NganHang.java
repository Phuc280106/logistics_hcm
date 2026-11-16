package com.fastpost.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ngan_hang")
public class NganHang {
    @Id
    @Column(name = "ma_ngan_hang_dm", length = 50)
    private String maNganHangDm;

    @Column(name = "ten_ngan_hang", length = 150, nullable = false)
    private String tenNganHang;

    @Column(name = "ten_viet_tat", length = 50, nullable = false)
    private String tenVietTat;

    public String getMaNganHangDm() { return maNganHangDm; }
    public void setMaNganHangDm(String maNganHangDm) { this.maNganHangDm = maNganHangDm; }
    public String getTenNganHang() { return tenNganHang; }
    public void setTenNganHang(String tenNganHang) { this.tenNganHang = tenNganHang; }
    public String getTenVietTat() { return tenVietTat; }
    public void setTenVietTat(String tenVietTat) { this.tenVietTat = tenVietTat; }
}

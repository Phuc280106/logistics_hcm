package com.fastpost.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "nhan_vien_quay")
public class NhanVienQuay {
    @Id
    @Column(name = "ma_nhan_vien", length = 50)
    private String maNhanVien;

    public NhanVienQuay() {}
    public NhanVienQuay(String maNhanVien) { this.maNhanVien = maNhanVien; }

    public String getMaNhanVien() { return maNhanVien; }
    public void setMaNhanVien(String maNhanVien) { this.maNhanVien = maNhanVien; }
}

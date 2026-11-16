package com.fastpost.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "chi_tiet_phieu_xuat")
@IdClass(ChiTietPhieuXuatId.class)
public class ChiTietPhieuXuat {
    @Id
    @Column(name = "ma_phieu_xuat", length = 50)
    private String maPhieuXuat;

    @Id
    @Column(name = "ma_van_don", length = 50)
    private String maVanDon;

    @Column(name = "ghi_chu_ban_giao")
    private String ghiChuBanGiao;

    public String getMaPhieuXuat() { return maPhieuXuat; }
    public void setMaPhieuXuat(String maPhieuXuat) { this.maPhieuXuat = maPhieuXuat; }
    public String getMaVanDon() { return maVanDon; }
    public void setMaVanDon(String maVanDon) { this.maVanDon = maVanDon; }
    public String getGhiChuBanGiao() { return ghiChuBanGiao; }
    public void setGhiChuBanGiao(String ghiChuBanGiao) { this.ghiChuBanGiao = ghiChuBanGiao; }
}

package com.fastpost.entity;

import java.io.Serializable;
import java.util.Objects;

public class ChiTietPhieuXuatId implements Serializable {
    private String maPhieuXuat;
    private String maVanDon;

    public ChiTietPhieuXuatId() {}
    public ChiTietPhieuXuatId(String maPhieuXuat, String maVanDon) {
        this.maPhieuXuat = maPhieuXuat;
        this.maVanDon = maVanDon;
    }

    public String getMaPhieuXuat() { return maPhieuXuat; }
    public void setMaPhieuXuat(String maPhieuXuat) { this.maPhieuXuat = maPhieuXuat; }
    public String getMaVanDon() { return maVanDon; }
    public void setMaVanDon(String maVanDon) { this.maVanDon = maVanDon; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChiTietPhieuXuatId that)) return false;
        return Objects.equals(maPhieuXuat, that.maPhieuXuat) && Objects.equals(maVanDon, that.maVanDon);
    }

    @Override
    public int hashCode() {
        return Objects.hash(maPhieuXuat, maVanDon);
    }
}

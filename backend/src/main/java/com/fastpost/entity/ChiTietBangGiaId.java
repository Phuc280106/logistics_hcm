package com.fastpost.entity;

import java.io.Serializable;
import java.util.Objects;

public class ChiTietBangGiaId implements Serializable {
    private String maBangGia;
    private String maVungTuyen;
    private String maGoiDichVu;

    public ChiTietBangGiaId() {}
    public ChiTietBangGiaId(String maBangGia, String maVungTuyen, String maGoiDichVu) {
        this.maBangGia = maBangGia;
        this.maVungTuyen = maVungTuyen;
        this.maGoiDichVu = maGoiDichVu;
    }

    public String getMaBangGia() { return maBangGia; }
    public void setMaBangGia(String maBangGia) { this.maBangGia = maBangGia; }
    public String getMaVungTuyen() { return maVungTuyen; }
    public void setMaVungTuyen(String maVungTuyen) { this.maVungTuyen = maVungTuyen; }
    public String getMaGoiDichVu() { return maGoiDichVu; }
    public void setMaGoiDichVu(String maGoiDichVu) { this.maGoiDichVu = maGoiDichVu; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChiTietBangGiaId that)) return false;
        return Objects.equals(maBangGia, that.maBangGia)
                && Objects.equals(maVungTuyen, that.maVungTuyen)
                && Objects.equals(maGoiDichVu, that.maGoiDichVu);
    }

    @Override
    public int hashCode() {
        return Objects.hash(maBangGia, maVungTuyen, maGoiDichVu);
    }
}

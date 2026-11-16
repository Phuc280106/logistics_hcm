package com.fastpost.entity;

import java.io.Serializable;
import java.util.Objects;

public class ChiTietTieuTuyenId implements Serializable {
    private String maTieuTuyen;
    private String quanHuyen;
    private String phuongXa;

    public ChiTietTieuTuyenId() {}
    public ChiTietTieuTuyenId(String maTieuTuyen, String quanHuyen, String phuongXa) {
        this.maTieuTuyen = maTieuTuyen;
        this.quanHuyen = quanHuyen;
        this.phuongXa = phuongXa;
    }

    public String getMaTieuTuyen() { return maTieuTuyen; }
    public void setMaTieuTuyen(String maTieuTuyen) { this.maTieuTuyen = maTieuTuyen; }
    public String getQuanHuyen() { return quanHuyen; }
    public void setQuanHuyen(String quanHuyen) { this.quanHuyen = quanHuyen; }
    public String getPhuongXa() { return phuongXa; }
    public void setPhuongXa(String phuongXa) { this.phuongXa = phuongXa; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChiTietTieuTuyenId that)) return false;
        return Objects.equals(maTieuTuyen, that.maTieuTuyen)
                && Objects.equals(quanHuyen, that.quanHuyen)
                && Objects.equals(phuongXa, that.phuongXa);
    }

    @Override
    public int hashCode() {
        return Objects.hash(maTieuTuyen, quanHuyen, phuongXa);
    }
}

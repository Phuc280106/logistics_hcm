package com.fastpost.entity;

import java.io.Serializable;
import java.util.Objects;

public class ChiTietManifestId implements Serializable {
    private String maManifest;
    private String maVanDon;

    public ChiTietManifestId() {}
    public ChiTietManifestId(String maManifest, String maVanDon) {
        this.maManifest = maManifest;
        this.maVanDon = maVanDon;
    }

    public String getMaManifest() { return maManifest; }
    public void setMaManifest(String maManifest) { this.maManifest = maManifest; }
    public String getMaVanDon() { return maVanDon; }
    public void setMaVanDon(String maVanDon) { this.maVanDon = maVanDon; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChiTietManifestId that)) return false;
        return Objects.equals(maManifest, that.maManifest) && Objects.equals(maVanDon, that.maVanDon);
    }

    @Override
    public int hashCode() {
        return Objects.hash(maManifest, maVanDon);
    }
}

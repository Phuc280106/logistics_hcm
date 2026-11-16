package com.fastpost.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "manifest")
public class Manifest {
    @Id
    @Column(name = "ma_manifest", length = 50)
    private String maManifest;

    @Column(name = "ma_buu_cuc_di", length = 50, nullable = false)
    private String maBuuCucDi;

    @Column(name = "ma_buu_cuc_den", length = 50, nullable = false)
    private String maBuuCucDen;

    @Column(name = "ma_nhan_vien_lap", length = 50, nullable = false)
    private String maNhanVienLap;

    @Column(name = "ngay_lap", nullable = false)
    private LocalDateTime ngayLap = LocalDateTime.now();

    @Column(name = "tong_so_kien", nullable = false)
    private Integer tongSoKien = 0;

    @Column(name = "trang_thai", length = 50, nullable = false)
    private String trangThai;

    public String getMaManifest() { return maManifest; }
    public void setMaManifest(String maManifest) { this.maManifest = maManifest; }
    public String getMaBuuCucDi() { return maBuuCucDi; }
    public void setMaBuuCucDi(String maBuuCucDi) { this.maBuuCucDi = maBuuCucDi; }
    public String getMaBuuCucDen() { return maBuuCucDen; }
    public void setMaBuuCucDen(String maBuuCucDen) { this.maBuuCucDen = maBuuCucDen; }
    public String getMaNhanVienLap() { return maNhanVienLap; }
    public void setMaNhanVienLap(String maNhanVienLap) { this.maNhanVienLap = maNhanVienLap; }
    public LocalDateTime getNgayLap() { return ngayLap; }
    public void setNgayLap(LocalDateTime ngayLap) { this.ngayLap = ngayLap; }
    public Integer getTongSoKien() { return tongSoKien; }
    public void setTongSoKien(Integer tongSoKien) { this.tongSoKien = tongSoKien; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
}

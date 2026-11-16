package com.fastpost.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tuyen_giao_hang")
public class TuyenGiaoHang {
    @Id
    @Column(name = "ma_tuyen", length = 50)
    private String maTuyen;

    @Column(name = "ma_buu_cuc", length = 50, nullable = false)
    private String maBuuCuc;

    @Column(name = "ten_tuyen", length = 150, nullable = false)
    private String tenTuyen;

    @Column(name = "loai_tuyen", length = 50, nullable = false)
    private String loaiTuyen;

    public String getMaTuyen() { return maTuyen; }
    public void setMaTuyen(String maTuyen) { this.maTuyen = maTuyen; }
    public String getMaBuuCuc() { return maBuuCuc; }
    public void setMaBuuCuc(String maBuuCuc) { this.maBuuCuc = maBuuCuc; }
    public String getTenTuyen() { return tenTuyen; }
    public void setTenTuyen(String tenTuyen) { this.tenTuyen = tenTuyen; }
    public String getLoaiTuyen() { return loaiTuyen; }
    public void setLoaiTuyen(String loaiTuyen) { this.loaiTuyen = loaiTuyen; }
}

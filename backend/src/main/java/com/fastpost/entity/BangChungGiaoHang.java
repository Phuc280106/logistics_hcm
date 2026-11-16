package com.fastpost.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bang_chung_giao_hang")
public class BangChungGiaoHang {
    @Id
    @Column(name = "ma_pod", length = 50)
    private String maPod;

    @Column(name = "ma_van_don", length = 50, nullable = false, unique = true)
    private String maVanDon;

    @Column(name = "anh_chup_goi_hang", nullable = false)
    private String anhChupGoiHang;

    @Column(name = "toa_do_gps", length = 100)
    private String toaDoGps;

    @Column(name = "thoi_gian_chup", nullable = false)
    private LocalDateTime thoiGianChup = LocalDateTime.now();

    @Column(name = "chu_ky_dien_tu")
    private String chuKyDienTu;

    @Column(name = "ten_nguoi_ky", length = 150)
    private String tenNguoiKy;

    public String getMaPod() { return maPod; }
    public void setMaPod(String maPod) { this.maPod = maPod; }
    public String getMaVanDon() { return maVanDon; }
    public void setMaVanDon(String maVanDon) { this.maVanDon = maVanDon; }
    public String getAnhChupGoiHang() { return anhChupGoiHang; }
    public void setAnhChupGoiHang(String anhChupGoiHang) { this.anhChupGoiHang = anhChupGoiHang; }
    public String getToaDoGps() { return toaDoGps; }
    public void setToaDoGps(String toaDoGps) { this.toaDoGps = toaDoGps; }
    public LocalDateTime getThoiGianChup() { return thoiGianChup; }
    public void setThoiGianChup(LocalDateTime thoiGianChup) { this.thoiGianChup = thoiGianChup; }
    public String getChuKyDienTu() { return chuKyDienTu; }
    public void setChuKyDienTu(String chuKyDienTu) { this.chuKyDienTu = chuKyDienTu; }
    public String getTenNguoiKy() { return tenNguoiKy; }
    public void setTenNguoiKy(String tenNguoiKy) { this.tenNguoiKy = tenNguoiKy; }
}

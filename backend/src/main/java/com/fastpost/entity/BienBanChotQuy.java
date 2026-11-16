package com.fastpost.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bien_ban_chot_quy")
public class BienBanChotQuy {
    @Id
    @Column(name = "ma_bien_ban_quy", length = 50)
    private String maBienBanQuy;

    @Column(name = "ma_buu_cuc", length = 50, nullable = false)
    private String maBuuCuc;

    @Column(name = "ma_nhan_vien_quay_lap", length = 50, nullable = false)
    private String maNhanVienQuayLap;

    @Column(name = "ma_quan_ly_ky", length = 50)
    private String maQuanLyKy;

    @Column(name = "ngay_chot", nullable = false)
    private LocalDateTime ngayChot = LocalDateTime.now();

    @Column(name = "tien_cuoc_quay", precision = 18, scale = 2, nullable = false)
    private BigDecimal tienCuocQuay = BigDecimal.ZERO;

    @Column(name = "tien_shipper_nop", precision = 18, scale = 2, nullable = false)
    private BigDecimal tienShipperNop = BigDecimal.ZERO;

    @Column(name = "tong_tien_so_sach", precision = 18, scale = 2, nullable = false)
    private BigDecimal tongTienSoSach = BigDecimal.ZERO;

    @Column(name = "tien_thuc_kiem_ke", precision = 18, scale = 2, nullable = false)
    private BigDecimal tienThucKiemKe = BigDecimal.ZERO;

    @Column(name = "chenh_lech", precision = 18, scale = 2, nullable = false)
    private BigDecimal chenhLech = BigDecimal.ZERO;

    @Column(name = "ly_do_chenh_lech")
    private String lyDoChenhLech;

    @Column(name = "da_khoa_so", nullable = false)
    private Boolean daKhoaSo = false;

    public String getMaBienBanQuy() { return maBienBanQuy; }
    public void setMaBienBanQuy(String maBienBanQuy) { this.maBienBanQuy = maBienBanQuy; }
    public String getMaBuuCuc() { return maBuuCuc; }
    public void setMaBuuCuc(String maBuuCuc) { this.maBuuCuc = maBuuCuc; }
    public String getMaNhanVienQuayLap() { return maNhanVienQuayLap; }
    public void setMaNhanVienQuayLap(String maNhanVienQuayLap) { this.maNhanVienQuayLap = maNhanVienQuayLap; }
    public String getMaQuanLyKy() { return maQuanLyKy; }
    public void setMaQuanLyKy(String maQuanLyKy) { this.maQuanLyKy = maQuanLyKy; }
    public LocalDateTime getNgayChot() { return ngayChot; }
    public void setNgayChot(LocalDateTime ngayChot) { this.ngayChot = ngayChot; }
    public BigDecimal getTienCuocQuay() { return tienCuocQuay; }
    public void setTienCuocQuay(BigDecimal tienCuocQuay) { this.tienCuocQuay = tienCuocQuay; }
    public BigDecimal getTienShipperNop() { return tienShipperNop; }
    public void setTienShipperNop(BigDecimal tienShipperNop) { this.tienShipperNop = tienShipperNop; }
    public BigDecimal getTongTienSoSach() { return tongTienSoSach; }
    public void setTongTienSoSach(BigDecimal tongTienSoSach) { this.tongTienSoSach = tongTienSoSach; }
    public BigDecimal getTienThucKiemKe() { return tienThucKiemKe; }
    public void setTienThucKiemKe(BigDecimal tienThucKiemKe) { this.tienThucKiemKe = tienThucKiemKe; }
    public BigDecimal getChenhLech() { return chenhLech; }
    public void setChenhLech(BigDecimal chenhLech) { this.chenhLech = chenhLech; }
    public String getLyDoChenhLech() { return lyDoChenhLech; }
    public void setLyDoChenhLech(String lyDoChenhLech) { this.lyDoChenhLech = lyDoChenhLech; }
    public Boolean getDaKhoaSo() { return daKhoaSo; }
    public void setDaKhoaSo(Boolean daKhoaSo) { this.daKhoaSo = daKhoaSo; }
}

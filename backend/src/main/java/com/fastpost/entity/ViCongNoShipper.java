package com.fastpost.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vi_cong_no_shipper")
public class ViCongNoShipper {
    @Id
    @Column(name = "ma_vi", length = 50)
    private String maVi;

    @Column(name = "ma_shipper", length = 50, nullable = false, unique = true)
    private String maShipper;

    @Column(name = "tong_no_luy_ke", precision = 18, scale = 2, nullable = false)
    private BigDecimal tongNoLuyKe = BigDecimal.ZERO;

    @Column(name = "thoi_diem_phat_sinh_no")
    private LocalDateTime thoiDiemPhatSinhNo;

    @Column(name = "da_khoa_nhan_don", nullable = false)
    private Boolean daKhoaNhanDon = false;

    public String getMaVi() { return maVi; }
    public void setMaVi(String maVi) { this.maVi = maVi; }
    public String getMaShipper() { return maShipper; }
    public void setMaShipper(String maShipper) { this.maShipper = maShipper; }
    public BigDecimal getTongNoLuyKe() { return tongNoLuyKe; }
    public void setTongNoLuyKe(BigDecimal tongNoLuyKe) { this.tongNoLuyKe = tongNoLuyKe; }
    public LocalDateTime getThoiDiemPhatSinhNo() { return thoiDiemPhatSinhNo; }
    public void setThoiDiemPhatSinhNo(LocalDateTime thoiDiemPhatSinhNo) { this.thoiDiemPhatSinhNo = thoiDiemPhatSinhNo; }
    public Boolean getDaKhoaNhanDon() { return daKhoaNhanDon; }
    public void setDaKhoaNhanDon(Boolean daKhoaNhanDon) { this.daKhoaNhanDon = daKhoaNhanDon; }
}

package com.fastpost.controller;

import com.fastpost.entity.*;
import com.fastpost.repository.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/danh-muc")
public class DanhMucController {

    private final VungTuyenRepository vungTuyenRepo;
    private final GoiDichVuRepository goiDichVuRepo;
    private final LoaiHangHoaRepository loaiHangHoaRepo;
    private final NganHangRepository nganHangRepo;
    private final BuuCucRepository buuCucRepo;
    private final TuyenGiaoHangRepository tuyenRepo;

    public DanhMucController(
            VungTuyenRepository vungTuyenRepo,
            GoiDichVuRepository goiDichVuRepo,
            LoaiHangHoaRepository loaiHangHoaRepo,
            NganHangRepository nganHangRepo,
            BuuCucRepository buuCucRepo,
            TuyenGiaoHangRepository tuyenRepo) {
        this.vungTuyenRepo = vungTuyenRepo;
        this.goiDichVuRepo = goiDichVuRepo;
        this.loaiHangHoaRepo = loaiHangHoaRepo;
        this.nganHangRepo = nganHangRepo;
        this.buuCucRepo = buuCucRepo;
        this.tuyenRepo = tuyenRepo;
    }

    @GetMapping("/vung-tuyen")
    public List<VungTuyen> listVungTuyen() {
        return vungTuyenRepo.findAll();
    }

    @PostMapping("/vung-tuyen")
    public VungTuyen saveVungTuyen(@RequestBody VungTuyen req) {
        return vungTuyenRepo.save(req);
    }

    @GetMapping("/goi-dich-vu")
    public List<GoiDichVu> listGoiDichVu() {
        return goiDichVuRepo.findAll();
    }

    @PostMapping("/goi-dich-vu")
    public GoiDichVu saveGoiDichVu(@RequestBody GoiDichVu req) {
        return goiDichVuRepo.save(req);
    }

    @GetMapping("/loai-hang-hoa")
    public List<LoaiHangHoa> listLoaiHangHoa() {
        return loaiHangHoaRepo.findAll();
    }

    @PostMapping("/loai-hang-hoa")
    public LoaiHangHoa saveLoaiHangHoa(@RequestBody LoaiHangHoa req) {
        return loaiHangHoaRepo.save(req);
    }

    @GetMapping("/ngan-hang")
    public List<NganHang> listNganHang() {
        return nganHangRepo.findAll();
    }

    @PostMapping("/ngan-hang")
    public NganHang saveNganHang(@RequestBody NganHang req) {
        return nganHangRepo.save(req);
    }

    @GetMapping("/buu-cuc")
    public List<BuuCuc> listBuuCuc() {
        return buuCucRepo.findAll();
    }

    @PostMapping("/buu-cuc")
    public BuuCuc saveBuuCuc(@RequestBody BuuCuc req) {
        return buuCucRepo.save(req);
    }

    @GetMapping("/tuyen-giao-hang")
    public List<TuyenGiaoHang> listTuyen() {
        return tuyenRepo.findAll();
    }

    @PostMapping("/tuyen-giao-hang")
    public TuyenGiaoHang saveTuyen(@RequestBody TuyenGiaoHang req) {
        return tuyenRepo.save(req);
    }
}

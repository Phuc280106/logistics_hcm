package com.fastpost.repository;

import com.fastpost.entity.ChiTietManifest;
import com.fastpost.entity.ChiTietManifestId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChiTietManifestRepository extends JpaRepository<ChiTietManifest, ChiTietManifestId> {
    List<ChiTietManifest> findByMaManifest(String maManifest);
}

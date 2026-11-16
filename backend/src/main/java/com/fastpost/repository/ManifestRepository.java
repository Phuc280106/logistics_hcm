package com.fastpost.repository;

import com.fastpost.entity.Manifest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ManifestRepository extends JpaRepository<Manifest, String> {
    List<Manifest> findAllByOrderByNgayLapDesc();
}

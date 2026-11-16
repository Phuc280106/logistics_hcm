package com.fastpost.repository;

import com.fastpost.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ViCongNoShipperRepository extends JpaRepository<ViCongNoShipper, String> {
    Optional<ViCongNoShipper> findByMaShipper(String maShipper);
}

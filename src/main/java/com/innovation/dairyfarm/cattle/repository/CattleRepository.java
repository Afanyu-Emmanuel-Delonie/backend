package com.innovation.dairyfarm.cattle.repository;

import com.innovation.dairyfarm.cattle.domain.Cattle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CattleRepository extends JpaRepository<Cattle, Long> {
    Optional<Cattle> findByTagNumber(String tagNumber);
    boolean existsByTagNumber(String tagNumber);
    boolean existsByTagNumberAndIdNot(String tagNumber, Long id);
}

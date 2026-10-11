package com.innovation.dairyfarm.cattle.repository;

import com.innovation.dairyfarm.cattle.domain.Cattle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CattleRepository extends JpaRepository<Cattle, Long> {
    List<Cattle> findAllByFarmId(Long farmId);
    Optional<Cattle> findByIdAndFarmId(Long id, Long farmId);
    boolean existsByTagNumberAndFarmId(String tagNumber, Long farmId);
    boolean existsByTagNumberAndFarmIdAndIdNot(String tagNumber, Long farmId, Long id);
}

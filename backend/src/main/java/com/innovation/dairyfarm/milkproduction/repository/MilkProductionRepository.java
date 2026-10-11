package com.innovation.dairyfarm.milkproduction.repository;

import com.innovation.dairyfarm.milkproduction.domain.MilkProduction;
import com.innovation.dairyfarm.milkproduction.domain.Shift;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MilkProductionRepository extends JpaRepository<MilkProduction, Long> {
    List<MilkProduction> findAllByFarmId(Long farmId);
    List<MilkProduction> findByCattleIdAndFarmId(Long cattleId, Long farmId);
    Optional<MilkProduction> findByIdAndFarmId(Long id, Long farmId);
    boolean existsByCattleIdAndRecordDateAndShiftAndFarmId(Long cattleId, LocalDate recordDate, Shift shift, Long farmId);
    boolean existsByCattleIdAndRecordDateAndShiftAndFarmIdAndIdNot(
            Long cattleId, LocalDate recordDate, Shift shift, Long farmId, Long id);
}

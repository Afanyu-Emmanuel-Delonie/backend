package com.innovation.dairyfarm.milkproduction.repository;

import com.innovation.dairyfarm.milkproduction.domain.MilkProduction;
import com.innovation.dairyfarm.milkproduction.domain.Shift;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MilkProductionRepository extends JpaRepository<MilkProduction, Long> {
    List<MilkProduction> findByCattleId(Long cattleId);
    boolean existsByCattleIdAndRecordDateAndShift(Long cattleId, LocalDate recordDate, Shift shift);
    boolean existsByCattleIdAndRecordDateAndShiftAndIdNot(Long cattleId, LocalDate recordDate, Shift shift, Long id);
}

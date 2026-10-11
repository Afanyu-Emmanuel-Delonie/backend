package com.innovation.dairyfarm.milkproduction.repository;

import com.innovation.dairyfarm.milkproduction.domain.MilkProduction;
import com.innovation.dairyfarm.milkproduction.domain.Shift;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MilkProductionRepository extends JpaRepository<MilkProduction, Long> {
    List<MilkProduction> findAllByOwnerId(Long ownerId);
    List<MilkProduction> findByCattleIdAndOwnerId(Long cattleId, Long ownerId);
    Optional<MilkProduction> findByIdAndOwnerId(Long id, Long ownerId);
    boolean existsByCattleIdAndRecordDateAndShiftAndOwnerId(Long cattleId, LocalDate recordDate, Shift shift, Long ownerId);
    boolean existsByCattleIdAndRecordDateAndShiftAndOwnerIdAndIdNot(
            Long cattleId, LocalDate recordDate, Shift shift, Long ownerId, Long id);
}

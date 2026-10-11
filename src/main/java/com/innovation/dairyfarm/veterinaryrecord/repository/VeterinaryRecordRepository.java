package com.innovation.dairyfarm.veterinaryrecord.repository;

import com.innovation.dairyfarm.veterinaryrecord.domain.VeterinaryRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VeterinaryRecordRepository extends JpaRepository<VeterinaryRecord, Long> {
    List<VeterinaryRecord> findAllByFarmId(Long farmId);
    List<VeterinaryRecord> findByCattleIdAndFarmId(Long cattleId, Long farmId);
    Optional<VeterinaryRecord> findByIdAndFarmId(Long id, Long farmId);
}

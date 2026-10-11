package com.innovation.dairyfarm.veterinaryrecord.repository;

import com.innovation.dairyfarm.veterinaryrecord.domain.VeterinaryRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VeterinaryRecordRepository extends JpaRepository<VeterinaryRecord, Long> {
    List<VeterinaryRecord> findAllByOwnerId(Long ownerId);
    List<VeterinaryRecord> findByCattleIdAndOwnerId(Long cattleId, Long ownerId);
    Optional<VeterinaryRecord> findByIdAndOwnerId(Long id, Long ownerId);
}

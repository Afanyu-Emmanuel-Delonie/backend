package com.innovation.dairyfarm.veterinaryrecord.repository;

import com.innovation.dairyfarm.veterinaryrecord.domain.VeterinaryRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VeterinaryRecordRepository extends JpaRepository<VeterinaryRecord, Long> {
    List<VeterinaryRecord> findByCattleId(Long cattleId);
}

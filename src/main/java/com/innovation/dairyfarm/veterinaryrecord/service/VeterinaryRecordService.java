package com.innovation.dairyfarm.veterinaryrecord.service;

import com.innovation.dairyfarm.veterinaryrecord.domain.VeterinaryRecord;
import com.innovation.dairyfarm.veterinaryrecord.dto.VeterinaryRecordRequest;

import java.util.List;

public interface VeterinaryRecordService {
    VeterinaryRecord create(VeterinaryRecordRequest request);
    VeterinaryRecord update(Long id, VeterinaryRecordRequest request);
    void delete(Long id);
    VeterinaryRecord findById(Long id);
    List<VeterinaryRecord> findAll();
    List<VeterinaryRecord> findByCattleId(Long cattleId);
    VeterinaryRecord resolve(Long id);
}

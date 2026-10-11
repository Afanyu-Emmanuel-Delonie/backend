package com.innovation.dairyfarm.veterinaryrecord.service;

import com.innovation.dairyfarm.farm.domain.Farm;
import com.innovation.dairyfarm.veterinaryrecord.domain.VeterinaryRecord;
import com.innovation.dairyfarm.veterinaryrecord.dto.VeterinaryRecordRequest;

import java.util.List;

public interface VeterinaryRecordService {
    VeterinaryRecord create(Farm farm, VeterinaryRecordRequest request);
    VeterinaryRecord update(Long farmId, Long id, VeterinaryRecordRequest request);
    void delete(Long farmId, Long id);
    VeterinaryRecord findById(Long farmId, Long id);
    List<VeterinaryRecord> findAll(Long farmId);
    List<VeterinaryRecord> findByCattleId(Long farmId, Long cattleId);
    VeterinaryRecord resolve(Long farmId, Long id);
}

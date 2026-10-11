package com.innovation.dairyfarm.veterinaryrecord.service;

import com.innovation.dairyfarm.auth.domain.User;
import com.innovation.dairyfarm.veterinaryrecord.domain.VeterinaryRecord;
import com.innovation.dairyfarm.veterinaryrecord.dto.VeterinaryRecordRequest;

import java.util.List;

public interface VeterinaryRecordService {
    VeterinaryRecord create(User owner, VeterinaryRecordRequest request);
    VeterinaryRecord update(Long ownerId, Long id, VeterinaryRecordRequest request);
    void delete(Long ownerId, Long id);
    VeterinaryRecord findById(Long ownerId, Long id);
    List<VeterinaryRecord> findAll(Long ownerId);
    List<VeterinaryRecord> findByCattleId(Long ownerId, Long cattleId);
    VeterinaryRecord resolve(Long ownerId, Long id);
}

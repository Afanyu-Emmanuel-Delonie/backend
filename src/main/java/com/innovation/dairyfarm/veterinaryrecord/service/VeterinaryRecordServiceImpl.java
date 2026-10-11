package com.innovation.dairyfarm.veterinaryrecord.service;

import com.innovation.dairyfarm.auth.domain.User;
import com.innovation.dairyfarm.cattle.domain.Cattle;
import com.innovation.dairyfarm.cattle.domain.HealthStatus;
import com.innovation.dairyfarm.cattle.repository.CattleRepository;
import com.innovation.dairyfarm.common.exception.BusinessRuleViolationException;
import com.innovation.dairyfarm.common.exception.ResourceNotFoundException;
import com.innovation.dairyfarm.veterinaryrecord.domain.VeterinaryRecord;
import com.innovation.dairyfarm.veterinaryrecord.dto.VeterinaryRecordRequest;
import com.innovation.dairyfarm.veterinaryrecord.repository.VeterinaryRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class VeterinaryRecordServiceImpl implements VeterinaryRecordService {

    private final VeterinaryRecordRepository veterinaryRecordRepository;
    private final CattleRepository cattleRepository;

    @Override
    public VeterinaryRecord create(User owner, VeterinaryRecordRequest request) {
        Cattle cattle = requireCattle(owner.getId(), request.cattleId());
        requireNotDeceased(cattle);
        requireFollowUpAfterVisit(request);

        VeterinaryRecord record = VeterinaryRecord.builder()
                .cattle(cattle)
                .date(request.date())
                .complaint(request.complaint())
                .notes(request.notes())
                .severity(request.severity())
                .treatedBy(request.treatedBy())
                .cost(request.cost())
                .followUpDate(request.followUpDate())
                .resolved(Boolean.FALSE)
                .build();
        record.setOwner(owner);

        // BR-11: a new veterinary visit puts the animal under treatment.
        cattle.setHealthStatus(HealthStatus.UNDER_TREATMENT);
        cattleRepository.save(cattle);

        return veterinaryRecordRepository.save(record);
    }

    @Override
    public VeterinaryRecord update(Long ownerId, Long id, VeterinaryRecordRequest request) {
        VeterinaryRecord record = findById(ownerId, id);
        Cattle cattle = requireCattle(ownerId, request.cattleId());
        requireNotDeceased(cattle);
        requireFollowUpAfterVisit(request);

        record.setCattle(cattle);
        record.setDate(request.date());
        record.setComplaint(request.complaint());
        record.setNotes(request.notes());
        record.setSeverity(request.severity());
        record.setTreatedBy(request.treatedBy());
        record.setCost(request.cost());
        record.setFollowUpDate(request.followUpDate());
        return veterinaryRecordRepository.save(record);
    }

    @Override
    public void delete(Long ownerId, Long id) {
        VeterinaryRecord record = findById(ownerId, id);
        veterinaryRecordRepository.delete(record);
    }

    @Override
    @Transactional(readOnly = true)
    public VeterinaryRecord findById(Long ownerId, Long id) {
        return veterinaryRecordRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Veterinary record not found with id " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VeterinaryRecord> findAll(Long ownerId) {
        return veterinaryRecordRepository.findAllByOwnerId(ownerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VeterinaryRecord> findByCattleId(Long ownerId, Long cattleId) {
        requireCattle(ownerId, cattleId);
        return veterinaryRecordRepository.findByCattleIdAndOwnerId(cattleId, ownerId);
    }

    @Override
    public VeterinaryRecord resolve(Long ownerId, Long id) {
        VeterinaryRecord record = findById(ownerId, id);
        if (Boolean.TRUE.equals(record.getResolved())) {
            throw new BusinessRuleViolationException("Veterinary record " + id + " is already resolved");
        }
        record.setResolved(Boolean.TRUE);

        // BR-11: resolving the last open visit returns the animal to RECOVERED.
        Cattle cattle = record.getCattle();
        cattle.setHealthStatus(HealthStatus.RECOVERED);
        cattleRepository.save(cattle);

        return veterinaryRecordRepository.save(record);
    }

    private Cattle requireCattle(Long ownerId, Long cattleId) {
        return cattleRepository.findByIdAndOwnerId(cattleId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cattle not found with id " + cattleId));
    }

    private void requireNotDeceased(Cattle cattle) {
        if (cattle.getHealthStatus() == HealthStatus.DECEASED) {
            throw new BusinessRuleViolationException(
                    "Cattle " + cattle.getTagNumber() + " is marked DECEASED and cannot receive new records");
        }
    }

    private void requireFollowUpAfterVisit(VeterinaryRecordRequest request) {
        if (request.followUpDate() != null && !request.followUpDate().isAfter(request.date())) {
            throw new BusinessRuleViolationException("followUpDate must be after date");
        }
    }
}

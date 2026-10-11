package com.innovation.dairyfarm.veterinaryrecord.service;

import com.innovation.dairyfarm.cattle.domain.Cattle;
import com.innovation.dairyfarm.cattle.domain.HealthStatus;
import com.innovation.dairyfarm.cattle.repository.CattleRepository;
import com.innovation.dairyfarm.common.exception.BusinessRuleViolationException;
import com.innovation.dairyfarm.common.exception.ResourceNotFoundException;
import com.innovation.dairyfarm.farm.domain.Farm;
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
    public VeterinaryRecord create(Farm farm, VeterinaryRecordRequest request) {
        Cattle cattle = requireCattle(farm.getId(), request.cattleId());
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
        record.setFarm(farm);

        // BR-11: a new veterinary visit puts the animal under treatment.
        cattle.setHealthStatus(HealthStatus.UNDER_TREATMENT);
        cattleRepository.save(cattle);

        return veterinaryRecordRepository.save(record);
    }

    @Override
    public VeterinaryRecord update(Long farmId, Long id, VeterinaryRecordRequest request) {
        VeterinaryRecord record = findById(farmId, id);
        Cattle cattle = requireCattle(farmId, request.cattleId());
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
    public void delete(Long farmId, Long id) {
        VeterinaryRecord record = findById(farmId, id);
        veterinaryRecordRepository.delete(record);
    }

    @Override
    @Transactional(readOnly = true)
    public VeterinaryRecord findById(Long farmId, Long id) {
        return veterinaryRecordRepository.findByIdAndFarmId(id, farmId)
                .orElseThrow(() -> new ResourceNotFoundException("Veterinary record not found with id " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VeterinaryRecord> findAll(Long farmId) {
        return veterinaryRecordRepository.findAllByFarmId(farmId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VeterinaryRecord> findByCattleId(Long farmId, Long cattleId) {
        requireCattle(farmId, cattleId);
        return veterinaryRecordRepository.findByCattleIdAndFarmId(cattleId, farmId);
    }

    @Override
    public VeterinaryRecord resolve(Long farmId, Long id) {
        VeterinaryRecord record = findById(farmId, id);
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

    private Cattle requireCattle(Long farmId, Long cattleId) {
        return cattleRepository.findByIdAndFarmId(cattleId, farmId)
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

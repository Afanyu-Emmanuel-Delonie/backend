package com.innovation.dairyfarm.veterinaryrecord.service;

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
    public VeterinaryRecord create(VeterinaryRecordRequest request) {
        Cattle cattle = requireCattle(request.cattleId());
        requireNotDeceased(cattle);
        requireFollowUpAfterVisit(request);

        VeterinaryRecord record = VeterinaryRecord.builder()
                .cattle(cattle)
                .visitDate(request.visitDate())
                .veterinarianName(request.veterinarianName())
                .diagnosis(request.diagnosis())
                .treatment(request.treatment())
                .cost(request.cost())
                .followUpDate(request.followUpDate())
                .resolved(Boolean.FALSE)
                .build();

        // BR-11: a new veterinary visit puts the animal under treatment.
        cattle.setHealthStatus(HealthStatus.UNDER_TREATMENT);
        cattleRepository.save(cattle);

        return veterinaryRecordRepository.save(record);
    }

    @Override
    public VeterinaryRecord update(Long id, VeterinaryRecordRequest request) {
        VeterinaryRecord record = findById(id);
        Cattle cattle = requireCattle(request.cattleId());
        requireNotDeceased(cattle);
        requireFollowUpAfterVisit(request);

        record.setCattle(cattle);
        record.setVisitDate(request.visitDate());
        record.setVeterinarianName(request.veterinarianName());
        record.setDiagnosis(request.diagnosis());
        record.setTreatment(request.treatment());
        record.setCost(request.cost());
        record.setFollowUpDate(request.followUpDate());
        return veterinaryRecordRepository.save(record);
    }

    @Override
    public void delete(Long id) {
        VeterinaryRecord record = findById(id);
        veterinaryRecordRepository.delete(record);
    }

    @Override
    @Transactional(readOnly = true)
    public VeterinaryRecord findById(Long id) {
        return veterinaryRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Veterinary record not found with id " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VeterinaryRecord> findAll() {
        return veterinaryRecordRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VeterinaryRecord> findByCattleId(Long cattleId) {
        requireCattle(cattleId);
        return veterinaryRecordRepository.findByCattleId(cattleId);
    }

    @Override
    public VeterinaryRecord resolve(Long id) {
        VeterinaryRecord record = findById(id);
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

    private Cattle requireCattle(Long cattleId) {
        return cattleRepository.findById(cattleId)
                .orElseThrow(() -> new ResourceNotFoundException("Cattle not found with id " + cattleId));
    }

    private void requireNotDeceased(Cattle cattle) {
        if (cattle.getHealthStatus() == HealthStatus.DECEASED) {
            throw new BusinessRuleViolationException(
                    "Cattle " + cattle.getTagNumber() + " is marked DECEASED and cannot receive new records");
        }
    }

    private void requireFollowUpAfterVisit(VeterinaryRecordRequest request) {
        if (request.followUpDate() != null && !request.followUpDate().isAfter(request.visitDate())) {
            throw new BusinessRuleViolationException("followUpDate must be after visitDate");
        }
    }
}

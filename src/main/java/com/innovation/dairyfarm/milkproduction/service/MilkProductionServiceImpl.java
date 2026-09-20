package com.innovation.dairyfarm.milkproduction.service;

import com.innovation.dairyfarm.cattle.domain.Cattle;
import com.innovation.dairyfarm.cattle.domain.HealthStatus;
import com.innovation.dairyfarm.cattle.repository.CattleRepository;
import com.innovation.dairyfarm.common.exception.BusinessRuleViolationException;
import com.innovation.dairyfarm.common.exception.DuplicateResourceException;
import com.innovation.dairyfarm.common.exception.ResourceNotFoundException;
import com.innovation.dairyfarm.milkproduction.domain.MilkProduction;
import com.innovation.dairyfarm.milkproduction.dto.MilkProductionRequest;
import com.innovation.dairyfarm.milkproduction.repository.MilkProductionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MilkProductionServiceImpl implements MilkProductionService {

    private final MilkProductionRepository milkProductionRepository;
    private final CattleRepository cattleRepository;

    @Override
    public MilkProduction create(MilkProductionRequest request) {
        Cattle cattle = requireCattle(request.cattleId());
        requireNotDeceased(cattle);
        if (milkProductionRepository.existsByCattleIdAndRecordDateAndShift(
                cattle.getId(), request.recordDate(), request.shift())) {
            throw new DuplicateResourceException("A " + request.shift() + " milk production record already "
                    + "exists for cattle " + cattle.getTagNumber() + " on " + request.recordDate());
        }
        MilkProduction record = MilkProduction.builder()
                .cattle(cattle)
                .recordDate(request.recordDate())
                .shift(request.shift())
                .quantityLiters(request.quantityLiters())
                .build();
        return milkProductionRepository.save(record);
    }

    @Override
    public MilkProduction update(Long id, MilkProductionRequest request) {
        MilkProduction record = findById(id);
        Cattle cattle = requireCattle(request.cattleId());
        requireNotDeceased(cattle);
        if (milkProductionRepository.existsByCattleIdAndRecordDateAndShiftAndIdNot(
                cattle.getId(), request.recordDate(), request.shift(), id)) {
            throw new DuplicateResourceException("A " + request.shift() + " milk production record already "
                    + "exists for cattle " + cattle.getTagNumber() + " on " + request.recordDate());
        }
        record.setCattle(cattle);
        record.setRecordDate(request.recordDate());
        record.setShift(request.shift());
        record.setQuantityLiters(request.quantityLiters());
        return milkProductionRepository.save(record);
    }

    @Override
    public void delete(Long id) {
        MilkProduction record = findById(id);
        milkProductionRepository.delete(record);
    }

    @Override
    @Transactional(readOnly = true)
    public MilkProduction findById(Long id) {
        return milkProductionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Milk production record not found with id " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MilkProduction> findAll() {
        return milkProductionRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MilkProduction> findByCattleId(Long cattleId) {
        requireCattle(cattleId);
        return milkProductionRepository.findByCattleId(cattleId);
    }

    private Cattle requireCattle(Long cattleId) {
        return cattleRepository.findById(cattleId)
                .orElseThrow(() -> new ResourceNotFoundException("Cattle not found with id " + cattleId));
    }

    /** BR-12: a deceased animal cannot receive new production or veterinary entries. */
    private void requireNotDeceased(Cattle cattle) {
        if (cattle.getHealthStatus() == HealthStatus.DECEASED) {
            throw new BusinessRuleViolationException(
                    "Cattle " + cattle.getTagNumber() + " is marked DECEASED and cannot receive new records");
        }
    }
}

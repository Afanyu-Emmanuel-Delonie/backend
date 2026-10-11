package com.innovation.dairyfarm.milkproduction.service;

import com.innovation.dairyfarm.auth.domain.User;
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
    public MilkProduction create(User owner, MilkProductionRequest request) {
        Cattle cattle = requireCattle(owner.getId(), request.cattleId());
        requireNotDeceased(cattle);
        if (milkProductionRepository.existsByCattleIdAndRecordDateAndShiftAndOwnerId(
                cattle.getId(), request.recordDate(), request.shift(), owner.getId())) {
            throw new DuplicateResourceException("A " + request.shift() + " milk production record already "
                    + "exists for cattle " + cattle.getTagNumber() + " on " + request.recordDate());
        }
        MilkProduction record = MilkProduction.builder()
                .cattle(cattle)
                .recordDate(request.recordDate())
                .shift(request.shift())
                .quantityLiters(request.quantityLiters())
                .build();
        record.setOwner(owner);
        return milkProductionRepository.save(record);
    }

    @Override
    public MilkProduction update(Long ownerId, Long id, MilkProductionRequest request) {
        MilkProduction record = findById(ownerId, id);
        Cattle cattle = requireCattle(ownerId, request.cattleId());
        requireNotDeceased(cattle);
        if (milkProductionRepository.existsByCattleIdAndRecordDateAndShiftAndOwnerIdAndIdNot(
                cattle.getId(), request.recordDate(), request.shift(), ownerId, id)) {
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
    public void delete(Long ownerId, Long id) {
        MilkProduction record = findById(ownerId, id);
        milkProductionRepository.delete(record);
    }

    @Override
    @Transactional(readOnly = true)
    public MilkProduction findById(Long ownerId, Long id) {
        return milkProductionRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Milk production record not found with id " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MilkProduction> findAll(Long ownerId) {
        return milkProductionRepository.findAllByOwnerId(ownerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MilkProduction> findByCattleId(Long ownerId, Long cattleId) {
        requireCattle(ownerId, cattleId);
        return milkProductionRepository.findByCattleIdAndOwnerId(cattleId, ownerId);
    }

    private Cattle requireCattle(Long ownerId, Long cattleId) {
        return cattleRepository.findByIdAndOwnerId(cattleId, ownerId)
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

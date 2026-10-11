package com.innovation.dairyfarm.cattle.service;

import com.innovation.dairyfarm.cattle.domain.Cattle;
import com.innovation.dairyfarm.cattle.dto.CattleRequest;
import com.innovation.dairyfarm.cattle.repository.CattleRepository;
import com.innovation.dairyfarm.common.exception.DuplicateResourceException;
import com.innovation.dairyfarm.common.exception.ResourceNotFoundException;
import com.innovation.dairyfarm.farm.domain.Farm;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CattleServiceImpl implements CattleService {

    private final CattleRepository cattleRepository;

    @Override
    public Cattle create(Farm farm, CattleRequest request) {
        if (cattleRepository.existsByTagNumberAndFarmId(request.tagNumber(), farm.getId())) {
            throw new DuplicateResourceException("Cattle with tagNumber '" + request.tagNumber() + "' already exists");
        }
        Cattle cattle = Cattle.builder()
                .tagNumber(request.tagNumber())
                .breed(request.breed())
                .dateOfBirth(request.dateOfBirth())
                .healthStatus(request.healthStatus())
                .estimatedValue(request.estimatedValue())
                .purchaseDate(request.purchaseDate())
                .purchasePrice(request.purchasePrice())
                .deceasedDate(request.deceasedDate())
                .soldDate(request.soldDate())
                .soldPrice(request.soldPrice())
                .build();
        cattle.setFarm(farm);
        return cattleRepository.save(cattle);
    }

    @Override
    public Cattle update(Long farmId, Long id, CattleRequest request) {
        Cattle cattle = findById(farmId, id);
        if (cattleRepository.existsByTagNumberAndFarmIdAndIdNot(request.tagNumber(), farmId, id)) {
            throw new DuplicateResourceException("Cattle with tagNumber '" + request.tagNumber() + "' already exists");
        }
        cattle.setTagNumber(request.tagNumber());
        cattle.setBreed(request.breed());
        cattle.setDateOfBirth(request.dateOfBirth());
        cattle.setHealthStatus(request.healthStatus());
        cattle.setEstimatedValue(request.estimatedValue());
        cattle.setPurchaseDate(request.purchaseDate());
        cattle.setPurchasePrice(request.purchasePrice());
        cattle.setDeceasedDate(request.deceasedDate());
        cattle.setSoldDate(request.soldDate());
        cattle.setSoldPrice(request.soldPrice());
        return cattleRepository.save(cattle);
    }

    @Override
    public void delete(Long farmId, Long id) {
        Cattle cattle = findById(farmId, id);
        cattleRepository.delete(cattle);
    }

    @Override
    @Transactional(readOnly = true)
    public Cattle findById(Long farmId, Long id) {
        return cattleRepository.findByIdAndFarmId(id, farmId)
                .orElseThrow(() -> new ResourceNotFoundException("Cattle not found with id " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cattle> findAll(Long farmId) {
        return cattleRepository.findAllByFarmId(farmId);
    }
}

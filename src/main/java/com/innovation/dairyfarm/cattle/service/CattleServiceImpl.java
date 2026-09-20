package com.innovation.dairyfarm.cattle.service;

import com.innovation.dairyfarm.cattle.domain.Cattle;
import com.innovation.dairyfarm.cattle.dto.CattleRequest;
import com.innovation.dairyfarm.cattle.repository.CattleRepository;
import com.innovation.dairyfarm.common.exception.DuplicateResourceException;
import com.innovation.dairyfarm.common.exception.ResourceNotFoundException;
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
    public Cattle create(CattleRequest request) {
        if (cattleRepository.existsByTagNumber(request.tagNumber())) {
            throw new DuplicateResourceException("Cattle with tagNumber '" + request.tagNumber() + "' already exists");
        }
        Cattle cattle = Cattle.builder()
                .tagNumber(request.tagNumber())
                .breed(request.breed())
                .dateOfBirth(request.dateOfBirth())
                .healthStatus(request.healthStatus())
                .build();
        return cattleRepository.save(cattle);
    }

    @Override
    public Cattle update(Long id, CattleRequest request) {
        Cattle cattle = findById(id);
        if (cattleRepository.existsByTagNumberAndIdNot(request.tagNumber(), id)) {
            throw new DuplicateResourceException("Cattle with tagNumber '" + request.tagNumber() + "' already exists");
        }
        cattle.setTagNumber(request.tagNumber());
        cattle.setBreed(request.breed());
        cattle.setDateOfBirth(request.dateOfBirth());
        cattle.setHealthStatus(request.healthStatus());
        return cattleRepository.save(cattle);
    }

    @Override
    public void delete(Long id) {
        Cattle cattle = findById(id);
        cattleRepository.delete(cattle);
    }

    @Override
    @Transactional(readOnly = true)
    public Cattle findById(Long id) {
        return cattleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cattle not found with id " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cattle> findAll() {
        return cattleRepository.findAll();
    }
}

package com.innovation.dairyfarm.milkproduction.service;

import com.innovation.dairyfarm.farm.domain.Farm;
import com.innovation.dairyfarm.milkproduction.domain.MilkProduction;
import com.innovation.dairyfarm.milkproduction.dto.MilkProductionRequest;

import java.util.List;

public interface MilkProductionService {
    MilkProduction create(Farm farm, MilkProductionRequest request);
    MilkProduction update(Long farmId, Long id, MilkProductionRequest request);
    void delete(Long farmId, Long id);
    MilkProduction findById(Long farmId, Long id);
    List<MilkProduction> findAll(Long farmId);
    List<MilkProduction> findByCattleId(Long farmId, Long cattleId);
}

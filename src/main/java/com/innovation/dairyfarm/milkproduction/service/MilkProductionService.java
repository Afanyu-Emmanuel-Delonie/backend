package com.innovation.dairyfarm.milkproduction.service;

import com.innovation.dairyfarm.milkproduction.domain.MilkProduction;
import com.innovation.dairyfarm.milkproduction.dto.MilkProductionRequest;

import java.util.List;

public interface MilkProductionService {
    MilkProduction create(MilkProductionRequest request);
    MilkProduction update(Long id, MilkProductionRequest request);
    void delete(Long id);
    MilkProduction findById(Long id);
    List<MilkProduction> findAll();
    List<MilkProduction> findByCattleId(Long cattleId);
}

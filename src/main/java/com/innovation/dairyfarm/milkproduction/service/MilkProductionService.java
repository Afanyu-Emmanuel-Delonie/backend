package com.innovation.dairyfarm.milkproduction.service;

import com.innovation.dairyfarm.auth.domain.User;
import com.innovation.dairyfarm.milkproduction.domain.MilkProduction;
import com.innovation.dairyfarm.milkproduction.dto.MilkProductionRequest;

import java.util.List;

public interface MilkProductionService {
    MilkProduction create(User owner, MilkProductionRequest request);
    MilkProduction update(Long ownerId, Long id, MilkProductionRequest request);
    void delete(Long ownerId, Long id);
    MilkProduction findById(Long ownerId, Long id);
    List<MilkProduction> findAll(Long ownerId);
    List<MilkProduction> findByCattleId(Long ownerId, Long cattleId);
}

package com.innovation.dairyfarm.cattle.service;

import com.innovation.dairyfarm.cattle.domain.Cattle;
import com.innovation.dairyfarm.cattle.dto.CattleRequest;
import com.innovation.dairyfarm.farm.domain.Farm;

import java.util.List;

public interface CattleService {
    Cattle create(Farm farm, CattleRequest request);
    Cattle update(Long farmId, Long id, CattleRequest request);
    void delete(Long farmId, Long id);
    Cattle findById(Long farmId, Long id);
    List<Cattle> findAll(Long farmId);
}

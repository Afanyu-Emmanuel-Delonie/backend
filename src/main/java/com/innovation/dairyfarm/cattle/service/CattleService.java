package com.innovation.dairyfarm.cattle.service;

import com.innovation.dairyfarm.cattle.domain.Cattle;
import com.innovation.dairyfarm.cattle.dto.CattleRequest;

import java.util.List;

public interface CattleService {
    Cattle create(CattleRequest request);
    Cattle update(Long id, CattleRequest request);
    void delete(Long id);
    Cattle findById(Long id);
    List<Cattle> findAll();
}

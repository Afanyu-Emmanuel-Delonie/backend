package com.innovation.dairyfarm.cattle.service;

import com.innovation.dairyfarm.auth.domain.User;
import com.innovation.dairyfarm.cattle.domain.Cattle;
import com.innovation.dairyfarm.cattle.dto.CattleRequest;

import java.util.List;

public interface CattleService {
    Cattle create(User owner, CattleRequest request);
    Cattle update(Long ownerId, Long id, CattleRequest request);
    void delete(Long ownerId, Long id);
    Cattle findById(Long ownerId, Long id);
    List<Cattle> findAll(Long ownerId);
}

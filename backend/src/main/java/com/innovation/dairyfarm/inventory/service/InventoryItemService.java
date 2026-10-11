package com.innovation.dairyfarm.inventory.service;

import com.innovation.dairyfarm.farm.domain.Farm;
import com.innovation.dairyfarm.inventory.domain.InventoryItem;
import com.innovation.dairyfarm.inventory.dto.InventoryItemRequest;

import java.util.List;

public interface InventoryItemService {
    InventoryItem create(Farm farm, InventoryItemRequest request);
    InventoryItem update(Long farmId, Long id, InventoryItemRequest request);
    void delete(Long farmId, Long id);
    InventoryItem findById(Long farmId, Long id);
    List<InventoryItem> findAll(Long farmId);
}

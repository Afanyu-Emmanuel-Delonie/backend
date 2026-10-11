package com.innovation.dairyfarm.inventory.service;

import com.innovation.dairyfarm.auth.domain.User;
import com.innovation.dairyfarm.inventory.domain.InventoryItem;
import com.innovation.dairyfarm.inventory.dto.InventoryItemRequest;

import java.util.List;

public interface InventoryItemService {
    InventoryItem create(User owner, InventoryItemRequest request);
    InventoryItem update(Long ownerId, Long id, InventoryItemRequest request);
    void delete(Long ownerId, Long id);
    InventoryItem findById(Long ownerId, Long id);
    List<InventoryItem> findAll(Long ownerId);
}

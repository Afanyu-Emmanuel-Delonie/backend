package com.innovation.dairyfarm.inventory.service;

import com.innovation.dairyfarm.auth.domain.User;
import com.innovation.dairyfarm.common.exception.ResourceNotFoundException;
import com.innovation.dairyfarm.inventory.domain.InventoryItem;
import com.innovation.dairyfarm.inventory.dto.InventoryItemRequest;
import com.innovation.dairyfarm.inventory.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryItemServiceImpl implements InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;

    @Override
    public InventoryItem create(User owner, InventoryItemRequest request) {
        InventoryItem item = InventoryItem.builder()
                .name(request.name())
                .category(request.category())
                .quantity(request.quantity())
                .unit(request.unit())
                .reorderLevel(request.reorderLevel())
                .unitCost(request.unitCost())
                .lastRestocked(request.lastRestocked())
                .condition(request.condition())
                .purchaseDate(request.purchaseDate())
                .build();
        item.setOwner(owner);
        return inventoryItemRepository.save(item);
    }

    @Override
    public InventoryItem update(Long ownerId, Long id, InventoryItemRequest request) {
        InventoryItem item = findById(ownerId, id);
        item.setName(request.name());
        item.setCategory(request.category());
        item.setQuantity(request.quantity());
        item.setUnit(request.unit());
        item.setReorderLevel(request.reorderLevel());
        item.setUnitCost(request.unitCost());
        item.setLastRestocked(request.lastRestocked());
        item.setCondition(request.condition());
        item.setPurchaseDate(request.purchaseDate());
        return inventoryItemRepository.save(item);
    }

    @Override
    public void delete(Long ownerId, Long id) {
        InventoryItem item = findById(ownerId, id);
        inventoryItemRepository.delete(item);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryItem findById(Long ownerId, Long id) {
        return inventoryItemRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryItem> findAll(Long ownerId) {
        return inventoryItemRepository.findAllByOwnerId(ownerId);
    }
}

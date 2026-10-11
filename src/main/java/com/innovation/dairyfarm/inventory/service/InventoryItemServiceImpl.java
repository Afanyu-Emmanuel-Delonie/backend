package com.innovation.dairyfarm.inventory.service;

import com.innovation.dairyfarm.common.exception.ResourceNotFoundException;
import com.innovation.dairyfarm.farm.domain.Farm;
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
    public InventoryItem create(Farm farm, InventoryItemRequest request) {
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
        item.setFarm(farm);
        return inventoryItemRepository.save(item);
    }

    @Override
    public InventoryItem update(Long farmId, Long id, InventoryItemRequest request) {
        InventoryItem item = findById(farmId, id);
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
    public void delete(Long farmId, Long id) {
        InventoryItem item = findById(farmId, id);
        inventoryItemRepository.delete(item);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryItem findById(Long farmId, Long id) {
        return inventoryItemRepository.findByIdAndFarmId(id, farmId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryItem> findAll(Long farmId) {
        return inventoryItemRepository.findAllByFarmId(farmId);
    }
}

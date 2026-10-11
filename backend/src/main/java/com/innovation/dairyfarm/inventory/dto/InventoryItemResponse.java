package com.innovation.dairyfarm.inventory.dto;

import com.innovation.dairyfarm.inventory.domain.EquipmentCondition;
import com.innovation.dairyfarm.inventory.domain.InventoryCategory;
import com.innovation.dairyfarm.inventory.domain.InventoryItem;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record InventoryItemResponse(
        Long id,
        String name,
        InventoryCategory category,
        Double quantity,
        String unit,
        Double reorderLevel,
        Double unitCost,
        LocalDate lastRestocked,
        EquipmentCondition condition,
        LocalDate purchaseDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static InventoryItemResponse from(InventoryItem item) {
        return new InventoryItemResponse(
                item.getId(),
                item.getName(),
                item.getCategory(),
                item.getQuantity(),
                item.getUnit(),
                item.getReorderLevel(),
                item.getUnitCost(),
                item.getLastRestocked(),
                item.getCondition(),
                item.getPurchaseDate(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}

package com.innovation.dairyfarm.inventory.dto;

import com.innovation.dairyfarm.inventory.domain.EquipmentCondition;
import com.innovation.dairyfarm.inventory.domain.InventoryCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/** BR-14: quantity, reorderLevel and unitCost cannot be negative. */
public record InventoryItemRequest(
        @NotBlank(message = "name is required")
        String name,

        @NotNull(message = "category is required")
        InventoryCategory category,

        @NotNull(message = "quantity is required")
        @DecimalMin(value = "0.0", message = "quantity cannot be negative")
        Double quantity,

        @NotBlank(message = "unit is required")
        String unit,

        @DecimalMin(value = "0.0", message = "reorderLevel cannot be negative")
        Double reorderLevel,

        @NotNull(message = "unitCost is required")
        @DecimalMin(value = "0.0", message = "unitCost cannot be negative")
        Double unitCost,

        LocalDate lastRestocked,

        EquipmentCondition condition,

        LocalDate purchaseDate
) {
}

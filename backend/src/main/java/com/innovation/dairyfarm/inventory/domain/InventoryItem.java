package com.innovation.dairyfarm.inventory.domain;

import com.innovation.dairyfarm.common.OwnedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/** BR-14: quantity, reorderLevel and unitCost cannot be negative. */
@Entity
@Table(name = "inventory_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem extends OwnedEntity {

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InventoryCategory category;

    @Column(nullable = false)
    private Double quantity;

    @Column(nullable = false)
    private String unit;

    /** Feed/supplies: restock below this level. Not used for equipment. */
    @Column(name = "reorder_level")
    private Double reorderLevel;

    @Column(name = "unit_cost", nullable = false)
    private Double unitCost;

    @Column(name = "last_restocked")
    private LocalDate lastRestocked;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EquipmentCondition condition;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;
}

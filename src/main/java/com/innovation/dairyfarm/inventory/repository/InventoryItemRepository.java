package com.innovation.dairyfarm.inventory.repository;

import com.innovation.dairyfarm.inventory.domain.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findAllByFarmId(Long farmId);
    Optional<InventoryItem> findByIdAndFarmId(Long id, Long farmId);
}

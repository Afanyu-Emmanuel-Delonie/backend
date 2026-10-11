package com.innovation.dairyfarm.inventory.repository;

import com.innovation.dairyfarm.inventory.domain.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findAllByOwnerId(Long ownerId);
    Optional<InventoryItem> findByIdAndOwnerId(Long id, Long ownerId);
}

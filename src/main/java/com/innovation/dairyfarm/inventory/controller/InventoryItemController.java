package com.innovation.dairyfarm.inventory.controller;

import com.innovation.dairyfarm.inventory.dto.InventoryItemRequest;
import com.innovation.dairyfarm.inventory.dto.InventoryItemResponse;
import com.innovation.dairyfarm.inventory.service.InventoryItemService;
import com.innovation.dairyfarm.security.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

/** BR-14: create, read, update and delete operations for Inventory Items, scoped to the authenticated owner. */
@RestController
@RequestMapping("/api/inventory-items")
@RequiredArgsConstructor
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    @PostMapping
    public ResponseEntity<InventoryItemResponse> create(
            @Valid @RequestBody InventoryItemRequest request, Authentication authentication) {
        InventoryItemResponse response =
                InventoryItemResponse.from(inventoryItemService.create(CurrentUser.user(authentication), request));
        return ResponseEntity.created(URI.create("/api/inventory-items/" + response.id())).body(response);
    }

    @GetMapping
    public List<InventoryItemResponse> findAll(Authentication authentication) {
        return inventoryItemService.findAll(CurrentUser.id(authentication)).stream()
                .map(InventoryItemResponse::from).toList();
    }

    @GetMapping("/{id}")
    public InventoryItemResponse findById(@PathVariable Long id, Authentication authentication) {
        return InventoryItemResponse.from(inventoryItemService.findById(CurrentUser.id(authentication), id));
    }

    @PutMapping("/{id}")
    public InventoryItemResponse update(
            @PathVariable Long id, @Valid @RequestBody InventoryItemRequest request, Authentication authentication) {
        return InventoryItemResponse.from(inventoryItemService.update(CurrentUser.id(authentication), id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        inventoryItemService.delete(CurrentUser.id(authentication), id);
    }
}

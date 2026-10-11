package com.innovation.dairyfarm.milkproduction.controller;

import com.innovation.dairyfarm.milkproduction.domain.MilkProduction;
import com.innovation.dairyfarm.milkproduction.dto.MilkProductionRequest;
import com.innovation.dairyfarm.milkproduction.dto.MilkProductionResponse;
import com.innovation.dairyfarm.milkproduction.service.MilkProductionService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

/** BR-06: create, read, update and delete operations for Milk Production, scoped to the authenticated account's farm. */
@RestController
@RequestMapping("/api/milk-productions")
@RequiredArgsConstructor
public class MilkProductionController {

    private final MilkProductionService milkProductionService;

    @PostMapping
    public ResponseEntity<MilkProductionResponse> create(
            @Valid @RequestBody MilkProductionRequest request, Authentication authentication) {
        MilkProductionResponse response =
                MilkProductionResponse.from(milkProductionService.create(CurrentUser.farm(authentication), request));
        return ResponseEntity.created(URI.create("/api/milk-productions/" + response.id())).body(response);
    }

    @GetMapping
    public List<MilkProductionResponse> findAll(@RequestParam(required = false) Long cattleId, Authentication authentication) {
        Long farmId = CurrentUser.farmId(authentication);
        List<MilkProduction> records = cattleId != null
                ? milkProductionService.findByCattleId(farmId, cattleId)
                : milkProductionService.findAll(farmId);
        return records.stream().map(MilkProductionResponse::from).toList();
    }

    @GetMapping("/{id}")
    public MilkProductionResponse findById(@PathVariable Long id, Authentication authentication) {
        return MilkProductionResponse.from(milkProductionService.findById(CurrentUser.farmId(authentication), id));
    }

    @PutMapping("/{id}")
    public MilkProductionResponse update(
            @PathVariable Long id, @Valid @RequestBody MilkProductionRequest request, Authentication authentication) {
        return MilkProductionResponse.from(milkProductionService.update(CurrentUser.farmId(authentication), id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        milkProductionService.delete(CurrentUser.farmId(authentication), id);
    }
}

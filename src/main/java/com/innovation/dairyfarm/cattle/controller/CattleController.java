package com.innovation.dairyfarm.cattle.controller;

import com.innovation.dairyfarm.cattle.dto.CattleRequest;
import com.innovation.dairyfarm.cattle.dto.CattleResponse;
import com.innovation.dairyfarm.cattle.service.CattleService;
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

/** BR-05: create, read, update and delete operations for Cattle, scoped to the authenticated account's farm. */
@RestController
@RequestMapping("/api/cattle")
@RequiredArgsConstructor
public class CattleController {

    private final CattleService cattleService;

    @PostMapping
    public ResponseEntity<CattleResponse> create(@Valid @RequestBody CattleRequest request, Authentication authentication) {
        CattleResponse response = CattleResponse.from(cattleService.create(CurrentUser.farm(authentication), request));
        return ResponseEntity.created(URI.create("/api/cattle/" + response.id())).body(response);
    }

    @GetMapping
    public List<CattleResponse> findAll(Authentication authentication) {
        return cattleService.findAll(CurrentUser.farmId(authentication)).stream().map(CattleResponse::from).toList();
    }

    @GetMapping("/{id}")
    public CattleResponse findById(@PathVariable Long id, Authentication authentication) {
        return CattleResponse.from(cattleService.findById(CurrentUser.farmId(authentication), id));
    }

    @PutMapping("/{id}")
    public CattleResponse update(@PathVariable Long id, @Valid @RequestBody CattleRequest request, Authentication authentication) {
        return CattleResponse.from(cattleService.update(CurrentUser.farmId(authentication), id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        cattleService.delete(CurrentUser.farmId(authentication), id);
    }
}

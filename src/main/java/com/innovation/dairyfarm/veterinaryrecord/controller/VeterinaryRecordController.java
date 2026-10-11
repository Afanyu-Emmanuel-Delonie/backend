package com.innovation.dairyfarm.veterinaryrecord.controller;

import com.innovation.dairyfarm.security.CurrentUser;
import com.innovation.dairyfarm.veterinaryrecord.domain.VeterinaryRecord;
import com.innovation.dairyfarm.veterinaryrecord.dto.VeterinaryRecordRequest;
import com.innovation.dairyfarm.veterinaryrecord.dto.VeterinaryRecordResponse;
import com.innovation.dairyfarm.veterinaryrecord.service.VeterinaryRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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

/** BR: create, read, update and delete operations for Veterinary Records, plus resolving a visit. */
@RestController
@RequestMapping("/api/veterinary-records")
@RequiredArgsConstructor
public class VeterinaryRecordController {

    private final VeterinaryRecordService veterinaryRecordService;

    @PostMapping
    public ResponseEntity<VeterinaryRecordResponse> create(
            @Valid @RequestBody VeterinaryRecordRequest request, Authentication authentication) {
        VeterinaryRecordResponse response =
                VeterinaryRecordResponse.from(veterinaryRecordService.create(CurrentUser.user(authentication), request));
        return ResponseEntity.created(URI.create("/api/veterinary-records/" + response.id())).body(response);
    }

    @GetMapping
    public List<VeterinaryRecordResponse> findAll(@RequestParam(required = false) Long cattleId, Authentication authentication) {
        Long ownerId = CurrentUser.id(authentication);
        List<VeterinaryRecord> records = cattleId != null
                ? veterinaryRecordService.findByCattleId(ownerId, cattleId)
                : veterinaryRecordService.findAll(ownerId);
        return records.stream().map(VeterinaryRecordResponse::from).toList();
    }

    @GetMapping("/{id}")
    public VeterinaryRecordResponse findById(@PathVariable Long id, Authentication authentication) {
        return VeterinaryRecordResponse.from(veterinaryRecordService.findById(CurrentUser.id(authentication), id));
    }

    @PutMapping("/{id}")
    public VeterinaryRecordResponse update(
            @PathVariable Long id, @Valid @RequestBody VeterinaryRecordRequest request, Authentication authentication) {
        return VeterinaryRecordResponse.from(veterinaryRecordService.update(CurrentUser.id(authentication), id, request));
    }

    @PatchMapping("/{id}/resolve")
    public VeterinaryRecordResponse resolve(@PathVariable Long id, Authentication authentication) {
        return VeterinaryRecordResponse.from(veterinaryRecordService.resolve(CurrentUser.id(authentication), id));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        veterinaryRecordService.delete(CurrentUser.id(authentication), id);
    }
}

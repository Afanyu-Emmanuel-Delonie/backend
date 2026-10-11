package com.innovation.dairyfarm.workers.controller;

import com.innovation.dairyfarm.security.CurrentUser;
import com.innovation.dairyfarm.workers.dto.WorkerRequest;
import com.innovation.dairyfarm.workers.dto.WorkerResponse;
import com.innovation.dairyfarm.workers.service.WorkerService;
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

/** BR-15: create, read, update and delete operations for Workers, scoped to the authenticated owner. */
@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerService workerService;

    @PostMapping
    public ResponseEntity<WorkerResponse> create(@Valid @RequestBody WorkerRequest request, Authentication authentication) {
        WorkerResponse response = WorkerResponse.from(workerService.create(CurrentUser.user(authentication), request));
        return ResponseEntity.created(URI.create("/api/workers/" + response.id())).body(response);
    }

    @GetMapping
    public List<WorkerResponse> findAll(Authentication authentication) {
        return workerService.findAll(CurrentUser.id(authentication)).stream().map(WorkerResponse::from).toList();
    }

    @GetMapping("/{id}")
    public WorkerResponse findById(@PathVariable Long id, Authentication authentication) {
        return WorkerResponse.from(workerService.findById(CurrentUser.id(authentication), id));
    }

    @PutMapping("/{id}")
    public WorkerResponse update(@PathVariable Long id, @Valid @RequestBody WorkerRequest request, Authentication authentication) {
        return WorkerResponse.from(workerService.update(CurrentUser.id(authentication), id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        workerService.delete(CurrentUser.id(authentication), id);
    }
}

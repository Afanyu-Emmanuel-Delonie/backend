package com.innovation.dairyfarm.finance.controller;

import com.innovation.dairyfarm.finance.dto.FinanceTransactionRequest;
import com.innovation.dairyfarm.finance.dto.FinanceTransactionResponse;
import com.innovation.dairyfarm.finance.service.FinanceTransactionService;
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

/** BR-13: create, read, update and delete operations for Finance Transactions, scoped to the authenticated account's farm. */
@RestController
@RequestMapping("/api/finance-transactions")
@RequiredArgsConstructor
public class FinanceTransactionController {

    private final FinanceTransactionService financeTransactionService;

    @PostMapping
    public ResponseEntity<FinanceTransactionResponse> create(
            @Valid @RequestBody FinanceTransactionRequest request, Authentication authentication) {
        FinanceTransactionResponse response =
                FinanceTransactionResponse.from(financeTransactionService.create(CurrentUser.farm(authentication), request));
        return ResponseEntity.created(URI.create("/api/finance-transactions/" + response.id())).body(response);
    }

    @GetMapping
    public List<FinanceTransactionResponse> findAll(Authentication authentication) {
        return financeTransactionService.findAll(CurrentUser.farmId(authentication)).stream()
                .map(FinanceTransactionResponse::from).toList();
    }

    @GetMapping("/{id}")
    public FinanceTransactionResponse findById(@PathVariable Long id, Authentication authentication) {
        return FinanceTransactionResponse.from(financeTransactionService.findById(CurrentUser.farmId(authentication), id));
    }

    @PutMapping("/{id}")
    public FinanceTransactionResponse update(
            @PathVariable Long id, @Valid @RequestBody FinanceTransactionRequest request, Authentication authentication) {
        return FinanceTransactionResponse.from(financeTransactionService.update(CurrentUser.farmId(authentication), id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        financeTransactionService.delete(CurrentUser.farmId(authentication), id);
    }
}

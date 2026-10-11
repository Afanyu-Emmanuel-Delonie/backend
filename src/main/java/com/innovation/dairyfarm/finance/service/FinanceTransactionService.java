package com.innovation.dairyfarm.finance.service;

import com.innovation.dairyfarm.auth.domain.User;
import com.innovation.dairyfarm.finance.domain.FinanceTransaction;
import com.innovation.dairyfarm.finance.dto.FinanceTransactionRequest;

import java.util.List;

public interface FinanceTransactionService {
    FinanceTransaction create(User owner, FinanceTransactionRequest request);
    FinanceTransaction update(Long ownerId, Long id, FinanceTransactionRequest request);
    void delete(Long ownerId, Long id);
    FinanceTransaction findById(Long ownerId, Long id);
    List<FinanceTransaction> findAll(Long ownerId);
}

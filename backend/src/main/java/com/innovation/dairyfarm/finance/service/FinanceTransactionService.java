package com.innovation.dairyfarm.finance.service;

import com.innovation.dairyfarm.farm.domain.Farm;
import com.innovation.dairyfarm.finance.domain.FinanceTransaction;
import com.innovation.dairyfarm.finance.dto.FinanceTransactionRequest;

import java.util.List;

public interface FinanceTransactionService {
    FinanceTransaction create(Farm farm, FinanceTransactionRequest request);
    FinanceTransaction update(Long farmId, Long id, FinanceTransactionRequest request);
    void delete(Long farmId, Long id);
    FinanceTransaction findById(Long farmId, Long id);
    List<FinanceTransaction> findAll(Long farmId);
}

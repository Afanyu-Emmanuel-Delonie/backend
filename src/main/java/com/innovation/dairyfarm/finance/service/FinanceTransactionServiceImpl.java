package com.innovation.dairyfarm.finance.service;

import com.innovation.dairyfarm.common.exception.ResourceNotFoundException;
import com.innovation.dairyfarm.farm.domain.Farm;
import com.innovation.dairyfarm.finance.domain.FinanceTransaction;
import com.innovation.dairyfarm.finance.dto.FinanceTransactionRequest;
import com.innovation.dairyfarm.finance.repository.FinanceTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FinanceTransactionServiceImpl implements FinanceTransactionService {

    private final FinanceTransactionRepository financeTransactionRepository;

    @Override
    public FinanceTransaction create(Farm farm, FinanceTransactionRequest request) {
        FinanceTransaction transaction = FinanceTransaction.builder()
                .date(request.date())
                .type(request.type())
                .category(request.category())
                .description(request.description())
                .amount(request.amount())
                .reference(request.reference())
                .build();
        transaction.setFarm(farm);
        return financeTransactionRepository.save(transaction);
    }

    @Override
    public FinanceTransaction update(Long farmId, Long id, FinanceTransactionRequest request) {
        FinanceTransaction transaction = findById(farmId, id);
        transaction.setDate(request.date());
        transaction.setType(request.type());
        transaction.setCategory(request.category());
        transaction.setDescription(request.description());
        transaction.setAmount(request.amount());
        transaction.setReference(request.reference());
        return financeTransactionRepository.save(transaction);
    }

    @Override
    public void delete(Long farmId, Long id) {
        FinanceTransaction transaction = findById(farmId, id);
        financeTransactionRepository.delete(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public FinanceTransaction findById(Long farmId, Long id) {
        return financeTransactionRepository.findByIdAndFarmId(id, farmId)
                .orElseThrow(() -> new ResourceNotFoundException("Finance transaction not found with id " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FinanceTransaction> findAll(Long farmId) {
        return financeTransactionRepository.findAllByFarmId(farmId);
    }
}

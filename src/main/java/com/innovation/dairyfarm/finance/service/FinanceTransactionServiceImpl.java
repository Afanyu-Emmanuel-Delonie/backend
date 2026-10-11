package com.innovation.dairyfarm.finance.service;

import com.innovation.dairyfarm.auth.domain.User;
import com.innovation.dairyfarm.common.exception.ResourceNotFoundException;
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
    public FinanceTransaction create(User owner, FinanceTransactionRequest request) {
        FinanceTransaction transaction = FinanceTransaction.builder()
                .date(request.date())
                .type(request.type())
                .category(request.category())
                .description(request.description())
                .amount(request.amount())
                .reference(request.reference())
                .build();
        transaction.setOwner(owner);
        return financeTransactionRepository.save(transaction);
    }

    @Override
    public FinanceTransaction update(Long ownerId, Long id, FinanceTransactionRequest request) {
        FinanceTransaction transaction = findById(ownerId, id);
        transaction.setDate(request.date());
        transaction.setType(request.type());
        transaction.setCategory(request.category());
        transaction.setDescription(request.description());
        transaction.setAmount(request.amount());
        transaction.setReference(request.reference());
        return financeTransactionRepository.save(transaction);
    }

    @Override
    public void delete(Long ownerId, Long id) {
        FinanceTransaction transaction = findById(ownerId, id);
        financeTransactionRepository.delete(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public FinanceTransaction findById(Long ownerId, Long id) {
        return financeTransactionRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Finance transaction not found with id " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FinanceTransaction> findAll(Long ownerId) {
        return financeTransactionRepository.findAllByOwnerId(ownerId);
    }
}

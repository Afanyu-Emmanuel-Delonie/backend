package com.innovation.dairyfarm.finance.dto;

import com.innovation.dairyfarm.finance.domain.FinanceTransaction;
import com.innovation.dairyfarm.finance.domain.TransactionCategory;
import com.innovation.dairyfarm.finance.domain.TransactionType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record FinanceTransactionResponse(
        Long id,
        LocalDate date,
        TransactionType type,
        TransactionCategory category,
        String description,
        Double amount,
        String reference,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static FinanceTransactionResponse from(FinanceTransaction transaction) {
        return new FinanceTransactionResponse(
                transaction.getId(),
                transaction.getDate(),
                transaction.getType(),
                transaction.getCategory(),
                transaction.getDescription(),
                transaction.getAmount(),
                transaction.getReference(),
                transaction.getCreatedAt(),
                transaction.getUpdatedAt()
        );
    }
}

package com.innovation.dairyfarm.finance.dto;

import com.innovation.dairyfarm.finance.domain.TransactionCategory;
import com.innovation.dairyfarm.finance.domain.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

/** BR-13: date cannot be in the future; amount must be positive. */
public record FinanceTransactionRequest(
        @NotNull(message = "date is required")
        @PastOrPresent(message = "date cannot be in the future")
        LocalDate date,

        @NotNull(message = "type is required")
        TransactionType type,

        @NotNull(message = "category is required")
        TransactionCategory category,

        @NotBlank(message = "description is required")
        String description,

        @NotNull(message = "amount is required")
        @DecimalMin(value = "0.01", message = "amount must be positive")
        Double amount,

        String reference
) {
}

package com.innovation.dairyfarm.milkproduction.dto;

import com.innovation.dairyfarm.milkproduction.domain.Shift;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

/** BR-04, BR-07: production date cannot be future, quantity is 0-100 litres. */
public record MilkProductionRequest(
        @NotNull(message = "cattleId is required")
        Long cattleId,

        @NotNull(message = "recordDate is required")
        @PastOrPresent(message = "recordDate cannot be in the future")
        LocalDate recordDate,

        @NotNull(message = "shift is required")
        Shift shift,

        @NotNull(message = "quantityLiters is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "quantityLiters must be at least 0")
        @DecimalMax(value = "100.0", inclusive = true, message = "quantityLiters must be at most 100")
        Double quantityLiters
) {
}

package com.innovation.dairyfarm.veterinaryrecord.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

/** BR-10: visitDate cannot be future, cost cannot be negative. */
public record VeterinaryRecordRequest(
        @NotNull(message = "cattleId is required")
        Long cattleId,

        @NotNull(message = "visitDate is required")
        @PastOrPresent(message = "visitDate cannot be in the future")
        LocalDate visitDate,

        @NotBlank(message = "veterinarianName is required")
        String veterinarianName,

        @NotBlank(message = "diagnosis is required")
        String diagnosis,

        String treatment,

        @NotNull(message = "cost is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "cost cannot be negative")
        Double cost,

        LocalDate followUpDate
) {
}

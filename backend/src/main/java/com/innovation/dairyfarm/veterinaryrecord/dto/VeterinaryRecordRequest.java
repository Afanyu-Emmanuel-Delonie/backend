package com.innovation.dairyfarm.veterinaryrecord.dto;

import com.innovation.dairyfarm.veterinaryrecord.domain.Severity;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

/** BR-10: date cannot be future; cost (when given) cannot be negative. */
public record VeterinaryRecordRequest(
        @NotNull(message = "cattleId is required")
        Long cattleId,

        @NotNull(message = "date is required")
        @PastOrPresent(message = "date cannot be in the future")
        LocalDate date,

        @NotBlank(message = "complaint is required")
        String complaint,

        String notes,

        @NotNull(message = "severity is required")
        Severity severity,

        @NotBlank(message = "treatedBy is required")
        String treatedBy,

        @DecimalMin(value = "0.0", inclusive = true, message = "cost cannot be negative")
        Double cost,

        LocalDate followUpDate
) {
}

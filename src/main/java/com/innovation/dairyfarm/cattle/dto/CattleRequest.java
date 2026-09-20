package com.innovation.dairyfarm.cattle.dto;

import com.innovation.dairyfarm.cattle.domain.HealthStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

/** BR-01, BR-07: tag number must be 3-20 alphanumeric/hyphen characters. */
public record CattleRequest(
        @NotBlank(message = "tagNumber is required")
        @Pattern(regexp = "^[A-Za-z0-9-]{3,20}$", message = "tagNumber must be 3-20 letters, digits or hyphens")
        String tagNumber,

        @NotBlank(message = "breed is required")
        String breed,

        @NotNull(message = "dateOfBirth is required")
        @PastOrPresent(message = "dateOfBirth cannot be in the future")
        LocalDate dateOfBirth,

        @NotNull(message = "healthStatus is required")
        HealthStatus healthStatus
) {
}

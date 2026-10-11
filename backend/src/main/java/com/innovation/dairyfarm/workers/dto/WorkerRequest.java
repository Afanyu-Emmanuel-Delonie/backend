package com.innovation.dairyfarm.workers.dto;

import com.innovation.dairyfarm.workers.domain.EmploymentStatus;
import com.innovation.dairyfarm.workers.domain.WorkerRole;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

/** BR-15: startDate cannot be in the future; monthlySalary cannot be negative. */
public record WorkerRequest(
        @NotBlank(message = "name is required")
        String name,

        @NotNull(message = "role is required")
        WorkerRole role,

        @NotBlank(message = "phone is required")
        String phone,

        @NotNull(message = "startDate is required")
        @PastOrPresent(message = "startDate cannot be in the future")
        LocalDate startDate,

        @NotNull(message = "status is required")
        EmploymentStatus status,

        @DecimalMin(value = "0.0", message = "monthlySalary cannot be negative")
        Double monthlySalary
) {
}

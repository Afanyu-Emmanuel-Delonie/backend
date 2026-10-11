package com.innovation.dairyfarm.workers.dto;

import com.innovation.dairyfarm.workers.domain.EmploymentStatus;
import com.innovation.dairyfarm.workers.domain.Worker;
import com.innovation.dairyfarm.workers.domain.WorkerRole;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record WorkerResponse(
        Long id,
        String name,
        WorkerRole role,
        String phone,
        LocalDate startDate,
        EmploymentStatus status,
        Double monthlySalary,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static WorkerResponse from(Worker worker) {
        return new WorkerResponse(
                worker.getId(),
                worker.getName(),
                worker.getRole(),
                worker.getPhone(),
                worker.getStartDate(),
                worker.getStatus(),
                worker.getMonthlySalary(),
                worker.getCreatedAt(),
                worker.getUpdatedAt()
        );
    }
}

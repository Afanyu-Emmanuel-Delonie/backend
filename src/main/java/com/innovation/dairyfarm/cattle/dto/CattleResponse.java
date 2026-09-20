package com.innovation.dairyfarm.cattle.dto;

import com.innovation.dairyfarm.cattle.domain.Cattle;
import com.innovation.dairyfarm.cattle.domain.HealthStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CattleResponse(
        Long id,
        String tagNumber,
        String breed,
        LocalDate dateOfBirth,
        HealthStatus healthStatus,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static CattleResponse from(Cattle cattle) {
        return new CattleResponse(
                cattle.getId(),
                cattle.getTagNumber(),
                cattle.getBreed(),
                cattle.getDateOfBirth(),
                cattle.getHealthStatus(),
                cattle.getCreatedAt(),
                cattle.getUpdatedAt()
        );
    }
}

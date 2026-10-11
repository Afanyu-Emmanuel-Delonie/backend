package com.innovation.dairyfarm.milkproduction.dto;

import com.innovation.dairyfarm.milkproduction.domain.MilkProduction;
import com.innovation.dairyfarm.milkproduction.domain.Shift;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record MilkProductionResponse(
        Long id,
        Long cattleId,
        String cattleTagNumber,
        LocalDate recordDate,
        Shift shift,
        Double quantityLiters,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static MilkProductionResponse from(MilkProduction record) {
        return new MilkProductionResponse(
                record.getId(),
                record.getCattle().getId(),
                record.getCattle().getTagNumber(),
                record.getRecordDate(),
                record.getShift(),
                record.getQuantityLiters(),
                record.getCreatedAt(),
                record.getUpdatedAt()
        );
    }
}

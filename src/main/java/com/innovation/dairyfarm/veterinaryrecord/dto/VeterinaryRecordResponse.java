package com.innovation.dairyfarm.veterinaryrecord.dto;

import com.innovation.dairyfarm.veterinaryrecord.domain.Severity;
import com.innovation.dairyfarm.veterinaryrecord.domain.VeterinaryRecord;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record VeterinaryRecordResponse(
        Long id,
        Long cattleId,
        String cattleTagNumber,
        LocalDate date,
        String complaint,
        String notes,
        Severity severity,
        String treatedBy,
        Double cost,
        LocalDate followUpDate,
        Boolean resolved,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static VeterinaryRecordResponse from(VeterinaryRecord record) {
        return new VeterinaryRecordResponse(
                record.getId(),
                record.getCattle().getId(),
                record.getCattle().getTagNumber(),
                record.getDate(),
                record.getComplaint(),
                record.getNotes(),
                record.getSeverity(),
                record.getTreatedBy(),
                record.getCost(),
                record.getFollowUpDate(),
                record.getResolved(),
                record.getCreatedAt(),
                record.getUpdatedAt()
        );
    }
}

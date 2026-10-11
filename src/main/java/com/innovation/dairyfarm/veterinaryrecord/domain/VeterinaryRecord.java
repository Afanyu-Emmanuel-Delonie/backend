package com.innovation.dairyfarm.veterinaryrecord.domain;

import com.innovation.dairyfarm.cattle.domain.Cattle;
import com.innovation.dairyfarm.common.OwnedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * BR-10, BR-11: visit date cannot be future, cost (when given) cannot be
 * negative, and a follow-up date (if given) must be after the visit date.
 * Creating a record moves the related Cattle into UNDER_TREATMENT; resolving
 * it moves the Cattle to RECOVERED.
 */
@Entity
@Table(name = "veterinary_record")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VeterinaryRecord extends OwnedEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cattle_id", nullable = false)
    private Cattle cattle;

    @Column(name = "visit_date", nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String complaint;

    @Column
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Severity severity;

    @Column(name = "treated_by", nullable = false)
    private String treatedBy;

    /** Optional - the current Health UI doesn't collect this yet. */
    @Column
    private Double cost;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Column(nullable = false)
    @Builder.Default
    private Boolean resolved = Boolean.FALSE;
}

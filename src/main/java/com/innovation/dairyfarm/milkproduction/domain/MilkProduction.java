package com.innovation.dairyfarm.milkproduction.domain;

import com.innovation.dairyfarm.cattle.domain.Cattle;
import com.innovation.dairyfarm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * BR-03, BR-04, BR-07, BR-09: every record references an existing Cattle,
 * quantity is 0-100 litres, and a cattle can only have one record per
 * shift per day.
 */
@Entity
@Table(name = "milk_production",
        uniqueConstraints = @UniqueConstraint(columnNames = {"cattle_id", "record_date", "shift"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MilkProduction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cattle_id", nullable = false)
    private Cattle cattle;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "shift", nullable = false, length = 10)
    private Shift shift;

    @Column(name = "quantity_liters", nullable = false)
    private Double quantityLiters;
}

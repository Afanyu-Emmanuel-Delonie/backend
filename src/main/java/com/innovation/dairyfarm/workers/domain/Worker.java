package com.innovation.dairyfarm.workers.domain;

import com.innovation.dairyfarm.common.OwnedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/** BR-15: startDate cannot be in the future; monthlySalary cannot be negative. */
@Entity
@Table(name = "worker")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Worker extends OwnedEntity {

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkerRole role;

    @Column(nullable = false)
    private String phone;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private EmploymentStatus status;

    /** Monthly wage in farm currency. Omitted for an owner, who draws profit rather than a wage. */
    @Column(name = "monthly_salary")
    private Double monthlySalary;
}

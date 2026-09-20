package com.innovation.dairyfarm.cattle.domain;

import com.innovation.dairyfarm.common.BaseEntity;
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

/**
 * BR-01, BR-02: unique tag number, breed, date of birth and health status;
 * the birth date can never be in the future.
 */
@Entity
@Table(name = "cattle")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cattle extends BaseEntity {

    @Column(name = "tag_number", nullable = false, unique = true, length = 20)
    private String tagNumber;

    @Column(name = "breed", nullable = false)
    private String breed;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "health_status", nullable = false, length = 20)
    private HealthStatus healthStatus;
}

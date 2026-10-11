package com.innovation.dairyfarm.cattle.domain;

import com.innovation.dairyfarm.common.OwnedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * BR-01, BR-02: tag number is unique per owner (not globally - two different
 * farms may each have their own "001"), breed, date of birth, health status
 * and estimated value are required; the birth date can never be in the
 * future. Purchase/sale/death fields are optional, set via the matching
 * acquisition or lifecycle flow rather than always being present.
 */
@Entity
@Table(name = "cattle", uniqueConstraints = @UniqueConstraint(columnNames = {"tag_number", "owner_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cattle extends OwnedEntity {

    @Column(name = "tag_number", nullable = false, length = 20)
    private String tagNumber;

    @Column(name = "breed", nullable = false)
    private String breed;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "health_status", nullable = false, length = 20)
    private HealthStatus healthStatus;

    /** Estimated current market value. */
    @Column(name = "estimated_value", nullable = false)
    private Double estimatedValue;

    /** Set when the animal was bought in rather than born on the farm. */
    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "purchase_price")
    private Double purchasePrice;

    /** Set if the animal has died. */
    @Column(name = "deceased_date")
    private LocalDate deceasedDate;

    /** Set if the animal has been sold off the farm. */
    @Column(name = "sold_date")
    private LocalDate soldDate;

    @Column(name = "sold_price")
    private Double soldPrice;
}

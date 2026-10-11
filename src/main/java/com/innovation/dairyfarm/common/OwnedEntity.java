package com.innovation.dairyfarm.common;

import com.innovation.dairyfarm.farm.domain.Farm;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

/**
 * Base for every entity that belongs to one farm (Cattle, Milk Production, Veterinary Record,
 * Finance, Inventory, Workers, Invites). Scoping by Farm rather than by the individual User is
 * what lets a farm owner and the workers they invite all see the same data - see Farm's javadoc.
 */
@MappedSuperclass
@Getter
@Setter
public abstract class OwnedEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;
}

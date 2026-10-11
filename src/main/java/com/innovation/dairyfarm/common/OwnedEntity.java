package com.innovation.dairyfarm.common;

import com.innovation.dairyfarm.auth.domain.User;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

/**
 * Base for every entity that belongs to one farm account (Cattle, Milk Production,
 * Veterinary Record, Finance, Inventory, Workers). Keeping the owner link here means
 * every repository can filter by it consistently, so one account can never see or
 * modify another account's farm data.
 */
@MappedSuperclass
@Getter
@Setter
public abstract class OwnedEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
}

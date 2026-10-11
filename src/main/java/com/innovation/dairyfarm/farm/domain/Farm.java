package com.innovation.dairyfarm.farm.domain;

import com.innovation.dairyfarm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One farm account. Every {@code OwnedEntity} row (Cattle, Milk Production, etc.) belongs to a
 * Farm, not directly to a User - that's what lets multiple accounts (an owner plus the workers
 * they invite) share the same farm data instead of each getting an isolated empty account.
 */
@Entity
@Table(name = "farm")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farm extends BaseEntity {

    @Column(nullable = false)
    private String name;
}

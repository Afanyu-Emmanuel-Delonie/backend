package com.innovation.dairyfarm.finance.domain;

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

/** BR-13: transaction date cannot be in the future; amount must be positive. */
@Entity
@Table(name = "finance_transaction")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinanceTransaction extends OwnedEntity {

    @Column(name = "transaction_date", nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionCategory category;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Double amount;

    /** Optional free-text reference, e.g. an animal tag number or invoice number. */
    @Column
    private String reference;
}

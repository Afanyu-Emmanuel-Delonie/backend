package com.innovation.dairyfarm.finance.repository;

import com.innovation.dairyfarm.finance.domain.FinanceTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FinanceTransactionRepository extends JpaRepository<FinanceTransaction, Long> {
    List<FinanceTransaction> findAllByOwnerId(Long ownerId);
    Optional<FinanceTransaction> findByIdAndOwnerId(Long id, Long ownerId);
}

package com.innovation.dairyfarm.workers.repository;

import com.innovation.dairyfarm.workers.domain.Worker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkerRepository extends JpaRepository<Worker, Long> {
    List<Worker> findAllByFarmId(Long farmId);
    Optional<Worker> findByIdAndFarmId(Long id, Long farmId);
}

package com.innovation.dairyfarm.cattle.repository;

import com.innovation.dairyfarm.cattle.domain.Cattle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CattleRepository extends JpaRepository<Cattle, Long> {
    List<Cattle> findAllByOwnerId(Long ownerId);
    Optional<Cattle> findByIdAndOwnerId(Long id, Long ownerId);
    boolean existsByTagNumberAndOwnerId(String tagNumber, Long ownerId);
    boolean existsByTagNumberAndOwnerIdAndIdNot(String tagNumber, Long ownerId, Long id);
}

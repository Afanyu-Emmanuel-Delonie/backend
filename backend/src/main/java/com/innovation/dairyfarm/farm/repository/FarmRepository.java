package com.innovation.dairyfarm.farm.repository;

import com.innovation.dairyfarm.farm.domain.Farm;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FarmRepository extends JpaRepository<Farm, Long> {
}

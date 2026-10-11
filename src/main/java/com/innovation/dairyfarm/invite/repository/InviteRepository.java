package com.innovation.dairyfarm.invite.repository;

import com.innovation.dairyfarm.invite.domain.Invite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InviteRepository extends JpaRepository<Invite, Long> {
    List<Invite> findAllByFarmId(Long farmId);
    Optional<Invite> findByIdAndFarmId(Long id, Long farmId);
}

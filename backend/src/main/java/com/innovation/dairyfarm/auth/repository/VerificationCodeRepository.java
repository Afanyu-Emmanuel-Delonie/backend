package com.innovation.dairyfarm.auth.repository;

import com.innovation.dairyfarm.auth.domain.OtpPurpose;
import com.innovation.dairyfarm.auth.domain.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    Optional<VerificationCode> findFirstByEmailAndPurposeOrderByCreatedAtDesc(String email, OtpPurpose purpose);
}

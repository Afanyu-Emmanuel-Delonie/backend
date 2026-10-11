package com.innovation.dairyfarm.auth.service;

import com.innovation.dairyfarm.auth.domain.OtpPurpose;
import com.innovation.dairyfarm.auth.domain.VerificationCode;
import com.innovation.dairyfarm.auth.repository.VerificationCodeRepository;
import com.innovation.dairyfarm.common.exception.BusinessRuleViolationException;
import com.innovation.dairyfarm.common.exception.InvalidCredentialsException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class OtpServiceImpl implements OtpService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final VerificationCodeRepository verificationCodeRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.otp.expiration-minutes}")
    private long expirationMinutes;

    @Value("${app.otp.resend-cooldown-seconds}")
    private long resendCooldownSeconds;

    @Override
    public void generateAndSend(String email, OtpPurpose purpose) {
        verificationCodeRepository.findFirstByEmailAndPurposeOrderByCreatedAtDesc(email, purpose)
                .filter(last -> last.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(resendCooldownSeconds)))
                .ifPresent(last -> {
                    throw new BusinessRuleViolationException(
                            "Please wait before requesting another code.");
                });

        String code = "%06d".formatted(RANDOM.nextInt(1_000_000));
        VerificationCode verificationCode = VerificationCode.builder()
                .email(email)
                .codeHash(passwordEncoder.encode(code))
                .purpose(purpose)
                .expiresAt(LocalDateTime.now().plusMinutes(expirationMinutes))
                .consumed(false)
                .build();
        verificationCodeRepository.save(verificationCode);

        emailService.sendOtpEmail(email, code, purpose);
    }

    @Override
    public void verify(String email, String code, OtpPurpose purpose) {
        VerificationCode verificationCode = verificationCodeRepository
                .findFirstByEmailAndPurposeOrderByCreatedAtDesc(email, purpose)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired code"));

        boolean valid = !verificationCode.isConsumed()
                && verificationCode.getExpiresAt().isAfter(LocalDateTime.now())
                && passwordEncoder.matches(code, verificationCode.getCodeHash());

        if (!valid) {
            throw new InvalidCredentialsException("Invalid or expired code");
        }

        verificationCode.setConsumed(true);
        verificationCodeRepository.save(verificationCode);
    }
}

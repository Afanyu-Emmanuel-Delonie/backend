package com.innovation.dairyfarm.auth.service;

import com.innovation.dairyfarm.auth.domain.OtpPurpose;
import com.innovation.dairyfarm.auth.domain.PasswordResetToken;
import com.innovation.dairyfarm.auth.domain.Role;
import com.innovation.dairyfarm.auth.domain.User;
import com.innovation.dairyfarm.auth.dto.ChangePasswordRequest;
import com.innovation.dairyfarm.auth.dto.ForgotPasswordRequest;
import com.innovation.dairyfarm.auth.dto.LoginRequest;
import com.innovation.dairyfarm.auth.dto.OtpVerifyResponse;
import com.innovation.dairyfarm.auth.dto.RegisterRequest;
import com.innovation.dairyfarm.auth.dto.ResendOtpRequest;
import com.innovation.dairyfarm.auth.dto.ResetPasswordRequest;
import com.innovation.dairyfarm.auth.dto.UpdateProfileRequest;
import com.innovation.dairyfarm.auth.dto.UserResponse;
import com.innovation.dairyfarm.auth.dto.VerifyOtpRequest;
import com.innovation.dairyfarm.auth.repository.PasswordResetTokenRepository;
import com.innovation.dairyfarm.auth.repository.UserRepository;
import com.innovation.dairyfarm.common.exception.DuplicateResourceException;
import com.innovation.dairyfarm.common.exception.EmailNotVerifiedException;
import com.innovation.dairyfarm.common.exception.InvalidCredentialsException;
import com.innovation.dairyfarm.common.exception.ResourceNotFoundException;
import com.innovation.dairyfarm.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;
    private final JwtService jwtService;

    @Value("${app.password-reset.expiration-minutes}")
    private long passwordResetExpirationMinutes;

    @Override
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("An account with email '" + request.email() + "' already exists");
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .farmName(request.farmName())
                .phone(request.phone())
                .role(Role.FARM_OWNER)
                .emailVerified(false)
                .enabled(true)
                .build();
        userRepository.save(user);

        otpService.generateAndSend(user.getEmail(), OtpPurpose.SIGNUP_VERIFICATION);
    }

    @Override
    public OtpVerifyResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (DisabledException ex) {
            otpService.generateAndSend(user.getEmail(), OtpPurpose.SIGNUP_VERIFICATION);
            throw new EmailNotVerifiedException("Please verify your email first. A new code has been sent.");
        } catch (BadCredentialsException ex) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return OtpVerifyResponse.signedIn(jwtService.generateToken(user), UserResponse.from(user));
    }

    @Override
    public OtpVerifyResponse verifyOtp(VerifyOtpRequest request) {
        otpService.verify(request.email(), request.code(), request.purpose());

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired code"));

        return switch (request.purpose()) {
            case SIGNUP_VERIFICATION -> {
                user.setEmailVerified(true);
                userRepository.save(user);
                yield OtpVerifyResponse.signedIn(jwtService.generateToken(user), UserResponse.from(user));
            }
            case LOGIN_2FA -> OtpVerifyResponse.signedIn(jwtService.generateToken(user), UserResponse.from(user));
            case PASSWORD_RESET -> {
                String resetToken = UUID.randomUUID().toString();
                passwordResetTokenRepository.save(PasswordResetToken.builder()
                        .email(user.getEmail())
                        .token(resetToken)
                        .expiresAt(LocalDateTime.now().plusMinutes(passwordResetExpirationMinutes))
                        .used(false)
                        .build());
                yield OtpVerifyResponse.passwordReset(resetToken);
            }
        };
    }

    @Override
    public void resendOtp(ResendOtpRequest request) {
        if (!userRepository.existsByEmail(request.email())) {
            throw new ResourceNotFoundException("No account found for that email");
        }
        otpService.generateAndSend(request.email(), request.purpose());
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.email())
                .ifPresent(user -> otpService.generateAndSend(user.getEmail(), OtpPurpose.PASSWORD_RESET));
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.resetToken())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired reset token"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Invalid or expired reset token");
        }

        User user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired reset token"));

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        return UserResponse.from(userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));
    }

    @Override
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setFullName(request.fullName());
        user.setFarmName(request.farmName());
        user.setPhone(request.phone());
        return UserResponse.from(userRepository.save(user));
    }

    @Override
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Override
    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
    }
}

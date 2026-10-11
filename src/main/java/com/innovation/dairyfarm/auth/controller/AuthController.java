package com.innovation.dairyfarm.auth.controller;

import com.innovation.dairyfarm.auth.dto.ForgotPasswordRequest;
import com.innovation.dairyfarm.auth.dto.LoginRequest;
import com.innovation.dairyfarm.auth.dto.MessageResponse;
import com.innovation.dairyfarm.auth.dto.OtpVerifyResponse;
import com.innovation.dairyfarm.auth.dto.RegisterRequest;
import com.innovation.dairyfarm.auth.dto.ResendOtpRequest;
import com.innovation.dairyfarm.auth.dto.ResetPasswordRequest;
import com.innovation.dairyfarm.auth.dto.UserResponse;
import com.innovation.dairyfarm.auth.dto.VerifyOtpRequest;
import com.innovation.dairyfarm.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(MessageResponse.of("Registration successful. Check your email for a verification code."));
    }

    @PostMapping("/login")
    public MessageResponse login(@Valid @RequestBody LoginRequest request) {
        authService.login(request);
        return MessageResponse.of("A verification code has been sent to your email.");
    }

    @PostMapping("/otp/verify")
    public OtpVerifyResponse verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return authService.verifyOtp(request);
    }

    @PostMapping("/otp/resend")
    public MessageResponse resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request);
        return MessageResponse.of("A new code has been sent to your email.");
    }

    @PostMapping("/password/forgot")
    public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return MessageResponse.of("If that email is registered, a reset code has been sent.");
    }

    @PostMapping("/password/reset")
    public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return MessageResponse.of("Password updated. You can now sign in.");
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return authService.getCurrentUser(authentication.getName());
    }
}

package com.innovation.dairyfarm.auth.service;

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

public interface AuthService {
    void register(RegisterRequest request);

    /** Checks credentials and returns a signed-in session directly. */
    OtpVerifyResponse login(LoginRequest request);

    OtpVerifyResponse verifyOtp(VerifyOtpRequest request);

    void resendOtp(ResendOtpRequest request);

    /** Always succeeds from the caller's point of view, whether or not the email is registered. */
    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    UserResponse getCurrentUser(String email);

    UserResponse updateProfile(String email, UpdateProfileRequest request);

    void changePassword(String email, ChangePasswordRequest request);

    void deleteAccount(String email);
}

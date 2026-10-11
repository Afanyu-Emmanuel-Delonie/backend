package com.innovation.dairyfarm.auth.dto;

/**
 * Response for {@code POST /api/auth/otp/verify}. Exactly one of {@code token}
 * (SIGNUP_VERIFICATION / LOGIN_2FA - the caller is now signed in) or
 * {@code resetToken} (PASSWORD_RESET - exchange it at /api/auth/password/reset)
 * is populated, matching the purpose that was verified.
 */
public record OtpVerifyResponse(
        String token,
        String resetToken,
        UserResponse user
) {
    public static OtpVerifyResponse signedIn(String token, UserResponse user) {
        return new OtpVerifyResponse(token, null, user);
    }

    public static OtpVerifyResponse passwordReset(String resetToken) {
        return new OtpVerifyResponse(null, resetToken, null);
    }
}

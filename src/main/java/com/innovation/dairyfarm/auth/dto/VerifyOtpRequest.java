package com.innovation.dairyfarm.auth.dto;

import com.innovation.dairyfarm.auth.domain.OtpPurpose;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record VerifyOtpRequest(
        @NotBlank(message = "email is required")
        @Email(message = "email must be a valid email address")
        String email,

        @NotBlank(message = "code is required")
        @Pattern(regexp = "^\\d{6}$", message = "code must be a 6-digit number")
        String code,

        @NotNull(message = "purpose is required")
        OtpPurpose purpose
) {
}

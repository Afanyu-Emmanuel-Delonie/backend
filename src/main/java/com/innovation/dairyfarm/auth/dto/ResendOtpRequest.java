package com.innovation.dairyfarm.auth.dto;

import com.innovation.dairyfarm.auth.domain.OtpPurpose;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ResendOtpRequest(
        @NotBlank(message = "email is required")
        @Email(message = "email must be a valid email address")
        String email,

        @NotNull(message = "purpose is required")
        OtpPurpose purpose
) {
}

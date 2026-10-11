package com.innovation.dairyfarm.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "fullName is required")
        String fullName,

        @NotBlank(message = "farmName is required")
        String farmName,

        @NotBlank(message = "email is required")
        @Email(message = "email must be a valid email address")
        String email,

        String phone,

        @NotBlank(message = "password is required")
        @Size(min = 8, message = "password must be at least 8 characters")
        String password
) {
}

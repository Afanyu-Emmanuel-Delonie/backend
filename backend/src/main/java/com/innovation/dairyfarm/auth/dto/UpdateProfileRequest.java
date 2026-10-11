package com.innovation.dairyfarm.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank @Size(max = 100) String fullName,
        @NotBlank @Size(max = 100) String farmName,
        String phone
) {}

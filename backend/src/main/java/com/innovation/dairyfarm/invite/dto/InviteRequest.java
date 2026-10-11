package com.innovation.dairyfarm.invite.dto;

import com.innovation.dairyfarm.auth.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InviteRequest(
        @NotBlank(message = "email is required")
        @Email(message = "email must be a valid email address")
        String email,

        @NotNull(message = "role is required")
        Role role
) {
}

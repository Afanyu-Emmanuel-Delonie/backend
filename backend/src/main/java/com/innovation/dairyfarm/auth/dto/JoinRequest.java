package com.innovation.dairyfarm.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Accepting an invite - email, farm and role all come from the Invite itself, never the client. */
public record JoinRequest(
        @NotNull(message = "inviteId is required")
        Long inviteId,

        @NotBlank(message = "fullName is required")
        String fullName,

        String phone,

        @NotBlank(message = "password is required")
        @Size(min = 8, message = "password must be at least 8 characters")
        String password
) {
}

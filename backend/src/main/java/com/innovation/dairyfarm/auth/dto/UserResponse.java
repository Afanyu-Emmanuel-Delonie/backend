package com.innovation.dairyfarm.auth.dto;

import com.innovation.dairyfarm.auth.domain.Role;
import com.innovation.dairyfarm.auth.domain.User;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String email,
        String fullName,
        String farmName,
        String phone,
        Role role,
        boolean emailVerified,
        LocalDateTime createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getFarm().getName(),
                user.getPhone(),
                user.getRole(),
                user.isEmailVerified(),
                user.getCreatedAt()
        );
    }
}

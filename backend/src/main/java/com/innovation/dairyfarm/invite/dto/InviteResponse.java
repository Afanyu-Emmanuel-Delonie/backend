package com.innovation.dairyfarm.invite.dto;

import com.innovation.dairyfarm.auth.domain.Role;
import com.innovation.dairyfarm.invite.domain.Invite;
import com.innovation.dairyfarm.invite.domain.InviteStatus;

import java.time.LocalDateTime;

public record InviteResponse(
        Long id,
        String email,
        Role role,
        InviteStatus status,
        LocalDateTime sentAt
) {
    public static InviteResponse from(Invite invite) {
        return new InviteResponse(
                invite.getId(),
                invite.getEmail(),
                invite.getRole(),
                invite.getStatus(),
                invite.getCreatedAt()
        );
    }
}

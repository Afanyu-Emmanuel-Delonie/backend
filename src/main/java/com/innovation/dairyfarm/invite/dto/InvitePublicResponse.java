package com.innovation.dairyfarm.invite.dto;

import com.innovation.dairyfarm.auth.domain.Role;
import com.innovation.dairyfarm.invite.domain.Invite;
import com.innovation.dairyfarm.invite.domain.InviteStatus;

/** What the join page (opened by someone not signed in yet) is allowed to see about an invite. */
public record InvitePublicResponse(
        Long id,
        String farmName,
        String email,
        Role role,
        InviteStatus status
) {
    public static InvitePublicResponse from(Invite invite) {
        return new InvitePublicResponse(
                invite.getId(),
                invite.getFarm().getName(),
                invite.getEmail(),
                invite.getRole(),
                invite.getStatus()
        );
    }
}

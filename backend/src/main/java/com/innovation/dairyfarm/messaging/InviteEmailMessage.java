package com.innovation.dairyfarm.messaging;

import com.innovation.dairyfarm.auth.domain.Role;

import java.io.Serializable;

/** Queued payload for an invite notification, consumed asynchronously by {@link InviteEmailConsumer}. */
public record InviteEmailMessage(String to, String farmName, Role role, Long inviteId) implements Serializable {
}

package com.innovation.dairyfarm.auth.service;

import com.innovation.dairyfarm.auth.domain.OtpPurpose;
import com.innovation.dairyfarm.auth.domain.Role;

public interface EmailService {
    void sendOtpEmail(String to, String code, OtpPurpose purpose);

    /** Notifies someone a farm owner invited them, with the link they need to join. */
    void sendInviteEmail(String to, String farmName, Role role, Long inviteId);
}

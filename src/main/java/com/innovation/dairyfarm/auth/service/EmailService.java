package com.innovation.dairyfarm.auth.service;

import com.innovation.dairyfarm.auth.domain.OtpPurpose;

public interface EmailService {
    void sendOtpEmail(String to, String code, OtpPurpose purpose);
}

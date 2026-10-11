package com.innovation.dairyfarm.auth.service;

import com.innovation.dairyfarm.auth.domain.OtpPurpose;

public interface OtpService {
    /** Generates a fresh 6-digit code, stores its hash, and emails it. Throttled per email+purpose. */
    void generateAndSend(String email, OtpPurpose purpose);

    /** Validates the code against the most recent unconsumed, unexpired code for email+purpose, then consumes it. */
    void verify(String email, String code, OtpPurpose purpose);
}

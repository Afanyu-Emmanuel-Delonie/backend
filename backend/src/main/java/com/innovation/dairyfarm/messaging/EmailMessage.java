package com.innovation.dairyfarm.messaging;

import com.innovation.dairyfarm.auth.domain.OtpPurpose;

import java.io.Serializable;

/** Queued payload for an OTP email, consumed asynchronously by {@link OtpEmailConsumer}. */
public record EmailMessage(String to, String code, OtpPurpose purpose) implements Serializable {
}

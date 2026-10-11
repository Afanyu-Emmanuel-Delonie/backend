package com.innovation.dairyfarm.common.exception;

/** Raised on bad login credentials or an invalid/expired OTP. Maps to 401. */
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}

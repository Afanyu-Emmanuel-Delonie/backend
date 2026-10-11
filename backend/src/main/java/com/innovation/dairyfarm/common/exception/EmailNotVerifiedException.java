package com.innovation.dairyfarm.common.exception;

/** Raised when login is attempted before the account's email has been verified. Maps to 403. */
public class EmailNotVerifiedException extends RuntimeException {
    public EmailNotVerifiedException(String message) {
        super(message);
    }
}

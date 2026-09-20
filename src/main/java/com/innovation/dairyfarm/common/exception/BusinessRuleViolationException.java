package com.innovation.dairyfarm.common.exception;

/** Raised when a request violates a domain business rule (e.g. BR-02, BR-07, BR-12). */
public class BusinessRuleViolationException extends RuntimeException {
    public BusinessRuleViolationException(String message) {
        super(message);
    }
}

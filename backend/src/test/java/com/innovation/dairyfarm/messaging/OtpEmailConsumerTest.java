package com.innovation.dairyfarm.messaging;

import com.innovation.dairyfarm.auth.domain.OtpPurpose;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Covers the piece that actually hits SMTP: given a queued EmailMessage, it must build
 * a MIME message addressed correctly, subjected correctly per OtpPurpose, and hand it to
 * JavaMailSender.send - this is the behavior that moved here out of the old synchronous
 * EmailServiceImpl.
 */
class OtpEmailConsumerTest {

    private JavaMailSender mailSender;
    private OtpEmailConsumer consumer;

    @BeforeEach
    void setUp() {
        mailSender = mock(JavaMailSender.class);
        when(mailSender.createMimeMessage()).thenAnswer(invocation -> new MimeMessage(Session.getDefaultInstance(new Properties())));
        consumer = new OtpEmailConsumer(mailSender);
        ReflectionTestUtils.setField(consumer, "from", "noreply@farmiq.test");
    }

    @ParameterizedTest
    @EnumSource(OtpPurpose.class)
    void sendsAMimeMessageForEveryPurpose(OtpPurpose purpose) throws MessagingException {
        consumer.handle(new EmailMessage("worker@farm.com", "654321", purpose));

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void aMailSendFailureIsSwallowedNotPropagated() {
        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("smtp down"));

        // A broker redelivery storm must not happen because of a transient mail outage;
        // the consumer logs and moves on rather than throwing back into the listener container.
        org.junit.jupiter.api.Assertions.assertDoesNotThrow(() ->
                consumer.handle(new EmailMessage("worker@farm.com", "111111", OtpPurpose.LOGIN_2FA)));
    }

    @Test
    void addressesTheMessageToTheGivenRecipient() throws MessagingException {
        MimeMessage[] captured = new MimeMessage[1];
        when(mailSender.createMimeMessage()).thenAnswer(invocation -> {
            captured[0] = new MimeMessage(Session.getDefaultInstance(new Properties()));
            return captured[0];
        });

        consumer.handle(new EmailMessage("owner@farm.com", "999999", OtpPurpose.PASSWORD_RESET));

        assertThat(captured[0].getAllRecipients()[0].toString()).isEqualTo("owner@farm.com");
    }
}

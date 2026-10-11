package com.innovation.dairyfarm.auth.service;

import com.innovation.dairyfarm.auth.domain.OtpPurpose;
import com.innovation.dairyfarm.messaging.EmailMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

/**
 * EmailServiceImpl no longer talks to SMTP directly - it only has to prove it hands the
 * right message to the right exchange/routing key and returns immediately. Actual
 * delivery is OtpEmailConsumer's job (covered separately).
 */
class EmailServiceImplTest {

    private static final String EXCHANGE = "farmiq.email.exchange";
    private static final String ROUTING_KEY = "email.otp";

    private RabbitTemplate rabbitTemplate;
    private EmailServiceImpl emailService;

    @BeforeEach
    void setUp() {
        rabbitTemplate = mock(RabbitTemplate.class);
        emailService = new EmailServiceImpl(rabbitTemplate);
        ReflectionTestUtils.setField(emailService, "emailExchange", EXCHANGE);
        ReflectionTestUtils.setField(emailService, "emailRoutingKey", ROUTING_KEY);
    }

    @Test
    void publishesToTheConfiguredExchangeAndRoutingKey() {
        emailService.sendOtpEmail("owner@farm.com", "123456", OtpPurpose.SIGNUP_VERIFICATION);

        ArgumentCaptor<EmailMessage> captor = ArgumentCaptor.forClass(EmailMessage.class);
        verify(rabbitTemplate).convertAndSend(eqExchange(), eqRoutingKey(), captor.capture());

        EmailMessage sent = captor.getValue();
        assertThat(sent.to()).isEqualTo("owner@farm.com");
        assertThat(sent.code()).isEqualTo("123456");
        assertThat(sent.purpose()).isEqualTo(OtpPurpose.SIGNUP_VERIFICATION);
    }

    private String eqExchange() {
        return org.mockito.ArgumentMatchers.eq(EXCHANGE);
    }

    private String eqRoutingKey() {
        return org.mockito.ArgumentMatchers.eq(ROUTING_KEY);
    }
}

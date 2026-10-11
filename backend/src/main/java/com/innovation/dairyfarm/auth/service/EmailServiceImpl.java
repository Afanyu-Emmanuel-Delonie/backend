package com.innovation.dairyfarm.auth.service;

import com.innovation.dairyfarm.auth.domain.OtpPurpose;
import com.innovation.dairyfarm.messaging.EmailMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Publishes OTP emails onto the {@code app.rabbitmq.email-queue} queue rather than
 * sending them inline, so a register/login/invite request returns as soon as the
 * message is queued instead of waiting on an SMTP round trip. {@link
 * com.innovation.dairyfarm.messaging.OtpEmailConsumer} does the actual delivery.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final RabbitTemplate rabbitTemplate;

    @Value("${app.rabbitmq.email-exchange}")
    private String emailExchange;

    @Value("${app.rabbitmq.email-routing-key}")
    private String emailRoutingKey;

    @Override
    public void sendOtpEmail(String to, String code, OtpPurpose purpose) {
        rabbitTemplate.convertAndSend(emailExchange, emailRoutingKey, new EmailMessage(to, code, purpose));
        log.info("Queued {} email for {}", purpose, to);
    }
}

package com.innovation.dairyfarm.messaging;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

/**
 * Listens on the email queue and performs the actual SMTP send. Kept separate from the
 * publishing side ({@code EmailServiceImpl}) so a slow or failing mail server never blocks
 * the register/login/invite request that triggered the email.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OtpEmailConsumer {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @RabbitListener(queues = "${app.rabbitmq.email-queue}")
    public void handle(EmailMessage message) {
        String subject = switch (message.purpose()) {
            case SIGNUP_VERIFICATION -> "Verify your FarmIQ account";
            case LOGIN_2FA -> "Your FarmIQ sign-in code";
            case PASSWORD_RESET -> "Reset your FarmIQ password";
        };
        String intro = switch (message.purpose()) {
            case SIGNUP_VERIFICATION -> "Use this code to verify your email address:";
            case LOGIN_2FA -> "Use this code to finish signing in:";
            case PASSWORD_RESET -> "Use this code to reset your password:";
        };

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setTo(message.to());
            helper.setFrom(from);
            helper.setSubject(subject);
            helper.setText("""
                    <div style="font-family:sans-serif;max-width:420px;margin:0 auto">
                      <h2 style="color:#003d2a">FarmIQ</h2>
                      <p>%s</p>
                      <p style="font-size:32px;font-weight:700;letter-spacing:6px;color:#003d2a">%s</p>
                      <p style="color:#6b7280;font-size:13px">This code expires shortly and can only be used once.
                      If you didn't request it, you can safely ignore this email.</p>
                    </div>
                    """.formatted(intro, message.code()), true);
            mailSender.send(mimeMessage);
        } catch (MessagingException | MailException ex) {
            log.error("Failed to send {} email to {}: {}", message.purpose(), message.to(), ex.getMessage());
        }
    }
}

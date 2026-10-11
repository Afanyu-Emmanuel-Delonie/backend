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
 * Listens on the invite-email queue and sends the invitee their join link. Without this,
 * creating an Invite only ever produced a database row - the invited person had no way to
 * find out they'd been invited unless the owner copied the join link out of band.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class InviteEmailConsumer {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @RabbitListener(queues = "${app.rabbitmq.invite-email-queue}")
    public void handle(InviteEmailMessage message) {
        String roleLabel = switch (message.role()) {
            case FARM_OWNER -> "owner";
            case WORKER -> "worker";
            case BRANCH -> "branch account";
        };
        String joinLink = frontendUrl + "/join?invite=" + message.inviteId();

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setTo(message.to());
            helper.setFrom(from);
            helper.setSubject("You've been invited to join " + message.farmName() + " on FarmIQ");
            helper.setText("""
                    <div style="font-family:sans-serif;max-width:420px;margin:0 auto">
                      <h2 style="color:#003d2a">FarmIQ</h2>
                      <p>You've been invited to join <strong>%s</strong> as a %s.</p>
                      <p style="margin:24px 0">
                        <a href="%s" style="background:#003d2a;color:#ffffff;padding:12px 20px;
                           border-radius:8px;text-decoration:none;font-weight:600">Accept invite</a>
                      </p>
                      <p style="color:#6b7280;font-size:13px">If the button doesn't work, copy this link into your browser:<br>%s</p>
                      <p style="color:#6b7280;font-size:13px">If you weren't expecting this, you can safely ignore this email.</p>
                    </div>
                    """.formatted(message.farmName(), roleLabel, joinLink, joinLink), true);
            mailSender.send(mimeMessage);
        } catch (MessagingException | MailException ex) {
            log.error("Failed to send invite email to {}: {}", message.to(), ex.getMessage());
        } catch (RuntimeException ex) {
            log.error("Unexpected failure sending invite email to {}: {}", message.to(), ex.getMessage(), ex);
        }
    }
}

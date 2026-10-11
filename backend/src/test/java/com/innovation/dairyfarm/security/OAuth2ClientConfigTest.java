package com.innovation.dairyfarm.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The whole point of this class is that a missing Google client-id/secret must not take
 * the application down at startup - it should degrade to "the button exists but does
 * nothing" instead of a crash loop. These tests pin that contract down explicitly.
 */
class OAuth2ClientConfigTest {

    @Test
    void blankCredentialsProduceARepositoryThatResolvesNothing() {
        OAuth2ClientConfig config = new OAuth2ClientConfig();
        ReflectionTestUtils.setField(config, "googleClientId", "");
        ReflectionTestUtils.setField(config, "googleClientSecret", "");

        ClientRegistrationRepository repository = config.clientRegistrationRepository();

        assertThat(repository.findByRegistrationId("google")).isNull();
    }

    @Test
    void missingClientSecretAloneAlsoDisablesTheRegistration() {
        OAuth2ClientConfig config = new OAuth2ClientConfig();
        ReflectionTestUtils.setField(config, "googleClientId", "some-client-id.apps.googleusercontent.com");
        ReflectionTestUtils.setField(config, "googleClientSecret", "");

        ClientRegistrationRepository repository = config.clientRegistrationRepository();

        assertThat(repository.findByRegistrationId("google")).isNull();
    }

    @Test
    void realCredentialsProduceAUsableGoogleRegistration() {
        OAuth2ClientConfig config = new OAuth2ClientConfig();
        ReflectionTestUtils.setField(config, "googleClientId", "test-client-id.apps.googleusercontent.com");
        ReflectionTestUtils.setField(config, "googleClientSecret", "test-client-secret");

        ClientRegistrationRepository repository = config.clientRegistrationRepository();
        ClientRegistration google = repository.findByRegistrationId("google");

        assertThat(google).isNotNull();
        assertThat(google.getClientId()).isEqualTo("test-client-id.apps.googleusercontent.com");
        assertThat(google.getScopes()).contains("openid", "email", "profile");
        assertThat(google.getProviderDetails().getAuthorizationUri())
                .isEqualTo("https://accounts.google.com/o/oauth2/v2/auth");
    }
}

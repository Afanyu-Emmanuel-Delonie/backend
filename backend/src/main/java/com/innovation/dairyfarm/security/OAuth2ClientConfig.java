package com.innovation.dairyfarm.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;

/**
 * Builds the Google OAuth2 client registration from plain env vars instead of Spring
 * Boot's {@code spring.security.oauth2.client.registration.*} property binding, which
 * would fail application startup with an empty client-id/secret. Until {@code
 * GOOGLE_CLIENT_ID}/{@code GOOGLE_CLIENT_SECRET} are set, {@code /oauth2/authorization/google}
 * simply 404s instead of taking the whole app down — the "Continue with Google" button
 * can ship ahead of the credentials being provisioned.
 */
@Configuration
public class OAuth2ClientConfig {

    @Value("${app.oauth2.google.client-id}")
    private String googleClientId;

    @Value("${app.oauth2.google.client-secret}")
    private String googleClientSecret;

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        if (googleClientId == null || googleClientId.isBlank()
                || googleClientSecret == null || googleClientSecret.isBlank()) {
            return registrationId -> null;
        }

        // Google's fixed OIDC endpoints (docs.google.com/identity) — hardcoded rather than
        // resolved via ClientRegistrations.fromIssuerLocation(...) so a missing/misconfigured
        // credential never costs a network round trip at application startup.
        ClientRegistration google = ClientRegistration.withRegistrationId("google")
                .clientId(googleClientId)
                .clientSecret(googleClientSecret)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .scope("openid", "email", "profile")
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .tokenUri("https://www.googleapis.com/oauth2/v4/token")
                .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
                .userNameAttributeName("sub")
                .jwkSetUri("https://www.googleapis.com/oauth2/v3/certs")
                .clientName("Google")
                .build();

        return new InMemoryClientRegistrationRepository(google);
    }
}

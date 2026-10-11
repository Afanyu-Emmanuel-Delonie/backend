package com.innovation.dairyfarm.security;

import com.innovation.dairyfarm.auth.domain.Role;
import com.innovation.dairyfarm.auth.domain.User;
import com.innovation.dairyfarm.auth.repository.UserRepository;
import com.innovation.dairyfarm.farm.domain.Farm;
import com.innovation.dairyfarm.farm.repository.FarmRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * Finds or creates a {@link User} for a Google-authenticated email, then redirects back
 * to the SPA with a short-lived JWT in the query string — the same token shape issued
 * by normal password login — so the frontend can finish the session the same way it
 * does after OTP verification. A first-time Google sign-in self-registers a new Farm and
 * a FARM_OWNER account, mirroring {@code AuthServiceImpl.register}; there is no invite-only
 * path through Google since an invite is tied to a specific email a person didn't choose.
 */
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final FarmRepository farmRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                         Authentication authentication) throws IOException, ServletException {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");

        if (email == null || email.isBlank()) {
            redirectWithError(response, "Google did not share an email address.");
            return;
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> createUser(email, name));

        if (!user.isEnabled()) {
            redirectWithError(response, "This account is disabled.");
            return;
        }

        String token = jwtService.generateToken(user);
        response.sendRedirect(frontendUrl + "/oauth2/callback?token="
                + URLEncoder.encode(token, StandardCharsets.UTF_8));
    }

    private User createUser(String email, String name) {
        String displayName = (name != null && !name.isBlank()) ? name : email;
        Farm farm = farmRepository.save(Farm.builder()
                .name(displayName + "'s Farm")
                .build());
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .fullName(displayName)
                .farm(farm)
                .role(Role.FARM_OWNER)
                .emailVerified(true)
                .enabled(true)
                .build();
        return userRepository.save(user);
    }

    private void redirectWithError(HttpServletResponse response, String message) throws IOException {
        response.sendRedirect(frontendUrl + "/login?error=" + URLEncoder.encode(message, StandardCharsets.UTF_8));
    }
}

package com.innovation.dairyfarm.security;

import com.innovation.dairyfarm.auth.domain.Role;
import com.innovation.dairyfarm.auth.domain.User;
import com.innovation.dairyfarm.auth.repository.UserRepository;
import com.innovation.dairyfarm.farm.domain.Farm;
import com.innovation.dairyfarm.farm.repository.FarmRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * This handler is the bridge between Google's OAuth2 callback and FarmIQ's own JWT
 * session model: it must find-or-create a User for the authenticated email, then
 * redirect to the SPA with a token - never leave the browser sitting on a Spring
 * Security session page the frontend doesn't know how to read.
 */
class OAuth2LoginSuccessHandlerTest {

    private UserRepository userRepository;
    private FarmRepository farmRepository;
    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private OAuth2LoginSuccessHandler handler;

    private HttpServletRequest request;
    private HttpServletResponse response;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        farmRepository = mock(FarmRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        jwtService = mock(JwtService.class);
        handler = new OAuth2LoginSuccessHandler(userRepository, farmRepository, passwordEncoder, jwtService);
        ReflectionTestUtils.setField(handler, "frontendUrl", "http://localhost:3000");

        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        authentication = mock(Authentication.class);

        when(passwordEncoder.encode(any())).thenReturn("$2a$encoded");
    }

    private OAuth2User googleUser(String email, String name) {
        Map<String, Object> attributes = Map.of("email", email, "name", name, "sub", "google-sub-1");
        return new DefaultOAuth2User(List.of(() -> "ROLE_USER"), attributes, "sub");
    }

    @Test
    void firstTimeGoogleSignInCreatesAFarmAndAFarmOwnerAccount() throws Exception {
        when(authentication.getPrincipal()).thenReturn(googleUser("new.owner@gmail.com", "New Owner"));
        when(userRepository.findByEmail("new.owner@gmail.com")).thenReturn(Optional.empty());
        when(farmRepository.save(any(Farm.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token-123");

        handler.onAuthenticationSuccess(request, response, authentication);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User created = userCaptor.getValue();

        assertThat(created.getEmail()).isEqualTo("new.owner@gmail.com");
        assertThat(created.getFullName()).isEqualTo("New Owner");
        assertThat(created.getRole()).isEqualTo(Role.FARM_OWNER);
        assertThat(created.isEmailVerified()).isTrue();
        assertThat(created.isEnabled()).isTrue();
        assertThat(created.getFarm()).isNotNull();

        verify(farmRepository).save(any(Farm.class));
        verify(response).sendRedirect("http://localhost:3000/oauth2/callback?token=jwt-token-123");
    }

    @Test
    void existingAccountSignsInWithoutCreatingAFarmOrUser() throws Exception {
        Farm existingFarm = Farm.builder().name("Green Hills Dairy").build();
        User existingUser = User.builder()
                .email("owner@farm.com")
                .passwordHash("already-hashed")
                .fullName("Existing Owner")
                .farm(existingFarm)
                .role(Role.FARM_OWNER)
                .emailVerified(true)
                .enabled(true)
                .build();

        when(authentication.getPrincipal()).thenReturn(googleUser("owner@farm.com", "Existing Owner"));
        when(userRepository.findByEmail("owner@farm.com")).thenReturn(Optional.of(existingUser));
        when(jwtService.generateToken(existingUser)).thenReturn("jwt-token-456");

        handler.onAuthenticationSuccess(request, response, authentication);

        verify(userRepository, never()).save(any(User.class));
        verify(farmRepository, never()).save(any(Farm.class));
        verify(response).sendRedirect("http://localhost:3000/oauth2/callback?token=jwt-token-456");
    }

    @Test
    void missingEmailRedirectsToLoginWithAnErrorInsteadOfCreatingAnAccount() throws Exception {
        OAuth2User noEmail = new DefaultOAuth2User(List.of(() -> "ROLE_USER"),
                Map.of("sub", "google-sub-2", "name", "No Email"), "sub");
        when(authentication.getPrincipal()).thenReturn(noEmail);

        handler.onAuthenticationSuccess(request, response, authentication);

        verify(userRepository, never()).save(any());
        verify(response).sendRedirect(startsWith("http://localhost:3000/login?error="));
    }

    @Test
    void disabledAccountIsRefusedEvenWithAValidGoogleIdentity() throws Exception {
        Farm farm = Farm.builder().name("Suspended Farm").build();
        User disabledUser = User.builder()
                .email("suspended@farm.com")
                .passwordHash("hash")
                .fullName("Suspended")
                .farm(farm)
                .role(Role.WORKER)
                .emailVerified(true)
                .enabled(false)
                .build();

        when(authentication.getPrincipal()).thenReturn(googleUser("suspended@farm.com", "Suspended"));
        when(userRepository.findByEmail("suspended@farm.com")).thenReturn(Optional.of(disabledUser));

        handler.onAuthenticationSuccess(request, response, authentication);

        verify(jwtService, never()).generateToken(any());
        verify(response).sendRedirect(startsWith("http://localhost:3000/login?error="));
    }

    private static String startsWith(String prefix) {
        return org.mockito.ArgumentMatchers.argThat(s -> s != null && s.startsWith(prefix));
    }
}

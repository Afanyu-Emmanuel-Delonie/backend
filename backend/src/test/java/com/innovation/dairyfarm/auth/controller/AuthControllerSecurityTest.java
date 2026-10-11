package com.innovation.dairyfarm.auth.controller;

import com.innovation.dairyfarm.auth.domain.Role;
import com.innovation.dairyfarm.auth.dto.LoginRequest;
import com.innovation.dairyfarm.auth.dto.OtpVerifyResponse;
import com.innovation.dairyfarm.auth.dto.UserResponse;
import com.innovation.dairyfarm.auth.service.AuthService;
import com.innovation.dairyfarm.security.CustomUserDetailsService;
import com.innovation.dairyfarm.security.JwtAuthenticationFilter;
import com.innovation.dairyfarm.security.JwtService;
import com.innovation.dairyfarm.security.OAuth2ClientConfig;
import com.innovation.dairyfarm.security.OAuth2LoginFailureHandler;
import com.innovation.dairyfarm.security.OAuth2LoginSuccessHandler;
import com.innovation.dairyfarm.security.RestAuthenticationEntryPoint;
import com.innovation.dairyfarm.security.SecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regression coverage for a real bug found while wiring OAuth2 into SecurityConfig:
 * {@code .requestMatchers("/api/auth/**").permitAll()} was broad enough to also cover
 * /api/auth/me and friends, which read {@code Authentication} directly and expect Spring
 * Security to have already rejected an anonymous caller. Because that matcher let the
 * request through unauthenticated, {@code authentication} resolved to null and the
 * endpoint NPE'd into a 500 instead of ever returning 401. These tests pin the fixed
 * matcher down: the public auth endpoints stay public, the /me endpoints require a token.
 */
@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, RestAuthenticationEntryPoint.class,
        CustomUserDetailsService.class, OAuth2ClientConfig.class})
class AuthControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private com.innovation.dairyfarm.auth.repository.UserRepository userRepository;

    @MockitoBean
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @MockitoBean
    private OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    @Test
    void getMeWithoutATokenIsRejectedWithUnauthorizedNotAServerError() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void patchMeWithoutATokenIsRejectedWithUnauthorized() throws Exception {
        mockMvc.perform(patch("/api/auth/me")
                        .contentType("application/json")
                        .content("{\"fullName\":\"X\",\"farmName\":\"Y\",\"phone\":\"0780000000\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void patchMePasswordWithoutATokenIsRejectedWithUnauthorized() throws Exception {
        mockMvc.perform(patch("/api/auth/me/password")
                        .contentType("application/json")
                        .content("{\"currentPassword\":\"a\",\"newPassword\":\"b\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deleteMeWithoutATokenIsRejectedWithUnauthorized() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginRemainsPubliclyReachableWithoutAToken() throws Exception {
        UserResponse user = new UserResponse(1L, "owner@farm.com", "Owner", "Green Hills",
                null, Role.FARM_OWNER, true, LocalDateTime.now());
        when(authService.login(any())).thenReturn(OtpVerifyResponse.signedIn("jwt-token", user));

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(new LoginRequest("owner@farm.com", "password123"))))
                .andExpect(status().isOk());
    }
}

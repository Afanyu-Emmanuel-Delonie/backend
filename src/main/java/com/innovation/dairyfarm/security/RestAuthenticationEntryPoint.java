package com.innovation.dairyfarm.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.innovation.dairyfarm.common.exception.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Without this, Spring Security's default fallback entry point returns a bare
 * 403 for requests with no (or an invalid) bearer token - misleading for a
 * stateless API, where "not authenticated" (401) and "authenticated but not
 * allowed" (403) are different things. This returns 401 with the same
 * {@link ApiError} shape the rest of the API uses.
 */
@Component
@RequiredArgsConstructor
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiError body = ApiError.of(
                HttpStatus.UNAUTHORIZED.value(), "Unauthorized", "Authentication is required to access this resource.");
        objectMapper.writeValue(response.getWriter(), body);
    }
}

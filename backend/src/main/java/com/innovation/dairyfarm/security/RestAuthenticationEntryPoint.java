package com.innovation.dairyfarm.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * Without this, Spring Security's default fallback entry point returns a bare
 * 403 for requests with no (or an invalid) bearer token - misleading for a
 * stateless API, where "not authenticated" (401) and "authenticated but not
 * allowed" (403) are different things. This returns 401 in the same error
 * shape as {@code common.exception.ApiError}, written by hand so it doesn't
 * need to pick between the app's Jackson 3 and jjwt's bundled Jackson 2.
 */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("""
                {"timestamp":"%s","status":401,"error":"Unauthorized","message":"Authentication is required to access this resource.","details":[]}""".formatted(LocalDateTime.now()));
    }
}

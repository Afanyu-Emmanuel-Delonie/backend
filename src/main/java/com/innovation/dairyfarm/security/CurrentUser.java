package com.innovation.dairyfarm.security;

import com.innovation.dairyfarm.auth.domain.User;
import org.springframework.security.core.Authentication;

/** Pulls the authenticated {@link User} out of the Authentication Spring Security injects into controllers. */
public final class CurrentUser {

    private CurrentUser() {
    }

    public static User user(Authentication authentication) {
        return ((UserPrincipal) authentication.getPrincipal()).getUser();
    }

    public static Long id(Authentication authentication) {
        return user(authentication).getId();
    }
}

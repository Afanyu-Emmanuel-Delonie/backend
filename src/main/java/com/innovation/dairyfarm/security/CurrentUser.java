package com.innovation.dairyfarm.security;

import com.innovation.dairyfarm.auth.domain.User;
import com.innovation.dairyfarm.farm.domain.Farm;
import org.springframework.security.core.Authentication;

/** Pulls the authenticated {@link User} (and their {@link Farm}) out of the Authentication Spring Security injects into controllers. */
public final class CurrentUser {

    private CurrentUser() {
    }

    public static User user(Authentication authentication) {
        return ((UserPrincipal) authentication.getPrincipal()).getUser();
    }

    public static Long id(Authentication authentication) {
        return user(authentication).getId();
    }

    /** The farm this account belongs to - use this (not the User id) to scope Cattle/Finance/etc. queries. */
    public static Farm farm(Authentication authentication) {
        return user(authentication).getFarm();
    }

    public static Long farmId(Authentication authentication) {
        return farm(authentication).getId();
    }
}

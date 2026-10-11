package com.innovation.dairyfarm.auth.domain;

public enum Role {
    /** Created the farm (via self-registration). */
    FARM_OWNER,
    /** Joined an existing farm via invite - full day-to-day access, Workers/Finance hidden. */
    WORKER,
    /** Joined an existing farm via invite, representing another location. Same visibility as WORKER. */
    BRANCH
}

package com.innovation.dairyfarm.invite.controller;

import com.innovation.dairyfarm.auth.service.EmailService;
import com.innovation.dairyfarm.common.exception.ResourceNotFoundException;
import com.innovation.dairyfarm.farm.domain.Farm;
import com.innovation.dairyfarm.invite.domain.Invite;
import com.innovation.dairyfarm.invite.domain.InviteStatus;
import com.innovation.dairyfarm.invite.dto.InvitePublicResponse;
import com.innovation.dairyfarm.invite.dto.InviteRequest;
import com.innovation.dairyfarm.invite.dto.InviteResponse;
import com.innovation.dairyfarm.invite.repository.InviteRepository;
import com.innovation.dairyfarm.security.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/invites")
@RequiredArgsConstructor
public class InviteController {

    private final InviteRepository inviteRepository;
    private final EmailService emailService;

    @GetMapping
    public List<InviteResponse> findAll(Authentication authentication) {
        return inviteRepository.findAllByFarmId(CurrentUser.farmId(authentication))
                .stream().map(InviteResponse::from).toList();
    }

    /** Public - the join page needs this before the invitee has an account to authenticate with. */
    @GetMapping("/{id}/public")
    public InvitePublicResponse findPublic(@PathVariable Long id) {
        Invite invite = inviteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invite not found with id " + id));
        return InvitePublicResponse.from(invite);
    }

    @PostMapping
    public ResponseEntity<InviteResponse> create(@Valid @RequestBody InviteRequest request, Authentication authentication) {
        Farm farm = CurrentUser.farm(authentication);
        Invite invite = Invite.builder()
                .email(request.email())
                .role(request.role())
                .status(InviteStatus.PENDING)
                .build();
        invite.setFarm(farm);
        Invite saved = inviteRepository.save(invite);
        emailService.sendInviteEmail(saved.getEmail(), farm.getName(), saved.getRole(), saved.getId());
        return ResponseEntity.created(URI.create("/api/invites/" + saved.getId()))
                .body(InviteResponse.from(saved));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revoke(@PathVariable Long id, Authentication authentication) {
        Invite invite = inviteRepository.findByIdAndFarmId(id, CurrentUser.farmId(authentication))
                .orElseThrow(() -> new ResourceNotFoundException("Invite not found with id " + id));
        invite.setStatus(InviteStatus.REVOKED);
        inviteRepository.save(invite);
    }
}

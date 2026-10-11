package com.innovation.dairyfarm.farm.controller;

import com.innovation.dairyfarm.auth.dto.UserResponse;
import com.innovation.dairyfarm.auth.repository.UserRepository;
import com.innovation.dairyfarm.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/farm")
@RequiredArgsConstructor
public class FarmController {

    private final UserRepository userRepository;

    @GetMapping("/users")
    public List<UserResponse> farmUsers(Authentication authentication) {
        return userRepository.findAllByFarmId(CurrentUser.farmId(authentication))
                .stream().map(UserResponse::from).toList();
    }
}

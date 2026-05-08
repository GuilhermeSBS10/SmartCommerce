package com.example.financeiro.controller;

import com.example.financeiro.dto.UpdatePreferencesRequest;
import com.example.financeiro.dto.UpdateProfileRequest;
import com.example.financeiro.dto.UpdateSecurityRequest;
import com.example.financeiro.dto.UserResponse;
import com.example.financeiro.model.User;
import com.example.financeiro.service.AuthService;
import com.example.financeiro.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios/me")
public class UserController {
    private final AuthService authService;
    private final UserService userService;

    public UserController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @GetMapping
    public UserResponse me(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        User user = authService.authenticate(authorizationHeader);
        return userService.toResponse(user);
    }

    @PutMapping("/perfil")
    public UserResponse updateProfile(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        User user = authService.authenticate(authorizationHeader);
        return userService.updateProfile(user, request);
    }

    @PutMapping("/preferencias")
    public UserResponse updatePreferences(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody UpdatePreferencesRequest request
    ) {
        User user = authService.authenticate(authorizationHeader);
        return userService.updatePreferences(user, request);
    }

    @PutMapping("/seguranca")
    public UserResponse updateSecurity(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody UpdateSecurityRequest request
    ) {
        User user = authService.authenticate(authorizationHeader);
        return userService.updateSecurity(user, request);
    }
}

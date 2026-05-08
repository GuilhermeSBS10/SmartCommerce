package com.example.financeiro.controller;

import com.example.financeiro.dto.AuthResponse;
import com.example.financeiro.dto.LoginRequest;
import com.example.financeiro.dto.MessageResponse;
import com.example.financeiro.dto.RecuperarSenhaRequest;
import com.example.financeiro.dto.RegisterRequest;
import com.example.financeiro.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/recuperar-senha")
    public MessageResponse recuperarSenha(@Valid @RequestBody RecuperarSenhaRequest request) {
        return authService.recuperarSenha(request);
    }
}

package com.example.financeiro.service;

import com.example.financeiro.dto.AuthResponse;
import com.example.financeiro.dto.LoginRequest;
import com.example.financeiro.dto.MessageResponse;
import com.example.financeiro.dto.RecuperarSenhaRequest;
import com.example.financeiro.dto.RegisterRequest;
import com.example.financeiro.exception.ApiException;
import com.example.financeiro.model.User;
import com.example.financeiro.persistence.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final Map<String, Long> usersByToken = new ConcurrentHashMap<>();

    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        User user = usuarioRepository.create(request.nome(), email, request.senha());
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = usuarioRepository.findByEmail(email);
        if (user == null || !user.getSenha().equals(request.senha())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Email ou senha invalidos");
        }
        return buildAuthResponse(user);
    }

    public MessageResponse recuperarSenha(RecuperarSenhaRequest request) {
        String email = normalizeEmail(request.email());
        User user = usuarioRepository.findByEmail(email);
        if (user == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Nao encontramos uma conta com esse email");
        }
        user.setSenha(request.novaSenha());
        usuarioRepository.update(user);
        return new MessageResponse("Senha redefinida com sucesso");
    }

    public User authenticate(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Token nao informado");
        }
        String token = authorizationHeader.substring("Bearer ".length()).trim();
        Long userId = usersByToken.get(token);
        User user = userId == null ? null : usuarioRepository.findById(userId);
        if (user == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Token invalido");
        }
        return user;
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = UUID.randomUUID().toString();
        usersByToken.put(token, user.getId());
        return new AuthResponse(
                user.getId(),
                user.getNome(),
                user.getEmail(),
                user.getTelefone(),
                user.getCpf(),
                user.getTheme(),
                user.isNotificationsEnabled(),
                user.isCompactMode(),
                user.isAnimationsEnabled(),
                token
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}

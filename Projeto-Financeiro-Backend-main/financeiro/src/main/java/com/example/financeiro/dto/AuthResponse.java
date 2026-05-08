package com.example.financeiro.dto;

public record AuthResponse(
        Long id,
        String nome,
        String email,
        String telefone,
        String cpf,
        String theme,
        boolean notificationsEnabled,
        boolean compactMode,
        boolean animationsEnabled,
        String token
) {
}

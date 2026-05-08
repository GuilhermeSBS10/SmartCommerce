package com.example.financeiro.dto;

public record UserResponse(
        Long id,
        String nome,
        String email,
        String telefone,
        String cpf,
        String theme,
        boolean notificationsEnabled,
        boolean compactMode,
        boolean animationsEnabled
) {
}

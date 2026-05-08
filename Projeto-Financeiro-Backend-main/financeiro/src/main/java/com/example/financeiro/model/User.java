package com.example.financeiro.model;

public record User(
        Long id,
        String nome,
        String email,
        String senha,
        String telefone,
        String cpf,
        String theme,
        boolean notificationsEnabled,
        boolean compactMode,
        boolean animationsEnabled
) {
}

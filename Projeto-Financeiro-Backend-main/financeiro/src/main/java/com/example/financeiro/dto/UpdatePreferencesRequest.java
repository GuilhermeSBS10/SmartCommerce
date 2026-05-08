package com.example.financeiro.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdatePreferencesRequest(
        @NotBlank(message = "Tema e obrigatorio")
        String theme,
        boolean notificationsEnabled,
        boolean compactMode,
        boolean animationsEnabled
) {
}

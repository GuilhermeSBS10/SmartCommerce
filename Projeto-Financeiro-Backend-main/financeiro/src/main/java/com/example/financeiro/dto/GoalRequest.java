package com.example.financeiro.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GoalRequest(
        @NotBlank(message = "Titulo e obrigatorio")
        String titulo,

        @NotBlank(message = "Objetivo e obrigatorio")
        String objetivo,

        @NotNull(message = "Valor alvo e obrigatorio")
        @DecimalMin(value = "0.0", inclusive = false, message = "Valor alvo deve ser maior que zero")
        BigDecimal valorAlvo,

        @NotNull(message = "Valor guardado e obrigatorio")
        @DecimalMin(value = "0.0", inclusive = true, message = "Valor guardado nao pode ser negativo")
        BigDecimal valorGuardado,

        @NotNull(message = "Prazo e obrigatorio")
        LocalDate prazo
) {
}

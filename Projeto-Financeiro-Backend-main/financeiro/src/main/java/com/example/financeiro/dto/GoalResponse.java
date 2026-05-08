package com.example.financeiro.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GoalResponse(
        Long id,
        String titulo,
        String objetivo,
        BigDecimal valorAlvo,
        BigDecimal valorGuardado,
        BigDecimal valorRestante,
        BigDecimal valorMensalSugerido,
        double percentual,
        LocalDate prazo,
        boolean concluida
) {
}

package com.example.financeiro.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FinancialGoal(
        Long id,
        Long userId,
        String titulo,
        String objetivo,
        BigDecimal valorAlvo,
        BigDecimal valorGuardado,
        LocalDate prazo
) {
}

package com.example.financeiro.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record Transaction(
        Long id,
        Long userId,
        String descricao,
        TransactionType tipo,
        String categoria,
        BigDecimal valor,
        LocalDate data
) {
}

package com.example.financeiro.dto;

import java.math.BigDecimal;

public record AnnualComparisonResponse(
        int ano,
        BigDecimal receitas,
        BigDecimal despesas,
        BigDecimal saldo
) {
}

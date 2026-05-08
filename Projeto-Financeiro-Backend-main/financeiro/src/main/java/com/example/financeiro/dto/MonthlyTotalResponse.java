package com.example.financeiro.dto;

import java.math.BigDecimal;

public record MonthlyTotalResponse(
        int ano,
        int mes,
        BigDecimal total
) {
}

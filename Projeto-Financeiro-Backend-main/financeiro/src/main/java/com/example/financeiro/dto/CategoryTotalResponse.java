package com.example.financeiro.dto;

import java.math.BigDecimal;

public record CategoryTotalResponse(
        String categoria,
        BigDecimal total
) {
}

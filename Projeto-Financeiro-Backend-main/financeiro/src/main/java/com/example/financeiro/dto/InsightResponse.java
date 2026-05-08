package com.example.financeiro.dto;

import java.math.BigDecimal;

public record InsightResponse(
        int totalTransacoes,
        String categoriaCampea,
        BigDecimal maiorDespesa,
        String descricaoMaiorDespesa,
        BigDecimal ticketMedio,
        BigDecimal saldoMedioMensal
) {
}

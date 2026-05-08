package com.example.financeiro.dto;

import com.example.financeiro.model.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(
        @NotBlank(message = "Descricao e obrigatoria")
        String descricao,

        @NotNull(message = "Tipo e obrigatorio")
        TransactionType tipo,

        @NotBlank(message = "Categoria e obrigatoria")
        String categoria,

        @NotNull(message = "Valor e obrigatorio")
        @DecimalMin(value = "0.0", inclusive = false, message = "Valor deve ser maior que zero")
        BigDecimal valor,

        @NotNull(message = "Data e obrigatoria")
        LocalDate data
) {
}

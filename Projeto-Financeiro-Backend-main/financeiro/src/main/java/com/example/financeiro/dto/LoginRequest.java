package com.example.financeiro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Email(message = "Email invalido")
        @NotBlank(message = "Email e obrigatorio")
        String email,

        @NotBlank(message = "Senha e obrigatoria")
        String senha
) {
}

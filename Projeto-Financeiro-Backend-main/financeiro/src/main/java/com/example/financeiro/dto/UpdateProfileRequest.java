package com.example.financeiro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequest(
        @NotBlank(message = "Nome e obrigatorio")
        String nome,

        @Email(message = "Email invalido")
        @NotBlank(message = "Email e obrigatorio")
        String email,

        String telefone,
        String cpf
) {
}

package com.example.financeiro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RecuperarSenhaRequest(
        @Email(message = "Email invalido")
        @NotBlank(message = "Email e obrigatorio")
        String email,

        @NotBlank(message = "Nova senha e obrigatoria")
        @Size(min = 6, message = "Senha deve ter no minimo 6 caracteres")
        String novaSenha
) {
}

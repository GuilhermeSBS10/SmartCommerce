package com.example.financeiro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateSecurityRequest(
        @NotBlank(message = "Senha atual e obrigatoria")
        String senhaAtual,

        @Email(message = "Novo email invalido")
        String novoEmail,

        @Size(min = 6, message = "Nova senha deve ter no minimo 6 caracteres")
        String novaSenha
) {
}

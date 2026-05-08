package com.example.financeiro.persistence;

import com.example.financeiro.exception.ApiException;
import org.springframework.http.HttpStatus;

public class PersistenciaNaoConfiguradaException extends ApiException {
    public PersistenciaNaoConfiguradaException() {
        super(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Cadastro nao encontrado. Verifique os dados e tente novamente."
        );
    }
}

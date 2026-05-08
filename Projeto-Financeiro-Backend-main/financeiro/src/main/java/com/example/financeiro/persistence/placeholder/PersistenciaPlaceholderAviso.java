package com.example.financeiro.persistence.placeholder;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class PersistenciaPlaceholderAviso {
    private static final Logger LOGGER = LoggerFactory.getLogger(PersistenciaPlaceholderAviso.class);

    @PostConstruct
    void logWarning() {
        LOGGER.warn("Persistencia temporariamente indisponivel para operacoes de dados.");
    }
}

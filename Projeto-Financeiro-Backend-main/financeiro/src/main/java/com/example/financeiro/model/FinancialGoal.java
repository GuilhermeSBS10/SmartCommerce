package com.example.financeiro.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "cofrinhos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FinancialGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(length = 255)
    private String objetivo;

    @Column(name = "valor_alvo", nullable = false, precision = 15, scale = 2)
    private BigDecimal valorAlvo;

    @Column(name = "valor_guardado", precision = 15, scale = 2)
    private BigDecimal valorGuardado = BigDecimal.ZERO;

    private LocalDate prazo;
}

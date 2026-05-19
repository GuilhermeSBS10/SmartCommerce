package com.example.financeiro.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuarios")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Column(length = 20)
    private String telefone;

    @Column(length = 14)
    private String cpf;

    @Column(length = 20)
    private String theme = "light";

    @Column(name = "notifications_enabled")
    private boolean notificationsEnabled = true;

    @Column(name = "compact_mode")
    private boolean compactMode = false;

    @Column(name = "animations_enabled")
    private boolean animationsEnabled = true;
}

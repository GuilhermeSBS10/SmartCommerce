package com.example.financeiro.persistence;

import com.example.financeiro.model.User;

public interface UsuarioRepository {
    User findByEmail(String email);

    User findById(Long id);

    User create(String nome, String email, String senha);

    User update(User user);
}

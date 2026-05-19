package com.example.financeiro.persistence.placeholder;

import com.example.financeiro.exception.ApiException;
import com.example.financeiro.model.User;
import com.example.financeiro.persistence.UsuarioJpaRepository;
import com.example.financeiro.persistence.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class UsuarioRepositoryPlaceholder implements UsuarioRepository {

    private final UsuarioJpaRepository jpa;

    public UsuarioRepositoryPlaceholder(UsuarioJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public User findByEmail(String email) {
        return jpa.findByEmail(email).orElse(null);
    }

    @Override
    public User findById(Long id) {
        return jpa.findById(id).orElse(null);
    }

    @Override
    public User create(String nome, String email, String senha) {
        if (jpa.findByEmail(email).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Email ja cadastrado");
        }
        User user = new User();
        user.setNome(nome);
        user.setEmail(email);
        user.setSenha(senha);
        return jpa.save(user);
    }

    @Override
    public User update(User user) {
        return jpa.save(user);
    }
}

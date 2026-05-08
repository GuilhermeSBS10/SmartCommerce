package com.example.financeiro.persistence.placeholder;

import com.example.financeiro.model.User;
import com.example.financeiro.persistence.PersistenciaNaoConfiguradaException;
import com.example.financeiro.persistence.UsuarioRepository;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class UsuarioRepositoryPlaceholder implements UsuarioRepository {
    @Override
    public User findByEmail(String email) {
        throw new PersistenciaNaoConfiguradaException();
    }

    @Override
    public User findById(Long id) {
        throw new PersistenciaNaoConfiguradaException();
    }

    @Override
    public User create(String nome, String email, String senha) {
        throw new PersistenciaNaoConfiguradaException();
    }

    @Override
    public User update(User user) {
        throw new PersistenciaNaoConfiguradaException();
    }
}

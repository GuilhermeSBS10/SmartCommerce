package com.example.financeiro.persistence;

import com.example.financeiro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioJpaRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}

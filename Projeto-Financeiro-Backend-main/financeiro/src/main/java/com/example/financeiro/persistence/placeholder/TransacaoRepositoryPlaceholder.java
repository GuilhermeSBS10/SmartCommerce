package com.example.financeiro.persistence.placeholder;

import com.example.financeiro.exception.ApiException;
import com.example.financeiro.model.Transaction;
import com.example.financeiro.persistence.TransacaoJpaRepository;
import com.example.financeiro.persistence.TransacaoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TransacaoRepositoryPlaceholder implements TransacaoRepository {

    private final TransacaoJpaRepository jpa;

    public TransacaoRepositoryPlaceholder(TransacaoJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public List<Transaction> findByUserId(Long userId) {
        return jpa.findByUserId(userId);
    }

    @Override
    public Transaction create(Transaction transaction) {
        return jpa.save(transaction);
    }

    @Override
    public Transaction update(Long userId, Long id, Transaction transaction) {
        jpa.findById(id)
            .filter(t -> t.getUserId().equals(userId))
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Transacao nao encontrada"));
        return jpa.save(transaction);
    }

    @Override
    public void delete(Long userId, Long id) {
        Transaction t = jpa.findById(id)
            .filter(tr -> tr.getUserId().equals(userId))
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Transacao nao encontrada"));
        jpa.delete(t);
    }
}

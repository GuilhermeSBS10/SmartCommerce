package com.example.financeiro.persistence.placeholder;

import com.example.financeiro.model.Transaction;
import com.example.financeiro.persistence.PersistenciaNaoConfiguradaException;
import com.example.financeiro.persistence.TransacaoRepository;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Primary
public class TransacaoRepositoryPlaceholder implements TransacaoRepository {
    @Override
    public List<Transaction> findByUserId(Long userId) {
        throw new PersistenciaNaoConfiguradaException();
    }

    @Override
    public Transaction create(Transaction transaction) {
        throw new PersistenciaNaoConfiguradaException();
    }

    @Override
    public Transaction update(Long userId, Long id, Transaction transaction) {
        throw new PersistenciaNaoConfiguradaException();
    }

    @Override
    public void delete(Long userId, Long id) {
        throw new PersistenciaNaoConfiguradaException();
    }
}

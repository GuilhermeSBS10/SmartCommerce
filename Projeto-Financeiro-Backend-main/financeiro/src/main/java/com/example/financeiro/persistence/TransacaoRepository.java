package com.example.financeiro.persistence;

import com.example.financeiro.model.Transaction;

import java.util.List;

public interface TransacaoRepository {
    List<Transaction> findByUserId(Long userId);

    Transaction create(Transaction transaction);

    Transaction update(Long userId, Long id, Transaction transaction);

    void delete(Long userId, Long id);
}

package com.example.financeiro.persistence;

import com.example.financeiro.model.FinancialGoal;

import java.util.List;

public interface CofrinhoRepository {
    List<FinancialGoal> findByUserId(Long userId);

    FinancialGoal create(FinancialGoal goal);

    FinancialGoal update(Long userId, Long id, FinancialGoal goal);

    void delete(Long userId, Long id);
}

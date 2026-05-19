package com.example.financeiro.persistence.placeholder;

import com.example.financeiro.exception.ApiException;
import com.example.financeiro.model.FinancialGoal;
import com.example.financeiro.persistence.CofrinhoJpaRepository;
import com.example.financeiro.persistence.CofrinhoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CofrinhoRepositoryPlaceholder implements CofrinhoRepository {

    private final CofrinhoJpaRepository jpa;

    public CofrinhoRepositoryPlaceholder(CofrinhoJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public List<FinancialGoal> findByUserId(Long userId) {
        return jpa.findByUserId(userId);
    }

    @Override
    public FinancialGoal create(FinancialGoal goal) {
        return jpa.save(goal);
    }

    @Override
    public FinancialGoal update(Long userId, Long id, FinancialGoal goal) {
        jpa.findById(id)
            .filter(g -> g.getUserId().equals(userId))
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cofrinho nao encontrado"));
        return jpa.save(goal);
    }

    @Override
    public void delete(Long userId, Long id) {
        FinancialGoal g = jpa.findById(id)
            .filter(goal -> goal.getUserId().equals(userId))
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cofrinho nao encontrado"));
        jpa.delete(g);
    }
}

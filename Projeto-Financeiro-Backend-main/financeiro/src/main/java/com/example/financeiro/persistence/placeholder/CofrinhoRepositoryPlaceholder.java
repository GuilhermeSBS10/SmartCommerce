package com.example.financeiro.persistence.placeholder;

import com.example.financeiro.model.FinancialGoal;
import com.example.financeiro.persistence.CofrinhoRepository;
import com.example.financeiro.persistence.PersistenciaNaoConfiguradaException;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Primary
public class CofrinhoRepositoryPlaceholder implements CofrinhoRepository {
    @Override
    public List<FinancialGoal> findByUserId(Long userId) {
        throw new PersistenciaNaoConfiguradaException();
    }

    @Override
    public FinancialGoal create(FinancialGoal goal) {
        throw new PersistenciaNaoConfiguradaException();
    }

    @Override
    public FinancialGoal update(Long userId, Long id, FinancialGoal goal) {
        throw new PersistenciaNaoConfiguradaException();
    }

    @Override
    public void delete(Long userId, Long id) {
        throw new PersistenciaNaoConfiguradaException();
    }
}

package com.example.financeiro.service;

import com.example.financeiro.dto.GoalRequest;
import com.example.financeiro.dto.GoalResponse;
import com.example.financeiro.exception.ApiException;
import com.example.financeiro.model.FinancialGoal;
import com.example.financeiro.model.User;
import com.example.financeiro.persistence.CofrinhoRepository;
import com.example.financeiro.persistence.TransacaoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

@Service
public class GoalService {
    private final CofrinhoRepository cofrinhoRepository;
    private final TransacaoRepository transacaoRepository;

    public GoalService(CofrinhoRepository cofrinhoRepository, TransacaoRepository transacaoRepository) {
        this.cofrinhoRepository = cofrinhoRepository;
        this.transacaoRepository = transacaoRepository;
    }

    public List<GoalResponse> list(User user) {
        return cofrinhoRepository.findByUserId(user.id()).stream()
                .sorted(Comparator.comparing(FinancialGoal::prazo))
                .map(this::toResponse)
                .toList();
    }

    public GoalResponse create(User user, GoalRequest request) {
        FinancialGoal created = cofrinhoRepository.create(new FinancialGoal(
                null,
                user.id(),
                request.titulo().trim(),
                request.objetivo().trim(),
                request.valorAlvo(),
                request.valorGuardado(),
                request.prazo()
        ));
        return toResponse(created);
    }

    public GoalResponse update(User user, Long id, GoalRequest request) {
        FinancialGoal updated = cofrinhoRepository.update(user.id(), id, new FinancialGoal(
                id,
                user.id(),
                request.titulo().trim(),
                request.objetivo().trim(),
                request.valorAlvo(),
                request.valorGuardado(),
                request.prazo()
        ));
        return toResponse(updated);
    }

    public void delete(User user, Long id) {
        cofrinhoRepository.delete(user.id(), id);
    }

    public GoalResponse deposit(User user, Long id, BigDecimal value) {
        FinancialGoal goal = findGoal(user, id);
        if (availableBalance(user).compareTo(value) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Saldo disponivel insuficiente");
        }
        FinancialGoal updated = cofrinhoRepository.update(user.id(), id, new FinancialGoal(
                goal.id(),
                goal.userId(),
                goal.titulo(),
                goal.objetivo(),
                goal.valorAlvo(),
                goal.valorGuardado().add(value),
                goal.prazo()
        ));
        return toResponse(updated);
    }

    public GoalResponse withdraw(User user, Long id, BigDecimal value) {
        FinancialGoal goal = findGoal(user, id);
        if (goal.valorGuardado().compareTo(value) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Saldo insuficiente no cofrinho");
        }

        FinancialGoal updated = cofrinhoRepository.update(user.id(), id, new FinancialGoal(
                goal.id(),
                goal.userId(),
                goal.titulo(),
                goal.objetivo(),
                goal.valorAlvo(),
                goal.valorGuardado().subtract(value),
                goal.prazo()
        ));
        return toResponse(updated);
    }

    private GoalResponse toResponse(FinancialGoal goal) {
        BigDecimal valorAlvo = goal.valorAlvo() == null ? BigDecimal.ZERO : goal.valorAlvo();
        BigDecimal valorGuardado = goal.valorGuardado() == null ? BigDecimal.ZERO : goal.valorGuardado();
        BigDecimal valorRestante = valorAlvo.subtract(valorGuardado).max(BigDecimal.ZERO);
        BigDecimal valorMensalSugerido = monthlyRequired(valorRestante, goal.prazo());
        double percentual = valorAlvo.compareTo(BigDecimal.ZERO) > 0
                ? valorGuardado.divide(valorAlvo, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0;

        return new GoalResponse(
                goal.id(),
                goal.titulo(),
                goal.objetivo(),
                valorAlvo,
                valorGuardado,
                valorRestante,
                valorMensalSugerido,
                Math.min(percentual, 999.0),
                goal.prazo(),
                valorGuardado.compareTo(valorAlvo) >= 0
        );
    }

    private FinancialGoal findGoal(User user, Long id) {
        return cofrinhoRepository.findByUserId(user.id()).stream()
                .filter(goal -> goal.id().equals(id))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cofrinho nao encontrado"));
    }

    public BigDecimal totalGuardado(User user) {
        return cofrinhoRepository.findByUserId(user.id()).stream()
                .map(goal -> goal.valorGuardado() == null ? BigDecimal.ZERO : goal.valorGuardado())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal availableBalance(User user) {
        BigDecimal totalTransactions = transacaoRepository.findByUserId(user.id()).stream()
                .map(transaction -> transaction.tipo().name().equals("RECEITA")
                        ? transaction.valor()
                        : transaction.valor().negate())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return totalTransactions.subtract(totalGuardado(user));
    }

    private BigDecimal monthlyRequired(BigDecimal remaining, LocalDate dueDate) {
        if (remaining.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        if (dueDate == null) return remaining;

        long months = Math.max(1, ChronoUnit.MONTHS.between(
                LocalDate.now().withDayOfMonth(1),
                dueDate.withDayOfMonth(1)
        ) + 1);
        return remaining.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP);
    }
}

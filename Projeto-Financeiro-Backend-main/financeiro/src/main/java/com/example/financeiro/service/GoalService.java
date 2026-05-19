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
        return cofrinhoRepository.findByUserId(user.getId()).stream()
                .sorted(Comparator.comparing(FinancialGoal::getPrazo, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toResponse)
                .toList();
    }

    public GoalResponse create(User user, GoalRequest request) {
        FinancialGoal goal = new FinancialGoal();
        goal.setUserId(user.getId());
        goal.setTitulo(request.titulo().trim());
        goal.setObjetivo(request.objetivo().trim());
        goal.setValorAlvo(request.valorAlvo());
        goal.setValorGuardado(request.valorGuardado() != null ? request.valorGuardado() : BigDecimal.ZERO);
        goal.setPrazo(request.prazo());
        return toResponse(cofrinhoRepository.create(goal));
    }

    public GoalResponse update(User user, Long id, GoalRequest request) {
        FinancialGoal goal = new FinancialGoal();
        goal.setId(id);
        goal.setUserId(user.getId());
        goal.setTitulo(request.titulo().trim());
        goal.setObjetivo(request.objetivo().trim());
        goal.setValorAlvo(request.valorAlvo());
        goal.setValorGuardado(request.valorGuardado() != null ? request.valorGuardado() : BigDecimal.ZERO);
        goal.setPrazo(request.prazo());
        return toResponse(cofrinhoRepository.update(user.getId(), id, goal));
    }

    public void delete(User user, Long id) {
        cofrinhoRepository.delete(user.getId(), id);
    }

    public GoalResponse deposit(User user, Long id, BigDecimal value) {
        FinancialGoal goal = findGoal(user, id);
        if (availableBalance(user).compareTo(value) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Saldo disponivel insuficiente");
        }
        goal.setValorGuardado(goal.getValorGuardado().add(value));
        return toResponse(cofrinhoRepository.update(user.getId(), id, goal));
    }

    public GoalResponse withdraw(User user, Long id, BigDecimal value) {
        FinancialGoal goal = findGoal(user, id);
        if (goal.getValorGuardado().compareTo(value) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Saldo insuficiente no cofrinho");
        }
        goal.setValorGuardado(goal.getValorGuardado().subtract(value));
        return toResponse(cofrinhoRepository.update(user.getId(), id, goal));
    }

    private GoalResponse toResponse(FinancialGoal goal) {
        BigDecimal valorAlvo = goal.getValorAlvo() == null ? BigDecimal.ZERO : goal.getValorAlvo();
        BigDecimal valorGuardado = goal.getValorGuardado() == null ? BigDecimal.ZERO : goal.getValorGuardado();
        BigDecimal valorRestante = valorAlvo.subtract(valorGuardado).max(BigDecimal.ZERO);
        BigDecimal valorMensalSugerido = monthlyRequired(valorRestante, goal.getPrazo());
        double percentual = valorAlvo.compareTo(BigDecimal.ZERO) > 0
                ? valorGuardado.divide(valorAlvo, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0;
        return new GoalResponse(
                goal.getId(), goal.getTitulo(), goal.getObjetivo(),
                valorAlvo, valorGuardado, valorRestante, valorMensalSugerido,
                Math.min(percentual, 999.0), goal.getPrazo(),
                valorGuardado.compareTo(valorAlvo) >= 0
        );
    }

    private FinancialGoal findGoal(User user, Long id) {
        return cofrinhoRepository.findByUserId(user.getId()).stream()
                .filter(g -> g.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cofrinho nao encontrado"));
    }

    public BigDecimal totalGuardado(User user) {
        return cofrinhoRepository.findByUserId(user.getId()).stream()
                .map(g -> g.getValorGuardado() == null ? BigDecimal.ZERO : g.getValorGuardado())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal availableBalance(User user) {
        BigDecimal total = transacaoRepository.findByUserId(user.getId()).stream()
                .map(t -> t.getTipo().name().equals("RECEITA") ? t.getValor() : t.getValor().negate())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.subtract(totalGuardado(user));
    }

    private BigDecimal monthlyRequired(BigDecimal remaining, LocalDate dueDate) {
        if (remaining.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        if (dueDate == null) return remaining;
        long months = Math.max(1, ChronoUnit.MONTHS.between(
                LocalDate.now().withDayOfMonth(1), dueDate.withDayOfMonth(1)) + 1);
        return remaining.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP);
    }
}

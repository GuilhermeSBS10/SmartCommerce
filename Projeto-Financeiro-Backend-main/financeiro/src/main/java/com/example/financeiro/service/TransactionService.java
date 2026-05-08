package com.example.financeiro.service;

import com.example.financeiro.dto.AnnualComparisonResponse;
import com.example.financeiro.dto.CategoryTotalResponse;
import com.example.financeiro.dto.DashboardResponse;
import com.example.financeiro.dto.GoalResponse;
import com.example.financeiro.dto.InsightResponse;
import com.example.financeiro.dto.MonthlyTotalResponse;
import com.example.financeiro.dto.TransactionRequest;
import com.example.financeiro.model.Transaction;
import com.example.financeiro.model.TransactionType;
import com.example.financeiro.model.User;
import com.example.financeiro.persistence.TransacaoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TransactionService {
    private final TransacaoRepository transacaoRepository;
    private final GoalService goalService;

    public TransactionService(TransacaoRepository transacaoRepository, GoalService goalService) {
        this.transacaoRepository = transacaoRepository;
        this.goalService = goalService;
    }

    public List<Transaction> list(User user, String tipo, String categoria, LocalDate inicio, LocalDate fim) {
        return transacaoRepository.findByUserId(user.id())
                .stream()
                .filter(transaction -> tipo == null || tipo.isBlank() || transaction.tipo().name().equalsIgnoreCase(tipo))
                .filter(transaction -> categoria == null || categoria.isBlank() || transaction.categoria().equalsIgnoreCase(categoria))
                .filter(transaction -> inicio == null || !transaction.data().isBefore(inicio))
                .filter(transaction -> fim == null || !transaction.data().isAfter(fim))
                .sorted(Comparator.comparing(Transaction::data).reversed().thenComparing(Transaction::id).reversed())
                .toList();
    }

    public Transaction create(User user, TransactionRequest request) {
        return transacaoRepository.create(new Transaction(
                null,
                user.id(),
                request.descricao().trim(),
                request.tipo(),
                request.categoria().trim(),
                request.valor(),
                request.data()
        ));
    }

    public Transaction update(User user, Long id, TransactionRequest request) {
        return transacaoRepository.update(user.id(), id, new Transaction(
                id,
                user.id(),
                request.descricao().trim(),
                request.tipo(),
                request.categoria().trim(),
                request.valor(),
                request.data()
        ));
    }

    public void delete(User user, Long id) {
        transacaoRepository.delete(user.id(), id);
    }

    public DashboardResponse dashboard(User user, LocalDate inicio, LocalDate fim) {
        List<Transaction> transactions = list(user, null, null, inicio, fim);

        BigDecimal totalReceitas = sumByType(transactions, TransactionType.RECEITA);
        BigDecimal totalDespesas = sumByType(transactions, TransactionType.DESPESA);
        BigDecimal saldoTotal = totalReceitas.subtract(totalDespesas);
        BigDecimal totalGuardado = goalService.totalGuardado(user);
        BigDecimal saldoDisponivel = saldoTotal.subtract(totalGuardado);
        List<GoalResponse> metas = goalService.list(user);

        return new DashboardResponse(
                saldoTotal,
                saldoDisponivel,
                totalGuardado,
                totalReceitas,
                totalDespesas,
                monthlyTotals(transactions, TransactionType.RECEITA),
                monthlyTotals(transactions, TransactionType.DESPESA),
                expenseTotalsByCategory(transactions),
                annualComparison(transactions),
                buildInsights(transactions, saldoDisponivel),
                metas
        );
    }

    private BigDecimal sumByType(List<Transaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(transaction -> transaction.tipo() == type)
                .map(Transaction::valor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<MonthlyTotalResponse> monthlyTotals(List<Transaction> transactions, TransactionType type) {
        Map<String, BigDecimal> totals = new LinkedHashMap<>();

        transactions.stream()
                .filter(transaction -> transaction.tipo() == type)
                .sorted(Comparator.comparing(Transaction::data))
                .forEach(transaction -> {
                    String key = transaction.data().getYear() + "-" + transaction.data().getMonthValue();
                    totals.merge(key, transaction.valor(), BigDecimal::add);
                });

        return totals.entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split("-");
                    return new MonthlyTotalResponse(
                            Integer.parseInt(parts[0]),
                            Integer.parseInt(parts[1]),
                            entry.getValue()
                    );
                })
                .toList();
    }

    private List<CategoryTotalResponse> expenseTotalsByCategory(List<Transaction> transactions) {
        return transactions.stream()
                .filter(transaction -> transaction.tipo() == TransactionType.DESPESA)
                .collect(Collectors.groupingBy(Transaction::categoria, LinkedHashMap::new,
                        Collectors.mapping(Transaction::valor, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))))
                .entrySet().stream()
                .map(entry -> new CategoryTotalResponse(entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<AnnualComparisonResponse> annualComparison(List<Transaction> transactions) {
        Map<Integer, BigDecimal> receitas = totalsByYear(transactions, TransactionType.RECEITA);
        Map<Integer, BigDecimal> despesas = totalsByYear(transactions, TransactionType.DESPESA);

        return transactions.stream()
                .map(transaction -> transaction.data().getYear())
                .distinct()
                .sorted()
                .map(year -> {
                    BigDecimal receita = receitas.getOrDefault(year, BigDecimal.ZERO);
                    BigDecimal despesa = despesas.getOrDefault(year, BigDecimal.ZERO);
                    return new AnnualComparisonResponse(year, receita, despesa, receita.subtract(despesa));
                })
                .toList();
    }

    private Map<Integer, BigDecimal> totalsByYear(List<Transaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(transaction -> transaction.tipo() == type)
                .collect(Collectors.groupingBy(
                        transaction -> transaction.data().getYear(),
                        LinkedHashMap::new,
                        Collectors.mapping(Transaction::valor, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));
    }

    private InsightResponse buildInsights(List<Transaction> transactions, BigDecimal saldo) {
        List<Transaction> despesas = transactions.stream()
                .filter(transaction -> transaction.tipo() == TransactionType.DESPESA)
                .toList();

        Transaction maiorDespesa = despesas.stream()
                .max(Comparator.comparing(Transaction::valor))
                .orElse(null);

        String categoriaCampea = expenseTotalsByCategory(transactions).stream()
                .max(Comparator.comparing(CategoryTotalResponse::total))
                .map(CategoryTotalResponse::categoria)
                .orElse("Sem dados");

        BigDecimal ticketMedio = transactions.isEmpty()
                ? BigDecimal.ZERO
                : transactions.stream()
                    .map(Transaction::valor)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(transactions.size()), 2, RoundingMode.HALF_UP);

        long mesesAtivos = transactions.stream()
                .map(transaction -> transaction.data().getYear() * 100 + transaction.data().getMonthValue())
                .distinct()
                .count();

        BigDecimal saldoMedioMensal = mesesAtivos == 0
                ? saldo
                : saldo.divide(BigDecimal.valueOf(mesesAtivos), 2, RoundingMode.HALF_UP);

        return new InsightResponse(
                transactions.size(),
                categoriaCampea,
                maiorDespesa != null ? maiorDespesa.valor() : BigDecimal.ZERO,
                maiorDespesa != null ? maiorDespesa.descricao() : "Sem despesas registradas",
                ticketMedio,
                saldoMedioMensal
        );
    }
}

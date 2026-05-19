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
        return transacaoRepository.findByUserId(user.getId()).stream()
                .filter(t -> tipo == null || tipo.isBlank() || t.getTipo().name().equalsIgnoreCase(tipo))
                .filter(t -> categoria == null || categoria.isBlank() || t.getCategoria().equalsIgnoreCase(categoria))
                .filter(t -> inicio == null || !t.getData().isBefore(inicio))
                .filter(t -> fim == null || !t.getData().isAfter(fim))
                .sorted(Comparator.comparing(Transaction::getData).reversed()
                        .thenComparing(Comparator.comparing(Transaction::getId).reversed()))
                .toList();
    }

    public Transaction create(User user, TransactionRequest request) {
        Transaction t = new Transaction();
        t.setUserId(user.getId());
        t.setDescricao(request.descricao().trim());
        t.setTipo(request.tipo());
        t.setCategoria(request.categoria().trim());
        t.setValor(request.valor());
        t.setData(request.data());
        return transacaoRepository.create(t);
    }

    public Transaction update(User user, Long id, TransactionRequest request) {
        Transaction t = new Transaction();
        t.setId(id);
        t.setUserId(user.getId());
        t.setDescricao(request.descricao().trim());
        t.setTipo(request.tipo());
        t.setCategoria(request.categoria().trim());
        t.setValor(request.valor());
        t.setData(request.data());
        return transacaoRepository.update(user.getId(), id, t);
    }

    public void delete(User user, Long id) {
        transacaoRepository.delete(user.getId(), id);
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
                saldoTotal, saldoDisponivel, totalGuardado, totalReceitas, totalDespesas,
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
                .filter(t -> t.getTipo() == type)
                .map(Transaction::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<MonthlyTotalResponse> monthlyTotals(List<Transaction> transactions, TransactionType type) {
        Map<String, BigDecimal> totals = new LinkedHashMap<>();
        transactions.stream()
                .filter(t -> t.getTipo() == type)
                .sorted(Comparator.comparing(Transaction::getData))
                .forEach(t -> {
                    String key = t.getData().getYear() + "-" + t.getData().getMonthValue();
                    totals.merge(key, t.getValor(), BigDecimal::add);
                });
        return totals.entrySet().stream()
                .map(e -> {
                    String[] parts = e.getKey().split("-");
                    return new MonthlyTotalResponse(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]), e.getValue());
                }).toList();
    }

    private List<CategoryTotalResponse> expenseTotalsByCategory(List<Transaction> transactions) {
        return transactions.stream()
                .filter(t -> t.getTipo() == TransactionType.DESPESA)
                .collect(Collectors.groupingBy(Transaction::getCategoria, LinkedHashMap::new,
                        Collectors.mapping(Transaction::getValor, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))))
                .entrySet().stream()
                .map(e -> new CategoryTotalResponse(e.getKey(), e.getValue()))
                .toList();
    }

    private List<AnnualComparisonResponse> annualComparison(List<Transaction> transactions) {
        Map<Integer, BigDecimal> receitas = totalsByYear(transactions, TransactionType.RECEITA);
        Map<Integer, BigDecimal> despesas = totalsByYear(transactions, TransactionType.DESPESA);
        return transactions.stream()
                .map(t -> t.getData().getYear())
                .distinct().sorted()
                .map(year -> {
                    BigDecimal r = receitas.getOrDefault(year, BigDecimal.ZERO);
                    BigDecimal d = despesas.getOrDefault(year, BigDecimal.ZERO);
                    return new AnnualComparisonResponse(year, r, d, r.subtract(d));
                }).toList();
    }

    private Map<Integer, BigDecimal> totalsByYear(List<Transaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(t -> t.getTipo() == type)
                .collect(Collectors.groupingBy(t -> t.getData().getYear(), LinkedHashMap::new,
                        Collectors.mapping(Transaction::getValor, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));
    }

    private InsightResponse buildInsights(List<Transaction> transactions, BigDecimal saldo) {
        Transaction maiorDespesa = transactions.stream()
                .filter(t -> t.getTipo() == TransactionType.DESPESA)
                .max(Comparator.comparing(Transaction::getValor)).orElse(null);
        String categoriaCampea = expenseTotalsByCategory(transactions).stream()
                .max(Comparator.comparing(CategoryTotalResponse::total))
                .map(CategoryTotalResponse::categoria).orElse("Sem dados");
        BigDecimal ticketMedio = transactions.isEmpty() ? BigDecimal.ZERO
                : transactions.stream().map(Transaction::getValor).reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(transactions.size()), 2, RoundingMode.HALF_UP);
        long mesesAtivos = transactions.stream()
                .map(t -> t.getData().getYear() * 100 + t.getData().getMonthValue())
                .distinct().count();
        BigDecimal saldoMedioMensal = mesesAtivos == 0 ? saldo
                : saldo.divide(BigDecimal.valueOf(mesesAtivos), 2, RoundingMode.HALF_UP);
        return new InsightResponse(
                transactions.size(), categoriaCampea,
                maiorDespesa != null ? maiorDespesa.getValor() : BigDecimal.ZERO,
                maiorDespesa != null ? maiorDespesa.getDescricao() : "Sem despesas registradas",
                ticketMedio, saldoMedioMensal
        );
    }
}

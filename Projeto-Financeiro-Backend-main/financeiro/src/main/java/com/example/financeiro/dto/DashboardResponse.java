package com.example.financeiro.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        BigDecimal saldoTotal,
        BigDecimal saldoDisponivel,
        BigDecimal totalGuardadoCofrinhos,
        BigDecimal totalReceitas,
        BigDecimal totalDespesas,
        List<MonthlyTotalResponse> receitasPorMes,
        List<MonthlyTotalResponse> despesasPorMes,
        List<CategoryTotalResponse> despesasPorCategoria,
        List<AnnualComparisonResponse> comparativoAnual,
        InsightResponse insights,
        List<GoalResponse> metas
) {
}

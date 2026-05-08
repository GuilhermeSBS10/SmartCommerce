package com.example.financeiro.controller;

import com.example.financeiro.dto.DashboardResponse;
import com.example.financeiro.dto.TransactionRequest;
import com.example.financeiro.model.Transaction;
import com.example.financeiro.model.User;
import com.example.financeiro.service.AuthService;
import com.example.financeiro.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transacoes")
public class TransactionController {
    private final AuthService authService;
    private final TransactionService transactionService;

    public TransactionController(AuthService authService, TransactionService transactionService) {
        this.authService = authService;
        this.transactionService = transactionService;
    }

    @GetMapping
    public List<Transaction> list(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        User user = authService.authenticate(authorizationHeader);
        return transactionService.list(user, tipo, categoria, inicio, fim);
    }

    @PostMapping
    public Transaction create(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody TransactionRequest request
    ) {
        User user = authService.authenticate(authorizationHeader);
        return transactionService.create(user, request);
    }

    @PutMapping("/{id}")
    public Transaction update(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request
    ) {
        User user = authService.authenticate(authorizationHeader);
        return transactionService.update(user, id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @PathVariable Long id
    ) {
        User user = authService.authenticate(authorizationHeader);
        transactionService.delete(user, id);
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        User user = authService.authenticate(authorizationHeader);
        return transactionService.dashboard(user, inicio, fim);
    }
}

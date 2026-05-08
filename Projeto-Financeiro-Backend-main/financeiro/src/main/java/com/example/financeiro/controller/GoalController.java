package com.example.financeiro.controller;

import com.example.financeiro.dto.GoalRequest;
import com.example.financeiro.dto.GoalResponse;
import com.example.financeiro.dto.GoalBalanceRequest;
import com.example.financeiro.model.User;
import com.example.financeiro.service.AuthService;
import com.example.financeiro.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/metas")
public class GoalController {
    private final AuthService authService;
    private final GoalService goalService;

    public GoalController(AuthService authService, GoalService goalService) {
        this.authService = authService;
        this.goalService = goalService;
    }

    @GetMapping
    public List<GoalResponse> list(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        User user = authService.authenticate(authorizationHeader);
        return goalService.list(user);
    }

    @PostMapping
    public GoalResponse create(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody GoalRequest request
    ) {
        User user = authService.authenticate(authorizationHeader);
        return goalService.create(user, request);
    }

    @PutMapping("/{id}")
    public GoalResponse update(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @PathVariable Long id,
            @Valid @RequestBody GoalRequest request
    ) {
        User user = authService.authenticate(authorizationHeader);
        return goalService.update(user, id, request);
    }

    @PatchMapping("/{id}/depositar")
    public GoalResponse deposit(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @PathVariable Long id,
            @Valid @RequestBody GoalBalanceRequest request
    ) {
        User user = authService.authenticate(authorizationHeader);
        return goalService.deposit(user, id, request.valor());
    }

    @PatchMapping("/{id}/retirar")
    public GoalResponse withdraw(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @PathVariable Long id,
            @Valid @RequestBody GoalBalanceRequest request
    ) {
        User user = authService.authenticate(authorizationHeader);
        return goalService.withdraw(user, id, request.valor());
    }

    @DeleteMapping("/{id}")
    public void delete(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @PathVariable Long id
    ) {
        User user = authService.authenticate(authorizationHeader);
        goalService.delete(user, id);
    }
}

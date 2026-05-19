package com.example.financeiro.service;

import com.example.financeiro.dto.UpdatePreferencesRequest;
import com.example.financeiro.dto.UpdateProfileRequest;
import com.example.financeiro.dto.UpdateSecurityRequest;
import com.example.financeiro.dto.UserResponse;
import com.example.financeiro.exception.ApiException;
import com.example.financeiro.model.User;
import com.example.financeiro.persistence.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class UserService {
    private final UsuarioRepository usuarioRepository;

    public UserService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getNome(),
                user.getEmail(),
                user.getTelefone(),
                user.getCpf(),
                user.getTheme(),
                user.isNotificationsEnabled(),
                user.isCompactMode(),
                user.isAnimationsEnabled()
        );
    }

    public UserResponse updateProfile(User currentUser, UpdateProfileRequest request) {
        String cpf = normalizeCpf(request.cpf());
        if (cpf != null && !cpf.isBlank() && !isValidCpf(cpf)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "CPF invalido");
        }
        currentUser.setNome(request.nome().trim());
        currentUser.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        currentUser.setTelefone(normalizePhone(request.telefone()));
        currentUser.setCpf(cpf);
        User updated = usuarioRepository.update(currentUser);
        return toResponse(updated);
    }

    public UserResponse updatePreferences(User currentUser, UpdatePreferencesRequest request) {
        String theme = "light".equalsIgnoreCase(request.theme()) ? "light" : "dark";
        currentUser.setTheme(theme);
        currentUser.setNotificationsEnabled(request.notificationsEnabled());
        currentUser.setCompactMode(request.compactMode());
        currentUser.setAnimationsEnabled(request.animationsEnabled());
        User updated = usuarioRepository.update(currentUser);
        return toResponse(updated);
    }

    public UserResponse updateSecurity(User currentUser, UpdateSecurityRequest request) {
        if (!currentUser.getSenha().equals(request.senhaAtual())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Senha atual incorreta");
        }
        if ((request.novoEmail() == null || request.novoEmail().isBlank()) &&
                (request.novaSenha() == null || request.novaSenha().isBlank())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Informe um novo email ou uma nova senha");
        }
        if (request.novoEmail() != null && !request.novoEmail().isBlank()) {
            currentUser.setEmail(request.novoEmail().trim().toLowerCase(Locale.ROOT));
        }
        if (request.novaSenha() != null && !request.novaSenha().isBlank()) {
            currentUser.setSenha(request.novaSenha());
        }
        User updated = usuarioRepository.update(currentUser);
        return toResponse(updated);
    }

    public static boolean isValidCpf(String cpf) {
        String digits = normalizeCpf(cpf);
        if (digits == null || digits.length() != 11) return false;
        if (digits.chars().distinct().count() == 1) return false;
        int first = 0;
        for (int i = 0; i < 9; i++) first += (digits.charAt(i) - '0') * (10 - i);
        first = 11 - (first % 11);
        if (first >= 10) first = 0;
        int second = 0;
        for (int i = 0; i < 10; i++) second += (digits.charAt(i) - '0') * (11 - i);
        second = 11 - (second % 11);
        if (second >= 10) second = 0;
        return first == digits.charAt(9) - '0' && second == digits.charAt(10) - '0';
    }

    private static String normalizeCpf(String cpf) {
        if (cpf == null) return null;
        return cpf.replaceAll("\\D", "");
    }

    private static String normalizePhone(String phone) {
        if (phone == null) return "";
        return phone.trim();
    }
}

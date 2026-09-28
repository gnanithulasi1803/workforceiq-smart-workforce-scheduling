package com.workforce.controller;

import com.workforce.dto.AuthResponse;
import com.workforce.dto.LoginRequest;
import com.workforce.dto.RegisterRequest;
import com.workforce.service.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.workforce.dto.EmployeeAccountRequest;
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(
            AuthService authService) {

        this.authService = authService;
    }

    // ==============================
    // REGISTER
    // ==============================
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request) {

        return ResponseEntity.ok(
                authService.register(request)
        );
    }

    // ==============================
    // LOGIN
    // ==============================
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }

    @PostMapping("/create-employee-account")
    public ResponseEntity<String> createEmployeeAccount(
            @RequestBody EmployeeAccountRequest request) {

        authService.createEmployeeAccount(request);

        return ResponseEntity.ok(
                "Employee login account created successfully"
        );
    }

    @GetMapping("/employee/{employeeCode}")
    public ResponseEntity<?> findEmployeeByCode(
            @PathVariable String employeeCode) {

        return ResponseEntity.ok(
                authService.findEmployeeByCode(employeeCode)
        );
    }
}
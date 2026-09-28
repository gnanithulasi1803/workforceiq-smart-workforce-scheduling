package com.workforce.service;

import com.workforce.dto.AuthResponse;
import com.workforce.dto.LoginRequest;
import com.workforce.dto.RegisterRequest;
import com.workforce.entity.Role;
import com.workforce.entity.User;
import com.workforce.repository.UserRepository;
import com.workforce.security.CustomUserDetails;
import com.workforce.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import com.workforce.dto.EmployeeAccountRequest;
import com.workforce.entity.Employee;
import com.workforce.repository.EmployeeRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    private final EmployeeRepository employeeRepository;

    public AuthService(
            UserRepository userRepository,
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    // ==============================
    // REGISTER
    // ==============================
    public AuthResponse register(
            RegisterRequest request) {

        if (userRepository.existsByUsername(
                request.getUsername())) {

            throw new RuntimeException(
                    "Username already exists"
            );
        }

        if (userRepository.existsByEmail(
                request.getEmail())) {

            throw new RuntimeException(
                    "Email already exists"
            );
        }

        Role role = request.getRole();

        if (role == null) {
            role = Role.EMPLOYEE;
        }

        User user = new User();

        user.setUsername(
                request.getUsername()
        );

        user.setEmail(
                request.getEmail()
        );

        // BCrypt
        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(role);
        user.setEnabled(true);

        User savedUser =
                userRepository.save(user);

        CustomUserDetails userDetails =
                new CustomUserDetails(savedUser);

        String token =
                jwtService.generateToken(
                        userDetails
                );

        return new AuthResponse(
                token,
                savedUser.getUsername(),
                savedUser.getRole().name()
        );
    }

    // ==============================
    // LOGIN
    // ==============================
    public AuthResponse login(
            LoginRequest request) {

        // Verify username + password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // Find user
        User user =
                userRepository
                        .findByUsername(
                                request.getUsername()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        // Convert User → UserDetails
        CustomUserDetails userDetails =
                new CustomUserDetails(user);

        // Generate JWT
        String token =
                jwtService.generateToken(
                        userDetails
                );

        return new AuthResponse(
                token,
                user.getUsername(),
                user.getRole().name()
        );
    }

    public User createEmployeeAccount(EmployeeAccountRequest request) {

        if (request.getEmployeeId() == null) {
            throw new RuntimeException("Employee ID is required");
        }

        if (request.getPassword() == null
                || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }

        Employee employee = employeeRepository
                .findById(request.getEmployeeId())
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        // Check whether employee already has an account
        if (userRepository.existsByEmployeeId(employee.getId())) {
            throw new RuntimeException(
                    "Employee already has a login account");
        }

        // Employee code becomes username
        String username = employee.getEmployeeCode();

        // Check username
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException(
                    "Username already exists");
        }

        // Check email
        if (userRepository.existsByEmail(employee.getEmail())) {
            throw new RuntimeException(
                    "Email already exists");
        }

        User user = new User();

        user.setUsername(username);
        user.setEmail(employee.getEmail());

        // Never store plain password
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole(Role.EMPLOYEE);
        user.setEnabled(true);

        user.setEmployee(employee);

        return userRepository.save(user);
    }

    public Employee findEmployeeByCode(String employeeCode) {

        if (employeeCode == null
                || employeeCode.trim().isEmpty()) {
            throw new RuntimeException(
                    "Employee code is required"
            );
        }

        return employeeRepository
                .findByEmployeeCode(employeeCode.trim().toUpperCase())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found"
                        )
                );
    }
}

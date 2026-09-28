package com.workforce.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CustomUserDetailsService userDetailsService) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }


    // ==========================================
    // PASSWORD ENCODER
    // ==========================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    // ==========================================
    // AUTHENTICATION PROVIDER
    // ==========================================

    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }


    // ==========================================
    // AUTHENTICATION MANAGER
    // ==========================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }


    // ==========================================
    // SECURITY FILTER CHAIN
    // ==========================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        http
                // Enable CORS for React frontend
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Disable CSRF
                .csrf(csrf -> csrf.disable())
                // JWT is stateless
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // Authentication provider
                .authenticationProvider(
                        authenticationProvider()
                )

                // Authorization
                .authorizeHttpRequests(auth -> {

                    // ----------------------------------
                    // AUTH
                    // Login and Register
                    // ----------------------------------

                    auth.requestMatchers(
                            "/api/auth/**"
                    ).permitAll();


                    // ----------------------------------
                    // ADMIN
                    // ----------------------------------

                    auth.requestMatchers(
                            "/api/admin/**"
                    ).hasRole("ADMIN");


                    // ----------------------------------
                    // MANAGER
                    // ----------------------------------

                    auth.requestMatchers(
                            "/api/manager/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER"
                    );


                    // ==================================
                    // EMPLOYEE
                    // ==================================

                    // GET employee
                    // ADMIN + MANAGER + EMPLOYEE

                    auth.requestMatchers(
                            HttpMethod.GET,
                            "/api/employees/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER",
                            "EMPLOYEE"
                    );


                    // POST employee
                    // ADMIN + MANAGER

                    auth.requestMatchers(
                            HttpMethod.POST,
                            "/api/employees/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER"
                    );


                    // PUT employee
                    // ADMIN + MANAGER

                    auth.requestMatchers(
                            HttpMethod.PUT,
                            "/api/employees/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER"
                    );


                    // DELETE employee
                    // ADMIN ONLY

                    auth.requestMatchers(
                            HttpMethod.DELETE,
                            "/api/employees/**"
                    ).hasRole("ADMIN");


                    // ==================================
                    // SHIFT
                    // ==================================

                    // CREATE SHIFT

                    auth.requestMatchers(
                            HttpMethod.POST,
                            "/api/shifts/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER"
                    );


                    // UPDATE SHIFT

                    auth.requestMatchers(
                            HttpMethod.PUT,
                            "/api/shifts/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER"
                    );


                    // DELETE SHIFT

                    auth.requestMatchers(
                            HttpMethod.DELETE,
                            "/api/shifts/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER"
                    );


                    // VIEW SHIFT

                    auth.requestMatchers(
                            HttpMethod.GET,
                            "/api/shifts/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER",
                            "EMPLOYEE"
                    );


                    // ==================================
                    // LEAVE
                    // ==================================

                    // APPLY LEAVE

                    auth.requestMatchers(
                            HttpMethod.POST,
                            "/api/leaves/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER",
                            "EMPLOYEE"
                    );


                    // VIEW LEAVE

                    auth.requestMatchers(
                            HttpMethod.GET,
                            "/api/leaves/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER",
                            "EMPLOYEE"
                    );


                    // UPDATE / APPROVE / REJECT LEAVE

                    auth.requestMatchers(
                            HttpMethod.PUT,
                            "/api/leaves/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER"
                    );


                    // DELETE LEAVE

                    auth.requestMatchers(
                            HttpMethod.DELETE,
                            "/api/leaves/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER"
                    );

                    // ==================================
// AVAILABILITY
// ==================================

// Employee can create availability
                    auth.requestMatchers(
                            HttpMethod.POST,
                            "/api/availability/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER",
                            "EMPLOYEE"
                    );

// Everyone authenticated can view availability
                    auth.requestMatchers(
                            HttpMethod.GET,
                            "/api/availability/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER",
                            "EMPLOYEE"
                    );

// Admin + Manager can update
                    auth.requestMatchers(
                            HttpMethod.PUT,
                            "/api/availability/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER"
                    );

// Admin + Manager can delete
                    auth.requestMatchers(
                            HttpMethod.DELETE,
                            "/api/availability/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER",
                            "EMPLOYEE"
                    );

                    // ==================================
// HOLIDAY
// ==================================

// Admin + Manager can create holidays
                    auth.requestMatchers(
                            HttpMethod.POST,
                            "/api/holidays/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER"
                    );


// Admin + Manager + Employee can view holidays
                    auth.requestMatchers(
                            HttpMethod.GET,
                            "/api/holidays/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER",
                            "EMPLOYEE"
                    );


// Admin + Manager can update holidays
                    auth.requestMatchers(
                            HttpMethod.PUT,
                            "/api/holidays/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER"
                    );


// Admin only can delete holidays
                    auth.requestMatchers(
                            HttpMethod.DELETE,
                            "/api/holidays/**"
                    ).hasRole("ADMIN");

                    // ==================================
// POLICY
// ==================================

// Admin + Manager can create policy
                    auth.requestMatchers(
                            HttpMethod.POST,
                            "/api/policies/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER"
                    );


// Admin + Manager + Employee can view policy
                    auth.requestMatchers(
                            HttpMethod.GET,
                            "/api/policies/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER",
                            "EMPLOYEE"
                    );


// Admin + Manager can update policy
                    auth.requestMatchers(
                            HttpMethod.PUT,
                            "/api/policies/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER"
                    );


// Admin only can delete policy
                    auth.requestMatchers(
                            HttpMethod.DELETE,
                            "/api/policies/**"
                    ).hasRole("ADMIN");

                    auth.requestMatchers(
                            HttpMethod.GET,
                            "/api/rosters/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER",
                            "EMPLOYEE"
                    );
                    auth.requestMatchers(
                            HttpMethod.POST,
                            "/api/rosters/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER"
                    );
                    auth.requestMatchers(
                            HttpMethod.PUT,
                            "/api/rosters/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER"
                    );
                    auth.requestMatchers(
                            HttpMethod.DELETE,
                            "/api/rosters/**"
                    ).hasRole("ADMIN");

                    // Roster - generate/create/update/delete: ADMIN + MANAGER
                    auth.requestMatchers(
                            HttpMethod.POST,
                            "/api/rosters/generate"
                    ).hasAnyRole("ADMIN", "MANAGER")

                            .requestMatchers(
                                    HttpMethod.POST,
                                    "/api/rosters"
                            ).hasAnyRole("ADMIN", "MANAGER")

                            .requestMatchers(
                                    HttpMethod.PUT,
                                    "/api/rosters/**"
                            ).hasAnyRole("ADMIN", "MANAGER")

                            .requestMatchers(
                                    HttpMethod.DELETE,
                                    "/api/rosters/**"
                            ).hasRole("ADMIN")

// Roster - viewing: ADMIN + MANAGER + EMPLOYEE
                            .requestMatchers(
                                    HttpMethod.GET,
                                    "/api/rosters/**"
                            ).hasAnyRole("ADMIN", "MANAGER", "EMPLOYEE");

                    // ==================================
// SHIFT SWAP
// ==================================

// Create shift swap request
                    auth.requestMatchers(
                            HttpMethod.POST,
                            "/api/shift-swaps"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER",
                            "EMPLOYEE"
                    );

// View all shift swaps
                    auth.requestMatchers(
                            HttpMethod.GET,
                            "/api/shift-swaps/**"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER",
                            "EMPLOYEE"
                    );

// Manager approval
                    auth.requestMatchers(
                            HttpMethod.PUT,
                            "/api/shift-swaps/*/approve"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER"
                    );

                    // ==================================
// REPLACEMENT SUGGESTIONS
// ==================================

// View replacement suggestions
                    auth.requestMatchers(
                            HttpMethod.GET,
                            "/api/replacements/suggestions"
                    ).authenticated();

// Replace employee in roster
                    auth.requestMatchers(
                            HttpMethod.PUT,
                            "/api/replacements/replace"
                    ).hasAnyRole(
                            "ADMIN",
                            "MANAGER"
                    );
                    // ==================================
                    // ALL OTHER REQUESTS
                    // ==================================

                    auth.anyRequest().authenticated();
                });


        // ==========================================
        // JWT FILTER
        // ==========================================

        http.addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
        );


        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                Arrays.asList(
                        "http://localhost:5173"
                )
        );

        configuration.setAllowedMethods(
                Arrays.asList(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                Arrays.asList(
                        "Authorization",
                        "Content-Type"
                )
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}
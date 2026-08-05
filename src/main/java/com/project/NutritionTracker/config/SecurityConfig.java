package com.project.NutritionTracker.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf  -> csrf.disable()) // Cross site request forgery / disable, not use of cookies
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // Let anyone send request even when not logged in, verifies when the request gets to the service.
                );
        return http.build();
    }

}

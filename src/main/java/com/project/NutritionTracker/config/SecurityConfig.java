package com.project.NutritionTracker.config;


import com.project.NutritionTracker.security.GoogleAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, GoogleAuthFilter googleAuthFilter) throws Exception {
        http
                .csrf(csrf  -> csrf.disable()) // Cross site request forgery / disable, not use of cookies
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll())
                .addFilterBefore(googleAuthFilter, UsernamePasswordAuthenticationFilter.class);

    // Let anyone send request even when not logged in, verifies when the request gets to the service
        return http.build();
    }

}

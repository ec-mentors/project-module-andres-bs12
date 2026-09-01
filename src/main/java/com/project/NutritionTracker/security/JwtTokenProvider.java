package com.project.NutritionTracker.security;

import com.project.NutritionTracker.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration-days}")
    private long expirationDays;

    // Create cryptographic key

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        Date nowDate = new Date();

        // 30 days * 24h * 60min ...
        Date expirationDate = new Date(nowDate.getTime() + (expirationDays * 24 * 60 * 60 * 1000L));

        return Jwts.builder().subject(user.getId().toString()).claim("email", user.getEmail()).claim("role", user.getRole()).issuedAt(nowDate).expiration(expirationDate).signWith(getSigningKey()).compact();
    }

    public UUID validateTokenAndGetUserId(String token) {
        try {
            Claims claims = Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
            return UUID.fromString(claims.getSubject());
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }

}

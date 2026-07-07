package com.example.nexus.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Date;
import javax.crypto.SecretKey;

@Service
public class JwtService {

    @Value("${jwt.secret:mySecretKeyForJwtTokenGenerationPleaseChangeThis1234567890VERYSECURE}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    @Value("${jwt.refresh.expiration:604800000}")
    private long refreshTokenExpiration;

    // ── Generate Access Token ─────────────────────────────────────
    public String generateToken(Long userId, String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ── Generate Refresh Token ────────────────────────────────────
    public String generateRefreshToken(Long userId, String username) {
        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ── Extract username from token ───────────────────────────────
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // ── Extract user ID from token ────────────────────────────────
    public Long extractUserId(String token) {
        return getClaims(token).get("userId", Long.class);
    }

    // ── Extract role from token ───────────────────────────────────
    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    // ── Check if token is valid ───────────────────────────────────
    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ── Check if token is expired ─────────────────────────────────
    public boolean isTokenExpired(String token) {
        try {
            return getClaims(token).getExpiration().before(new Date());
        } catch (JwtException e) {
            return true;
        }
    }

    // ── Private helper methods ────────────────────────────────────
    private Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getSigningKey())
                .parseClaimsJws(token)
                .getBody();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
}
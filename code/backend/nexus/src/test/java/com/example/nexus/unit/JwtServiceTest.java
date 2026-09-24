package com.example.nexus.unit;

import com.example.nexus.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(
                jwtService,
                "jwtSecret",
                "unitTestSecretKeyForJwtTokenGeneration12345678901234567890");
    }

    @Test
    void accessTokenPreservesUserClaims() {
        var token = jwtService.generateToken(42, "assembler@example.com", "ASSEMBLER");

        assertTrue(jwtService.isTokenValid(token));
        assertFalse(jwtService.isTokenExpired(token));
        assertEquals("assembler@example.com", jwtService.extractUsername(token));
        assertEquals(42, jwtService.extractUserId(token));
        assertEquals("ASSEMBLER", jwtService.extractRole(token));
    }

    @Test
    void refreshTokenPreservesIdentityWithoutAnAccessRole() {
        var token = jwtService.generateRefreshToken(7, "customer@example.com");

        assertTrue(jwtService.isTokenValid(token));
        assertEquals("customer@example.com", jwtService.extractUsername(token));
        assertEquals(7, jwtService.extractUserId(token));
        assertEquals(null, jwtService.extractRole(token));
    }

    @Test
    void malformedTokenIsRejectedAndTreatedAsExpired() {
        assertFalse(jwtService.isTokenValid("not-a-jwt"));
        assertTrue(jwtService.isTokenExpired("not-a-jwt"));
    }
}

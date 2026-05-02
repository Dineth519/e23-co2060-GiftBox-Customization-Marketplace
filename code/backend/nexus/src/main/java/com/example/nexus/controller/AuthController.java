package com.example.nexus.controller;

import com.example.nexus.dto.*;
import com.example.nexus.service.AuthService;
import jakarta.servlet.http.HttpSession;                // [NEW] import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verify(@RequestBody VerifyRequest request) {
        return ResponseEntity.ok(authService.verifyEmail(request));
    }

    // [MODIFIED] HttpSession parameter add කළා — session set සඳහා
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request,
                                              HttpSession session) {
        return ResponseEntity.ok(authService.login(request, session));
    }

    // [NEW] Logout — session invalidate කරනවා
    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpSession session) {
        return ResponseEntity.ok(authService.logout(session));
    }

    @PostMapping("/resend-code")
    public ResponseEntity<AuthResponse> resendCode(@RequestParam String email) {
        return ResponseEntity.ok(authService.resendCode(email));
    }
}
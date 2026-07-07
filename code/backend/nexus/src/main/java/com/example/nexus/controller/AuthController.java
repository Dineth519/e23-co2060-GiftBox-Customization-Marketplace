package com.example.nexus.controller;

import com.example.nexus.dto.*;
import com.example.nexus.model.Customer;
import com.example.nexus.repository.CustomerRepository;
import com.example.nexus.service.AuthService;
import com.example.nexus.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomerRepository customerRepository;

    // ── Register ──────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    // ── Verify Email ──────────────────────────────────────
    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verify(@RequestBody VerifyRequest request) {
        return ResponseEntity.ok(authService.verifyEmail(request));
    }

    // ── Login with JWT ────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (Exception e) {
            java.util.Map<String, String> err = new java.util.LinkedHashMap<>();
            err.put("error", e.getClass().getSimpleName());
            err.put("message", e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(err);
        }
    }

    // ── Resend Code ───────────────────────────────────────
    @PostMapping("/resend-code")
    public ResponseEntity<AuthResponse> resendCode(@RequestParam String email) {
        return ResponseEntity.ok(authService.resendCode(email));
    }

    // ── Refresh Token ─────────────────────────────────────
    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(new AuthResponse(false, "Invalid token format"));
            }

            String refreshToken = authHeader.substring(7);
            
            if (!jwtService.isTokenValid(refreshToken)) {
                return ResponseEntity.status(401).body(new AuthResponse(false, "Invalid or expired refresh token"));
            }

            Long customerId = jwtService.extractUserId(refreshToken);
            String username = jwtService.extractUsername(refreshToken);
            
            Optional<Customer> customerOpt = customerRepository.findById(customerId);
            if (customerOpt.isEmpty()) {
                return ResponseEntity.status(401).body(new AuthResponse(false, "Customer not found"));
            }

            Customer customer = customerOpt.get();
            String newAccessToken = jwtService.generateToken(
                customer.getId(), 
                customer.getUsername(), 
                customer.getRole().name()
            );

            AuthResponse response = new AuthResponse(true, "Token refreshed");
            response.setAccessToken(newAccessToken);
            response.setRole(customer.getRole().name());
            response.setUserId(customer.getId().intValue());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new AuthResponse(false, "Token refresh failed: " + e.getMessage()));
        }
    }

    // ── Get Current User Info ─────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(new AuthResponse(false, "Invalid token format"));
            }

            String token = authHeader.substring(7);
            
            if (!jwtService.isTokenValid(token)) {
                return ResponseEntity.status(401).body(new AuthResponse(false, "Invalid or expired token"));
            }

            Long customerId = jwtService.extractUserId(token);
            Optional<Customer> customerOpt = customerRepository.findById(customerId);

            if (customerOpt.isEmpty()) {
                return ResponseEntity.status(404).body(new AuthResponse(false, "Customer not found"));
            }

            Customer customer = customerOpt.get();
            
            java.util.Map<String, Object> userInfo = new java.util.LinkedHashMap<>();
            userInfo.put("id", customer.getId());
            userInfo.put("username", customer.getUsername());
            userInfo.put("email", customer.getEmail());
            userInfo.put("name", customer.getName());
            userInfo.put("role", customer.getRole().name());
            userInfo.put("verified", customer.isVerified());

            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new AuthResponse(false, "Failed to get user info: " + e.getMessage()));
        }
    }

    // ── Logout (optional - for frontend to clear tokens) ──
    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(@RequestHeader("Authorization") String authHeader) {
        // Since we're using stateless JWT, logout is handled on frontend by removing tokens
        return ResponseEntity.ok(new AuthResponse(true, "Logged out successfully. Please clear your tokens on the client side."));
    }
}
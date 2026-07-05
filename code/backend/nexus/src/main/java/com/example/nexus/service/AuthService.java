package com.example.nexus.service;

import com.example.nexus.dto.*;
import com.example.nexus.model.Role;
import com.example.nexus.model.Customer;
import com.example.nexus.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    // ── Register ───────────────────────────────
    public AuthResponse register(RegisterRequest request) {

        if (customerRepository.existsByUsername(request.getUsername())) {
            return new AuthResponse(false, "Username already exists");
        }

        if (customerRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(false, "Email already registered");
        }

        // Generate 6-digit OTP
        String code = String.format("%06d", new Random().nextInt(999999));

        // Build customer — not verified yet
        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setUsername(request.getUsername());
        customer.setEmail(request.getEmail());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setRole(Role.CUSTOMER);
        customer.setVerified(false);
        customer.setVerificationCode(code);
        customer.setCodeExpiresAt(LocalDateTime.now().plusMinutes(10)); // 10 min expiry

        customerRepository.save(customer);

        // Send email
        emailService.sendVerificationCode(request.getEmail(), code);

        return new AuthResponse(true, "Registration successful! Check your email for the verification code.");
    }

    // ── Verify Email ───────────────────────────
    public AuthResponse verifyEmail(VerifyRequest request) {

        Optional<Customer> userOpt = customerRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "Customer not found");
        }

        Customer customer = userOpt.get();

        // Already verified?
        if (customer.isVerified()) {
            return new AuthResponse(false, "Email already verified");
        }

        // Code expired?
        if (LocalDateTime.now().isAfter(customer.getCodeExpiresAt())) {
            return new AuthResponse(false, "Verification code expired. Please register again.");
        }

        // Wrong code?
        if (!customer.getVerificationCode().equals(request.getCode())) {
            return new AuthResponse(false, "Invalid verification code");
        }

        // All good — mark as verified
        customer.setVerified(true);
        customer.setVerificationCode(null);  // clear code after use
        customer.setCodeExpiresAt(null);
        customerRepository.save(customer);

        return new AuthResponse(true, "Email verified successfully! You can now login.");
    }

    // ── Login ──────────────────────────────────
    public AuthResponse login(LoginRequest request) {

        Optional<Customer> userOpt = customerRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) {
            userOpt = customerRepository.findByEmail(request.getUsername());
        }

        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "Customer not found");
        }

        Customer customer = userOpt.get();

        // Block login if not verified
        if (!customer.isVerified()) {
            return new AuthResponse(false, "Please verify your email before logging in");
        }

        if (!passwordEncoder.matches(request.getPassword(), customer.getPassword())) {
            return new AuthResponse(false, "Incorrect password");
        }

        // Changed part: sending Role and Customer ID
        return new AuthResponse(true, "Login Successful", customer.getRole().name(), customer.getId().intValue());
    }

    // ── Resend Code ────────────────────────────
    public AuthResponse resendCode(String email) {

        Optional<Customer> userOpt = customerRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "Customer not found");
        }

        Customer customer = userOpt.get();

        if (customer.isVerified()) {
            return new AuthResponse(false, "Email already verified");
        }

        // Generate new code
        String newCode = String.format("%06d", new Random().nextInt(999999));
        customer.setVerificationCode(newCode);
        customer.setCodeExpiresAt(LocalDateTime.now().plusMinutes(10));
        customerRepository.save(customer);

        emailService.sendVerificationCode(email, newCode);

        return new AuthResponse(true, "New verification code sent!");
    }
}
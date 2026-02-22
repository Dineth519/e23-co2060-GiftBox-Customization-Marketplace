package com.example.nexus.service;

import com.example.nexus.dto.*;
import com.example.nexus.model.Role;
import com.example.nexus.model.User;
import com.example.nexus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    // ── Register ───────────────────────────────
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            return new AuthResponse(false, "Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(false, "Email already registered");
        }

        // Generate 6-digit OTP
        String code = String.format("%06d", new Random().nextInt(999999));

        // Build user — not verified yet
        User user = new User();
        user.setName(request.getName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CUSTOMER);
        user.setVerified(false);
        user.setVerificationCode(code);
        user.setCodeExpiresAt(LocalDateTime.now().plusMinutes(10)); // 10 min expiry

        userRepository.save(user);

        // Send email
        emailService.sendVerificationCode(request.getEmail(), code);

        return new AuthResponse(true, "Registration successful! Check your email for the verification code.");
    }

    // ── Verify Email ───────────────────────────
    public AuthResponse verifyEmail(VerifyRequest request) {

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "User not found");
        }

        User user = userOpt.get();

        // Already verified?
        if (user.isVerified()) {
            return new AuthResponse(false, "Email already verified");
        }

        // Code expired?
        if (LocalDateTime.now().isAfter(user.getCodeExpiresAt())) {
            return new AuthResponse(false, "Verification code expired. Please register again.");
        }

        // Wrong code?
        if (!user.getVerificationCode().equals(request.getCode())) {
            return new AuthResponse(false, "Invalid verification code");
        }

        // All good — mark as verified
        user.setVerified(true);
        user.setVerificationCode(null);  // clear code after use
        user.setCodeExpiresAt(null);
        userRepository.save(user);

        return new AuthResponse(true, "Email verified successfully! You can now login.");
    }

    // ── Login ──────────────────────────────────
    public AuthResponse login(LoginRequest request) {

        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "User not found");
        }

        User user = userOpt.get();

        // Block login if not verified
        if (!user.isVerified()) {
            return new AuthResponse(false, "Please verify your email before logging in");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new AuthResponse(false, "Incorrect password");
        }

        // 👈 වෙනස් කරපු තැන: Role එක යවනවා
        return new AuthResponse(true, "Login Successful", user.getRole().name());
    }

    // ── Resend Code ────────────────────────────
    public AuthResponse resendCode(String email) {

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "User not found");
        }

        User user = userOpt.get();

        if (user.isVerified()) {
            return new AuthResponse(false, "Email already verified");
        }

        // Generate new code
        String newCode = String.format("%06d", new Random().nextInt(999999));
        user.setVerificationCode(newCode);
        user.setCodeExpiresAt(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailService.sendVerificationCode(email, newCode);

        return new AuthResponse(true, "New verification code sent!");
    }
}
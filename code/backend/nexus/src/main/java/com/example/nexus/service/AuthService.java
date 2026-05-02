package com.example.nexus.service;

import com.example.nexus.dto.*;
import com.example.nexus.model.Role;
import com.example.nexus.model.User;
import com.example.nexus.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired private UserRepository  userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private EmailService    emailService;
    @Autowired private CartService     cartService;   // [NEW] cart merge සඳහා

    // ── Register ───────────────────────────────────────────
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            return new AuthResponse(false, "Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(false, "Email already registered");
        }

        String code = String.format("%06d", new Random().nextInt(999999));

        User user = new User();
        user.setName(request.getName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CUSTOMER);
        user.setVerified(false);
        user.setVerificationCode(code);
        user.setCodeExpiresAt(LocalDateTime.now().plusMinutes(10));

        userRepository.save(user);
        emailService.sendVerificationCode(request.getEmail(), code);

        return new AuthResponse(true,
            "Registration successful! Check your email for the verification code.");
    }

    // ── Verify Email ───────────────────────────────────────
    public AuthResponse verifyEmail(VerifyRequest request) {

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) return new AuthResponse(false, "User not found");

        User user = userOpt.get();

        if (user.isVerified())
            return new AuthResponse(false, "Email already verified");

        if (LocalDateTime.now().isAfter(user.getCodeExpiresAt()))
            return new AuthResponse(false,
                "Verification code expired. Please register again.");

        if (!user.getVerificationCode().equals(request.getCode()))
            return new AuthResponse(false, "Invalid verification code");

        user.setVerified(true);
        user.setVerificationCode(null);
        user.setCodeExpiresAt(null);
        userRepository.save(user);

        return new AuthResponse(true,
            "Email verified successfully! You can now login.");
    }

    // ── Login ──────────────────────────────────────────────
    // [MODIFIED] HttpSession parameter add කළා
    //  1. session එකේ user info set කරනවා
    //  2. guest cart → DB cart merge කරනවා
    public AuthResponse login(LoginRequest request, HttpSession session) {

        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isEmpty())
            return new AuthResponse(false, "User not found");

        User user = userOpt.get();

        if (!user.isVerified())
            return new AuthResponse(false,
                "Please verify your email before logging in");

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            return new AuthResponse(false, "Incorrect password");

        // ── [NEW] Session set ──────────────────────────────
        // CartService.getCustomerId(session) මේකෙන් ගන්නවා
        session.setAttribute("user_id",     user.getId());
        session.setAttribute("username",    user.getUsername());
        session.setAttribute("role",        user.getRole().name());

        // CUSTOMER role නම් customer_id set කරනවා
        // (users table user_id = customers table customer_id — same value)
        if (user.getRole() == Role.CUSTOMER) {
            session.setAttribute("customer_id", user.getId());

            // ── [NEW] Guest cart → DB merge ────────────────
            // Login කලින් guest session cart DB cart එකට merge
            cartService.mergeGuestCartOnLogin(session, user.getId().intValue());
        }

        return new AuthResponse(true, "Login Successful", user.getRole().name());
    }

    // ── Logout ─────────────────────────────────────────────
    // [NEW] Session invalidate — cart session ද clear වෙනවා
    // (DB cart safe — next login වෙද්දි reload වෙනවා)
    public AuthResponse logout(HttpSession session) {
        session.invalidate();
        return new AuthResponse(true, "Logged out successfully.");
    }

    // ── Resend Code ────────────────────────────────────────
    public AuthResponse resendCode(String email) {

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) return new AuthResponse(false, "User not found");

        User user = userOpt.get();

        if (user.isVerified())
            return new AuthResponse(false, "Email already verified");

        String newCode = String.format("%06d", new Random().nextInt(999999));
        user.setVerificationCode(newCode);
        user.setCodeExpiresAt(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailService.sendVerificationCode(email, newCode);

        return new AuthResponse(true, "New verification code sent!");
    }
}
package com.example.nexus.service;

import com.example.nexus.model.User;
import com.example.nexus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JavaMailSender mailSender;

    // 1. Register User
    public String register(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return "Username already exists";
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return "Email already exists";
        }
        
        // Encrypt password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return "Account Created";
    }

    // 2. Login (Using Username)
    public String login(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Securely compare the raw password with the hashed database password
            if (passwordEncoder.matches(password, user.getPassword())) {
                return "Login Successful"; 
            } else {
                return "Incorrect Password";
            }
        }
        return "User not found";
    }

    // 3. Send 4-Digit OTP (Using Email)
public String sendResetOtp(String email) {
    // 1. Clean the input immediately
    if (email == null) return "Email is required";
    String cleanEmail = email.trim().toLowerCase(); 

    // 2. Use a case-insensitive search
    Optional<User> userOpt = userRepository.findByEmailIgnoreCase(cleanEmail);
    
    if (userOpt.isEmpty()) {
        System.out.println("DEBUG: Search failed for email: [" + cleanEmail + "]");
        return "User not found";
    }

    User user = userOpt.get();
    String otp = String.format("%04d", new Random().nextInt(10000)); 
    
    user.setResetOtp(otp);
    user.setResetOtpExpireAt(LocalDateTime.now().plusMinutes(15));
    userRepository.save(user);

    try {
        sendEmail(user.getEmail(), "Your Password Reset Code", "Your 4-digit OTP is: " + otp);
        return "OTP sent";
    } catch (Exception e) {
        System.err.println("Email Error: " + e.getMessage());
        return "Error sending email, but OTP was generated";
    }
}

    // 4. Verify OTP
    public String verifyOtp(String email, String otp) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return "User not found";

        User user = userOpt.get();
        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp)) {
            return "Invalid OTP";
        }
        if (user.getResetOtpExpireAt() == null || user.getResetOtpExpireAt().isBefore(LocalDateTime.now())) {
            return "OTP Expired";
        }
        return "OTP Verified";
    }

    // 5. Save New Password
    public String resetPassword(String email, String newPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return "User not found";

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetOtp(null); // Clear OTP
        user.setResetOtpExpireAt(null);
        userRepository.save(user);
        
        return "Password reset successfully";
    }

    // Helper method to send email
    private void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }
}
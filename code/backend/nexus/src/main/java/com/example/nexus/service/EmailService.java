package com.example.nexus.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Giftora - Email Verification Code");
        message.setText(
            "Dear Customer,\n\n" +
            "Thank you for joining Giftora! To complete your registration and verify your email address, please use the verification code provided below:\n\n" +
            "Verification Code: " + code + "\n\n" +
            "Please note that this code is valid for 10 minutes only. For security reasons, do not share this code with anyone.\n\n" +
            "If you did not request this registration, you can safely ignore this email.\n\n" +
            "Best regards,\n" +
            "The Giftora Team"
        );
        mailSender.send(message);
    }
}
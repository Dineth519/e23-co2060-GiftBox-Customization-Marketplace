package com.example.nexus.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "users")  
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId; 

    private String name;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.CUSTOMER;

    private String verifyOtp;
    private LocalDateTime verifyOtpExpireAt;
    
    private boolean isAccountVerified = false;

    private String resetOtp;
    private LocalDateTime resetOtpExpireAt;

    public enum Role {
        ADMIN,
        CUSTOMER
    }
}
package com.example.nexus.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED) // User සහ Partner සම්බන්ධ කරන ප්‍රධාන තැන
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "users")  
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private int userId;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Role role; // ADMIN, CUSTOMER, PARTNER

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Enum for Roles
    public enum Role { ADMIN, CUSTOMER, PARTNER }

    // Getters and Setters
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
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
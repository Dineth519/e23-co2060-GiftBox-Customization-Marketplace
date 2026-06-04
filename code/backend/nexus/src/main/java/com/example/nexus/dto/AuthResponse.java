package com.example.nexus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
public class AuthResponse {
    private boolean success;
    private String message;
    private String role;
    private Integer userId;

    // 4-parameter constructor
    public AuthResponse(boolean success, String message, String role, Integer userId) {
        this.success = success;
        this.message = message;
        this.role = role;
        this.userId = userId;
    }

    // 3-parameter constructor (compatibility)
    public AuthResponse(boolean success, String message, String role) {
        this.success = success;
        this.message = message;
        this.role = role;
    }

    // 2-parameter constructor
    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // Default constructor for deserialization
    public AuthResponse() {}
}
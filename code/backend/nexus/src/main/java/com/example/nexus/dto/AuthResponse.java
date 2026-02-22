package com.example.nexus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private boolean success;
    private String message;
    private String role;

    // Manually add the 2-parameter constructor for error and general responses
    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}
package com.example.nexus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor // Generates a constructor with all arguments
@NoArgsConstructor  // Generates an empty constructor (required for Spring Boot JSON parsing)
public class LoginRequest {
    private String username;
    private String password;
}
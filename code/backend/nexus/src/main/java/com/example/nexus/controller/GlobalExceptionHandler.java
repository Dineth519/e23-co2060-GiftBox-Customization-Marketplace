package com.example.nexus.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        e.printStackTrace();
        java.io.StringWriter sw = new java.io.StringWriter();
        e.printStackTrace(new java.io.PrintWriter(sw));
        
        try {
            java.nio.file.Files.writeString(java.nio.file.Paths.get("global_error.log"), sw.toString());
        } catch(Exception ignored) {}

        return ResponseEntity.status(500).body("GLOBAL ERROR: " + e.toString() + "\n" + sw.toString());
    }
}

package com.example.nexus.controller;

import com.example.nexus.model.Product;
import com.example.nexus.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// REST Controller to handle API requests from the React frontend
// CORS is now handled globally by CorsConfig.java — no @CrossOrigin needed here
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // Fetch all products from the database and return them as a JSON list
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

}
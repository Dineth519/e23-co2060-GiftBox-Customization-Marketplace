package com.example.nexus.repository;

import com.example.nexus.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Repository interface for database operations on the Product entity
@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    
    // Spring Data JPA automatically provides built-in methods here 
    // such as findAll(), save(), findById(), etc.
    
}
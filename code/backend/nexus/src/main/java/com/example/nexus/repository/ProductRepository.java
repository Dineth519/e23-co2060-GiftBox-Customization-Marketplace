package com.example.nexus.repository;

import com.example.nexus.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    // Seller's product list page
    List<Product> findByPartnerId(Integer partnerId);

    // Dashboard — total products count for a seller
    long countByPartnerId(Integer partnerId);
}
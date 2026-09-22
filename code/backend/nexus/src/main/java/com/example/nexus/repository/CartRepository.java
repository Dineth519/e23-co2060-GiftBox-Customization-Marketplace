package com.example.nexus.repository;

import com.example.nexus.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    Optional<Cart> findByCustomerIdAndPartnerId(Integer customerId, Integer partnerId);
    List<Cart> findByCustomerId(Integer customerId);
}

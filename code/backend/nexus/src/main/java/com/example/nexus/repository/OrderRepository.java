package com.example.nexus.repository;

import com.example.nexus.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    // Custom query to find orders by partner_id, ordered by created_at descending
    List<Order> findByPartnerIdOrderByCreatedAtDesc(Integer partnerId);
}
package com.example.nexus.repository;

import com.example.nexus.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {

    // Order එකේ items ගන්නවා
    List<OrderItem> findByOrderId(Integer orderId);

    // Vendor ගේ order items ගන්නවා (dashboard සඳහා)
    List<OrderItem> findByPartnerId(Integer partnerId);
}
package com.example.nexus.controller;

import com.example.nexus.model.Order;
import com.example.nexus.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000") 
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    // 1. Seller-specific orders retrieval (sorted by created_at desc)
    @GetMapping("/sellers/{sellerId}/orders")
    public List<Order> getOrdersBySeller(@PathVariable Integer sellerId) {
        return orderRepository.findByPartnerIdOrderByCreatedAtDesc(sellerId);
    }

    // 2. Vendor order status update (only from PENDING to CONFIRMED or CANCELLED)
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Integer orderId, @RequestBody Map<String, String> request) {
        return orderRepository.findById(orderId).map(order -> {
            String newStatus = request.get("status");

            // Only allow status change if current status is PENDING
            if ("PENDING".equals(order.getStatus())) {
                if ("CONFIRMED".equals(newStatus) || "CANCELLED".equals(newStatus)) {
                    order.setStatus(newStatus);
                    orderRepository.save(order);
                    return ResponseEntity.ok().body("Order " + newStatus);
                }
            }
            return ResponseEntity.badRequest().body("Action not allowed for current status");
        }).orElse(ResponseEntity.notFound().build());
    }
}
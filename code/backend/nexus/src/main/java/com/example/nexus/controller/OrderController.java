package com.example.nexus.controller;

import com.example.nexus.dto.CheckoutRequest;
import com.example.nexus.model.Order;
import com.example.nexus.repository.OrderRepository;
import com.example.nexus.service.OrderService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class OrderController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderService    orderService;

    // ── GET /api/sellers/{sellerId}/orders ────────────────
    @GetMapping("/sellers/{sellerId}/orders")
    public List<Order> getOrdersBySeller(@PathVariable Integer sellerId) {
        return orderRepository.findByPartnerIdOrderByCreatedAtDesc(sellerId);
    }

    // ── PUT /api/orders/{orderId}/status ──────────────────
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> request) {

        return orderRepository.findById(orderId).map(order -> {
            String newStatus = request.get("status");

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

    // ── POST /api/orders/checkout ─────────────────────────
    @PostMapping("/orders/checkout")
    public ResponseEntity<?> checkout(
            @RequestBody CheckoutRequest request,
            HttpSession session) {

        try {
            System.out.println("=== CHECKOUT REQUEST RECEIVED ===");
            System.out.println("Full Name: " + request.getFullName());
            System.out.println("Phone: " + request.getPhone());
            System.out.println("Address Line 1: " + request.getAddressLine1());
            System.out.println("Address Line 2: " + request.getAddressLine2());
            System.out.println("City: " + request.getCity());
            System.out.println("Special Notes: " + request.getSpecialNotes());
            System.out.println("Session ID: " + session.getId());
            System.out.println("Customer ID from session: " + session.getAttribute("customer_id"));
            System.out.println("================================");

            List<Integer> orderIds = orderService.checkout(session, request);
            
            return ResponseEntity.ok(Map.of(
                "success",  true,
                "orderIds", orderIds,
                "message",  "Order placed successfully!"
            ));

        } catch (RuntimeException e) {
            System.err.println("❌ CHECKOUT FAILED: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            System.err.println("❌ UNEXPECTED ERROR: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Server error: " + e.getMessage()
            ));
        }
    }

    // ── GET /api/orders/customer ──────────────────────────
    @GetMapping("/orders/customer")
    public ResponseEntity<?> getCustomerOrders(HttpSession session) {
        Integer customerId = (Integer) session.getAttribute("customer_id");

        if (customerId == null) {
            return ResponseEntity.status(401).body(Map.of(
                "message", "Not logged in"
            ));
        }

        List<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        return ResponseEntity.ok(orders);
    }
}
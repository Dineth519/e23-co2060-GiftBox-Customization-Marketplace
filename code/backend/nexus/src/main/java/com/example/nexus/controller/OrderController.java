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
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderService    orderService;   // [NEW]

    // ── GET /api/sellers/{sellerId}/orders ────────────────
    // Vendor dashboard — seller ගේ orders list
    @GetMapping("/sellers/{sellerId}/orders")
    public List<Order> getOrdersBySeller(@PathVariable Integer sellerId) {
        return orderRepository.findByPartnerIdOrderByCreatedAtDesc(sellerId);
    }

    // ── PUT /api/orders/{orderId}/status ──────────────────
    // Vendor — PENDING → CONFIRMED or CANCELLED only
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
    // [NEW] Customer checkout
    // Body: { deliveryAddress, specialNotes }
    // 1. Cart items vendor අනුව split කරනවා
    // 2. Vendor per Order create (status = PENDING)
    // 3. Cart clear කරනවා
    // Returns: { orderIds: [1, 2, ...] }
    @PostMapping("/orders/checkout")
    public ResponseEntity<?> checkout(
            @RequestBody CheckoutRequest request,
            HttpSession session) {

        try {
            List<Integer> orderIds = orderService.checkout(session, request);
            return ResponseEntity.ok(Map.of(
                "success",  true,
                "orderIds", orderIds,
                "message",  "Order placed successfully!"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // ── GET /api/orders/customer ──────────────────────────
    // [NEW] Customer "My Orders" page
    // Session ෙකෙ customer_id ගෙන orders return කරනවා
    @GetMapping("/orders/customer")
    public ResponseEntity<?> getCustomerOrders(HttpSession session) {
        Integer customerId = (Integer) session.getAttribute("customer_id");

        if (customerId == null) {
            return ResponseEntity.status(401).body(Map.of(
                "message", "Not logged in"
            ));
        }

        List<Order> orders =
            orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);

        return ResponseEntity.ok(orders);
    }
}
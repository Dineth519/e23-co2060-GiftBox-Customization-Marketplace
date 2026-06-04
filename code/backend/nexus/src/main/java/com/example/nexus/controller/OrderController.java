package com.example.nexus.controller;

import com.example.nexus.dto.CreateOrderRequest;
import com.example.nexus.model.Order;
import com.example.nexus.model.OrderItem;
import com.example.nexus.model.Product;
import com.example.nexus.repository.OrderRepository;
import com.example.nexus.repository.OrderItemRepository;
import com.example.nexus.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

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

    // 3. Place custom box order
    @PostMapping("/orders/custom-box")
    @Transactional
    public ResponseEntity<?> placeCustomBoxOrder(@RequestBody CreateOrderRequest request) {
        // Validate request
        if (request.getCustomerId() == null || request.getPartnerId() == null || request.getItems() == null || request.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid order request. Missing required fields.");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        // Calculate box fee
        BigDecimal boxFee = getBoxFee(request.getBoxSize());
        totalAmount = totalAmount.add(boxFee);

        // Fetch products and calculate total items price, check stock
        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + itemReq.getProductId()));
            
            if (product.getStockQuantity() < itemReq.getQuantity()) {
                return ResponseEntity.badRequest().body("Insufficient stock for product: " + product.getName());
            }

            BigDecimal itemSubtotal = product.getPrice().multiply(new BigDecimal(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemSubtotal);
        }

        // Create and save the Order
        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setPartnerId(request.getPartnerId());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setOccasion(request.getOccasion());
        order.setBoxSize(request.getBoxSize());
        order.setGiftMessage(request.getGiftMessage());
        order.setRecipientName(request.getRecipientName());
        order.setWrappingStyle(request.getWrappingStyle());
        order.setStatus("PENDING");
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        // Save OrderItems and update product stock
        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId()).get();
            
            // Decrement stock
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);

            // Create OrderItem
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(savedOrder.getOrderId());
            orderItem.setProductId(product.getId());
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            
            orderItemRepository.save(orderItem);
        }

        return ResponseEntity.ok(savedOrder);
    }

    // 4. Place standard cart order (multi-vendor split)
    @PostMapping("/orders/standard")
    @Transactional
    public ResponseEntity<?> placeStandardOrder(@RequestBody CreateOrderRequest request) {
        if (request.getCustomerId() == null || request.getItems() == null || request.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid order request. Missing required fields.");
        }

        // Group items by partnerId
        java.util.Map<Integer, java.util.List<CreateOrderRequest.OrderItemRequest>> itemsByPartner = new java.util.HashMap<>();
        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + itemReq.getProductId()));
            
            if (product.getStockQuantity() < itemReq.getQuantity()) {
                return ResponseEntity.badRequest().body("Insufficient stock for product: " + product.getName());
            }
            
            itemsByPartner.computeIfAbsent(product.getPartnerId(), k -> new java.util.ArrayList<>()).add(itemReq);
        }

        java.util.List<Order> savedOrders = new java.util.ArrayList<>();

        // Create one order per partner
        for (java.util.Map.Entry<Integer, java.util.List<CreateOrderRequest.OrderItemRequest>> entry : itemsByPartner.entrySet()) {
            Integer partnerId = entry.getKey();
            java.util.List<CreateOrderRequest.OrderItemRequest> partnerItems = entry.getValue();

            BigDecimal totalAmount = BigDecimal.ZERO;
            for (CreateOrderRequest.OrderItemRequest itemReq : partnerItems) {
                Product product = productRepository.findById(itemReq.getProductId()).get();
                BigDecimal itemSubtotal = product.getPrice().multiply(new BigDecimal(itemReq.getQuantity()));
                totalAmount = totalAmount.add(itemSubtotal);
            }

            Order order = new Order();
            order.setCustomerId(request.getCustomerId());
            order.setPartnerId(partnerId);
            order.setDeliveryAddress(request.getDeliveryAddress());
            order.setStatus("PENDING");
            order.setTotalAmount(totalAmount);

            Order savedOrder = orderRepository.save(order);
            savedOrders.add(savedOrder);

            for (CreateOrderRequest.OrderItemRequest itemReq : partnerItems) {
                Product product = productRepository.findById(itemReq.getProductId()).get();
                
                // Decrement stock
                product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
                productRepository.save(product);

                // Create OrderItem
                OrderItem orderItem = new OrderItem();
                orderItem.setOrderId(savedOrder.getOrderId());
                orderItem.setProductId(product.getId());
                orderItem.setQuantity(itemReq.getQuantity());
                orderItem.setUnitPrice(product.getPrice());
                
                orderItemRepository.save(orderItem);
            }
        }

        return ResponseEntity.ok(savedOrders);
    }

    private BigDecimal getBoxFee(String boxSize) {
        if ("SMALL".equalsIgnoreCase(boxSize)) {
            return new BigDecimal("500");
        } else if ("MEDIUM".equalsIgnoreCase(boxSize)) {
            return new BigDecimal("800");
        } else if ("LARGE".equalsIgnoreCase(boxSize)) {
            return new BigDecimal("1200");
        }
        return BigDecimal.ZERO;
    }
}
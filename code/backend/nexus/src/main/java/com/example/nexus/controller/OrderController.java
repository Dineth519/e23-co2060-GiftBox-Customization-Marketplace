package com.example.nexus.controller;

import com.example.nexus.dto.CreateOrderRequest;
import com.example.nexus.model.Order;
import com.example.nexus.model.OrderItem;
import com.example.nexus.model.Product;
import com.example.nexus.model.SubOrder;
import com.example.nexus.repository.OrderRepository;
import com.example.nexus.repository.OrderItemRepository;
import com.example.nexus.repository.ProductRepository;
import com.example.nexus.repository.SubOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.example.nexus.repository.UserRepository;

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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubOrderRepository subOrderRepository;

    // 1. Vendor-specific sub-orders retrieval
    @GetMapping("/vendors/{vendorId}/orders")
    public List<SubOrder> getOrdersByVendor(@PathVariable Integer vendorId) {
        return subOrderRepository.findByVendorId(vendorId);
    }

    // 1b. Customer-specific orders retrieval — each customer sees ONLY their own orders
    @GetMapping("/customers/{customerId}/orders")
    public List<Order> getOrdersByCustomer(@PathVariable Integer customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    // 1c. Customer-specific orders summary
    @GetMapping("/orders/customer/{customerId}/summary")
    public ResponseEntity<?> getCustomerOrderSummary(@PathVariable Integer customerId) {
        List<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        
        int totalOrders = orders.size();
        int delivered = 0;
        int inProgress = 0;
        BigDecimal totalSpent = BigDecimal.ZERO;

        for (Order order : orders) {
            String status = order.getStatus();
            if ("DELIVERED".equalsIgnoreCase(status)) {
                delivered++;
            } else if ("PENDING".equalsIgnoreCase(status) || "CONFIRMED".equalsIgnoreCase(status) || "SHIPPED".equalsIgnoreCase(status) || "ASSEMBLING".equalsIgnoreCase(status) || "PROCESSING".equalsIgnoreCase(status)) {
                inProgress++;
            }
            if (!"CANCELLED".equalsIgnoreCase(status)) {
                totalSpent = totalSpent.add(order.getTotalAmount());
            }
        }

        Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("totalOrders", totalOrders);
        summary.put("delivered", delivered);
        summary.put("inProgress", inProgress);
        summary.put("totalSpent", totalSpent);

        return ResponseEntity.ok(summary);
    }

    // 2. Sub-Order status update (Vendor updating their part)
    @PutMapping("/sub-orders/{subOrderId}/status")
    public ResponseEntity<?> updateSubOrderStatus(@PathVariable Integer subOrderId, @RequestBody Map<String, String> request) {
        return subOrderRepository.findById(subOrderId).map(subOrder -> {
            String newStatus = request.get("status");
            String currentStatus = subOrder.getStatus();

            // Allow vendor to change PENDING_VENDOR_ACCEPTANCE to ACCEPTED_BY_VENDOR or REJECTED
            if ("PENDING_VENDOR_ACCEPTANCE".equals(currentStatus) && ("ACCEPTED_BY_VENDOR".equals(newStatus) || "REJECTED".equals(newStatus))) {
                subOrder.setStatus(newStatus);
                subOrderRepository.save(subOrder);
                checkParentOrderStatus(subOrder.getOrder());
                return ResponseEntity.ok().body("Sub-Order " + newStatus);
            }
            
            // Allow vendor to mark as SENT_TO_ASSEMBLY if it's currently ACCEPTED_BY_VENDOR
            if ("SENT_TO_ASSEMBLY".equals(newStatus) && "ACCEPTED_BY_VENDOR".equals(currentStatus)) {
                subOrder.setStatus(newStatus);
                subOrderRepository.save(subOrder);
                checkParentOrderStatus(subOrder.getOrder());
                return ResponseEntity.ok().body("Sub-Order marked as SENT_TO_ASSEMBLY");
            }

            return ResponseEntity.badRequest().body("Action not allowed for current status");
        }).orElse(ResponseEntity.notFound().build());
    }

    // Internal helper to update parent order status
    private void checkParentOrderStatus(Order order) {
        List<SubOrder> subs = subOrderRepository.findByOrder_OrderId(order.getOrderId());
        boolean allSentToAssembly = true;
        for (SubOrder sub : subs) {
            if (!"SENT_TO_ASSEMBLY".equals(sub.getStatus()) && !"REJECTED".equals(sub.getStatus())) {
                allSentToAssembly = false;
                break;
            }
        }
        if (allSentToAssembly && !"ASSEMBLING".equals(order.getStatus())) {
            order.setStatus("ASSEMBLING");
            orderRepository.save(order);
        }
    }

    // 2b. Get items for an order
    @GetMapping("/orders/{orderId}/items")
    public ResponseEntity<?> getOrderItems(@PathVariable Integer orderId) {
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        List<Map<String, Object>> response = new java.util.ArrayList<>();
        
        for (OrderItem item : items) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("productId", item.getProductId());
            map.put("quantity", item.getQuantity());
            map.put("unitPrice", item.getUnitPrice());
            if (product != null) {
                map.put("name", product.getName());
                map.put("imageUrl", product.getImageUrl());
            } else {
                map.put("name", "Unknown Product");
            }
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    // 3. Place custom box order
    @PostMapping("/orders/custom-box")
    @Transactional
    public ResponseEntity<?> placeCustomBoxOrder(@RequestBody CreateOrderRequest request) {
        return processOrderCheckout(request, "CUSTOM_BOX");
    }

    // 4. Place standard cart order (multi-vendor split)
    @PostMapping("/orders/standard")
    @Transactional
    public ResponseEntity<?> placeStandardOrder(@RequestBody CreateOrderRequest request) {
        return processOrderCheckout(request, "STANDARD");
    }

    private ResponseEntity<?> processOrderCheckout(CreateOrderRequest request, String orderType) {
        try {
            // Validate request
            if (request.getCustomerId() == null) {
                return ResponseEntity.badRequest().body("Validation Error: customerId is required.");
            }
            if (!userRepository.existsById(request.getCustomerId())) {
                return ResponseEntity.badRequest().body("Validation Error: customer with ID " + request.getCustomerId() + " does not exist.");
            }
            if (request.getDeliveryAddress() == null || request.getDeliveryAddress().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Validation Error: deliveryAddress is required.");
            }
            if (request.getItems() == null || request.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body("Validation Error: items list cannot be empty.");
            }
            if ("CUSTOM_BOX".equals(orderType)) {
                if (request.getBoxSize() == null || request.getBoxSize().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body("Validation Error: boxSize is required for custom boxes.");
                }
                if (request.getRecipientName() == null || request.getRecipientName().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body("Validation Error: recipientName is required for custom boxes.");
                }
            }

            BigDecimal totalAmount = BigDecimal.ZERO;
            BigDecimal adminRevenue = BigDecimal.ZERO;
            BigDecimal vendorRevenue = BigDecimal.ZERO;
            BigDecimal commissionRate = new BigDecimal("0.10");
            BigDecimal vendorRate = new BigDecimal("0.90");

            // Calculate box fee for custom boxes
            if ("CUSTOM_BOX".equals(orderType)) {
                BigDecimal boxFee = getBoxFee(request.getBoxSize());
                totalAmount = totalAmount.add(boxFee);
                // Box fee entirely goes to admin
                adminRevenue = adminRevenue.add(boxFee);
            }

            // Group items by vendorId for SubOrders
            java.util.Map<Integer, BigDecimal> vendorTotals = new java.util.HashMap<>();
            java.util.Map<Integer, java.util.List<CreateOrderRequest.OrderItemRequest>> itemsByVendor = new java.util.HashMap<>();

            for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + itemReq.getProductId()));
                
                int stock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                if (stock < itemReq.getQuantity()) {
                    return ResponseEntity.badRequest().body("Insufficient stock for product: " + product.getName());
                }

                BigDecimal itemSubtotal = product.getPrice().multiply(new BigDecimal(itemReq.getQuantity()));
                totalAmount = totalAmount.add(itemSubtotal);
                
                vendorTotals.put(product.getVendorId(), vendorTotals.getOrDefault(product.getVendorId(), BigDecimal.ZERO).add(itemSubtotal));
                itemsByVendor.computeIfAbsent(product.getVendorId(), k -> new java.util.ArrayList<>()).add(itemReq);
                
                // Item revenue split
                adminRevenue = adminRevenue.add(itemSubtotal.multiply(commissionRate));
                vendorRevenue = vendorRevenue.add(itemSubtotal.multiply(vendorRate));
            }

            // Create and save the Parent Order
            Order order = new Order();
            order.setCustomerId(request.getCustomerId());
            order.setVendorId(null); // Parent order is multi-vendor
            order.setDeliveryAddress(request.getDeliveryAddress());
            order.setOrderType(orderType);
            
            if ("CUSTOM_BOX".equals(orderType)) {
                order.setStatus("CONFIRMED"); // Ensure custom boxes start as CONFIRMED for assembler
                order.setOccasion(request.getOccasion());
                order.setBoxSize(request.getBoxSize());
                order.setGiftMessage(request.getGiftMessage());
                order.setRecipientName(request.getRecipientName());
                order.setWrappingStyle(request.getWrappingStyle());
                Map<String, Object> customization = new java.util.LinkedHashMap<>();
                customization.put("ribbonColor", request.getRibbonColor());
                customization.put("cardTemplate", request.getCardTemplate());
                customization.put("senderName", request.getSenderName());
                customization.put("hasWaxSeal", request.getHasWaxSeal());
                customization.put("deliveryDate", request.getDeliveryDate() == null ? null : request.getDeliveryDate().toString());
                
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                order.setCustomBoxDetails(mapper.writeValueAsString(customization));
                order.setDueDate(request.getDeliveryDate() == null ? null : request.getDeliveryDate().atStartOfDay());
            } else {
                order.setStatus("PENDING");
            }

            order.setTotalAmount(totalAmount);
            order.setAdminRevenue(adminRevenue);
            order.setVendorRevenue(vendorRevenue);

            Order savedOrder = orderRepository.saveAndFlush(order);

            // Create SubOrders for each Vendor
            for (java.util.Map.Entry<Integer, BigDecimal> entry : vendorTotals.entrySet()) {
                SubOrder subOrder = new SubOrder();
                subOrder.setOrder(savedOrder);
                subOrder.setVendorId(entry.getKey());
                subOrder.setVendorTotal(entry.getValue());
                subOrder.setStatus("PENDING_VENDOR_ACCEPTANCE");
                subOrderRepository.save(subOrder);
            }

            // Save OrderItems and update product stock
            for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId()).get();
                
                int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                product.setStockQuantity(currentStock - itemReq.getQuantity());
                productRepository.save(product);

                OrderItem orderItem = new OrderItem();
                orderItem.setOrderId(savedOrder.getOrderId());
                orderItem.setProductId(product.getId());
                orderItem.setQuantity(itemReq.getQuantity());
                orderItem.setUnitPrice(product.getPrice());
                
                orderItemRepository.saveAndFlush(orderItem);
            }
            
            java.util.Map<String, Object> orderDto = new java.util.HashMap<>();
            orderDto.put("orderId", savedOrder.getOrderId());
            orderDto.put("orderType", savedOrder.getOrderType());
            orderDto.put("totalAmount", savedOrder.getTotalAmount());
            orderDto.put("status", savedOrder.getStatus());
            orderDto.put("createdAt", savedOrder.getCreatedAt());

            return ResponseEntity.ok(orderDto);
        } catch (Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            return ResponseEntity.status(500).body("Error: " + e.getMessage() + "\n" + sw.toString());
        }
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

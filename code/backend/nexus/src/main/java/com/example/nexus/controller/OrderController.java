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
import org.springframework.security.core.Authentication;
import com.example.nexus.repository.UserRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import tools.jackson.databind.json.JsonMapper;

@RestController
@RequestMapping("/api")
public class OrderController {

    private final JsonMapper json = JsonMapper.builder().build();

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
    public ResponseEntity<?> getOrdersByVendor(@PathVariable Integer vendorId, Authentication authentication) {
        if (!isActor(authentication, "VENDOR", vendorId)) {
            return ResponseEntity.status(403).body("Vendor access denied");
        }
        List<Map<String, Object>> response = subOrderRepository.findByVendorId(vendorId).stream().map(subOrder -> {
            Order order = subOrder.getOrder();
            Map<String, Object> item = new java.util.LinkedHashMap<>();
            item.put("sub_order_id", subOrder.getSubOrderId());
            item.put("order_id", order.getOrderId());
            item.put("vendor_id", subOrder.getVendorId());
            item.put("status", subOrder.getStatus());
            item.put("vendor_total", subOrder.getVendorTotal().multiply(new java.math.BigDecimal("0.9")));
            item.put("total_amount", subOrder.getVendorTotal().multiply(new java.math.BigDecimal("0.9")));
            String customerName = "Unknown";
            if (order.getCustomerId() != null) {
                com.example.nexus.model.User u = userRepository.findById(order.getCustomerId()).orElse(null);
                if (u != null) customerName = u.getName();
            }

            List<Map<String, Object>> itemsList = orderItemRepository.findByOrderId(order.getOrderId()).stream()
                .filter(oi -> {
                    Product p = productRepository.findById(oi.getProductId()).orElse(null);
                    return p != null && p.getVendorId().equals(subOrder.getVendorId());
                }).map(oi -> {
                    Product p = productRepository.findById(oi.getProductId()).orElse(null);
                    Map<String, Object> i = new java.util.HashMap<>();
                    i.put("quantity", oi.getQuantity());
                    i.put("name", p != null ? p.getName() : "Unknown");
                    i.put("imageUrl", p != null ? p.getImageUrl() : null);
                    return i;
                }).toList();

            item.put("customer_name", customerName);
            item.put("items", itemsList);
            item.put("special_notes", order.getSpecialNotes());
            item.put("created_at", subOrder.getCreatedAt());
            return item;
        }).toList();
        return ResponseEntity.ok(response);
    }

    // 1b. Customer-specific orders retrieval — each customer sees ONLY their own orders
    @GetMapping("/customers/{customerId}/orders")
    public ResponseEntity<?> getOrdersByCustomer(@PathVariable Integer customerId, Authentication authentication) {
        if (!isActor(authentication, "CUSTOMER", customerId)) {
            return ResponseEntity.status(403).body("Customer access denied");
        }
        return ResponseEntity.ok(orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId));
    }

    // 1c. Customer-specific orders summary
    @GetMapping("/orders/customer/{customerId}/summary")
    public ResponseEntity<?> getCustomerOrderSummary(@PathVariable Integer customerId, Authentication authentication) {
        if (!isActor(authentication, "CUSTOMER", customerId)) {
            return ResponseEntity.status(403).body("Customer access denied");
        }
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

    // 2. Parent-order status update (assigned assembler or owning customer)
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Integer orderId,
            @RequestBody Map<String, String> request, Authentication authentication) {
        var found = orderRepository.findById(orderId);
        if (found.isEmpty()) return ResponseEntity.notFound().build();

        Order order = found.get();
        String next = request.get("status");
        String current = order.getStatus();
        Integer actorId = authentication != null && authentication.getDetails() instanceof Integer id ? id : null;
        boolean assembler = hasRole(authentication, "ASSEMBLER") && actorId != null && actorId.equals(order.getAssemblerId());
        boolean customer = hasRole(authentication, "CUSTOMER") && actorId != null && actorId.equals(order.getCustomerId());

        boolean allowed = assembler && "READY".equals(current) && "SHIPPED".equals(next)
                || assembler && "SHIPPED".equals(current) && "DELIVERED".equals(next)
                || customer && "DELIVERED".equals(current) && "RECEIVED".equals(next);

        if (!allowed) return ResponseEntity.badRequest().body("Action not allowed for this user or current status");
        order.setStatus(next);
        orderRepository.save(order);
        return ResponseEntity.ok().body("Order " + next);
    }

    // 2. Sub-Order status update (Vendor updating their part)
    @PutMapping("/sub-orders/{subOrderId}/status")
    public ResponseEntity<?> updateSubOrderStatus(@PathVariable Integer subOrderId,
            @RequestBody Map<String, String> request, Authentication authentication) {
        return subOrderRepository.findById(subOrderId).map(subOrder -> {
            if (!isActor(authentication, "VENDOR", subOrder.getVendorId())) {
                return ResponseEntity.status(403).body("Vendor access denied");
            }
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

    // Make the order available to assemblers as soon as one vendor accepts it.
    // This keeps a multi-vendor order from being blocked by vendors that have not
    // yet responded. The assembler workflow itself changes CONFIRMED to ASSEMBLING.
    private void checkParentOrderStatus(Order order) {
        List<SubOrder> subs = subOrderRepository.findByOrder_OrderId(order.getOrderId());
        boolean anyAccepted = subs.stream().anyMatch(sub ->
                Set.of("ACCEPTED_BY_VENDOR", "SENT_TO_ASSEMBLY").contains(sub.getStatus()));
        boolean allRejected = !subs.isEmpty()
                && subs.stream().allMatch(sub -> "REJECTED".equals(sub.getStatus()));

        if ("PENDING".equals(order.getStatus()) && anyAccepted) {
            order.setStatus("CONFIRMED");
            orderRepository.save(order);
        } else if ("PENDING".equals(order.getStatus()) && allRejected) {
            order.setStatus("CANCELLED");
            orderRepository.save(order);
        }
    }

    // 2b. Get items for an order
    @GetMapping("/orders/{orderId}/items")
    public ResponseEntity<?> getOrderItems(@PathVariable Integer orderId, Authentication authentication) {
        var order = orderRepository.findById(orderId);
        if (order.isEmpty()) return ResponseEntity.notFound().build();
        if (!canAccessOrder(authentication, order.get())) {
            return ResponseEntity.status(403).body("Order access denied");
        }
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
    public ResponseEntity<?> placeCustomBoxOrder(@RequestBody CreateOrderRequest request,
            Authentication authentication) {
        return processOrderCheckout(request, "CUSTOM_BOX", authentication);
    }

    // 4. Place standard cart order (multi-vendor split)
    @PostMapping("/orders/standard")
    @Transactional
    public ResponseEntity<?> placeStandardOrder(@RequestBody CreateOrderRequest request,
            Authentication authentication) {
        return processOrderCheckout(request, "STANDARD", authentication);
    }

    private ResponseEntity<?> processOrderCheckout(CreateOrderRequest request, String orderType,
            Authentication authentication) {
            if (!isCustomer(authentication, request.getCustomerId())) {
                return ResponseEntity.status(403).body("A customer may place orders only for their own account.");
            }
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

            for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
                if (itemReq == null || itemReq.getProductId() == null) {
                    return ResponseEntity.badRequest().body("Validation Error: every item must include a productId.");
                }
                if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                    return ResponseEntity.badRequest().body("Validation Error: item quantities must be positive integers.");
                }
                Product product = productRepository.findById(itemReq.getProductId()).orElse(null);
                if (product == null) {
                    return ResponseEntity.badRequest().body(
                            "A product in your cart is no longer available (ID: " + itemReq.getProductId()
                                    + "). Remove it from the cart and try again.");
                }
                
                int stock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                if (stock < itemReq.getQuantity()) {
                    return ResponseEntity.badRequest().body("Insufficient stock for product: " + product.getName());
                }

                BigDecimal itemSubtotal = product.getPrice().multiply(new BigDecimal(itemReq.getQuantity()));
                totalAmount = totalAmount.add(itemSubtotal);
                
                vendorTotals.put(product.getVendorId(), vendorTotals.getOrDefault(product.getVendorId(), BigDecimal.ZERO).add(itemSubtotal));
                
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
            
            order.setStatus("PENDING");
            if ("CUSTOM_BOX".equals(orderType)) {
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
                
                order.setCustomBoxDetails(json.writeValueAsString(customization));
                order.setDueDate(request.getDeliveryDate() == null ? null : request.getDeliveryDate().atStartOfDay());
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
            return ResponseEntity.ok(orderDto);
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

    private boolean isCustomer(Authentication authentication, Integer customerId) {
        return isActor(authentication, "CUSTOMER", customerId);
    }

    private boolean isActor(Authentication authentication, String role, Integer expectedId) {
        return expectedId != null && hasRole(authentication, role)
                && authentication.getDetails() instanceof Integer id && expectedId.equals(id);
    }

    private boolean canAccessOrder(Authentication authentication, Order order) {
        if (hasRole(authentication, "ADMIN")) return true;
        Integer actorId = authentication != null && authentication.getDetails() instanceof Integer id ? id : null;
        if (actorId == null) return false;
        if (hasRole(authentication, "CUSTOMER") && actorId.equals(order.getCustomerId())) return true;
        if (hasRole(authentication, "ASSEMBLER")
                && (order.getAssemblerId() == null || actorId.equals(order.getAssemblerId()))) return true;
        return hasRole(authentication, "VENDOR") && subOrderRepository.findByOrder_OrderId(order.getOrderId()).stream()
                .anyMatch(subOrder -> actorId.equals(subOrder.getVendorId()));
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }
}

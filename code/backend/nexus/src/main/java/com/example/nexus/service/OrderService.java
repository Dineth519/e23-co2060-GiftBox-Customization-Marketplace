package com.example.nexus.service;

import com.example.nexus.dto.CheckoutRequest;
import com.example.nexus.entity.CartItemEntity;
import com.example.nexus.model.Order;
import com.example.nexus.model.OrderItem;
import com.example.nexus.repository.*;
import com.example.nexus.model.Product;
import com.example.nexus.model.GiftBox;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class OrderService {

    @Autowired private OrderRepository     orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;
    @Autowired private CartRepository      cartRepository;
    @Autowired private CartItemRepository  cartItemRepository;
    @Autowired private ProductRepository   productRepository;
    @Autowired private GiftBoxRepository   giftBoxRepository;
    @Autowired private CartService         cartService;

    // ════════════════════════════════════════════════════
    //  CHECKOUT
    //  1. Cart items ගන්නවා
    //  2. Vendor අනුව group කරනවා
    //  3. Vendor per Order create කරනවා
    //  4. OrderItems save කරනවා
    //  5. Cart clear කරනවා
    //  Returns: created order IDs list
    // ════════════════════════════════════════════════════
    @Transactional
    public List<Integer> checkout(HttpSession session, CheckoutRequest request) {

        // Debug logging
        System.out.println("--- Checkout Debug ---");
        System.out.println("FullName: " + request.getFullName());
        System.out.println("Phone: " + request.getPhone());
        System.out.println("Address1: " + request.getAddressLine1());
        System.out.println("City: " + request.getCity());

        // Session ෙකෙ customer_id ගන්නවා
        Integer customerId = (Integer) session.getAttribute("customer_id");
        if (customerId == null) {
            throw new RuntimeException("Not logged in");
        }

        // DB cart ෙකෙ items ගන්නවා
        var cartOpt = cartRepository.findByCustomerId(customerId);
        if (cartOpt.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        List<CartItemEntity> cartItems =
            cartItemRepository.findByCart_CartId(cartOpt.get().getCartId());

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // ── Step 1: Cart items vendor අනුව group කරනවා ──
        // Map<partnerId, List<CartItemEntity>>
        Map<Integer, List<CartItemEntity>> byVendor = new LinkedHashMap<>();

        for (CartItemEntity cartItem : cartItems) {
            Integer partnerId = resolvePartnerId(cartItem);

            if (partnerId == null) continue; // invalid item — skip

            byVendor.computeIfAbsent(partnerId, k -> new ArrayList<>()).add(cartItem);
        }

        if (byVendor.isEmpty()) {
            throw new RuntimeException("No valid items in cart");
        }

        // ── Step 2: Vendor per Order create ─────────────
        List<Integer> createdOrderIds = new ArrayList<>();

        for (Map.Entry<Integer, List<CartItemEntity>> entry : byVendor.entrySet()) {
            Integer partnerId       = entry.getKey();
            List<CartItemEntity> vendorItems = entry.getValue();

            // Vendor ගේ items total calculate
            BigDecimal vendorTotal = vendorItems.stream()
                .map(i -> BigDecimal.valueOf(i.getUnitPrice())
                    .multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Order create
            Order order = new Order();
            order.setCustomerId(customerId);
            order.setPartnerId(partnerId);
            order.setStatus("PENDING");
            order.setDeliveryAddress(request.getDeliveryAddress());  // Uses helper method
            order.setSpecialNotes(request.getSpecialNotes());
            order.setTotalAmount(vendorTotal);

            Order savedOrder = orderRepository.save(order);
            createdOrderIds.add(savedOrder.getOrderId());

            System.out.println("Order created: ID=" + savedOrder.getOrderId() + ", Partner=" + partnerId);

            // OrderItems save
            for (CartItemEntity cartItem : vendorItems) {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrderId(savedOrder.getOrderId());
                orderItem.setPartnerId(partnerId);
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setUnitPrice(BigDecimal.valueOf(cartItem.getUnitPrice()));

                if (cartItem.getGiftBoxId() != null) {
                    orderItem.setGiftBoxId(cartItem.getGiftBoxId());
                } else {
                    orderItem.setProductId(cartItem.getProductId());
                }

                orderItemRepository.save(orderItem);
            }
        }

        // ── Step 3: Cart clear ───────────────────────────
        // DB cart_items delete + session clear
        cartService.clearCart(session);

        System.out.println("Checkout complete. Orders created: " + createdOrderIds);

        return createdOrderIds;
    }

    // ── Resolve partner_id from cart item ───────────────
    // Product cart item නම් → products table ෙකෙ partner_id ගන්නවා
    // Gift box cart item නම් → gift_boxes table ෙකෙ partner_id ගන්නවා
    private Integer resolvePartnerId(CartItemEntity cartItem) {
        if (cartItem.getGiftBoxId() != null) {
            return giftBoxRepository.findById(cartItem.getGiftBoxId())
                .map(GiftBox::getPartnerId)
                .orElse(null);
        } else {
            return productRepository.findById(cartItem.getProductId())
                .map(Product::getPartnerId)
                .orElse(null);
        }
    }
}
package com.example.nexus.controller;

// ═══════════════════════════════════════════════════════
//  GET    /api/cart                       → retrieve cart
//  POST   /api/cart/add                   → add product or gift box
//  DELETE /api/cart/remove/{productId}    → remove product
//  DELETE /api/cart/remove/giftbox/{id}   → [NEW] remove gift box
//  PUT    /api/cart/update                → update quantity
//  DELETE /api/cart/clear                 → clear cart
//  GET    /api/cart/total                 → total only
// ═══════════════════════════════════════════════════════

import com.example.nexus.dto.AddToCart;
import com.example.nexus.dto.CartResponse;
import com.example.nexus.dto.UpdateQuantity;
import com.example.nexus.model.CartItem;
import com.example.nexus.service.CartService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(
    origins          = "http://localhost:3000",
    allowCredentials = "true"
)
public class CartController {

    @Autowired
    private CartService cartService;

    // ── GET /api/cart ──────────────────────────────────────
    // Logged in  → DB load + session sync
    // Guest      → session only
    @GetMapping
    public ResponseEntity<CartResponse> getCart(HttpSession session) {
        List<CartItem> items     = cartService.getCartItems(session);
        double         total     = cartService.calculateTotal(items);
        int            itemCount = cartService.calculateItemCount(items);

        return ResponseEntity.ok(
            new CartResponse(items, total, itemCount, "Cart loaded.")
        );
    }

    // ── POST /api/cart/add ────────────────────────────────
    // Body: { productId?, giftBoxId?, name, price, imageUrl }
    // productId OR giftBoxId — one must be set
    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(
            @RequestBody AddToCart dto,
            HttpSession session) {

        CartResponse response = cartService.addItem(session, dto);
        return ResponseEntity.ok(response);
    }

    // ── DELETE /api/cart/remove/{productId} ───────────────
    // Product remove button click
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<CartResponse> removeFromCart(
            @PathVariable int productId,
            HttpSession session) {

        CartResponse response = cartService.removeItem(session, productId);
        return ResponseEntity.ok(response);
    }

    // ── DELETE /api/cart/remove/giftbox/{giftBoxId} ───────
    // [NEW] Gift box remove button click
    @DeleteMapping("/remove/giftbox/{giftBoxId}")
    public ResponseEntity<CartResponse> removeGiftBoxFromCart(
            @PathVariable int giftBoxId,
            HttpSession session) {

        CartResponse response = cartService.removeGiftBoxItem(session, giftBoxId);
        return ResponseEntity.ok(response);
    }

    // ── PUT /api/cart/update ──────────────────────────────
    // Quantity + / - buttons
    // Body: { productId, quantity }
    @PutMapping("/update")
    public ResponseEntity<CartResponse> updateQuantity(
            @RequestBody UpdateQuantity dto,
            HttpSession session) {

        CartResponse response = cartService.updateQuantity(
            session,
            dto.getProductId(),
            dto.getQuantity()
        );
        return ResponseEntity.ok(response);
    }

    // ── DELETE /api/cart/clear ────────────────────────────
    // "Clear Cart" button / after checkout
    // Logged in → DB clear + session clear
    // Guest     → session clear only
    @DeleteMapping("/clear")
    public ResponseEntity<CartResponse> clearCart(HttpSession session) {
        CartResponse response = cartService.clearCart(session);
        return ResponseEntity.ok(response);
    }

    // ── GET /api/cart/total ───────────────────────────────
    // Checkout summary page — total + count only
    @GetMapping("/total")
    public ResponseEntity<Map<String, Object>> getCartTotal(
            HttpSession session) {

        List<CartItem> items     = cartService.getCartItems(session);
        double         total     = cartService.calculateTotal(items);
        int            itemCount = cartService.calculateItemCount(items);

        return ResponseEntity.ok(Map.of(
            "total",     total,
            "itemCount", itemCount
        ));
    }
}
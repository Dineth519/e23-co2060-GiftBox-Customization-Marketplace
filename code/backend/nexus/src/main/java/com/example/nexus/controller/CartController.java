package com.example.nexus.controller;

// ═══════════════════════════════════════════════════════
//  GET    /api/cart                  → retrieve cart
//  POST   /api/cart/add              → add item
//  DELETE /api/cart/remove/{id}      → remove item
//  PUT    /api/cart/update           → update quantity
//  DELETE /api/cart/clear            → clear cart
//  GET    /api/cart/total            → Issue #41 total only
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
public class CartController {

    @Autowired
    private CartService cartService;

    // ── GET /api/cart ─────────────────────────────────────
    // Load current cart when React cart page opens
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
    // "Add to Cart" / "+" button click
    // Body: { productId, name, price, imageUrl }
    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(
            @RequestBody AddToCart dto,
            HttpSession session) {

        CartResponse response = cartService.addItem(session, dto);
        return ResponseEntity.ok(response);
    }

    // ── DELETE /api/cart/remove/{productId} ───────────────
    // Cart item remove button click
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<CartResponse> removeFromCart(
            @PathVariable int productId,
            HttpSession session) {

        CartResponse response = cartService.removeItem(session, productId);
        return ResponseEntity.ok(response);
    }

    // ── PUT /api/cart/update ──────────────────────────────
    // Quantity + / - button click
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
    // Clear cart after checkout or "Clear Cart" button click
    @DeleteMapping("/clear")
    public ResponseEntity<CartResponse> clearCart(HttpSession session) {
        CartResponse response = cartService.clearCart(session);
        return ResponseEntity.ok(response);
    }


    // ── GET /api/cart/total ───────────────────────────────
    // Total only — used by checkout summary page
    @GetMapping("/total")
    public ResponseEntity<Map<String, Object>> getCartTotal(
            HttpSession session) {

        List<CartItem> items     = cartService.getCartItems(session);
        double         total     = cartService.calculateTotal(items);
        int            itemCount = cartService.calculateItemCount(items);

        // { "total": 15800.00, "itemCount": 3 }
        return ResponseEntity.ok(Map.of(
            "total",     total,
            "itemCount", itemCount
        ));
    }
}
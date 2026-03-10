package com.example.nexus.service;

import com.example.nexus.dto.AddToCart;
import com.example.nexus.dto.CartResponse;
import com.example.nexus.model.CartItem;
import com.example.nexus.model.SessionCartManager;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    // Session cart ගන්නවා (නැත්නම් initialize කරනවා)
    public List<CartItem> getCartItems(HttpSession session) {
        return SessionCartManager.getOrCreateCart(session);
    }

    // ── Add item ─────────────────────────────────────────
    public CartResponse addItem(HttpSession session, AddToCart dto) {
        List<CartItem> cart = getCartItems(session);

        // Already cart එකේ තියෙනවාද?
        for (CartItem existing : cart) {
            if (existing.getProductId() == dto.getProductId()) {
                // තියෙනවා නම් quantity++ කරනවා
                existing.setQuantity(existing.getQuantity() + 1);
                SessionCartManager.saveCart(session, cart);
                return buildResponse(cart, "Item quantity updated!");
            }
        }

        // නැත්නම් අලුතෙන් add කරනවා
        cart.add(new CartItem(
            dto.getProductId(),
            dto.getName(),
            dto.getPrice(),
            1,
            dto.getImageUrl()
        ));

        SessionCartManager.saveCart(session, cart);
        return buildResponse(cart, dto.getName() + " added to cart!");
    }

    // ── Remove item ──────────────────────────────────────
    public CartResponse removeItem(HttpSession session, int productId) {
        List<CartItem> cart = getCartItems(session);

        cart.removeIf(item -> item.getProductId() == productId);

        SessionCartManager.saveCart(session, cart);
        return buildResponse(cart, "Item removed from cart.");
    }

    // ── Update quantity (+ / - buttons) ─────────────────
    public CartResponse updateQuantity(HttpSession session,
                                          int productId,
                                          int newQty) {
        List<CartItem> cart = getCartItems(session);

        // Quantity 0 or less නම් remove කරනවා
        if (newQty <= 0) {
            return removeItem(session, productId);
        }

        for (CartItem item : cart) {
            if (item.getProductId() == productId) {
                item.setQuantity(newQty);
                break;
            }
        }

        SessionCartManager.saveCart(session, cart);
        return buildResponse(cart, "Quantity updated.");
    }

    // ── Clear entire cart ────────────────────────────────
    public CartResponse clearCart(HttpSession session) {
        SessionCartManager.destroyCart(session);
        return buildResponse(List.of(), "Cart cleared.");
    }

    // සම්පූර්ණ cart total calculate කරනවා
    // හැම item: price × quantity → sum කරනවා
    public double calculateTotal(List<CartItem> cart) {
        double total = 0.0;

        for (CartItem item : cart) {
            total += item.getSubtotal();  // price * quantity
        }

        // Round to 2 decimal places (LKR cents)
        return Math.round(total * 100.0) / 100.0;
    }

    // Item count — header badge number
    // හැම item quantity sum කරනවා
    public int calculateItemCount(List<CartItem> cart) {
        int count = 0;
        for (CartItem item : cart) {
            count += item.getQuantity();
        }
        return count;
    }

    // ── Build response helper ────────────────────────────
    // හැම operation කෙනෙකෙන් පස්සේ React ට
    // updated cart + total + badge count එකක් දෙනවා
    private CartResponse buildResponse(List<CartItem> cart,
                                          String message) {
        double total     = calculateTotal(cart);
        int    itemCount = calculateItemCount(cart);

        return new CartResponse(cart, total, itemCount, message);
    }
}
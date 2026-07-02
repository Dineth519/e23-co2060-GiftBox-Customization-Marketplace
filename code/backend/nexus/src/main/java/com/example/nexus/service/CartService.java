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

    // Retrieve the session cart, or initialize a new one if it doesn't exist
    public List<CartItem> getCartItems(HttpSession session) {
        return SessionCartManager.getOrCreateCart(session);
    }

    // ── Add item ─────────────────────────────────────────
    public CartResponse addItem(HttpSession session, AddToCart dto) {
        List<CartItem> cart = getCartItems(session);

        // Check if the product already exists in the cart
        for (CartItem existing : cart) {
            if (existing.getProductId() == dto.getProductId()) {
                // Product already in cart — increment quantity by 1
                existing.setQuantity(existing.getQuantity() + 1);
                SessionCartManager.saveCart(session, cart);
                return buildResponse(cart, "Item quantity updated!");
            }
        }

        // Product not in cart — add as a new item with quantity 1
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

        // If quantity is 0 or less, remove the item from the cart entirely
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

    // Calculate the total price of all items in the cart
    // Each item contributes: price × quantity
    public double calculateTotal(List<CartItem> cart) {
        double total = 0.0;

        for (CartItem item : cart) {
            total += item.getSubtotal();  // price * quantity
        }

        // Round to 2 decimal places (LKR cents)
        return Math.round(total * 100.0) / 100.0;
    }

    // Calculate total item count across all cart entries (used for navbar badge)
    public int calculateItemCount(List<CartItem> cart) {
        int count = 0;
        for (CartItem item : cart) {
            count += item.getQuantity();
        }
        return count;
    }

    // ── Build response helper ────────────────────────────
    // After every cart operation, return the updated cart state
    // including the updated items list, total price, and item count badge
    private CartResponse buildResponse(List<CartItem> cart,
                                          String message) {
        double total     = calculateTotal(cart);
        int    itemCount = calculateItemCount(cart);

        return new CartResponse(cart, total, itemCount, message);
    }
}
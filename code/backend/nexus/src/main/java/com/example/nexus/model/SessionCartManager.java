package com.example.nexus.model;

// HttpSession cart management helper.
// Service layer calls methods here.

import jakarta.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;

public class SessionCartManager {

    // Session key — cart is stored with this name
    public static final String CART_KEY = "giftora_cart";

    // ── Session cart initialize / fetch ─────────────────
    // If cart doesn't exist, create an empty ArrayList and save to session.
    // If it exists, return the existing cart.
    @SuppressWarnings("unchecked")
    public static List<CartItem> getOrCreateCart(HttpSession session) {
        List<CartItem> cart =
            (List<CartItem>) session.getAttribute(CART_KEY);

        if (cart == null) {
            cart = new ArrayList<>();
            session.setAttribute(CART_KEY, cart);
        }

        return cart;
    }

    // ── Save cart to session ────────────────────────────
    public static void saveCart(HttpSession session, List<CartItem> cart) {
        session.setAttribute(CART_KEY, cart);
    }

    // ── Remove cart from session ────────────────────────
    public static void destroyCart(HttpSession session) {
        session.removeAttribute(CART_KEY);
    }
}
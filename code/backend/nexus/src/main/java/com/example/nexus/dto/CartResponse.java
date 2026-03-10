package com.example.nexus.dto;

// Response shape returned to React frontend.
// Contains items list, total price, and badge count.
// This response is returned for every cart operation

import com.example.nexus.model.CartItem;
import java.util.List;

public class CartResponse {

    private List<CartItem> items;       // cart items list
    private double         total;       // Issue #41 — total price (LKR)
    private int            itemCount;   // Header badge number
    private String         message;     // success / error message

    // ── Constructor ──────────────────────────────────────
    public CartResponse(List<CartItem> items,
                           double total,
                           int itemCount,
                           String message) {
        this.items     = items;
        this.total     = total;
        this.itemCount = itemCount;
        this.message   = message;
    }

    // ── Getters ──────────────────────────────────────────
    public List<CartItem> getItems()     { return items;     }
    public double         getTotal()     { return total;     }
    public int            getItemCount() { return itemCount; }
    public String         getMessage()   { return message;   }
}
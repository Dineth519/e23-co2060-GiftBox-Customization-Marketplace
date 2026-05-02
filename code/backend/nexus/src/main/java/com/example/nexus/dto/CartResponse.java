package com.example.nexus.dto;

import com.example.nexus.model.CartItem;
import java.util.List;

// ── Response returned to React for every cart operation ──
// items     → full cart item list (for cart page render)
// total     → LKR total (for order summary)
// itemCount → badge count (for header icon)
// message   → toast / debug message

public class CartResponse {

    private List<CartItem> items;
    private double         total;
    private int            itemCount;
    private String         message;

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
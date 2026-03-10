package com.example.nexus.model;

// Stored in HttpSession as List<CartItem>

public class CartItem {

    private int    productId;  
    private String name;       
    private double price;       
    private int    quantity;   
    private String imageUrl;   

    // ── Constructor ──────────────────────────────────────
    public CartItem(int productId, String name,
                    double price, int quantity, String imageUrl) {
        this.productId = productId;
        this.name      = name;
        this.price     = price;
        this.quantity  = quantity;
        this.imageUrl  = imageUrl;
    }

    // ── Getters ──────────────────────────────────────────
    public int    getProductId() { return productId; }
    public String getName()      { return name;      }
    public double getPrice()     { return price;     }
    public int    getQuantity()  { return quantity;  }
    public String getImageUrl()  { return imageUrl;  }

    // ── Setters ──────────────────────────────────────────
    public void setQuantity(int quantity) { this.quantity = quantity; }

    // ── Subtotal (Issue #41 total calculation helper) ────
    // price × quantity = total price for this item
    public double getSubtotal() {
        return price * quantity;
    }
}
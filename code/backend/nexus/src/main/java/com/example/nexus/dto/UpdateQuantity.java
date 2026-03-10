package com.example.nexus.dto;

// DTO for cart quantity update (+ / - buttons)
// PUT /api/cart/update request body shape

public class UpdateQuantity {

    private int productId;
    private int quantity;   // new quantity value

    // Getters
    public int getProductId() { return productId; }
    public int getQuantity()  { return quantity;  }

    // Setters
    public void setProductId(int productId) { this.productId = productId; }
    public void setQuantity(int quantity)   { this.quantity  = quantity;  }
}
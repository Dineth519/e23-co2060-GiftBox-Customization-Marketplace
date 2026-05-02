package com.example.nexus.entity;

import jakarta.persistence.*;

// ── Maps to `cart_items` table in DB ────────────────────
// Each row = one product OR one gift_box in the cart
// unit_price is snapshotted at add-time (price won't drift)

@Entity
@Table(name = "cart_items")
public class CartItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_item_id")
    private Integer cartItemId;

    // Many items → one cart
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private CartEntity cart;

    // product_id OR gift_box_id — one will be NULL (DB constraint enforces this)
    @Column(name = "product_id")
    private Integer productId;

    @Column(name = "gift_box_id")
    private Integer giftBoxId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    // Price at time of adding — so price changes don't affect cart
    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    // ── Getters ──────────────────────────────────────────
    public Integer    getCartItemId() { return cartItemId; }
    public CartEntity getCart()       { return cart;       }
    public Integer    getProductId()  { return productId;  }
    public Integer    getGiftBoxId()  { return giftBoxId;  }
    public Integer    getQuantity()   { return quantity;   }
    public Double     getUnitPrice()  { return unitPrice;  }

    // Subtotal helper — quantity × unit price
    public double getSubtotal() {
        return quantity * unitPrice;
    }

    // ── Setters ──────────────────────────────────────────
    public void setCart(CartEntity cart)         { this.cart      = cart;      }
    public void setProductId(Integer productId)  { this.productId = productId; }
    public void setGiftBoxId(Integer giftBoxId)  { this.giftBoxId = giftBoxId; }
    public void setQuantity(Integer quantity)    { this.quantity  = quantity;  }
    public void setUnitPrice(Double unitPrice)   { this.unitPrice = unitPrice; }
}
package com.example.nexus.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// ── Maps to `cart` table in DB ───────────────────────────
// One row per logged-in customer
// Guest users don't get a DB row — session only

@Entity
@Table(name = "cart")
public class CartEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_id")
    private Integer cartId;

    // One customer → one cart (UNIQUE in DB)
    @Column(name = "customer_id", nullable = false, unique = true)
    private Integer customerId;

    // Cart items — cascade delete when cart deleted
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CartItemEntity> items = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ────────────────────────────────
    public Integer       getCartId()     { return cartId;     }
    public Integer       getCustomerId() { return customerId; }
    public List<CartItemEntity> getItems() { return items;   }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public LocalDateTime getUpdatedAt()  { return updatedAt; }

    public void setCustomerId(Integer customerId) { this.customerId = customerId; }
    public void setItems(List<CartItemEntity> items) { this.items = items; }
}
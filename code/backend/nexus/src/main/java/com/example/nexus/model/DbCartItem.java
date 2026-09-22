package com.example.nexus.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cart_items")
@Data
public class DbCartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_item_id")
    private Integer cartItemId;

    @Column(name = "cart_id", nullable = false)
    private Integer cartId;

    @Column(name = "product_id")
    private Integer productId;

    @Column(name = "gift_box_id")
    private Integer giftBoxId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;
}

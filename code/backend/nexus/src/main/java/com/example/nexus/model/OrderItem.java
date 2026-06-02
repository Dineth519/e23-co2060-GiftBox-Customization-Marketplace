package com.example.nexus.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "order_items")
@Data
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "order_id", nullable = false)
    @JsonProperty("order_id")
    private Integer orderId;

    @Column(name = "product_id")
    @JsonProperty("product_id")
    private Integer productId;

    @Column(name = "gift_box_id")
    @JsonProperty("gift_box_id")
    private Integer giftBoxId;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false)
    @JsonProperty("unit_price")
    private BigDecimal unitPrice;

    @Column(insertable = false, updatable = false)
    private BigDecimal subtotal;
}

package com.example.nexus.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonProperty;

// ── Maps to `order_items` table ──────────────────────────
// Each row = one product OR one gift_box in an order
// partner_id — [NEW] added to track which vendor owns this item

@Entity
@Table(name = "order_items")
@Data
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "order_id")
    @JsonProperty("order_id")
    private Integer orderId;

    // [NEW] — DB schema change ෙකෙ add කළ field
    @Column(name = "partner_id")
    @JsonProperty("partner_id")
    private Integer partnerId;

    // product_id OR gift_box_id — one will be NULL
    @Column(name = "product_id")
    @JsonProperty("product_id")
    private Integer productId;

    @Column(name = "gift_box_id")
    @JsonProperty("gift_box_id")
    private Integer giftBoxId;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "unit_price")
    @JsonProperty("unit_price")
    private BigDecimal unitPrice;

    // subtotal — DB GENERATED ALWAYS column (insertable=false, updatable=false)
    @Column(name = "subtotal", insertable = false, updatable = false)
    private BigDecimal subtotal;
}
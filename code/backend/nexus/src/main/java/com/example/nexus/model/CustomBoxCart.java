package com.example.nexus.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "custom_box_cart", uniqueConstraints = @UniqueConstraint(columnNames = {"customer_id", "draft_key"}))
@Data
public class CustomBoxCart {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "customer_id", nullable = false)
    private Integer customerId;
    @Column(name = "draft_key", nullable = false, length = 36)
    private String draftKey;
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String configuration;
    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;
    @Column(name = "order_id")
    private Integer orderId;
}

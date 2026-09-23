package com.example.nexus.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "sub_orders")
@Data
public class SubOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sub_order_id")
    @JsonProperty("sub_order_id")
    private Integer subOrderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "vendor_id", nullable = false)
    @JsonProperty("vendor_id")
    private Integer vendorId;

    @Column(name = "status")
    private String status;

    @Column(name = "vendor_total", nullable = false)
    @JsonProperty("vendor_total")
    private BigDecimal vendorTotal;

    @Column(name = "created_at", insertable = false, updatable = false)
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}

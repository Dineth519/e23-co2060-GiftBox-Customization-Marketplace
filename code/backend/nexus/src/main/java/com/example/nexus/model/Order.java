package com.example.nexus.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "orders")
@Data
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    @JsonProperty("order_id")
    private Integer orderId;

    @Column(name = "customer_id")
    @JsonProperty("customer_id")
    private Integer customerId;

    @Column(name = "vendor_id")
    @JsonProperty("vendor_id")
    private Integer vendorId;

    @Column(name = "assembler_id")
    @JsonProperty("assembler_id")
    private Integer assemblerId;

    @Column(name = "status")
    private String status;

    @Column(name = "delivery_address")
    @JsonProperty("delivery_address")
    private String deliveryAddress;

    @Column(name = "special_notes")
    @JsonProperty("special_notes")
    private String specialNotes;

    @Column(name = "total_amount")
    @JsonProperty("total_amount")
    private BigDecimal totalAmount;

    @Column(name = "occasion")
    private String occasion;

    @Column(name = "box_size")
    @JsonProperty("box_size")
    private String boxSize;

    @Column(name = "gift_message")
    @JsonProperty("gift_message")
    private String giftMessage;

    @Column(name = "recipient_name")
    @JsonProperty("recipient_name")
    private String recipientName;

    @Column(name = "wrapping_style")
    @JsonProperty("wrapping_style")
    private String wrappingStyle;

    @Column(name = "order_type")
    @JsonProperty("order_type")
    private String orderType;

    @Column(name = "created_at", insertable = false, updatable = false)
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
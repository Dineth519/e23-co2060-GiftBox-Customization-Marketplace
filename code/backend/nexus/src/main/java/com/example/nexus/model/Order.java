package com.example.nexus.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.checkerframework.checker.units.qual.C;

@Entity
@Table(name = "orders")
@Data 
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer orderId;

    @Column(name = "customer_id")
    private Integer customerId;

    @Column(name = "partner_id")
    private Integer partnerId;

    @Column(name = "assembler_id")
    private Integer assemblerId;

    @Column(name = "status")
    private String status; 
    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "special_notes")
    private String specialNotes;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
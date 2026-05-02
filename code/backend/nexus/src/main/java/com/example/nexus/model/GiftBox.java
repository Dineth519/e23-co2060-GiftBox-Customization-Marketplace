package com.example.nexus.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "gift_boxes")
@Data
public class GiftBox {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer giftBoxId;
    
    private String name;
    private BigDecimal price;
    private Integer partnerId; // මේක තමයි Vendor ව අඳුරගන්න පාවිච්චි කරන්නේ
    private String description;
}
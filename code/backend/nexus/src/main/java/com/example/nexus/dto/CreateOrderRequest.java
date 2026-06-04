package com.example.nexus.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest {
    private Integer customerId;
    private Integer partnerId;
    private String deliveryAddress;
    private String occasion;
    private String boxSize;
    private String giftMessage;
    private String recipientName;
    private String wrappingStyle;
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        private Integer productId;
        private Integer quantity;
    }
}

package com.example.nexus.dto;

import java.util.List;

public record CustomBoxRequest(
    String draftKey, String occasion, String boxSize, String wrappingStyle,
    String ribbonColor, Boolean hasWaxSeal, String recipientName, String senderName,
    String giftMessage, String cardTemplate, String deliveryAddress, String deliveryDate,
    List<Item> items
) {
    public record Item(Integer productId, Integer quantity) {}
}

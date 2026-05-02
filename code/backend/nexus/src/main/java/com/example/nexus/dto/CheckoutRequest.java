package com.example.nexus.dto;

import lombok.Data;

@Data
public class CheckoutRequest {
    private String fullName;
    private String phone;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String specialNotes;
    
    // Helper method to build full address
    public String getDeliveryAddress() {
        return String.join(", ",
            addressLine1,
            addressLine2 != null ? addressLine2 : "",
            city
        ).replaceAll(", +", ", ").replaceAll(", $", "").trim();
    }
}
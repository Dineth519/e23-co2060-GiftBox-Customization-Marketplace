package com.example.nexus.dto;

// ── Checkout POST request body ───────────────────────────
// React checkout page ෙකෙ ඉදන් එනවා
// Body: { deliveryAddress, specialNotes }

public class CheckoutRequest {

    private String deliveryAddress;
    private String specialNotes;

    public String getDeliveryAddress() { return deliveryAddress; }
    public String getSpecialNotes()    { return specialNotes;    }

    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public void setSpecialNotes(String specialNotes)       { this.specialNotes    = specialNotes;    }
}
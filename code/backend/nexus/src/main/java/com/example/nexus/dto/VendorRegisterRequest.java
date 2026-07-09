package com.example.nexus.dto;

import lombok.Data;

@Data
public class VendorRegisterRequest {
    private String shopName;
    private String ownerName;
    private String email;
    private String phone;
    private String businessRegNumber;
    private String category;
    private String address;
    private String city;
    private String password;
}

package com.example.nexus.dto;

import lombok.Data;

@Data
public class AddressDTO {
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String district;
    private String province;
    private String postalCode;
    private String phoneNumber;
}
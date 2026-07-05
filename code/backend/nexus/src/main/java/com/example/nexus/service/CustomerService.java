package com.example.nexus.service;

import com.example.nexus.dto.AddressDTO;
import com.example.nexus.model.Customer;
import com.example.nexus.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    // ── Save or update address for a customer ────────────────────────────────
    public boolean saveAddress(String username, AddressDTO addressDTO) {
        Customer customer = customerRepository.findByUsername(username)
                .orElse(null);

        if (customer == null) return false;

        customer.setAddressLine1(addressDTO.getAddressLine1());
        customer.setAddressLine2(addressDTO.getAddressLine2());
        customer.setCity(addressDTO.getCity());
        customer.setDistrict(addressDTO.getDistrict());
        customer.setProvince(addressDTO.getProvince());
        customer.setPostalCode(addressDTO.getPostalCode());
        customer.setPhoneNumber(addressDTO.getPhoneNumber());

        customerRepository.save(customer);
        return true;
    }

    // ── Get address for a customer ────────────────────────────────────────────
    public AddressDTO getAddress(String username) {
        Customer customer = customerRepository.findByUsername(username)
                .orElse(null);

        if (customer == null) return null;

        AddressDTO dto = new AddressDTO();
        dto.setAddressLine1(customer.getAddressLine1());
        dto.setAddressLine2(customer.getAddressLine2());
        dto.setCity(customer.getCity());
        dto.setDistrict(customer.getDistrict());
        dto.setProvince(customer.getProvince());
        dto.setPostalCode(customer.getPostalCode());
        dto.setPhoneNumber(customer.getPhoneNumber());

        return dto;
    }
}

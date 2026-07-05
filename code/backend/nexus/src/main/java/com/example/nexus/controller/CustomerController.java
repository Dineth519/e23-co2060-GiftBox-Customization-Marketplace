package com.example.nexus.controller;

import com.example.nexus.model.Customer;
import com.example.nexus.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Get single customer by ID
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getUserById(@PathVariable Long id) {
        return customerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update customer profile details
    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateUser(@PathVariable Long id, @RequestBody Customer updatedUser) {
        return customerRepository.findById(id).map(customer -> {
            if (updatedUser.getName() != null) customer.setName(updatedUser.getName());
            if (updatedUser.getEmail() != null) customer.setEmail(updatedUser.getEmail());
            if (updatedUser.getPhoneNumber() != null) customer.setPhoneNumber(updatedUser.getPhoneNumber());
            if (updatedUser.getAddressLine1() != null) customer.setAddressLine1(updatedUser.getAddressLine1());
            if (updatedUser.getAddressLine2() != null) customer.setAddressLine2(updatedUser.getAddressLine2());
            if (updatedUser.getCity() != null) customer.setCity(updatedUser.getCity());
            if (updatedUser.getDistrict() != null) customer.setDistrict(updatedUser.getDistrict());
            if (updatedUser.getProvince() != null) customer.setProvince(updatedUser.getProvince());
            if (updatedUser.getPostalCode() != null) customer.setPostalCode(updatedUser.getPostalCode());
            Customer saved = customerRepository.save(customer);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Update customer password
    @PutMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(@PathVariable Long id, @RequestBody java.util.Map<String, String> request) {
        return customerRepository.findById(id).map(customer -> {
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (!passwordEncoder.matches(currentPassword, customer.getPassword())) {
                return ResponseEntity.badRequest().body(java.util.Map.of("success", false, "message", "Incorrect current password"));
            }

            customer.setPassword(passwordEncoder.encode(newPassword));
            customerRepository.save(customer);
            return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Password updated successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Get all users
    @GetMapping
    public List<Customer> getAllUsers() {
        return customerRepository.findAll();
    }

    // Get customer address
    @GetMapping("/{username}/address")
    public ResponseEntity<?> getUserAddress(@PathVariable String username) {
        return customerRepository.findByUsername(username).map(customer -> {
            java.util.Map<String, Object> address = new java.util.HashMap<>();
            address.put("addressLine1", customer.getAddressLine1());
            address.put("addressLine2", customer.getAddressLine2());
            address.put("city", customer.getCity());
            address.put("district", customer.getDistrict());
            address.put("province", customer.getProvince());
            address.put("postalCode", customer.getPostalCode());
            address.put("phoneNumber", customer.getPhoneNumber());
            
            return ResponseEntity.ok(java.util.Map.of("success", true, "address", address));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Save customer address
    @PostMapping("/{username}/address")
    public ResponseEntity<?> saveUserAddress(@PathVariable String username, @RequestBody java.util.Map<String, String> request) {
        return customerRepository.findByUsername(username).map(customer -> {
            customer.setAddressLine1(request.get("addressLine1"));
            customer.setAddressLine2(request.get("addressLine2"));
            customer.setCity(request.get("city"));
            customer.setDistrict(request.get("district"));
            customer.setProvince(request.get("province"));
            customer.setPostalCode(request.get("postalCode"));
            customer.setPhoneNumber(request.get("phoneNumber"));
            
            customerRepository.save(customer);
            return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Address saved successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Temporary test — add a dummy customer (delete this after testing)
    @GetMapping("/add-test-customer")
    public String addTestUser() {
        Customer newUser = new Customer();
        newUser.setUsername("giftbox_fan");
        newUser.setEmail("fan@giftbox.com");
        newUser.setPassword("supersecret");
        customerRepository.save(newUser);
        return "Customer saved successfully! Go check MySQL Workbench.";
    }
}
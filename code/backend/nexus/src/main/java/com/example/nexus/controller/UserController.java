package com.example.nexus.controller;

import com.example.nexus.model.User;
import com.example.nexus.model.Customer;
import com.example.nexus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Checkout details for the currently authenticated customer. Using the JWT
    // identity avoids stale or missing browser user IDs and keeps this lookup scoped
    // to the signed-in account.
    @GetMapping("/me/checkout-details")
    public ResponseEntity<?> getCheckoutDetails(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("Authentication is required.");
        }

        return userRepository.findByUsername(authentication.getName()).map(user -> {
            String addressLine1 = user.getAddressLine1();
            if ((addressLine1 == null || addressLine1.isBlank())
                    && user instanceof com.example.nexus.model.Customer customer) {
                addressLine1 = customer.getAddress();
            }

            java.util.Map<String, Object> details = new java.util.LinkedHashMap<>();
            details.put("name", user.getName());
            details.put("addressLine1", addressLine1);
            details.put("addressLine2", user.getAddressLine2());
            details.put("city", user.getCity());
            details.put("district", user.getDistrict());
            details.put("province", user.getProvince());
            details.put("postalCode", user.getPostalCode());
            details.put("phoneNumber", user.getPhoneNumber());
            return ResponseEntity.ok(details);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Get single user by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        try {
            return userRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    // Update user profile details
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User updatedUser) {
        return userRepository.findById(id).map(user -> {
            if (updatedUser.getName() != null) user.setName(updatedUser.getName());
            if (updatedUser.getEmail() != null) user.setEmail(updatedUser.getEmail());
            if (updatedUser.getPhoneNumber() != null) user.setPhoneNumber(updatedUser.getPhoneNumber());
            if (updatedUser.getAddressLine1() != null) user.setAddressLine1(updatedUser.getAddressLine1());
            if (updatedUser.getAddressLine2() != null) user.setAddressLine2(updatedUser.getAddressLine2());
            if (updatedUser.getCity() != null) user.setCity(updatedUser.getCity());
            if (updatedUser.getDistrict() != null) user.setDistrict(updatedUser.getDistrict());
            if (updatedUser.getProvince() != null) user.setProvince(updatedUser.getProvince());
            if (updatedUser.getPostalCode() != null) user.setPostalCode(updatedUser.getPostalCode());
            if (updatedUser.getProfileImageUrl() != null) user.setProfileImageUrl(updatedUser.getProfileImageUrl());
            User saved = userRepository.save(user);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Update user password
    @PutMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(@PathVariable Integer id, @RequestBody java.util.Map<String, String> request) {
        return userRepository.findById(id).map(user -> {
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body(java.util.Map.of("success", false, "message", "Incorrect current password"));
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Password updated successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Get all users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user address
    @GetMapping("/{username}/address")
    public ResponseEntity<?> getUserAddress(@PathVariable String username) {
        return userRepository.findByUsername(username).map(user -> {
            java.util.Map<String, Object> address = new java.util.HashMap<>();
            address.put("addressLine1", user.getAddressLine1());
            address.put("addressLine2", user.getAddressLine2());
            address.put("city", user.getCity());
            address.put("district", user.getDistrict());
            address.put("province", user.getProvince());
            address.put("postalCode", user.getPostalCode());
            address.put("phoneNumber", user.getPhoneNumber());
            
            return ResponseEntity.ok(java.util.Map.of("success", true, "address", address));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Save user address
    @PostMapping("/{username}/address")
    public ResponseEntity<?> saveUserAddress(@PathVariable String username, @RequestBody java.util.Map<String, String> request) {
        return userRepository.findByUsername(username).map(user -> {
            user.setAddressLine1(request.get("addressLine1"));
            user.setAddressLine2(request.get("addressLine2"));
            user.setCity(request.get("city"));
            user.setDistrict(request.get("district"));
            user.setProvince(request.get("province"));
            user.setPostalCode(request.get("postalCode"));
            user.setPhoneNumber(request.get("phoneNumber"));
            
            userRepository.save(user);
            return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Address saved successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Temporary test — add a dummy user (delete this after testing)
    @GetMapping("/add-test-customer")
    public String addTestUser() {
        User newUser = new User();
        newUser.setUsername("giftbox_fan");
        newUser.setEmail("fan@giftbox.com");
        newUser.setPassword("supersecret");
        userRepository.save(newUser);
        return "User saved successfully! Go check MySQL Workbench.";
    }
}

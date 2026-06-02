package com.example.nexus.controller;

import com.example.nexus.model.User;
import com.example.nexus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;

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
    @GetMapping("/add-test-user")
    public String addTestUser() {
        User newUser = new User();
        newUser.setUsername("giftbox_fan");
        newUser.setEmail("fan@giftbox.com");
        newUser.setPassword("supersecret");
        userRepository.save(newUser);
        return "User saved successfully! Go check MySQL Workbench.";
    }
}
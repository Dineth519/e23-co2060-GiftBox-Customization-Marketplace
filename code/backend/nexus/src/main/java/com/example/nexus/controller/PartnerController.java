package com.example.nexus.controller;

import com.example.nexus.model.Partner;
import com.example.nexus.model.User;
import com.example.nexus.model.Role;
import com.example.nexus.dto.VendorRegisterRequest;
import com.example.nexus.repository.PartnerRepository;
import com.example.nexus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/partners")
// Allows your React app (running on port 3000) to communicate with this backend
public class PartnerController {

    @Autowired
    private PartnerRepository partnerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    /**
     * Fetches all partners from the database.
     * Used by both the main Partners page and the Pending Requests page.
     */
    @GetMapping
    public List<Partner> getAllPartners() {
        return partnerRepository.findAll();
    }

    /**
     * Updates the status of a specific partner (Approve or Reject).
     * @param id The unique ID of the partner to update.
     * @param status The new status value (e.g., 'ACTIVE' or 'REJECTED').
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Partner> updateStatus(
            @PathVariable Integer id, 
            @RequestParam String status) {
        
        // 1. Retrieve the partner record by ID, or throw an error if not found
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Partner not found with id: " + id));

        // 2. Modify the status field
        partner.setStatus(status);
        
        // 3. Save the updated record back to the MariaDB/MySQL database
        Partner updatedPartner = partnerRepository.save(partner);
        
        // 4. Return the updated object with a 200 OK response
        return ResponseEntity.ok(updatedPartner);
    }

    /**
     * Registers a new vendor (Partner) application.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerVendor(@RequestBody VendorRegisterRequest request) {
        if (userRepository.existsByUsername(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email/Username already exists"));
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email already registered"));
        }

        // 1. Create User
        User user = new User();
        user.setName(request.getOwnerName());
        user.setUsername(request.getEmail()); // Use email as username for vendor login
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.PARTNER);
        user.setVerified(true); // Auto-verify email for vendor registration convenience

        userRepository.save(user);

        // 2. Create Partner
        Partner partner = new Partner();
        partner.setPartnerId(user.getId().intValue());
        partner.setShopName(request.getShopName());
        partner.setFullName(request.getOwnerName());
        partner.setPhoneNumber(request.getPhone());
        partner.setShopAddress(request.getAddress() + ", " + request.getCity());
        partner.setBrNo(request.getBusinessRegNumber());
        partner.setCategories(request.getCategory());
        partner.setStatus("PENDING"); // Defaults to PENDING until approved by admin

        partnerRepository.save(partner);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Application submitted successfully! Your shop registration is pending admin approval."
        ));
    }
}
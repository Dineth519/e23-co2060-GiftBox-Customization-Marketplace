package com.example.nexus.controller;

import com.example.nexus.model.Cart;
import com.example.nexus.model.DbCartItem;
import com.example.nexus.service.CustomerCartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/db-cart")
@CrossOrigin(origins = "*") // Adjust if needed
public class CustomerCartController {

    @Autowired
    private CustomerCartService customerCartService;

    public static class SyncCartRequest {
        public Integer customerId;
        public Integer partnerId;
        public List<DbCartItem> items;
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncCart(@RequestBody SyncCartRequest request) {
        if (request.customerId == null || request.partnerId == null || request.items == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
        }
        Cart cart = customerCartService.syncCart(request.customerId, request.partnerId, request.items);
        return ResponseEntity.ok(Map.of("message", "Cart synced successfully", "cartId", cart.getCartId()));
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<?> getCustomerCarts(@PathVariable Integer customerId) {
        List<Cart> carts = customerCartService.getCartsForCustomer(customerId);
        return ResponseEntity.ok(carts);
    }
    
    @GetMapping("/{cartId}/items")
    public ResponseEntity<?> getCartItems(@PathVariable Integer cartId) {
        List<DbCartItem> items = customerCartService.getCartItems(cartId);
        return ResponseEntity.ok(items);
    }
}

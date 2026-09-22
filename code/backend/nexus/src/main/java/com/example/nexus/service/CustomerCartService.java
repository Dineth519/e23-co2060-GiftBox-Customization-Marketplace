package com.example.nexus.service;

import com.example.nexus.model.Cart;
import com.example.nexus.model.DbCartItem;
import com.example.nexus.repository.CartRepository;
import com.example.nexus.repository.DbCartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerCartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private DbCartItemRepository dbCartItemRepository;

    @Transactional
    public Cart syncCart(Integer customerId, Integer partnerId, List<DbCartItem> items) {
        // Find existing cart or create a new one
        Cart cart = null;
        if (partnerId != null) {
            cart = cartRepository.findByCustomerIdAndPartnerId(customerId, partnerId).orElse(null);
        }
        if (cart == null) {
            Cart newCart = new Cart();
            newCart.setCustomerId(customerId);
            newCart.setPartnerId(partnerId);
            cart = cartRepository.save(newCart);
        }

        // Add items to the cart
        for (DbCartItem item : items) {
            item.setCartId(cart.getCartId());
            dbCartItemRepository.save(item);
        }
        return cart;
    }

    public List<Cart> getCartsForCustomer(Integer customerId) {
        return cartRepository.findByCustomerId(customerId);
    }
    
    public List<DbCartItem> getCartItems(Integer cartId) {
        return dbCartItemRepository.findByCartId(cartId);
    }
}

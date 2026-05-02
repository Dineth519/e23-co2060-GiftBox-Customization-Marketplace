package com.example.nexus.service;

import com.example.nexus.dto.AddToCart;
import com.example.nexus.dto.CartResponse;
import com.example.nexus.entity.CartEntity;
import com.example.nexus.entity.CartItemEntity;
import com.example.nexus.model.CartItem;
import com.example.nexus.model.SessionCartManager;
import com.example.nexus.repository.CartItemRepository;
import com.example.nexus.repository.CartRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired private CartRepository     cartRepository;
    @Autowired private CartItemRepository cartItemRepository;

    // ── Helper: Is the user logged in? ───────────────────
    // Session এ customer_id set করা থাকলে logged in
    private Integer getCustomerId(HttpSession session) {
        return (Integer) session.getAttribute("customer_id");
    }

    // ════════════════════════════════════════════════════
    //  GET CART ITEMS
    //  Logged in  → load from DB, sync to session
    //  Guest      → session only
    // ════════════════════════════════════════════════════
    public List<CartItem> getCartItems(HttpSession session) {
        Integer customerId = getCustomerId(session);

        if (customerId != null) {
            // Logged in — load from DB
            return loadCartFromDb(customerId, session);
        }

        // Guest — session only
        return SessionCartManager.getOrCreateCart(session);
    }

    // DB ෙකෙ cart load කරලා session sync කරනවා
    private List<CartItem> loadCartFromDb(Integer customerId, HttpSession session) {
        Optional<CartEntity> cartOpt = cartRepository.findByCustomerId(customerId);

        if (cartOpt.isEmpty()) {
            // DB cart නෑ — empty list return
            return new ArrayList<>();
        }

        CartEntity cartEntity = cartOpt.get();
        List<CartItemEntity> dbItems = cartItemRepository.findByCart_CartId(cartEntity.getCartId());

        // CartItemEntity → CartItem (session model) convert
        List<CartItem> cartItems = new ArrayList<>();
        for (CartItemEntity dbItem : dbItems) {
            CartItem item;
            if (dbItem.getGiftBoxId() != null) {
                // Gift box item
                // name + imageUrl — product/gift_box table ෙකෙ ගන්න ඕනේ
                // (ProductService / GiftBoxService inject කරලා ගන්නවා — simplified here)
                item = new CartItem(
                    dbItem.getGiftBoxId(),
                    "Gift Box #" + dbItem.getGiftBoxId(), // ideally fetch real name
                    dbItem.getUnitPrice(),
                    dbItem.getQuantity(),
                    "",           // ideally fetch real imageUrl
                    true
                );
            } else {
                // Product item
                item = new CartItem(
                    dbItem.getProductId(),
                    "Product #" + dbItem.getProductId(), // ideally fetch real name
                    dbItem.getUnitPrice(),
                    dbItem.getQuantity(),
                    ""            // ideally fetch real imageUrl
                );
            }
            cartItems.add(item);
        }

        // Session sync — page reload fast load සඳහා
        SessionCartManager.saveCart(session, cartItems);
        return cartItems;
    }

    // ════════════════════════════════════════════════════
    //  ADD ITEM
    //  Logged in  → DB + session
    //  Guest      → session only
    // ════════════════════════════════════════════════════
    @Transactional
    public CartResponse addItem(HttpSession session, AddToCart dto) {
        Integer customerId = getCustomerId(session);
        List<CartItem> cart = SessionCartManager.getOrCreateCart(session);

        if (customerId != null) {
            // ── Logged in — DB update ──────────────────
            CartEntity cartEntity = cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    // First add — create cart row
                    CartEntity newCart = new CartEntity();
                    newCart.setCustomerId(customerId);
                    return cartRepository.save(newCart);
                });

            if (dto.isGiftBox()) {
                // Gift box add
                Optional<CartItemEntity> existingOpt =
                    cartItemRepository.findByCart_CartIdAndGiftBoxId(
                        cartEntity.getCartId(), dto.getGiftBoxId());

                if (existingOpt.isPresent()) {
                    // Already in cart — quantity++
                    CartItemEntity existing = existingOpt.get();
                    existing.setQuantity(existing.getQuantity() + 1);
                    cartItemRepository.save(existing);
                } else {
                    // New gift box item
                    CartItemEntity newItem = new CartItemEntity();
                    newItem.setCart(cartEntity);
                    newItem.setGiftBoxId(dto.getGiftBoxId());
                    newItem.setQuantity(1);
                    newItem.setUnitPrice(dto.getPrice());
                    cartItemRepository.save(newItem);
                }
            } else {
                // Product add
                Optional<CartItemEntity> existingOpt =
                    cartItemRepository.findByCart_CartIdAndProductId(
                        cartEntity.getCartId(), dto.getProductId());

                if (existingOpt.isPresent()) {
                    CartItemEntity existing = existingOpt.get();
                    existing.setQuantity(existing.getQuantity() + 1);
                    cartItemRepository.save(existing);
                } else {
                    CartItemEntity newItem = new CartItemEntity();
                    newItem.setCart(cartEntity);
                    newItem.setProductId(dto.getProductId());
                    newItem.setQuantity(1);
                    newItem.setUnitPrice(dto.getPrice());
                    cartItemRepository.save(newItem);
                }
            }
        }

        // ── Session update (guest + logged-in both) ────
        boolean found = false;
        for (CartItem existing : cart) {
            boolean match = dto.isGiftBox()
                ? (existing.getGiftBoxId() != null && existing.getGiftBoxId().equals(dto.getGiftBoxId()))
                : (existing.getProductId() == dto.getProductId());

            if (match) {
                existing.setQuantity(existing.getQuantity() + 1);
                found = true;
                break;
            }
        }

        if (!found) {
            if (dto.isGiftBox()) {
                cart.add(new CartItem(dto.getGiftBoxId(), dto.getName(),
                    dto.getPrice(), 1, dto.getImageUrl(), true));
            } else {
                cart.add(new CartItem(dto.getProductId(), dto.getName(),
                    dto.getPrice(), 1, dto.getImageUrl()));
            }
        }

        SessionCartManager.saveCart(session, cart);
        return buildResponse(cart, dto.getName() + " added to cart!");
    }

    // ════════════════════════════════════════════════════
    //  REMOVE ITEM
    // ════════════════════════════════════════════════════
    @Transactional
    public CartResponse removeItem(HttpSession session, int productId) {
        Integer customerId = getCustomerId(session);

        if (customerId != null) {
            cartRepository.findByCustomerId(customerId).ifPresent(cartEntity -> {
                cartItemRepository.findByCart_CartIdAndProductId(
                    cartEntity.getCartId(), productId)
                    .ifPresent(cartItemRepository::delete);
            });
        }

        List<CartItem> cart = SessionCartManager.getOrCreateCart(session);
        cart.removeIf(item -> item.getProductId() == productId);

        SessionCartManager.saveCart(session, cart);
        return buildResponse(cart, "Item removed from cart.");
    }

    // ════════════════════════════════════════════════════
    //  REMOVE GIFT BOX ITEM
    // ════════════════════════════════════════════════════
    @Transactional
    public CartResponse removeGiftBoxItem(HttpSession session, int giftBoxId) {
        Integer customerId = getCustomerId(session);

        if (customerId != null) {
            cartRepository.findByCustomerId(customerId).ifPresent(cartEntity -> {
                cartItemRepository.findByCart_CartIdAndGiftBoxId(
                    cartEntity.getCartId(), giftBoxId)
                    .ifPresent(cartItemRepository::delete);
            });
        }

        List<CartItem> cart = SessionCartManager.getOrCreateCart(session);
        cart.removeIf(item -> item.getGiftBoxId() != null
            && item.getGiftBoxId() == giftBoxId);

        SessionCartManager.saveCart(session, cart);
        return buildResponse(cart, "Gift box removed from cart.");
    }

    // ════════════════════════════════════════════════════
    //  UPDATE QUANTITY
    // ════════════════════════════════════════════════════
    @Transactional
    public CartResponse updateQuantity(HttpSession session,
                                       int productId,
                                       int newQty) {
        if (newQty <= 0) {
            return removeItem(session, productId);
        }

        Integer customerId = getCustomerId(session);

        if (customerId != null) {
            cartRepository.findByCustomerId(customerId).ifPresent(cartEntity -> {
                cartItemRepository.findByCart_CartIdAndProductId(
                    cartEntity.getCartId(), productId)
                    .ifPresent(item -> {
                        item.setQuantity(newQty);
                        cartItemRepository.save(item);
                    });
            });
        }

        List<CartItem> cart = SessionCartManager.getOrCreateCart(session);
        for (CartItem item : cart) {
            if (item.getProductId() == productId) {
                item.setQuantity(newQty);
                break;
            }
        }

        SessionCartManager.saveCart(session, cart);
        return buildResponse(cart, "Quantity updated.");
    }

    // ════════════════════════════════════════════════════
    //  CLEAR CART
    //  Checkout / "Clear Cart" button click
    //  Logged in → DB cart_items delete + session clear
    //  Guest     → session clear only
    // ════════════════════════════════════════════════════
    @Transactional
    public CartResponse clearCart(HttpSession session) {
        Integer customerId = getCustomerId(session);

        if (customerId != null) {
            cartRepository.findByCustomerId(customerId).ifPresent(cartEntity -> {
                // cart_items rows delete — cart row itself keep (reuse next time)
                cartItemRepository.deleteAllByCartId(cartEntity.getCartId());
            });
        }

        SessionCartManager.destroyCart(session);
        return buildResponse(List.of(), "Cart cleared.");
    }

    // ════════════════════════════════════════════════════
    //  MERGE GUEST CART → DB CART  (Login වෙද්දි call)
    //  Guest session cart DB cart එකට merge කරනවා
    // ════════════════════════════════════════════════════
    @Transactional
    public void mergeGuestCartOnLogin(HttpSession session, Integer customerId) {
        List<CartItem> sessionCart = SessionCartManager.getOrCreateCart(session);

        if (sessionCart.isEmpty()) return;

        CartEntity cartEntity = cartRepository.findByCustomerId(customerId)
            .orElseGet(() -> {
                CartEntity newCart = new CartEntity();
                newCart.setCustomerId(customerId);
                return cartRepository.save(newCart);
            });

        for (CartItem sessionItem : sessionCart) {
            if ("GIFT_BOX".equals(sessionItem.getItemType())) {
                cartItemRepository.findByCart_CartIdAndGiftBoxId(
                    cartEntity.getCartId(), sessionItem.getGiftBoxId())
                    .ifPresentOrElse(
                        existing -> {
                            existing.setQuantity(existing.getQuantity() + sessionItem.getQuantity());
                            cartItemRepository.save(existing);
                        },
                        () -> {
                            CartItemEntity newItem = new CartItemEntity();
                            newItem.setCart(cartEntity);
                            newItem.setGiftBoxId(sessionItem.getGiftBoxId());
                            newItem.setQuantity(sessionItem.getQuantity());
                            newItem.setUnitPrice(sessionItem.getPrice());
                            cartItemRepository.save(newItem);
                        }
                    );
            } else {
                cartItemRepository.findByCart_CartIdAndProductId(
                    cartEntity.getCartId(), sessionItem.getProductId())
                    .ifPresentOrElse(
                        existing -> {
                            existing.setQuantity(existing.getQuantity() + sessionItem.getQuantity());
                            cartItemRepository.save(existing);
                        },
                        () -> {
                            CartItemEntity newItem = new CartItemEntity();
                            newItem.setCart(cartEntity);
                            newItem.setProductId(sessionItem.getProductId());
                            newItem.setQuantity(sessionItem.getQuantity());
                            newItem.setUnitPrice(sessionItem.getPrice());
                            cartItemRepository.save(newItem);
                        }
                    );
            }
        }
    }

    // ── Total & Count helpers ────────────────────────────
    public double calculateTotal(List<CartItem> cart) {
        double total = 0.0;
        for (CartItem item : cart) {
            total += item.getSubtotal();
        }
        return Math.round(total * 100.0) / 100.0;
    }

    public int calculateItemCount(List<CartItem> cart) {
        int count = 0;
        for (CartItem item : cart) {
            count += item.getQuantity();
        }
        return count;
    }

    // ── Build response helper ────────────────────────────
    private CartResponse buildResponse(List<CartItem> cart, String message) {
        return new CartResponse(cart, calculateTotal(cart),
            calculateItemCount(cart), message);
    }
}
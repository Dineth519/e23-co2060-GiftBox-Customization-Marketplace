package com.example.nexus.repository;

import com.example.nexus.entity.CartItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItemEntity, Integer> {

    // Cart ID එකෙන් items list ගන්නවා
    List<CartItemEntity> findByCart_CartId(Integer cartId);

    // Specific product cart එකේ තියෙනවාද? (duplicate check)
    Optional<CartItemEntity> findByCart_CartIdAndProductId(Integer cartId, Integer productId);

    // Specific gift box cart එකේ තියෙනවාද?
    Optional<CartItemEntity> findByCart_CartIdAndGiftBoxId(Integer cartId, Integer giftBoxId);

    // Checkout / clear cart — cart items delete කරනවා
    @Modifying
    @Transactional
    @Query("DELETE FROM CartItemEntity ci WHERE ci.cart.cartId = :cartId")
    void deleteAllByCartId(@Param("cartId") Integer cartId);
}
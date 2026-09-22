package com.example.nexus.repository;

import com.example.nexus.model.DbCartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DbCartItemRepository extends JpaRepository<DbCartItem, Integer> {
    List<DbCartItem> findByCartId(Integer cartId);
    void deleteByCartId(Integer cartId);
}

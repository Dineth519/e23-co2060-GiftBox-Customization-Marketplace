package com.example.nexus.repository;

import com.example.nexus.model.CustomBoxCart;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CustomBoxCartRepository extends JpaRepository<CustomBoxCart, Long> {
    List<CustomBoxCart> findByCustomerIdAndOrderIdIsNullOrderByIdDesc(Integer customerId);
    Optional<CustomBoxCart> findByCustomerIdAndDraftKey(Integer customerId, String draftKey);
    Optional<CustomBoxCart> findByIdAndCustomerId(Long id, Integer customerId);
}

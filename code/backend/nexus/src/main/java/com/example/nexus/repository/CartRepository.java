package com.example.nexus.repository;

import com.example.nexus.entity.CartEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<CartEntity, Integer> {

    // Customer ගේ cart load කරනවා (login වෙද්දි)
    Optional<CartEntity> findByCustomerId(Integer customerId);

    // Customer logout / account delete වෙද්දි cart delete
    void deleteByCustomerId(Integer customerId);

    // Customer ගේ cart තියෙනවාද check
    boolean existsByCustomerId(Integer customerId);
}
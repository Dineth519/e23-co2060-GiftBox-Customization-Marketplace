package com.example.nexus.repository;

import com.example.nexus.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Integer> {
    // JpaRepository gives you standard methods like findAll(), findById(), save(), delete() for free.
    // You don't need to write any code here for basic operations.
    java.util.Optional<Vendor> findByShopName(String shopName);
}
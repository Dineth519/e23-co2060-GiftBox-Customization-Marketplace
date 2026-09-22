package com.example.nexus.repository;

import com.example.nexus.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select p from Product p where p.id = :id")
    java.util.Optional<Product> findForBoxCheckout(@org.springframework.data.repository.query.Param("id") Integer id);

    // Vendor's product list page
    List<Product> findByVendorId(Integer vendorId);

    // Dashboard — total products count for a vendor
    long countByVendorId(Integer vendorId);
}

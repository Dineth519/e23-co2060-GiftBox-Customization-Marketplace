package com.example.nexus.repository;

import com.example.nexus.model.SubOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubOrderRepository extends JpaRepository<SubOrder, Integer> {
    List<SubOrder> findByVendorId(Integer vendorId);
    List<SubOrder> findByOrder_OrderId(Integer orderId);
}

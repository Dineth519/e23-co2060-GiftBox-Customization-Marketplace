package com.example.nexus.repository;

import com.example.nexus.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    // Orders page — vendor orders sorted by date
    List<Order> findByVendorIdOrderByCreatedAtDesc(Integer vendorId);

    // Customer orders — only this customer's orders
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Integer customerId);

    // Dashboard — orders count today
    @Query(value = "SELECT COUNT(*) FROM orders WHERE vendor_id = :vendorId AND DATE(created_at) = CURDATE()", nativeQuery = true)
    long countOrdersTodayByVendorId(@Param("vendorId") Integer vendorId);

    // Dashboard — revenue today
    @Query(value = "SELECT SUM(total_amount) FROM orders WHERE vendor_id = :vendorId AND DATE(created_at) = CURDATE() AND status != 'CANCELLED'", nativeQuery = true)
    Double getRevenueTodayByVendorId(@Param("vendorId") Integer vendorId);

    // Dashboard — weekly orders + revenue (last 7 days)
    @Query(value = "SELECT DATE_FORMAT(created_at, '%a') as day, COUNT(*) as orders, SUM(total_amount) as revenue FROM orders WHERE vendor_id = :vendorId AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY DATE(created_at), day ORDER BY DATE(created_at)", nativeQuery = true)
    List<Object[]> getWeeklyOrdersAndRevenue(@Param("vendorId") Integer vendorId);

    // Dashboard — monthly revenue (last 7 months)
    @Query(value = "SELECT DATE_FORMAT(created_at, '%b') as month, SUM(total_amount) as revenue FROM orders WHERE vendor_id = :vendorId AND status != 'CANCELLED' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 MONTH) GROUP BY YEAR(created_at), MONTH(created_at) ORDER BY YEAR(created_at), MONTH(created_at)", nativeQuery = true)
    List<Object[]> getMonthlyRevenue(@Param("vendorId") Integer vendorId);

    // Dashboard — order status distribution
    @Query(value = "SELECT status, COUNT(*) as count FROM orders WHERE vendor_id = :vendorId GROUP BY status", nativeQuery = true)
    List<Object[]> getOrderStatusDistribution(@Param("vendorId") Integer vendorId);
}
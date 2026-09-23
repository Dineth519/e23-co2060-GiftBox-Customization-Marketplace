package com.example.nexus.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Object> response = new HashMap<>();
        try {
            // 1. Total Customers Count (role = 'CUSTOMER')
            Integer totalCustomers = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER'", Integer.class);
            response.put("totalCustomers", totalCustomers != null ? totalCustomers : 0);

            // 2. Total Vendors Count
            Integer totalVendors = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM vendors", Integer.class);
            response.put("totalVendors", totalVendors != null ? totalVendors : 0);

            // 3. Orders Today / Total Orders Count
            Integer totalOrders = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM orders", Integer.class);
            response.put("totalOrders", totalOrders != null ? totalOrders : 0);

            // 4. Total Admin Revenue (LKR)
            Double totalRevenue = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(admin_revenue), 0) FROM orders", Double.class);
            response.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);

            // 5. Recent Orders
            List<Map<String, Object>> recentOrders = jdbcTemplate.queryForList(
                "SELECT order_id AS orderId, recipient_name AS recipientName, wrapping_style AS wrapStyle, status, total_amount AS totalAmount, created_at AS createdAt " +
                "FROM orders ORDER BY order_id DESC LIMIT 10"
            );
            response.put("recentOrders", recentOrders);

            // 6. Top Vendors (with product count)
            List<Map<String, Object>> topVendors = jdbcTemplate.queryForList(
                "SELECT v.vendor_id AS id, v.shop_name AS shopName, COUNT(p.id) AS productCount " +
                "FROM vendors v " +
                "LEFT JOIN products p ON v.vendor_id = p.vendor_id " +
                "GROUP BY v.vendor_id, v.shop_name " +
                "ORDER BY productCount DESC LIMIT 10"
            );
            response.put("topVendors", topVendors);

            // 7. Order Status Distribution (For Pie Chart)
            List<Map<String, Object>> orderStatusDistribution = jdbcTemplate.queryForList(
                "SELECT status AS name, COUNT(*) AS value FROM orders GROUP BY status"
            );
            response.put("orderStatusDistribution", orderStatusDistribution);

            // 8. Monthly Revenue and Orders (For Bar/Area Charts) - Last 6 months
            List<Map<String, Object>> monthlyRevenue = jdbcTemplate.queryForList(
                "SELECT DATE_FORMAT(created_at, '%b') AS month, COALESCE(SUM(admin_revenue), 0) AS revenue, COUNT(order_id) AS orderCount " +
                "FROM orders GROUP BY DATE_FORMAT(created_at, '%b'), DATE_FORMAT(created_at, '%Y-%m') ORDER BY DATE_FORMAT(created_at, '%Y-%m') ASC LIMIT 6"
            );
            response.put("monthlyRevenue", monthlyRevenue);

            // 9. Weekly Revenue (For Line Chart) - Last 7 Days (Admin Revenue)
            List<Map<String, Object>> weeklyRevenue = jdbcTemplate.queryForList(
                "SELECT DATE_FORMAT(created_at, '%W') AS day, COALESCE(SUM(admin_revenue), 0) AS revenue " +
                "FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) " +
                "GROUP BY DATE_FORMAT(created_at, '%W'), DATE(created_at) ORDER BY DATE(created_at) ASC"
            );
            response.put("weeklyRevenue", weeklyRevenue);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}

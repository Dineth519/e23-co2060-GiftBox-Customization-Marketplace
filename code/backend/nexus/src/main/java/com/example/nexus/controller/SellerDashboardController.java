package com.example.nexus.controller;

import com.example.nexus.repository.OrderRepository;
import com.example.nexus.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/seller")
@CrossOrigin(origins = "http://localhost:3000")
public class SellerDashboardController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private ProductRepository productRepository;

    @GetMapping("/{sellerId}/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(@PathVariable Integer sellerId) {
        Map<String, Object> res = new HashMap<>();

        // ── Stats ──
        res.put("ordersToday", orderRepository.countOrdersTodayByPartnerId(sellerId));
        Double rev = orderRepository.getRevenueTodayByPartnerId(sellerId);
        res.put("revenueToday", rev != null ? rev : 0.0);
        res.put("totalProducts", productRepository.countByPartnerId(sellerId));

        // ── Weekly orders + revenue ──
        List<Map<String, Object>> weekly = new ArrayList<>();
        for (Object[] row : orderRepository.getWeeklyOrdersAndRevenue(sellerId)) {
            Map<String, Object> m = new HashMap<>();
            m.put("day",     row[0]);
            m.put("orders",  row[1]);
            m.put("revenue", row[2]);
            weekly.add(m);
        }
        res.put("weeklyData", weekly);

        // ── Monthly revenue ──
        List<Map<String, Object>> monthly = new ArrayList<>();
        for (Object[] row : orderRepository.getMonthlyRevenue(sellerId)) {
            Map<String, Object> m = new HashMap<>();
            m.put("month",   row[0]);
            m.put("revenue", row[1]);
            monthly.add(m);
        }
        res.put("monthlyRevenue", monthly);

        // ── Order status distribution ──
        Map<String, Long> statusDist = new HashMap<>();
        for (Object[] row : orderRepository.getOrderStatusDistribution(sellerId)) {
            statusDist.put((String) row[0], ((Number) row[1]).longValue());
        }
        res.put("statusDistribution", statusDist);

        return ResponseEntity.ok(res);
    }
}
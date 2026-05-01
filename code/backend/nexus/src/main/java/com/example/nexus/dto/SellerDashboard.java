package com.example.nexus.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class SellerDashboard {
    private long ordersToday;
    private double revenueToday;
    private long totalProducts;
    private double avgRating;
    
    private List<Map<String, Object>> weeklyOrders;   // [ {day: 'Mon', count: 45}, ... ]
    private List<Map<String, Object>> dailyRevenue;  // [ {day: 'Mon', amount: 15000}, ... ]
    private List<Map<String, Object>> monthlyRevenue; // [ {month: 'Jan', amount: 200000}, ... ]
    private Map<String, Long> orderStatusDist;        // { 'Delivered': 54, 'Pending': 12, ... }
}
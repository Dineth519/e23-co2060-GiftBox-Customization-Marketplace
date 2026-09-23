package com.example.nexus.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.DependsOn;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.json.JsonMapper;

@Service
@DependsOn("assemblyFlyway")
public class AssemblyService {
    private final JdbcTemplate db;
    private final JsonMapper json = JsonMapper.builder().build();
    private static final Set<String> ACTIVE = Set.of("CONFIRMED", "ASSEMBLING", "READY", "DELIVERED");
    private static final List<Boolean> EMPTY_CHECKS = Collections.nCopies(6, false);

    public AssemblyService(JdbcTemplate db) { this.db = db; }

    public List<Map<String, Object>> list(int assemblerId) {
        List<Map<String, Object>> orders = db.queryForList("SELECT * FROM orders WHERE (assembler_id = ? OR assembler_id IS NULL) " +
                "AND status IN ('CONFIRMED','ASSEMBLING','READY','DELIVERED') ORDER BY due_date IS NULL, due_date, created_at", assemblerId);
        if (orders.isEmpty()) return List.of();
        
        List<Integer> orderIds = orders.stream().map(o -> ((Number) o.get("order_id")).intValue()).toList();
        String placeholders = String.join(",", Collections.nCopies(orderIds.size(), "?"));
        
        List<Map<String, Object>> allItems = db.queryForList("SELECT oi.order_id, oi.id, oi.quantity AS expected, oi.received_quantity AS received, " +
                "oi.received_condition AS `condition`, COALESCE(p.name, gb.name, 'Unavailable product') AS name, " +
                "COALESCE(p.image_url, gb.image_url) AS imageUrl, " +
                "COALESCE(v.shop_name, 'Vendor not recorded') AS vendor " +
                "FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id " +
                "LEFT JOIN gift_boxes gb ON gb.id = oi.gift_box_id " +
                "LEFT JOIN vendors v ON v.vendor_id = COALESCE(p.vendor_id, gb.vendor_id) " +
                "WHERE oi.order_id IN (" + placeholders + ") ORDER BY oi.id", orderIds.toArray());
        
        Map<Integer, List<Map<String, Object>>> itemsByOrder = new java.util.HashMap<>();
        for (Map<String, Object> item : allItems) {
            int orderId = ((Number) item.get("order_id")).intValue();
            item.remove("order_id");
            itemsByOrder.computeIfAbsent(orderId, k -> new java.util.ArrayList<>()).add(item);
        }
        
        return orders.stream().map(order -> {
            int id = ((Number) order.get("order_id")).intValue();
            return view(order, itemsByOrder.getOrDefault(id, List.of()));
        }).toList();
    }

    public Map<String, Object> get(int id, int assemblerId) {
        return view(ownedOrder(id, assemblerId, false));
    }

    private Map<String, Object> ownedOrder(int id, int assemblerId, boolean lock) {
        List<Map<String, Object>> rows = db.queryForList("SELECT * FROM orders WHERE order_id = ?" + (lock ? " FOR UPDATE" : ""), id);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found.");
        Map<String, Object> order = rows.get(0);
        Object owner = order.get("assembler_id");
        if (owner != null && ((Number) owner).intValue() != assemblerId)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This order is assigned to another assembler.");
        if (!ACTIVE.contains(str(order.get("status"))))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This order is not available for assembly. It may be unconfirmed, cancelled or already dispatched.");
        return order;
    }

    private List<Map<String, Object>> items(int id) {
        return db.queryForList("SELECT oi.id, oi.quantity AS expected, oi.received_quantity AS received, " +
                "oi.received_condition AS `condition`, COALESCE(p.name, gb.name, 'Unavailable product') AS name, " +
                "COALESCE(p.image_url, gb.image_url) AS imageUrl, " +
                "COALESCE(v.shop_name, 'Vendor not recorded') AS vendor " +
                "FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id " +
                "LEFT JOIN gift_boxes gb ON gb.id = oi.gift_box_id " +
                "LEFT JOIN vendors v ON v.vendor_id = COALESCE(p.vendor_id, gb.vendor_id) " +
                "WHERE oi.order_id = ? ORDER BY oi.id", id);
    }

    @Transactional
    public Map<String, Object> update(int id, int assemblerId, AssemblyRules.Change change) {
        Map<String, Object> order = ownedOrder(id, assemblerId, true);
        AssemblyRules.require(change != null && change.revision() != null, "Reload the order before saving.");
        int revision = ((Number) order.get("assembly_revision")).intValue();
        if (revision != change.revision()) throw new ResponseStatusException(HttpStatus.CONFLICT,
                "This order changed in another session. Reload it before saving again.");
        String previous = str(order.get("assembly_status"));
        AssemblyRules.require(!"completed".equals(previous), "Completed orders are locked for admin review.");
        List<Map<String, Object>> existingItems = items(id);
        AssemblyRules.require(change.items() != null && !existingItems.isEmpty() && change.items().size() == existingItems.size(),
                "The receipt must include every order item.");
        Map<Integer, AssemblyRules.Item> incoming = new HashMap<>();
        for (AssemblyRules.Item item : change.items()) {
            AssemblyRules.require(item != null && item.id() != null && incoming.put(item.id(), item) == null,
                    "Each order item must appear exactly once.");
        }
        boolean ready = true;
        boolean changedReceipts = false;
        for (Map<String, Object> item : existingItems) {
            int itemId = ((Number) item.get("id")).intValue();
            int expected = ((Number) item.get("expected")).intValue();
            AssemblyRules.Item updated = incoming.get(itemId);
            AssemblyRules.validateItem(updated, expected);
            ready &= updated.received() == expected && "good".equals(updated.condition());
            changedReceipts |= updated.received() != ((Number) item.get("received")).intValue()
                    || !updated.condition().equals(item.get("condition"));
        }
        String current = changedReceipts && !"hold".equals(previous) ? "awaiting" : previous;
        boolean confirmed = !changedReceipts && truth(order.get("receipt_confirmed"));
        String next = AssemblyRules.nextStatus(current, confirmed, ready, change);
        List<Boolean> checks = change.checks();
        if (changedReceipts || !"assembling".equals(current) || Set.of("report", "resolve", "confirm").contains(change.action())) checks = EMPTY_CHECKS;
        String issue = str(order.get("issue"));
        if ("report".equals(change.action())) issue = change.issue().trim();
        if ("resolve".equals(change.action())) issue = "";
        if ("confirm".equals(change.action())) confirmed = true;
        if (Set.of("report", "resolve").contains(change.action())) confirmed = false;
        String message = switch (change.action()) {
            case "confirm" -> "All items received; assembly started.";
            case "report" -> "Issue reported: " + issue;
            case "resolve" -> "Issue resolved; confirm receipt to continue.";
            case "submit" -> "Assembly and quality checks completed; order is ready for delivery.";
            default -> "Progress saved.";
        };
        List<Object> activity = new ArrayList<>(readList(order.get("assembly_activity")));
        activity.add(Map.of("text", message, "time", LocalDateTime.now().toString()));
        for (AssemblyRules.Item item : change.items()) db.update(
                "UPDATE order_items SET received_quantity = ?, received_condition = ? WHERE id = ? AND order_id = ?",
                item.received(), item.condition(), item.id(), id);
        // DELIVERED means assembled and directly marked as delivered, skipping admin approval.
        String lifecycle = "completed".equals(next) ? "DELIVERED" : "assembling".equals(next) ? "ASSEMBLING" : "CONFIRMED";
        db.update("INSERT IGNORE INTO assemblers (assembler_id, full_name, phone_number) VALUES (?, 'Assembler', '000')", assemblerId);
        db.update("UPDATE orders SET assembler_id = ?, assembly_status = ?, receipt_confirmed = ?, `checks` = ?, " +
                        "assembler_notes = ?, issue = ?, assembly_activity = ?, assembly_revision = assembly_revision + 1, " +
                        "assembly_submitted_at = ?, status = ? WHERE order_id = ?",
                assemblerId, next, confirmed, json.writeValueAsString(checks), change.notes(), issue,
                json.writeValueAsString(activity), "completed".equals(next) ? Timestamp.valueOf(LocalDateTime.now()) : null, lifecycle, id);
        return get(id, assemblerId);
    }

    private Map<String, Object> view(Map<String, Object> order) {
        int id = ((Number) order.get("order_id")).intValue();
        return view(order, items(id));
    }

    private Map<String, Object> view(Map<String, Object> order, List<Map<String, Object>> items) {
        int id = ((Number) order.get("order_id")).intValue();
        Map<String, Object> workspace = new LinkedHashMap<>();
        workspace.put("revision", order.get("assembly_revision"));
        workspace.put("items", items);
        List<?> checks = readList(order.get("checks"));
        workspace.put("checks", checks.size() == 6 ? checks : EMPTY_CHECKS);
        workspace.put("status", order.get("assembly_status"));
        workspace.put("receiptConfirmed", truth(order.get("receipt_confirmed")));
        workspace.put("notes", str(order.get("assembler_notes")));
        workspace.put("issue", str(order.get("issue")));
        workspace.put("activity", readList(order.get("assembly_activity")));
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", String.valueOf(id));
        result.put("occasion", fallback(order.get("occasion"), "Gift"));
        result.put("box", fallback(order.get("box_size"), "Not specified"));
        result.put("wrap", fallback(order.get("wrapping_style"), "Not specified"));
        result.put("recipient", fallback(order.get("recipient_name"), "Not specified"));
        result.put("message", fallback(order.get("gift_message"), "No gift message"));
        result.put("dueDate", iso(order.get("due_date")));
        result.put("submittedAt", iso(order.get("assembly_submitted_at")));
        result.put("status", order.get("assembly_status"));
        result.put("issue", workspace.get("issue"));
        result.put("total", items.stream().mapToInt(i -> ((Number) i.get("expected")).intValue()).sum());
        result.put("received", items.stream().mapToInt(i -> ((Number) i.get("received")).intValue()).sum());
        result.put("workspace", workspace);
        result.put("customization", readMap(order.get("custom_box_details")));
        return result;
    }

    private List<?> readList(Object value) {
        if (value == null || str(value).isBlank()) return List.of();
        return json.readValue(str(value), List.class);
    }
    private Map<?, ?> readMap(Object value) {
        if (value == null || str(value).isBlank()) return Map.of();
        return json.readValue(str(value), Map.class);
    }
    private static String str(Object value) { return value == null ? "" : value.toString(); }
    private static String fallback(Object value, String fallback) { return str(value).isBlank() ? fallback : str(value); }
    private static boolean truth(Object value) { return Boolean.TRUE.equals(value) || value instanceof Number n && n.intValue() != 0; }
    private static String iso(Object value) {
        return value instanceof Timestamp timestamp ? timestamp.toLocalDateTime().toString() : str(value);
    }
}

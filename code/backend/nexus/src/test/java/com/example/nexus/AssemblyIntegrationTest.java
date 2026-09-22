package com.example.nexus;

import com.example.nexus.controller.AssemblyWorkspaceController;
import com.example.nexus.service.AssemblyRules;
import com.example.nexus.service.AssemblyService;
import java.util.*;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;

/** Run only against the disposable local schema, never application.properties. */
@EnabledIfSystemProperty(named = "assembly.test.url", matches = "jdbc:mysql://127\\.0\\.0\\.1:3308/assembly_test.*")
class AssemblyIntegrationTest {
    static JdbcTemplate db;
    static AssemblyService service;
    static TransactionTemplate transaction;
    static final List<Boolean> NO = Collections.nCopies(6, false);
    static final List<Boolean> YES = Collections.nCopies(6, true);

    @BeforeAll static void schema() {
        var source = new DriverManagerDataSource(System.getProperty("assembly.test.url"), "root", "");
        db = new JdbcTemplate(source);
        transaction = new TransactionTemplate(new DataSourceTransactionManager(source));
        service = new AssemblyService(db);
        // Relevant pre-V22 columns follow V1, V9, V14 and V21; migrations under test are unchanged files.
        db.execute("CREATE TABLE vendors (vendor_id INT PRIMARY KEY, shop_name VARCHAR(100))");
        db.execute("CREATE TABLE products (id INT PRIMARY KEY, vendor_id INT, name VARCHAR(150))");
        db.execute("CREATE TABLE gift_boxes (id INT PRIMARY KEY, vendor_id INT, name VARCHAR(150))");
        db.execute("CREATE TABLE orders (order_id INT PRIMARY KEY, assembler_id INT NULL, status ENUM('PENDING','CONFIRMED','RECEIVED','ASSEMBLING','READY','SHIPPED','DELIVERED','CANCELLED') DEFAULT 'PENDING', occasion VARCHAR(50), box_size VARCHAR(50), wrapping_style VARCHAR(50), recipient_name VARCHAR(100), gift_message TEXT, custom_box_details LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
        db.execute("CREATE TABLE order_items (id INT PRIMARY KEY, order_id INT, product_id INT, gift_box_id INT, quantity INT NOT NULL, FOREIGN KEY (order_id) REFERENCES orders(order_id))");
        var flyway = Flyway.configure().dataSource(source).locations("classpath:db/migration").baselineVersion("21").load();
        flyway.baseline();
        assertEquals(2, flyway.migrate().migrationsExecuted);
        db.update("INSERT INTO vendors VALUES (1, 'Real vendor')");
        db.update("INSERT INTO products VALUES (1, 1, 'Real candle')");
        db.update("INSERT INTO gift_boxes VALUES (1, 1, 'Ready-made gift')");
    }
    @BeforeEach void seed() {
        db.update("DELETE FROM order_items");
        db.update("DELETE FROM orders");
        db.update("INSERT INTO orders (order_id, status, box_size, custom_box_details) VALUES (1, 'CONFIRMED', 'MEDIUM', '{\"ribbonColor\":\"Gold\",\"hasWaxSeal\":true}')");
        db.update("INSERT INTO order_items (id, order_id, product_id, quantity) VALUES (10, 1, 1, 2)");
    }
    AssemblyRules.Change change(int revision, String action, int received, String condition, List<Boolean> checks, String issue) {
        return new AssemblyRules.Change(revision, action, List.of(new AssemblyRules.Item(10, received, condition)), checks, "Packing note", issue);
    }
    Map<String, Object> update(AssemblyRules.Change change) {
        return transaction.execute(status -> service.update(1, 42, change));
    }
    @SuppressWarnings("unchecked") Map<String, Object> state(Map<String, Object> order) { return (Map<String, Object>) order.get("workspace"); }

    @Test void readsRealProductsAndCustomization() {
        var order = service.get(1, 42);
        assertEquals(2, order.get("total"));
        assertEquals(0, order.get("received"));
        assertTrue(state(order).get("items").toString().contains("Real candle"));
        assertTrue(order.get("customization").toString().contains("Gold"));
    }
    @Test void completeWorkflowPersistsAndLocksSubmission() {
        update(change(0, "confirm", 2, "good", NO, ""));
        update(change(1, "start", 2, "good", NO, ""));
        var saved = update(change(2, "submit", 2, "good", YES, ""));
        assertEquals("review", saved.get("status"));
        assertFalse(saved.get("submittedAt").toString().isBlank());
        assertEquals(42, db.queryForObject("SELECT assembler_id FROM orders WHERE order_id=1", Integer.class));
        assertEquals("READY", db.queryForObject("SELECT status FROM orders WHERE order_id=1", String.class));
        assertEquals(3, ((List<?>) state(service.get(1, 42)).get("activity")).size());
        assertThrows(ResponseStatusException.class, () -> update(change(3, "save", 2, "good", YES, "")));
    }
    @Test void cannotSubmitBeforeReceiptOrWithIncompleteChecks() {
        assertThrows(ResponseStatusException.class, () -> update(change(0, "submit", 0, "unchecked", YES, "")));
        update(change(0, "confirm", 2, "good", NO, ""));
        update(change(1, "start", 2, "good", NO, ""));
        assertThrows(ResponseStatusException.class, () -> update(change(2, "submit", 2, "good", NO, "")));
    }
    @Test void holdsMustBeResolvedAndReceiptReconfirmed() {
        update(change(0, "report", 1, "damaged", NO, "Broken candle"));
        assertThrows(ResponseStatusException.class, () -> update(change(1, "confirm", 2, "good", NO, "")));
        assertThrows(ResponseStatusException.class, () -> update(change(1, "resolve", 1, "damaged", NO, "")));
        var resolved = update(change(1, "resolve", 2, "good", NO, ""));
        assertEquals("", resolved.get("issue"));
        assertEquals(false, state(resolved).get("receiptConfirmed"));
        assertThrows(ResponseStatusException.class, () -> update(change(2, "start", 2, "good", NO, "")));
    }
    @Test void editingReceiptResetsAssemblyAndChecks() {
        update(change(0, "confirm", 2, "good", NO, ""));
        update(change(1, "start", 2, "good", NO, ""));
        var saved = update(change(2, "save", 1, "good", YES, ""));
        assertEquals("awaiting", saved.get("status"));
        assertEquals(NO, state(saved).get("checks"));
        assertEquals(false, state(saved).get("receiptConfirmed"));
    }
    @Test void rejectsStaleSavesWithoutOverwriting() {
        update(change(0, "save", 1, "good", NO, ""));
        var exception = assertThrows(ResponseStatusException.class, () -> update(change(0, "save", 2, "good", NO, "")));
        assertEquals(409, exception.getStatusCode().value());
        assertEquals(1, service.get(1, 42).get("received"));
    }
    @Test void anotherAssemblerCannotReadOrClaimSavedOrder() {
        update(change(0, "save", 1, "good", NO, ""));
        assertTrue(service.list(43).isEmpty());
        assertEquals(403, assertThrows(ResponseStatusException.class, () -> service.get(1, 43)).getStatusCode().value());
        assertThrows(ResponseStatusException.class, () -> transaction.execute(status -> service.update(1, 43, change(1, "save", 2, "good", NO, ""))));
    }
    @Test void rejectsInvalidQuantitiesAndForeignItems() {
        assertThrows(ResponseStatusException.class, () -> update(change(0, "save", 3, "good", NO, "")));
        assertThrows(ResponseStatusException.class, () -> update(change(0, "save", -1, "good", NO, "")));
        assertThrows(ResponseStatusException.class, () -> update(new AssemblyRules.Change(0, "save", List.of(new AssemblyRules.Item(999, 1, "good")), NO, "", "")));
        assertEquals(0, service.get(1, 42).get("received"));
    }
    @Test void pendingCancelledAndDispatchedOrdersAreNotWorkable() {
        for (String status : List.of("PENDING", "CANCELLED", "SHIPPED", "DELIVERED", "RECEIVED")) {
            db.update("UPDATE orders SET status=? WHERE order_id=1", status);
            assertTrue(service.list(42).isEmpty());
            assertThrows(ResponseStatusException.class, () -> update(change(0, "save", 1, "good", NO, "")));
        }
    }
    @Test void supportsGiftBoxItemsWithoutProductId() {
        db.update("UPDATE order_items SET product_id=NULL, gift_box_id=1 WHERE id=10");
        assertTrue(state(service.get(1, 42)).get("items").toString().contains("Ready-made gift"));
        update(change(0, "confirm", 2, "good", NO, ""));
    }
    @Test void controllerRejectsOtherRolesAndUsesTokenIdentity() {
        var controller = new AssemblyWorkspaceController(service);
        var customer = new UsernamePasswordAuthenticationToken("customer", null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
        customer.setDetails(42);
        assertThrows(ResponseStatusException.class, () -> controller.list(customer));
        assertThrows(ResponseStatusException.class, () -> controller.list(null));
        var assembler = new UsernamePasswordAuthenticationToken("assembler", null, List.of(new SimpleGrantedAuthority("ROLE_ASSEMBLER")));
        assembler.setDetails(42);
        assertEquals(1, controller.list(assembler).size());
    }
}

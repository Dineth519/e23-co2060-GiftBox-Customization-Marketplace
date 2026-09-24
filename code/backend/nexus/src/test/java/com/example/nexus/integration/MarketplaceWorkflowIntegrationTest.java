package com.example.nexus.integration;

import com.example.nexus.model.Assembler;
import com.example.nexus.model.Product;
import com.example.nexus.model.Role;
import com.example.nexus.model.User;
import com.example.nexus.model.Vendor;
import com.example.nexus.repository.OrderItemRepository;
import com.example.nexus.repository.OrderRepository;
import com.example.nexus.repository.ProductRepository;
import com.example.nexus.repository.SubOrderRepository;
import com.example.nexus.repository.UserRepository;
import com.example.nexus.repository.VendorRepository;
import com.example.nexus.service.EmailService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Import(MarketplaceWorkflowIntegrationTest.NoEmailConfiguration.class)
class MarketplaceWorkflowIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate db;
    @Autowired UserRepository users;
    @Autowired VendorRepository vendors;
    @Autowired ProductRepository products;
    @Autowired OrderRepository orders;
    @Autowired OrderItemRepository orderItems;
    @Autowired SubOrderRepository subOrders;
    @Autowired PasswordEncoder passwords;
    private final JsonMapper json = JsonMapper.builder().build();

    @TestConfiguration
    static class NoEmailConfiguration {
        @Bean
        @Primary
        EmailService noOpEmailService() {
            return new EmailService() {
                @Override public void sendVerificationCode(String toEmail, String code) { }
            };
        }
    }

    @BeforeAll
    void addAssemblyWorkflowColumns() {
        db.execute("ALTER TABLE assemblers ADD COLUMN IF NOT EXISTS full_name VARCHAR(100)");
        db.execute("ALTER TABLE assemblers ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)");
        db.execute("ALTER TABLE assemblers ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE'");
        db.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS assembly_status VARCHAR(20) DEFAULT 'awaiting' NOT NULL");
        db.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS assembly_revision INT DEFAULT 0 NOT NULL");
        db.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS assembly_activity LONGTEXT");
        db.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS assembly_submitted_at TIMESTAMP");
        db.execute("ALTER TABLE order_items ADD COLUMN IF NOT EXISTS received_quantity INT DEFAULT 0 NOT NULL");
        db.execute("ALTER TABLE order_items ADD COLUMN IF NOT EXISTS received_condition VARCHAR(20) DEFAULT 'unchecked' NOT NULL");
        db.execute("CREATE TABLE IF NOT EXISTS gift_boxes (id INT PRIMARY KEY, vendor_id INT, name VARCHAR(150), image_url VARCHAR(500))");
    }

    @BeforeEach
    void cleanDatabase() {
        db.execute("SET REFERENTIAL_INTEGRITY FALSE");
        for (String table : List.of("order_items", "sub_orders", "orders", "products", "cart_items", "carts",
                "custom_box_cart", "admins", "assemblers", "customers", "vendors", "users", "categories", "gift_boxes")) {
            db.execute("TRUNCATE TABLE " + table + " RESTART IDENTITY");
        }
        db.execute("SET REFERENTIAL_INTEGRITY TRUE");
    }

    @Test
    void vendorApprovalCustomerOrderAndAssemblyDeliveryWorkAcrossRoles() throws Exception {
        var admin = saveUser("admin", "admin@giftora.test", "AdminPass1", Role.ADMIN);
        var assembler = saveAssembler("assembler", "assembler@giftora.test", "AssemblerPass1");

        mvc.perform(post("/api/vendors/register").contentType(MediaType.APPLICATION_JSON).content("""
                {"shopName":"Integration Gifts","ownerName":"Vendor Owner","email":"vendor@giftora.test",
                 "phone":"0771111111","businessRegNumber":"BR-100","category":"Gifts",
                 "address":"10 Market Road","city":"Kandy","password":"VendorPass1"}
                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        Vendor vendor = vendors.findByShopName("Integration Gifts").orElseThrow();
        assertEquals("PENDING", vendor.getStatus());

        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("vendor@giftora.test", "VendorPass1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Vendor application is pending admin approval"));

        String adminToken = login("admin", "AdminPass1");
        mvc.perform(put("/api/vendors/{id}/status", vendor.getVendorId())
                        .param("status", "ACTIVE").header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        String vendorToken = login("vendor@giftora.test", "VendorPass1");
        String assemblerToken = login("assembler", "AssemblerPass1");
        CustomerIdentity customer = registerVerifyAndLogin(
                "customer-one", "customer1@giftora.test", "CustomerPass1");

        Product product = new Product();
        product.setVendorId(vendor.getVendorId());
        product.setName("Integration Chocolate");
        product.setDescription("Test product");
        product.setPrice(new BigDecimal("1250.00"));
        product.setStockQuantity(10);
        product.setImageUrl("https://example.test/chocolate.jpg");
        product.setIsActive(1);
        product = products.saveAndFlush(product);

        String orderResponse = mvc.perform(post("/api/orders/standard")
                        .header("Authorization", bearer(customer.token()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"customerId":%d,"deliveryAddress":"12 Temple Road, Kandy",
                                 "items":[{"productId":%d,"quantity":2}]}
                """.formatted(customer.id(), product.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn().getResponse().getContentAsString();

        int orderId = ((Number) json.readValue(orderResponse, Map.class).get("orderId")).intValue();
        assertEquals(8, products.findById(product.getId()).orElseThrow().getStockQuantity());

        int subOrderId = subOrders.findByVendorId(vendor.getVendorId()).get(0).getSubOrderId();
        mvc.perform(put("/api/sub-orders/{id}/status", subOrderId)
                        .header("Authorization", bearer(vendorToken))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"ACCEPTED_BY_VENDOR\"}"))
                .andExpect(status().isOk());
        assertEquals("CONFIRMED", orders.findById(orderId).orElseThrow().getStatus());
        mvc.perform(get("/api/assembler/orders")
                        .header("Authorization", bearer(assemblerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(String.valueOf(orderId)));

        mvc.perform(put("/api/sub-orders/{id}/status", subOrderId)
                        .header("Authorization", bearer(vendorToken))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"SENT_TO_ASSEMBLY\"}"))
                .andExpect(status().isOk());
        assertEquals("CONFIRMED", orders.findById(orderId).orElseThrow().getStatus());

        int orderItemId = orderItems.findByOrderId(orderId).get(0).getId();
        mvc.perform(put("/api/assembler/orders/{id}", orderId)
                        .header("Authorization", bearer(assemblerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assemblyChange(0, "confirm", orderItemId, false)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workspace.receiptConfirmed").value(true));

        mvc.perform(put("/api/assembler/orders/{id}", orderId)
                        .header("Authorization", bearer(assemblerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assemblyChange(1, "submit", orderItemId, true)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("completed"));
        assertEquals("READY", orders.findById(orderId).orElseThrow().getStatus());

        changeStatus(orderId, "SHIPPED", assemblerToken);
        changeStatus(orderId, "DELIVERED", assemblerToken);
        assertEquals("DELIVERED", orders.findById(orderId).orElseThrow().getStatus());

        changeStatus(orderId, "RECEIVED", customer.token());
        assertEquals("RECEIVED", orders.findById(orderId).orElseThrow().getStatus());
        assertTrue(users.findById(admin.getId()).isPresent());
        assertTrue(users.findById(assembler.getId()).isPresent());
    }

    @Test
    void databaseCartsPersistSeparatelyAndResyncWithoutDuplicates() throws Exception {
        CustomerIdentity first = registerVerifyAndLogin("cart-one", "cart1@giftora.test", "CustomerPass1");
        CustomerIdentity second = registerVerifyAndLogin("cart-two", "cart2@giftora.test", "CustomerPass2");

        int firstCartId = syncCart(first, 90, 501, 1);
        int secondCartId = syncCart(second, 90, 777, 2);
        assertFalse(firstCartId == secondCartId);

        mvc.perform(get("/api/db-cart/{cartId}/items", firstCartId)
                        .header("Authorization", bearer(first.token())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productId").value(501))
                .andExpect(jsonPath("$[0].quantity").value(1));

        mvc.perform(get("/api/db-cart/{cartId}/items", secondCartId)
                        .header("Authorization", bearer(second.token())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productId").value(777))
                .andExpect(jsonPath("$[0].quantity").value(2));

        mvc.perform(get("/api/db-cart/{customerId}", second.id())
                        .header("Authorization", bearer(first.token())))
                .andExpect(status().isForbidden());

        int resyncedCartId = syncCart(first, 90, 501, 3);
        assertEquals(firstCartId, resyncedCartId);
        mvc.perform(get("/api/db-cart/{cartId}/items", firstCartId)
                        .header("Authorization", bearer(first.token())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].quantity").value(3));

        mvc.perform(get("/api/db-cart/{cartId}/items", secondCartId)
                        .header("Authorization", bearer(second.token())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].quantity").value(2));
    }

    private User saveUser(String username, String email, String password, Role role) {
        User user = new User();
        user.setName(username);
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwords.encode(password));
        user.setRole(role);
        user.setVerified(true);
        return users.saveAndFlush(user);
    }

    private Assembler saveAssembler(String username, String email, String password) {
        Assembler assembler = new Assembler();
        assembler.setName(username);
        assembler.setUsername(username);
        assembler.setEmail(email);
        assembler.setPassword(passwords.encode(password));
        assembler.setRole(Role.ASSEMBLER);
        assembler.setVerified(true);
        assembler.setFullName("Integration Assembler");
        assembler.setStatus("ACTIVE");
        return users.saveAndFlush(assembler);
    }

    private CustomerIdentity registerVerifyAndLogin(String username, String email, String password) throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
                {"name":"Integration Customer","username":"%s","email":"%s","password":"%s"}
                """.formatted(username, email, password)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
        User customer = users.findByEmail(email).orElseThrow();
        mvc.perform(post("/api/auth/verify-email").contentType(MediaType.APPLICATION_JSON).content("""
                {"email":"%s","code":"%s"}
                """.formatted(email, customer.getVerificationCode())))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
        return new CustomerIdentity(customer.getId(), login(username, password));
    }

    @SuppressWarnings("unchecked")
    private String login(String username, String password) throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson(username, password)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
                .andReturn().getResponse().getContentAsString();
        return (String) json.readValue(body, Map.class).get("accessToken");
    }

    private String loginJson(String username, String password) {
        return "{\"username\":\"%s\",\"password\":\"%s\"}".formatted(username, password);
    }

    private String assemblyChange(int revision, String action, int itemId, boolean allChecks) {
        String checks = allChecks ? "true,true,true,true,true,true" : "false,false,false,false,false,false";
        return """
                {"revision":%d,"action":"%s","items":[{"id":%d,"received":2,"condition":"good"}],
                 "checks":[%s],"notes":"Integration packing complete","issue":""}
                """.formatted(revision, action, itemId, checks);
    }

    private void changeStatus(int orderId, String statusValue, String token) throws Exception {
        mvc.perform(put("/api/orders/{id}/status", orderId)
                        .header("Authorization", bearer(token)).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"%s\"}".formatted(statusValue)))
                .andExpect(status().isOk());
    }

    @SuppressWarnings("unchecked")
    private int syncCart(CustomerIdentity customer, int partnerId, int productId, int quantity) throws Exception {
        String body = mvc.perform(post("/api/db-cart/sync")
                        .header("Authorization", bearer(customer.token())).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"customerId":%d,"partnerId":%d,"items":[{"productId":%d,"quantity":%d}]}
                                """.formatted(customer.id(), partnerId, productId, quantity)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return ((Number) json.readValue(body, Map.class).get("cartId")).intValue();
    }

    private String bearer(String token) { return "Bearer " + token; }
    private record CustomerIdentity(Integer id, String token) {}
}

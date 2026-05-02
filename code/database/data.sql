-- ============================================================
-- DATA SCRIPT - FIXED VERSION
-- Proper order: Users → Role tables → Products → Orders
-- ============================================================

-- ============================================================
-- 1. USERS (All roles)
-- ============================================================
INSERT INTO users (user_id, name, username, email, password, role, is_verified, phone_number, address_line1, city) 
VALUES 
-- Admin
(1, 'System Admin', 'admin', 'admin@giftora.lk', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'ADMIN', 1, '0771234567', 'Admin Building', 'Colombo'),

-- Partners
(2, 'Amila Perera', 'giftworld', 'amila@giftworld.lk', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'PARTNER', 1, '0771234567', 'No. 45, Galle Road', 'Colombo'),
(3, 'Kasun Silva', 'luckygifts', 'kasun@lucky.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'PARTNER', 1, '0779876543', 'No. 12, Main Street', 'Kandy'),
(4, 'Nuwan Perera', 'craftyhands', 'nuwan@crafty.lk', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'PARTNER', 1, '0712345678', 'No. 78, High Street', 'Galle'),

-- Customers
(5, 'Dilshan Kavinda', 'dilshan_k', 'dilshan@gmail.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1, '0711111111', '123 Lotus Road', 'Colombo'),
(6, 'Sanath Jayasuriya', 'sanath_j', 'sanath@yahoo.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1, '0722222222', '45 Kandy Road', 'Kurunegala'),
(7, 'Kasun Perera', 'kasun_p', 'kasun.perera@gmail.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1, '0733333333', '56 Main Street', 'Kandy'),
(8, 'Amaya Silva', 'amaya_s', 'amaya.silva99@yahoo.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1, '0744444444', '78 Beach Road', 'Galle'),
(9, 'Nimal Fernando', 'nimal_fdo', 'nimalf@hotmail.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 0, '0755555555', '90 City Lane', 'Jaffna'),
(10, 'Tharushi Mendis', 'tharushi_m', 'mendis.tharushi@gmail.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1, '0766666666', '12 Market Street', 'Negombo'),
(11, 'Ruwan Kumara', 'ruwan_k', 'ruwan.kumara@outlook.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1, '0777777777', '34 Park Avenue', 'Matara'),
(12, 'Piyumi Hansika', 'piyumi_h', 'piyumihansika@gmail.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1, '0788888888', '56 Garden Lane', 'Colombo'),
(13, 'Lahiru Madushan', 'lahiru_madu', 'lahiru.madushan@yahoo.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 0, '0799999999', '78 Ocean Drive', 'Mirissa'),
(14, 'Chamari Atapattu', 'chamari_a', 'chamari.a@gmail.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1, '0701010101', '90 Temple Road', 'Kandy'),
(15, 'Sahan Rajapaksha', 'sahan_raj', 'sahan.rajapaksha@hotmail.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1, '0702020202', '11 Forest Street', 'Nuwara Eliya'),
(16, 'Nuwan Pradeep', 'nuwan_p', 'nuwan.pradeep@gmail.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1, '0703030303', '23 River Road', 'Colombo');

-- ============================================================
-- 2. ADMIN TABLE (Only admin record)
-- ============================================================
INSERT INTO admins (admin_id) 
VALUES (1);

-- ============================================================
-- 3. CUSTOMER TABLE
-- ============================================================
INSERT INTO customers (customer_id) 
VALUES (5), (6), (7), (8), (9), (10), (11), (12), (13), (14), (15), (16);

-- ============================================================
-- 4. PARTNER TABLE (IMPORTANT: Must be before products!)
-- ============================================================
INSERT INTO partners (partner_id, shop_name, full_name, phone_number, categories, shop_address, verification_id, status, is_trusted) 
VALUES 
(2, 'Gift World', 'Amila Perera', '0771234567', 'Handmade, Corporate', 'No. 45, Galle Road, Colombo 03', 'BR-99210', 'ACTIVE', 1),
(3, 'Lucky Gifts', 'Kasun Silva', '0779876543', 'Toys, Kids', 'No. 12, Main Street, Kandy', 'BR-88452', 'ACTIVE', 1),
(4, 'Crafty Hands', 'Nuwan Perera', '0712345678', 'Artisan, Gifts', 'No. 78, High Street, Galle', 'BR-77123', 'ACTIVE', 1);

-- ============================================================
-- 5. CATEGORIES
-- ============================================================
INSERT INTO categories (name) VALUES 
('Chocolates'),
('Flowers'),
('Perfume'),
('Candles'),
('Teddy Bears'),
('Bangles'),
('Wine'),
('Watches'),
('Handmade'),
('Corporate');

-- ============================================================
-- 6. PRODUCTS (Now partners exist!)
-- ============================================================
INSERT INTO products (partner_id, category_id, name, description, price, stock_quantity, sku, image_url, is_active, rating) 
VALUES 
-- Partner 2 (Gift World)
(2, 1, 'Belgian Chocolate Box', 'Premium Belgian chocolates - perfect for any occasion', 2500.00, 50, 'CHOC-001', 'https://via.placeholder.com/300?text=Chocolate+Box', 1, 4.8),
(2, 2, 'Fresh Rose Bouquet', 'Beautiful red roses - 12 stems', 3500.00, 30, 'FLOW-001', 'https://via.placeholder.com/300?text=Rose+Bouquet', 1, 4.9),
(2, 3, 'Luxury Perfume Set', 'Exotic perfume collection', 5500.00, 20, 'PERF-001', 'https://via.placeholder.com/300?text=Perfume+Set', 1, 4.7),
(2, 4, 'Scented Candle Pack', 'Aromatic candles for relaxation', 1800.00, 100, 'CAND-001', 'https://via.placeholder.com/300?text=Candle+Pack', 1, 4.6),
(2, 5, 'Teddy Bear Premium', 'Soft and cuddly teddy bear', 2000.00, 40, 'TEDD-001', 'https://via.placeholder.com/300?text=Teddy+Bear', 1, 4.8),

-- Partner 3 (Lucky Gifts)
(3, 1, 'Assorted Chocolate Truffles', 'Gourmet chocolate truffles - mixed flavors', 3200.00, 60, 'CHOC-002', 'https://via.placeholder.com/300?text=Chocolate+Truffles', 1, 4.9),
(3, 6, 'Designer Bangles Set', 'Traditional Sri Lankan bangles', 4500.00, 25, 'BANG-001', 'https://via.placeholder.com/300?text=Bangles+Set', 1, 4.7),
(3, 7, 'Premium Red Wine', 'French red wine - excellent quality', 6500.00, 15, 'WINE-001', 'https://via.placeholder.com/300?text=Red+Wine', 1, 4.9),
(3, 8, 'Classic Wristwatch', 'Elegant analog wristwatch', 8500.00, 12, 'WATC-001', 'https://via.placeholder.com/300?text=Wristwatch', 1, 4.8),
(3, 9, 'Handmade Ceramic Mug', 'Beautiful artisan ceramic mug', 1500.00, 80, 'HAND-001', 'https://via.placeholder.com/300?text=Ceramic+Mug', 1, 4.6),

-- Partner 4 (Crafty Hands)
(4, 9, 'Handwoven Basket', 'Traditional Sri Lankan weaving', 2800.00, 35, 'HAND-002', 'https://via.placeholder.com/300?text=Weaved+Basket', 1, 4.7),
(4, 10, 'Corporate Gift Pack', 'Premium corporate gifting box', 7500.00, 20, 'CORP-001', 'https://via.placeholder.com/300?text=Corporate+Pack', 1, 4.8),
(4, 2, 'Orchid Plants', 'Exotic orchid plants', 4200.00, 18, 'PLAN-001', 'https://via.placeholder.com/300?text=Orchid+Plant', 1, 4.9),
(4, 4, 'Natural Soap Set', 'Organic handmade soaps', 2200.00, 70, 'SOAP-001', 'https://via.placeholder.com/300?text=Soap+Set', 1, 4.7),
(4, 1, 'Dark Chocolate Bar', 'Premium dark chocolate 70% cocoa', 1200.00, 120, 'CHOC-003', 'https://via.placeholder.com/300?text=Dark+Chocolate', 1, 4.8);

-- ============================================================
-- 7. GIFT BOXES
-- ============================================================
INSERT INTO gift_boxes (partner_id, name, description, price, image_url, is_active) 
VALUES 
(2, 'Romance Box', 'Perfect for couples - roses, chocolates, and candles', 8500.00, 'https://via.placeholder.com/300?text=Romance+Box', 1),
(2, 'Wellness Box', 'Self-care essentials - soaps, candles, perfume', 7200.00, 'https://via.placeholder.com/300?text=Wellness+Box', 1),
(3, 'Celebration Box', 'Party essentials with wine and chocolates', 12500.00, 'https://via.placeholder.com/300?text=Celebration+Box', 1),
(4, 'Artisan Box', 'Handmade crafts and premium items', 9800.00, 'https://via.placeholder.com/300?text=Artisan+Box', 1);

-- ============================================================
-- 8. GIFT BOX ITEMS
-- ============================================================
INSERT INTO gift_box_items (gift_box_id, product_id, quantity) 
VALUES 
(1, 2, 1),
(1, 1, 1),
(1, 4, 2),
(2, 11, 1),
(2, 3, 1),
(2, 4, 1),
(3, 8, 1),
(3, 6, 1),
(3, 9, 1),
(4, 10, 1),
(4, 12, 1),
(4, 13, 2);

-- ============================================================
-- 9. ORDERS
-- ============================================================
INSERT INTO orders (customer_id, partner_id, status, total_amount, delivery_address, created_at) 
VALUES 
-- Past week
(5, 2, 'DELIVERED', 4500.00, '123 Lotus Road, Colombo 00100', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(6, 2, 'DELIVERED', 12000.00, '45 Kandy Road, Kurunegala 00600', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(7, 3, 'SHIPPED', 8500.00, '56 Main Street, Kandy 20000', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(8, 4, 'DELIVERED', 15000.00, '78 Beach Road, Galle 80000', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(9, 2, 'CONFIRMED', 7200.00, '90 City Lane, Jaffna 40000', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 3, 'PENDING', 5400.00, '123 Lotus Road, Colombo 00100', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 4, 'DELIVERED', 9800.00, '45 Kandy Road, Kurunegala 00600', CURDATE()),

-- Monthly data
(7, 2, 'DELIVERED', 18500.00, '56 Main Street, Kandy 20000', '2025-12-15 10:00:00'),
(8, 3, 'DELIVERED', 22000.00, '78 Beach Road, Galle 80000', '2026-01-20 11:30:00'),
(9, 2, 'DELIVERED', 25000.00, '90 City Lane, Jaffna 40000', '2026-02-10 09:15:00'),
(5, 4, 'DELIVERED', 31000.00, '123 Lotus Road, Colombo 00100', '2026-03-05 14:20:00'),
(6, 2, 'DELIVERED', 38500.00, '45 Kandy Road, Kurunegala 00600', '2026-04-12 16:45:00');

-- ============================================================
-- 10. ORDER ITEMS
-- ============================================================
INSERT INTO order_items (order_id, partner_id, product_id, quantity, unit_price) 
VALUES 
(1, 2, 1, 1, 2500.00),
(1, 2, 4, 1, 1800.00),
(2, 2, 2, 1, 3500.00),
(2, 2, 3, 1, 5500.00),
(2, 2, 5, 1, 2000.00),
(3, 3, 6, 1, 3200.00),
(3, 3, 7, 1, 4500.00),
(3, 3, 9, 1, 1500.00),
(4, 4, 10, 1, 7500.00),
(4, 4, 12, 1, 4200.00),
(4, 4, 13, 1, 2200.00),
(5, 2, 1, 2, 2500.00),
(5, 2, 4, 1, 1800.00),
(6, 3, 6, 1, 3200.00),
(6, 3, 8, 1, 6500.00),
(7, 4, 14, 1, 1200.00),
(7, 4, 11, 2, 2200.00),
(8, 2, 1, 3, 2500.00),
(8, 2, 2, 2, 3500.00),
(9, 3, 8, 1, 6500.00),
(9, 3, 6, 2, 3200.00),
(10, 2, 3, 1, 5500.00),
(10, 2, 5, 2, 2000.00),
(11, 4, 10, 1, 7500.00),
(11, 4, 12, 2, 4200.00),
(12, 2, 4, 3, 1800.00),
(12, 2, 1, 2, 2500.00);
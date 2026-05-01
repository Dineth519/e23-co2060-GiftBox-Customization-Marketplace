-- ============================================================
-- data.sql : USERS, PARTNERS & CUSTOMERS
-- ============================================================

-- 1. Admin
INSERT INTO users (name, username, email, password, role, is_verified) 
VALUES ('System Admin', 'Admin', 'admin@giftassemble.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'ADMIN', 1);

-- 2. Partners (Vendors)
INSERT INTO users (name, username, email, password, role, is_verified) VALUES 
('Amila Perera', 'giftworld', 'amila@giftworld.lk', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'PARTNER', 1),
('Kasun Silva', 'luckygifts', 'kasun@lucky.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'PARTNER', 1),
('Nuwan Perera', 'craftyhands', 'nuwan@crafty.lk', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'PARTNER', 1);

-- 3. Partner Details
UPDATE partners SET shop_name = 'Gift World', categories = 'Handmade, Corporate', shop_address = 'No. 45, Galle Road, Colombo 03', verification_id = 'BR-99210', full_name = 'Amila Perera', phone_number = '0771234567', status = 'ACTIVE' WHERE partner_id = 2;
UPDATE partners SET shop_name = 'Lucky Gifts', categories = 'Toys, Kids', shop_address = 'No. 12, Main Street, Kandy', verification_id = 'BR-88452', full_name = 'Kasun Silva', phone_number = '0779876543', status = 'ACTIVE' WHERE partner_id = 3;

-- 4. Customers
INSERT INTO users (name, username, email, password, role, is_verified) VALUES 
('Dilshan Kavinda', 'dilshan_k', 'dilshan@gmail.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1),
('Sanath Jayasuriya', 'sanath_j', 'sanath@yahoo.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1),
('Kasun Perera', 'kasun_p', 'kasun.perera@gmail.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1),
('Amaya Silva', 'amaya_s', 'amaya.silva99@yahoo.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1),
('Nimal Fernando', 'nimal_fdo', 'nimalf@hotmail.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 0),
('Tharushi Mendis', 'tharushi_m', 'mendis.tharushi@gmail.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1),
('Ruwan Kumara', 'ruwan_k', 'ruwan.kumara@outlook.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1),
('Piyumi Hansika', 'piyumi_h', 'piyumihansika@gmail.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1),
('Lahiru Madushan', 'lahiru_madu', 'lahiru.madushan@yahoo.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 0),
('Chamari Atapattu', 'chamari_a', 'chamari.a@gmail.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1),
('Sahan Rajapaksha', 'sahan_raj', 'sahan.rajapaksha@hotmail.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1),
('Nuwan Pradeep', 'nuwan_p', 'nuwan.pradeep@gmail.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1);

-- 5. Customer Addresses
UPDATE customers SET address = '123 Lotus Rd, Colombo' WHERE customer_id = 5;
UPDATE customers SET address = '45 Kandy Rd, Kurunegala' WHERE customer_id = 6;

-- 6. Consolidated Orders for Graphs (Weekly & Monthly Stats)
INSERT INTO orders (customer_id, partner_id, status, total_amount, created_at, delivery_address) VALUES
-- for the past week 
(5, 2, 'DELIVERED', 4500.00,  DATE_SUB(NOW(), INTERVAL 6 DAY), 'Colombo'),
(6, 2, 'DELIVERED', 12000.00, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Kandy'),
(7, 2, 'SHIPPED',   8500.00,  DATE_SUB(NOW(), INTERVAL 4 DAY), 'Galle'),
(8, 2, 'DELIVERED', 15000.00, DATE_SUB(NOW(), INTERVAL 3 DAY), 'Jaffna'),
(9, 2, 'CONFIRMED', 7200.00,  DATE_SUB(NOW(), INTERVAL 2 DAY), 'Negombo'), -- 'PROCESSING' වෙනුවට 'CONFIRMED'
(5, 2, 'PENDING',   5400.00,  DATE_SUB(NOW(), INTERVAL 1 DAY), 'Matara'),
(6, 2, 'DELIVERED', 9800.00,  CURDATE(), 'Colombo'),

-- for the past month
(7, 2, 'DELIVERED', 150000.00, '2025-12-15 10:00:00', 'Colombo'),
(8, 2, 'DELIVERED', 185000.00, '2026-01-20 11:30:00', 'Kandy'),
(9, 2, 'DELIVERED', 210000.00, '2026-02-10 09:15:00', 'Galle'),
(5, 2, 'DELIVERED', 245000.00, '2026-03-05 14:20:00', 'Colombo'),
(6, 2, 'DELIVERED', 310000.00, '2026-04-12 16:45:00', 'Kurunegala');
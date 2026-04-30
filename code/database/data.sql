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
INSERT INTO partners (partner_id, shop_name, categories, shop_address, verification_id, full_name, phone_number, status) VALUES 
(2, 'Gift World', 'Handmade, Corporate', 'No. 45, Galle Road, Colombo 03', 'BR-99210', 'Amila Perera', '0771234567', 'ACTIVE'),
(3, 'Lucky Gifts', 'Toys, Kids', 'No. 12, Main Street, Kandy', 'BR-88452', 'Kasun Silva', '0779876543', 'ACTIVE');

-- 4. Customers
INSERT INTO users (name, username, email, password, role, is_verified) VALUES 
('Dilshan Kavinda', 'dilshan_k', 'dilshan@gmail.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1),
('Sanath Jayasuriya', 'sanath_j', 'sanath@yahoo.com', '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW', 'CUSTOMER', 1);

-- 5. Customer Addresses
INSERT INTO customers (customer_id, address) VALUES 
(5, '123 Lotus Rd, Colombo'),
(6, '45 Kandy Rd, Kurunegala');
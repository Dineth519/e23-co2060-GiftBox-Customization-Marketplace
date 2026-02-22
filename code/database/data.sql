-- 5.1 Admin
INSERT INTO users (name, username, email, password, role, is_verified) 
VALUES ('System Admin', 'Admin', 'admin@giftassemble.com', '1234', 'ADMIN', 1);

-- 5.2 Partners
INSERT INTO users (name, username, email, password, role, is_verified) VALUES 
('Amila Perera', 'giftworld', 'amila@giftworld.lk', 'pass123', 'PARTNER', 1),
('Kasun Silva', 'luckygifts', 'kasun@lucky.com', 'pass123', 'PARTNER', 1),
('Nuwan Perera', 'craftyhands', 'nuwan@crafty.lk', 'pass123', 'PARTNER', 1);

-- 5.3 Partner Details Update
UPDATE partners SET shop_name='Gift World', categories='Handmade, Corporate', shop_address='No. 45, Galle Road, Colombo 03', verification_id='BR-99210', status='PENDING' WHERE partner_id=2;
UPDATE partners SET shop_name='Lucky Gifts', categories='Toys, Kids', shop_address='No. 12, Main Street, Kandy', verification_id='BR-88452', status='ACTIVE' WHERE partner_id=3;

-- 5.4 Customers
INSERT INTO users (name, username, email, password, role, is_verified) VALUES 
('Dilshan Kavinda', 'dilshan_k', 'dilshan@gmail.com', 'pass123', 'CUSTOMER', 1),
('Sanath Jayasuriya', 'sanath_j', 'sanath@yahoo.com', 'pass123', 'CUSTOMER', 1);

-- 5.5 Customer Address Update
UPDATE customers SET address='123 Lotus Rd, Colombo' WHERE customer_id=5;
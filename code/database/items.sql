-- ============================================================
-- items.sql : CATEGORIES & PRODUCTS (Final Corrected Version)
-- ============================================================

-- 1. Insert Categories
INSERT INTO categories (name) VALUES 
('Wine'),
('Watches'),
('Perfume'),
('Teddy Bears'),
('Bangles'),
('Chocolates')
ON DUPLICATE KEY UPDATE name=name;

-- 2. Insert Products (Items)
-- SKU එක duplicate වුණොත් price, stock සහ image_url අලුත් අගයට update වේ.
INSERT INTO products (partner_id, name, price, stock_quantity, sku, image_url, category_id, is_active) VALUES
-- Wine Category
(2, 'Classic Red Wine', 4500.00, 15, 'WINE-001', 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869078/aesop-wines-X-Ga6EUFmhE-unsplash_en6tfm.jpg', (SELECT id FROM categories WHERE name = 'Wine'), 1),
(2, 'Vintage White Wine', 5200.00, 8, 'WINE-002', 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869201/christine-isakzhanova-L3kQLAmbPWA-unsplash_z49cfx.jpg', (SELECT id FROM categories WHERE name = 'Wine'), 1),
(2, 'Premium Rose Wine', 4800.00, 0, 'WINE-003', 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869247/fernanda-franca-o04Ae_ZMoZ8-unsplash_j8xj9a.jpg', (SELECT id FROM categories WHERE name = 'Wine'), 0),
(2, 'Luxury Wine Reserve', 7500.00, 5, 'WINE-004', 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869440/teanna-morgan-lWQm9d9aTHA-unsplash_qgl9fb.jpg', (SELECT id FROM categories WHERE name = 'Wine'), 1),

-- Watches Category
(3, 'Classic Men Watch', 12000.00, 10, 'WTCH-001', 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869620/fashion-needles-j74VJLrxSyY-unsplash_y8udej.jpg', (SELECT id FROM categories WHERE name = 'Watches'), 1),
(3, 'Elegant Ladies Watch', 14500.00, 12, 'WTCH-002', 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869636/fashion-needles-JxHlr52IaIM-unsplash_j68vjj.jpg', (SELECT id FROM categories WHERE name = 'Watches'), 1),
(3, 'Sporty Chronograph', 18000.00, 2, 'WTCH-003', 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869649/hunters-race-dE0sBTZCVoY-unsplash_afncm1.jpg', (SELECT id FROM categories WHERE name = 'Watches'), 1),
(3, 'Minimalist Leather Watch', 9500.00, 0, 'WTCH-004', 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869654/john-torcasio-TJrkkhdB39E-unsplash_qupwjf.jpg', (SELECT id FROM categories WHERE name = 'Watches'), 0),

-- Perfume Category
(2, 'Floral Essence Perfume', 6500.00, 20, 'PERF-001', 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869772/siora-photography-LkT5-JCePUY-unsplash_dccuxb.jpg', (SELECT id FROM categories WHERE name = 'Perfume'), 1),
(2, 'Midnight Bloom Eau de Parfum', 8200.00, 15, 'PERF-002', 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869784/laura-chouette-gbT2KAq1V5c-unsplash_emctei.jpg', (SELECT id FROM categories WHERE name = 'Perfume'), 1),

-- Teddy Bears Category
(3, 'Classic Brown Teddy', 3500.00, 50, 'TED-001', 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869829/__-drz-__-XGoqsrXWmgw-unsplash_eauziq.jpg', (SELECT id FROM categories WHERE name = 'Teddy Bears'), 1),
(3, 'Giant Huggable Bear', 8500.00, 5, 'TED-002', 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869833/alicia-christin-gerald-9JnL29YwQQ4-unsplash_sciwwj.jpg', (SELECT id FROM categories WHERE name = 'Teddy Bears'), 1),

-- Bangles Category
(2, 'Gold Plated Bangle Set', 5500.00, 25, 'BANG-001', 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869888/koushalya-karthikeyan-1co0FGg8_W4-unsplash_uteniw.jpg', (SELECT id FROM categories WHERE name = 'Bangles'), 1),
(2, 'Silver Charm Bangles', 4800.00, 30, 'BANG-002', 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869896/mansi-shah-8angSQtYgKc-unsplash_qejkb1.jpg', (SELECT id FROM categories WHERE name = 'Bangles'), 1),

-- Chocolates Category
(3, 'Premium Dark Chocolate Box', 2800.00, 40, 'CHOC-001', 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772870229/marqquin-NBd5A6j3pgg-unsplash_jr6zol.jpg', (SELECT id FROM categories WHERE name = 'Chocolates'), 1),
(3, 'Assorted Truffle Collection', 3500.00, 35, 'CHOC-002', 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772870235/kavita-jangid-80zX8-Nz7Os-unsplash_lpiawe.jpg', (SELECT id FROM categories WHERE name = 'Chocolates'), 1)

ON DUPLICATE KEY UPDATE 
    price = VALUES(price),
    stock_quantity = VALUES(stock_quantity),
    image_url = VALUES(image_url),
    is_active = VALUES(is_active);

-- 3. Insert Orders
-- පරණ orders තිබුණොත් duplicate error එකක් එන නිසා මෙහිදී INSERT IGNORE භාවිතා කර ඇත.
INSERT IGNORE INTO orders (customer_id, partner_id, status, delivery_address, special_notes, total_amount) VALUES
((SELECT user_id FROM users WHERE username = 'dilshan_k'), 2, 'PENDING', '123 Galle Road, Colombo 03', 'Please deliver after 4 PM', 8450.00),
((SELECT user_id FROM users WHERE username = 'sanath_j'), 2, 'CONFIRMED', '45 Kandy Road, Peradeniya', 'Call before delivery', 12000.00),
((SELECT user_id FROM users WHERE username = 'kasun_p'), 2, 'DELIVERED', '12 Temple Trees, Colombo 01', 'Gift wrap needed', 14750.00),
((SELECT user_id FROM users WHERE username = 'amaya_s'), 2, 'PENDING', '89 Flower Road, Colombo 07', NULL, 9200.00),
((SELECT user_id FROM users WHERE username = 'nimal_fdo'), 2, 'CANCELLED', '22 Beach Road, Mount Lavinia', 'Customer requested cancellation', 5600.00),
((SELECT user_id FROM users WHERE username = 'dilshan_k'), 2, 'SHIPPED', '55 High Level Road, Nugegoda', 'Leave at the front desk', 6800.00);
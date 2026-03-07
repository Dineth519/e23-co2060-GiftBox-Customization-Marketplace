-- 1. Create the categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- 2. Create the products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 3. Insert Categories
-- Adding the categories based on the image groups you provided.
INSERT INTO categories (name) VALUES 
('Wine'),
('Watches'),
('Perfume'),
('Teddy Bears'),
('Bangles'),
('Chocolates')
ON DUPLICATE KEY UPDATE name=name; -- Prevents errors if categories already exist

-- 4. Insert Products
-- Using subqueries to automatically get the correct category_id based on the category name.

-- Wine Category
INSERT INTO products (name, price, image_url, category_id) VALUES
('Classic Red Wine', 4500.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869078/aesop-wines-X-Ga6EUFmhE-unsplash_en6tfm.jpg', (SELECT id FROM categories WHERE name = 'Wine')),
('Vintage White Wine', 5200.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869201/christine-isakzhanova-L3kQLAmbPWA-unsplash_z49cfx.jpg', (SELECT id FROM categories WHERE name = 'Wine')),
('Premium Rose Wine', 4800.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869247/fernanda-franca-o04Ae_ZMoZ8-unsplash_j8xj9a.jpg', (SELECT id FROM categories WHERE name = 'Wine')),
('Luxury Wine Reserve', 7500.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869440/teanna-morgan-lWQm9d9aTHA-unsplash_qgl9fb.jpg', (SELECT id FROM categories WHERE name = 'Wine'));
-- Note: You had a duplicate wine URL in your list, so I only added 4 unique ones.

-- Watches Category
INSERT INTO products (name, price, image_url, category_id) VALUES
('Classic Men Watch', 12000.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869620/fashion-needles-j74VJLrxSyY-unsplash_y8udej.jpg', (SELECT id FROM categories WHERE name = 'Watches')),
('Elegant Ladies Watch', 14500.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869636/fashion-needles-JxHlr52IaIM-unsplash_j68vjj.jpg', (SELECT id FROM categories WHERE name = 'Watches')),
('Sporty Chronograph', 18000.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869649/hunters-race-dE0sBTZCVoY-unsplash_afncm1.jpg', (SELECT id FROM categories WHERE name = 'Watches')),
('Minimalist Leather Watch', 9500.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869654/john-torcasio-TJrkkhdB39E-unsplash_qupwjf.jpg', (SELECT id FROM categories WHERE name = 'Watches')),
('Luxury Gold Watch', 25000.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869663/puru-raj-B6z8FAfi7zY-unsplash_awe4la.jpg', (SELECT id FROM categories WHERE name = 'Watches')),
('Modern Smart Watch', 15000.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869675/mambawatches-ukJdqKqFcDA-unsplash_tqqnyr.jpg', (SELECT id FROM categories WHERE name = 'Watches'));

-- Perfume Category
INSERT INTO products (name, price, image_url, category_id) VALUES
('Floral Essence Perfume', 6500.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869772/siora-photography-LkT5-JCePUY-unsplash_dccuxb.jpg', (SELECT id FROM categories WHERE name = 'Perfume')),
('Midnight Bloom Eau de Parfum', 8200.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869784/laura-chouette-gbT2KAq1V5c-unsplash_emctei.jpg', (SELECT id FROM categories WHERE name = 'Perfume')),
('Ocean Breeze Cologne', 5800.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869797/jeroen-den-otter-2b0JeJTEclQ-unsplash_ox0tm2.jpg', (SELECT id FROM categories WHERE name = 'Perfume')),
('Spicy Amber Fragrance', 7000.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869806/fernando-andrade-potCPE_Cw8A-unsplash_hugosq.jpg', (SELECT id FROM categories WHERE name = 'Perfume')),
('Sweet Vanilla Perfume', 6200.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869777/laura-chouette-4sKdeIMiFEI-unsplash_wrghxv.jpg', (SELECT id FROM categories WHERE name = 'Perfume')),
('Woody Musk Cologne', 7500.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869791/jeroen-van-roij-sLQt9PjsCcs-unsplash_giwnsf.jpg', (SELECT id FROM categories WHERE name = 'Perfume'));

-- Teddy Bears Category
INSERT INTO products (name, price, image_url, category_id) VALUES
('Classic Brown Teddy', 3500.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869829/__-drz-__-XGoqsrXWmgw-unsplash_eauziq.jpg', (SELECT id FROM categories WHERE name = 'Teddy Bears')),
('Giant Huggable Bear', 8500.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869833/alicia-christin-gerald-9JnL29YwQQ4-unsplash_sciwwj.jpg', (SELECT id FROM categories WHERE name = 'Teddy Bears')),
('Cute Pink Teddy', 4200.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869874/oxana-lyashenko-FUFWKF_Tlk0-unsplash_ag1x1w.jpg', (SELECT id FROM categories WHERE name = 'Teddy Bears')),
('Soft White Bear', 3800.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869851/lucas-van-oort-Tv9w8mgoVzs-unsplash_hoh9ub.jpg', (SELECT id FROM categories WHERE name = 'Teddy Bears')),
('Little Pocket Teddy', 1500.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869865/barry-Kz9-JcSo7Zg-unsplash_vy3nc2.jpg', (SELECT id FROM categories WHERE name = 'Teddy Bears'));

-- Bangles Category
INSERT INTO products (name, price, image_url, category_id) VALUES
('Gold Plated Bangle Set', 5500.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869888/koushalya-karthikeyan-1co0FGg8_W4-unsplash_uteniw.jpg', (SELECT id FROM categories WHERE name = 'Bangles')),
('Silver Charm Bangles', 4800.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869896/mansi-shah-8angSQtYgKc-unsplash_qejkb1.jpg', (SELECT id FROM categories WHERE name = 'Bangles')),
('Colorful Glass Bangles', 2500.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869908/samar-ahmad--nKCbZlOHek-unsplash_esbmxd.jpg', (SELECT id FROM categories WHERE name = 'Bangles')),
('Antique Brass Bangles', 3200.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869919/samar-ahmad-zz6-LqiW4mY-unsplash_tl2oxq.jpg', (SELECT id FROM categories WHERE name = 'Bangles')),
('Diamond Accented Bangle', 12500.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772869927/vetrivel-viswanathar-o7vTr0qMd54-unsplash_kf9uz0.jpg', (SELECT id FROM categories WHERE name = 'Bangles'));

-- Chocolates Category
INSERT INTO products (name, price, image_url, category_id) VALUES
('Premium Dark Chocolate Box', 2800.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772870229/marqquin-NBd5A6j3pgg-unsplash_jr6zol.jpg', (SELECT id FROM categories WHERE name = 'Chocolates')),
('Assorted Truffle Collection', 3500.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772870235/kavita-jangid-80zX8-Nz7Os-unsplash_lpiawe.jpg', (SELECT id FROM categories WHERE name = 'Chocolates')),
('Milk Chocolate Gift Set', 2200.00, 'https://res.cloudinary.com/dju3eqysw/image/upload/v1772870242/sara-cervera-we4l7ch6iwc-unsplash_kxlfwv.jpg', (SELECT id FROM categories WHERE name = 'Chocolates'));
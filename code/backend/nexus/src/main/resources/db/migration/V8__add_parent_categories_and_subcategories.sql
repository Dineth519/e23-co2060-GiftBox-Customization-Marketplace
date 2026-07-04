-- V8__add_parent_categories_and_subcategories.sql
-- Add parent_id to categories for self-referential subcategories
ALTER TABLE categories ADD COLUMN parent_id INT NULL DEFAULT NULL;
ALTER TABLE categories ADD CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Rename/Update existing categories to represent broad parent categories
UPDATE categories SET name = 'Drinks & Beverages' WHERE name = 'Wine';
UPDATE categories SET name = 'Watches' WHERE name = 'Watches';
UPDATE categories SET name = 'Perfume & Fragrance' WHERE name = 'Perfume';
UPDATE categories SET name = 'Teddy Bears & Plushes' WHERE name = 'Teddy Bears';
UPDATE categories SET name = 'Jewelry & Accessories' WHERE name = 'Bangles';
UPDATE categories SET name = 'Chocolates & Sweets' WHERE name = 'Chocolates';

-- Seed Subcategories for Watches (parent id = 2)
INSERT INTO categories (name, parent_id) VALUES 
('Men\'s Watches', 2),
('Ladies\' Watches', 2),
('Minimalist Watches', 2);

-- Seed Subcategories for Chocolates & Sweets (parent id = 6)
INSERT INTO categories (name, parent_id) VALUES 
('Premium Truffles', 6),
('Bakery & Cookies', 6),
('Macarons & Cupcakes', 6);

-- Seed Subcategories for Perfume & Fragrance (parent id = 3)
INSERT INTO categories (name, parent_id) VALUES 
('Men\'s Fragrances', 3),
('Ladies\' Perfumes', 3);

-- Seed Subcategories for Teddy Bears & Plushes (parent id = 4)
INSERT INTO categories (name, parent_id) VALUES 
('Plush Toys', 4),
('Newborn Plushes', 4);

-- Seed Subcategories for Jewelry & Accessories (parent id = 5)
INSERT INTO categories (name, parent_id) VALUES 
('Bangles & Bracelets', 5),
('Necklaces & Pendants', 5),
('Earrings', 5);

-- Seed Subcategories for Drinks & Beverages (parent id = 1)
INSERT INTO categories (name, parent_id) VALUES 
('Non-Alcoholic Wines', 1),
('Gourmet Coffee & Teas', 1);

-- Insert new parent categories first
INSERT INTO categories (name, parent_id) VALUES ('Self-Care & Wellness', NULL);
SET @wellness_id = LAST_INSERT_ID();
INSERT INTO categories (name, parent_id) VALUES 
('Scented Candles', @wellness_id),
('Organic Soaps & Bath', @wellness_id),
('Lotions & Skincare', @wellness_id);

INSERT INTO categories (name, parent_id) VALUES ('Gift Boxes & Packaging', NULL);
SET @boxes_id = LAST_INSERT_ID();
INSERT INTO categories (name, parent_id) VALUES 
('Wooden Keepsake Boxes', @boxes_id),
('Magnetic Cardboard Boxes', @boxes_id),
('Velvet Gift Boxes', @boxes_id);

INSERT INTO categories (name, parent_id) VALUES ('Flowers & Botanicals', NULL);
SET @flowers_id = LAST_INSERT_ID();
INSERT INTO categories (name, parent_id) VALUES 
('Fresh Flowers', @flowers_id),
('Preserved & Dried Flowers', @flowers_id),
('Mini Succulents', @flowers_id);

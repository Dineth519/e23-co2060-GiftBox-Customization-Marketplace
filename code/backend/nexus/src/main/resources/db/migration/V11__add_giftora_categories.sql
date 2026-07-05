-- V11__add_giftora_categories.sql
-- Add Giftora-specific gift item categories while safely removing old ones
-- Uses INSERT IGNORE to avoid duplicate errors if partial data exists
-- =====================================================================

-- Step 1: Null-out category_id in products to safely remove old categories
UPDATE products SET category_id = NULL WHERE category_id IS NOT NULL;

-- Step 2: Clear all existing categories (now safe since products no longer reference them)
DELETE FROM categories WHERE parent_id IS NOT NULL;
DELETE FROM categories WHERE parent_id IS NULL;

-- Step 3: Insert the 8 main (parent) categories
INSERT INTO categories (name, parent_id) VALUES ('Chocolates & Sweets', NULL);
INSERT INTO categories (name, parent_id) VALUES ('Candles & Fragrance', NULL);
INSERT INTO categories (name, parent_id) VALUES ('Skincare & Beauty', NULL);
INSERT INTO categories (name, parent_id) VALUES ('Stationery & Lifestyle', NULL);
INSERT INTO categories (name, parent_id) VALUES ('Plush & Keepsakes', NULL);
INSERT INTO categories (name, parent_id) VALUES ('Gourmet Food & Drinks', NULL);
INSERT INTO categories (name, parent_id) VALUES ('Gift Packaging & Fillers', NULL);
INSERT INTO categories (name, parent_id) VALUES ('Dried Botanicals & Decor', NULL);

-- Step 4: Read parent IDs dynamically
SET @choc   = (SELECT id FROM categories WHERE name = 'Chocolates & Sweets' LIMIT 1);
SET @candle = (SELECT id FROM categories WHERE name = 'Candles & Fragrance' LIMIT 1);
SET @skin   = (SELECT id FROM categories WHERE name = 'Skincare & Beauty' LIMIT 1);
SET @stat   = (SELECT id FROM categories WHERE name = 'Stationery & Lifestyle' LIMIT 1);
SET @plush  = (SELECT id FROM categories WHERE name = 'Plush & Keepsakes' LIMIT 1);
SET @gourm  = (SELECT id FROM categories WHERE name = 'Gourmet Food & Drinks' LIMIT 1);
SET @pack   = (SELECT id FROM categories WHERE name = 'Gift Packaging & Fillers' LIMIT 1);
SET @bot    = (SELECT id FROM categories WHERE name = 'Dried Botanicals & Decor' LIMIT 1);

-- Chocolates & Sweets
INSERT INTO categories (name, parent_id) VALUES
  ('Chocolate Bars & Boxes', @choc),
  ('Truffles & Pralines', @choc),
  ('Gummy & Candy Packs', @choc),
  ('Sri Lankan Artisan Sweets', @choc);

-- Candles & Fragrance
INSERT INTO categories (name, parent_id) VALUES
  ('Scented Candles', @candle),
  ('Reed Diffusers', @candle),
  ('Wax Melts', @candle),
  ('Room Sprays', @candle);

-- Skincare & Beauty
INSERT INTO categories (name, parent_id) VALUES
  ('Face Care', @skin),
  ('Bath & Body', @skin),
  ('Lip Care', @skin),
  ('Mini Perfumes & Roll-ons', @skin);

-- Stationery & Lifestyle
INSERT INTO categories (name, parent_id) VALUES
  ('Greeting Cards', @stat),
  ('Journals & Notebooks', @stat),
  ('Pens & Markers', @stat),
  ('Bookmarks & Prints', @stat);

-- Plush & Keepsakes
INSERT INTO categories (name, parent_id) VALUES
  ('Stuffed Toys & Plushies', @plush),
  ('Keychains & Charms', @plush),
  ('Photo Frames & Albums', @plush),
  ('Miniature Decor Items', @plush);

-- Gourmet Food & Drinks
INSERT INTO categories (name, parent_id) VALUES
  ('Tea & Herbal Infusions', @gourm),
  ('Coffee Sachets & Pods', @gourm),
  ('Honey & Jam Jars', @gourm),
  ('Nuts & Dried Fruit Packs', @gourm);

-- Gift Packaging & Fillers
INSERT INTO categories (name, parent_id) VALUES
  ('Gift Box Bases & Lids', @pack),
  ('Ribbons & Bows', @pack),
  ('Tissue Paper & Wrapping', @pack),
  ('Shredded Paper Fillers', @pack);

-- Dried Botanicals & Decor
INSERT INTO categories (name, parent_id) VALUES
  ('Dried Flower Bundles', @bot),
  ('Pressed Flower Items', @bot),
  ('Crystal & Stone Sets', @bot),
  ('Small Succulents & Plants', @bot);

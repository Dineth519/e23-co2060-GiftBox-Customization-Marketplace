-- Disable foreign key checks temporarily to allow truncating/deleting
SET FOREIGN_KEY_CHECKS = 0;

-- Delete all order items, orders, gift box structures, products, and vendors
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM gift_box_items;
DELETE FROM gift_boxes;
DELETE FROM products;
DELETE FROM vendors;

-- Delete users who are vendors (role = 'VENDOR' or role = 'PARTNER')
DELETE FROM users WHERE role = 'VENDOR' OR role = 'PARTNER';

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- V5__add_custom_box_fields_to_orders.sql
-- Flyway Migration - Add custom box builder fields to orders table
-- ============================================================

ALTER TABLE orders ADD COLUMN occasion VARCHAR(50) NULL;
ALTER TABLE orders ADD COLUMN box_size VARCHAR(50) NULL;
ALTER TABLE orders ADD COLUMN gift_message TEXT NULL;
ALTER TABLE orders ADD COLUMN recipient_name VARCHAR(100) NULL;
ALTER TABLE orders ADD COLUMN wrapping_style VARCHAR(50) NULL;

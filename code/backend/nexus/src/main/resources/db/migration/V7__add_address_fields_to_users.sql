-- ============================================================
-- V7__add_address_fields_to_users.sql
-- Add address fields to users table to match User JPA entity
-- ============================================================

ALTER TABLE users ADD COLUMN address_line1 VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN address_line2 VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN city VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN district VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN province VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN postal_code VARCHAR(20) NULL;
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) NULL;

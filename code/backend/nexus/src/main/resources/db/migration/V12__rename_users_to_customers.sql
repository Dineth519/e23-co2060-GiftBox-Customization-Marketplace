-- V12__rename_users_to_customers.sql

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Drop existing FK constraints referencing customers or users
ALTER TABLE orders DROP FOREIGN KEY orders_ibfk_1;
ALTER TABLE admins DROP FOREIGN KEY admins_ibfk_1;
ALTER TABLE assemblers DROP FOREIGN KEY assemblers_ibfk_1;
ALTER TABLE vendors DROP FOREIGN KEY vendors_ibfk_1;
ALTER TABLE customers DROP FOREIGN KEY customers_ibfk_1;

-- 2. Drop the old customers table completely
DROP TABLE customers;

-- 3. Rename users to customers
RENAME TABLE users TO customers;

-- 4. Rename user_id to id
ALTER TABLE customers CHANGE COLUMN user_id id INT AUTO_INCREMENT;

-- 5. Re-add foreign keys pointing to the new customers table
ALTER TABLE orders ADD CONSTRAINT orders_ibfk_1 FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE admins ADD CONSTRAINT admins_ibfk_1 FOREIGN KEY (admin_id) REFERENCES customers(id) ON DELETE CASCADE;
ALTER TABLE assemblers ADD CONSTRAINT assemblers_ibfk_1 FOREIGN KEY (assembler_id) REFERENCES customers(id) ON DELETE CASCADE;
ALTER TABLE vendors ADD CONSTRAINT vendors_ibfk_1 FOREIGN KEY (vendor_id) REFERENCES customers(id) ON DELETE CASCADE;

-- 6. Recreate views that referenced users
DROP VIEW IF EXISTS admin_order_overview;
CREATE VIEW admin_order_overview AS
SELECT
    o.order_id,
    c.name    AS customer_name,
    v.name    AS vendor_name,
    pt.shop_name,
    o.status,
    o.total_amount,
    o.created_at
FROM orders o
JOIN customers c  ON o.customer_id = c.id
JOIN vendors pt   ON o.vendor_id   = pt.vendor_id
JOIN customers v  ON pt.vendor_id  = v.id;

SET FOREIGN_KEY_CHECKS = 1;

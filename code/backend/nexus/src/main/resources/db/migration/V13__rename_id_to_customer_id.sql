-- V13__rename_id_to_customer_id.sql

SET FOREIGN_KEY_CHECKS = 0;

-- Rename id to customer_id
ALTER TABLE customers CHANGE COLUMN id customer_id INT AUTO_INCREMENT;

-- Recreate view admin_order_overview to use customer_id
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
JOIN customers c  ON o.customer_id = c.customer_id
JOIN vendors pt   ON o.vendor_id   = pt.vendor_id
JOIN customers v  ON pt.vendor_id  = v.customer_id;

SET FOREIGN_KEY_CHECKS = 1;

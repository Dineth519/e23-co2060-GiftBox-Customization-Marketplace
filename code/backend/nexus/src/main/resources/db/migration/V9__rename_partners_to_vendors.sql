-- 1. Drop existing views that reference partner_id / partners
DROP VIEW IF EXISTS vendor_daily_revenue;
DROP VIEW IF EXISTS vendor_weekly_revenue;
DROP VIEW IF EXISTS best_selling_products;
DROP VIEW IF EXISTS admin_order_overview;

-- 2. Rename table partners to vendors
RENAME TABLE partners TO vendors;

-- 3. Rename column partner_id to vendor_id in vendors
ALTER TABLE vendors CHANGE COLUMN partner_id vendor_id INT;

-- 4. Rename column partner_id to vendor_id in products
ALTER TABLE products CHANGE COLUMN partner_id vendor_id INT;

-- 5. Rename column partner_id to vendor_id in gift_boxes
ALTER TABLE gift_boxes CHANGE COLUMN partner_id vendor_id INT;

-- 6. Rename column partner_id to vendor_id in orders
ALTER TABLE orders CHANGE COLUMN partner_id vendor_id INT;

-- 7. Modify users role enum to use VENDOR instead of PARTNER
ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN', 'CUSTOMER', 'VENDOR', 'ASSEMBLER') DEFAULT 'CUSTOMER';
UPDATE users SET role = 'VENDOR' WHERE role = 'PARTNER';

-- 8. Recreate views referencing vendors and vendor_id
CREATE OR REPLACE VIEW vendor_daily_revenue AS
SELECT
    o.vendor_id,
    DATE(o.created_at)  AS order_date,
    COUNT(o.order_id)   AS total_orders,
    SUM(o.total_amount) AS daily_revenue
FROM orders o
WHERE o.status NOT IN ('CANCELLED')
GROUP BY o.vendor_id, DATE(o.created_at);

CREATE OR REPLACE VIEW vendor_weekly_revenue AS
SELECT
    o.vendor_id,
    YEAR(o.created_at)  AS yr,
    WEEK(o.created_at)  AS wk,
    COUNT(o.order_id)   AS total_orders,
    SUM(o.total_amount) AS weekly_revenue
FROM orders o
WHERE o.status NOT IN ('CANCELLED')
GROUP BY o.vendor_id, YEAR(o.created_at), WEEK(o.created_at);

CREATE OR REPLACE VIEW best_selling_products AS
SELECT
    p.id          AS product_id,
    p.name        AS product_name,
    p.vendor_id,
    SUM(oi.quantity) AS total_sold
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders   o ON oi.order_id   = o.order_id
WHERE o.status NOT IN ('CANCELLED')
GROUP BY p.id, p.name, p.vendor_id
ORDER BY total_sold DESC;

CREATE OR REPLACE VIEW admin_order_overview AS
SELECT
    o.order_id,
    u_c.name    AS customer_name,
    u_p.name    AS vendor_name,
    pt.shop_name,
    o.status,
    o.total_amount,
    o.created_at
FROM orders o
JOIN customers c  ON o.customer_id = c.customer_id
JOIN users u_c    ON c.customer_id = u_c.user_id
JOIN vendors pt   ON o.vendor_id   = pt.vendor_id
JOIN users u_p    ON pt.vendor_id  = u_p.user_id;

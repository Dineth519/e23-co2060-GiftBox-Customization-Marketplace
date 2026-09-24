-- V23__add_sub_orders.sql
-- Introduces the sub_orders table to track vendor-specific statuses
-- while keeping orders as the parent representation.

CREATE TABLE sub_orders (
    sub_order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    vendor_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_VENDOR_ACCEPTANCE',
    -- possible values: PENDING_VENDOR_ACCEPTANCE, ACCEPTED_BY_VENDOR, SENT_TO_ASSEMBLY, REJECTED
    vendor_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id) ON DELETE CASCADE
);

-- Update the existing views to use sub_orders for accurate status tracking
CREATE OR REPLACE VIEW vendor_daily_revenue AS
SELECT
    so.vendor_id,
    DATE(so.created_at)  AS order_date,
    COUNT(DISTINCT so.order_id)   AS total_orders,
    SUM(so.vendor_total) AS daily_revenue
FROM sub_orders so
WHERE so.status NOT IN ('REJECTED')
GROUP BY so.vendor_id, DATE(so.created_at);

CREATE OR REPLACE VIEW vendor_weekly_revenue AS
SELECT
    so.vendor_id,
    YEAR(so.created_at)  AS yr,
    WEEK(so.created_at)  AS wk,
    COUNT(DISTINCT so.order_id)   AS total_orders,
    SUM(so.vendor_total) AS weekly_revenue
FROM sub_orders so
WHERE so.status NOT IN ('REJECTED')
GROUP BY so.vendor_id, YEAR(so.created_at), WEEK(so.created_at);

-- Best selling products remains mostly the same, but we filter out rejected sub-orders instead of cancelled orders.
-- However, order_items currently points to order_id, not sub_order_id.
-- To properly filter out rejected items, we should link order_items to sub_orders in the future, 
-- but for now we join on sub_orders.
CREATE OR REPLACE VIEW best_selling_products AS
SELECT
    p.id          AS product_id,
    p.name        AS product_name,
    p.vendor_id,
    SUM(oi.quantity) AS total_sold
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN sub_orders so ON oi.order_id = so.order_id AND p.vendor_id = so.vendor_id
WHERE so.status NOT IN ('REJECTED')
GROUP BY p.id, p.name, p.vendor_id
ORDER BY total_sold DESC;

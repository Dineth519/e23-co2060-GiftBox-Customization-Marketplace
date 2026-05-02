-- ============================================================
-- 0. DROP EXISTING DATABASE
-- ============================================================
DROP DATABASE IF EXISTS nexus_db;

-- ============================================================
-- 1. DATABASE INITIALIZATION
-- ============================================================
CREATE DATABASE nexus_db;
USE nexus_db;

-- ============================================================
-- 2. CORE USERS TABLE
--    All roles share this table (ADMIN, CUSTOMER, PARTNER, ASSEMBLER)
-- ============================================================
CREATE TABLE users (
    user_id     INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100),
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('ADMIN', 'CUSTOMER', 'PARTNER', 'ASSEMBLER') DEFAULT 'CUSTOMER',

    -- Email verification fields
    is_verified       TINYINT(1)   DEFAULT 0,
    verification_code VARCHAR(10),
    code_expires_at   DATETIME,

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. ROLE-SPECIFIC TABLES
-- ============================================================

-- Admin table
CREATE TABLE admins (
    admin_id INT PRIMARY KEY,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Customer table
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    address     TEXT NULL,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Partner (Vendor) table
CREATE TABLE partners (
    partner_id      INT PRIMARY KEY,
    shop_name       VARCHAR(100) NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    phone_number    VARCHAR(15)  NOT NULL,
    categories      VARCHAR(255) NULL,
    shop_address    TEXT         NOT NULL,
    verification_id VARCHAR(50)  NOT NULL,
    status          ENUM('PENDING', 'ACTIVE', 'REJECTED') DEFAULT 'PENDING',
    is_trusted      TINYINT(1) DEFAULT 0,
    FOREIGN KEY (partner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Assembler table
CREATE TABLE assemblers (
    assembler_id INT PRIMARY KEY,
    full_name    VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15)  NOT NULL,
    FOREIGN KEY (assembler_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- 4. PRODUCT CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- ============================================================
-- 5. PRODUCTS
-- ============================================================
CREATE TABLE products (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    partner_id     INT           NOT NULL,
    category_id    INT           NOT NULL,
    name           VARCHAR(150)  NOT NULL,
    description    TEXT          NULL,
    price          DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2) DEFAULT 0.00,
    stock_quantity INT           DEFAULT 0,
    sku            VARCHAR(50)   UNIQUE,
    image_url      VARCHAR(255)  NULL,
    is_active      TINYINT(1)    DEFAULT 1,
    rating         DECIMAL(2,1)  DEFAULT 0.0,
    created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (partner_id)  REFERENCES partners(partner_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ============================================================
-- 6. GIFT BOXES
-- ============================================================
CREATE TABLE gift_boxes (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    partner_id  INT           NOT NULL,
    name        VARCHAR(150)  NOT NULL,
    description TEXT          NULL,
    price       DECIMAL(10,2) NOT NULL,
    image_url   VARCHAR(255)  NULL,
    is_active   TINYINT(1)    DEFAULT 1,
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (partner_id) REFERENCES partners(partner_id) ON DELETE CASCADE
);

-- Gift box inside items
CREATE TABLE gift_box_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    gift_box_id INT NOT NULL,
    product_id  INT NOT NULL,
    quantity    INT NOT NULL DEFAULT 1,

    FOREIGN KEY (gift_box_id) REFERENCES gift_boxes(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)  REFERENCES products(id)
);

-- ============================================================
-- 7. [NEW] CUSTOMER CART
--    One cart per customer — persists across sessions/logins
--    Guest users use session only (no DB row)
-- ============================================================
CREATE TABLE cart (
    cart_id     INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL UNIQUE,           -- One cart per customer
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

-- ============================================================
-- 8. [NEW] CART ITEMS
--    Each row = one product OR one gift_box in the cart
--    unit_price saved at add-time (price snapshot)
-- ============================================================
CREATE TABLE cart_items (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id      INT           NOT NULL,
    product_id   INT           NULL,           -- NULL if item is a gift box
    gift_box_id  INT           NULL,           -- NULL if item is a product
    quantity     INT           NOT NULL DEFAULT 1,
    unit_price   DECIMAL(10,2) NOT NULL,       -- Price at time of adding to cart

    FOREIGN KEY (cart_id)     REFERENCES cart(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)  REFERENCES products(id),
    FOREIGN KEY (gift_box_id) REFERENCES gift_boxes(id),

    -- Must be a product OR a gift box, not both, not neither
    CONSTRAINT chk_cart_item_type CHECK (
        (product_id IS NOT NULL AND gift_box_id IS NULL) OR
        (product_id IS NULL     AND gift_box_id IS NOT NULL)
    )
);

-- ============================================================
-- 9. ORDERS
--    One order = one vendor (multi-vendor cart → multiple orders)
--    Status flow: PENDING → CONFIRMED → RECEIVED → ASSEMBLING
--                 → READY → SHIPPED → DELIVERED | CANCELLED
-- ============================================================
CREATE TABLE orders (
    order_id         INT AUTO_INCREMENT PRIMARY KEY,
    customer_id      INT           NOT NULL,
    partner_id       INT           NOT NULL,   -- One vendor per order
    assembler_id     INT           NULL,
    status           ENUM(
                        'PENDING',
                        'CONFIRMED',
                        'RECEIVED',
                        'ASSEMBLING',
                        'READY',
                        'SHIPPED',
                        'DELIVERED',
                        'CANCELLED'
                     ) DEFAULT 'PENDING',
    delivery_address VARCHAR(255)  NOT NULL,
    special_notes    TEXT          NULL,
    total_amount     DECIMAL(10,2) NOT NULL,
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id)  REFERENCES customers(customer_id),
    FOREIGN KEY (partner_id)   REFERENCES partners(partner_id),
    FOREIGN KEY (assembler_id) REFERENCES assemblers(assembler_id)
);

-- ============================================================
-- 10. ORDER ITEMS
--     [MODIFIED] Added partner_id — track which vendor per item
--     product_id OR gift_box_id — one will be NULL
-- ============================================================
CREATE TABLE order_items (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    order_id     INT           NOT NULL,
    partner_id   INT           NOT NULL,       -- [NEW] Vendor who owns this item
    product_id   INT           NULL,
    gift_box_id  INT           NULL,
    quantity     INT           NOT NULL DEFAULT 1,
    unit_price   DECIMAL(10,2) NOT NULL,
    subtotal     DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,

    FOREIGN KEY (order_id)    REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (partner_id)  REFERENCES partners(partner_id),
    FOREIGN KEY (product_id)  REFERENCES products(id),
    FOREIGN KEY (gift_box_id) REFERENCES gift_boxes(id),

    CONSTRAINT chk_item_type CHECK (
        (product_id IS NOT NULL AND gift_box_id IS NULL) OR
        (product_id IS NULL     AND gift_box_id IS NOT NULL)
    )
);

-- ============================================================
-- 11. VIEWS
-- ============================================================

-- Vendor daily revenue
CREATE VIEW vendor_daily_revenue AS
SELECT
    o.partner_id,
    DATE(o.created_at)  AS order_date,
    COUNT(o.order_id)   AS total_orders,
    SUM(o.total_amount) AS daily_revenue
FROM orders o
WHERE o.status NOT IN ('CANCELLED')
GROUP BY o.partner_id, DATE(o.created_at);

-- Vendor weekly revenue
CREATE VIEW vendor_weekly_revenue AS
SELECT
    o.partner_id,
    YEAR(o.created_at)  AS yr,
    WEEK(o.created_at)  AS wk,
    COUNT(o.order_id)   AS total_orders,
    SUM(o.total_amount) AS weekly_revenue
FROM orders o
WHERE o.status NOT IN ('CANCELLED')
GROUP BY o.partner_id, YEAR(o.created_at), WEEK(o.created_at);

-- [MODIFIED] Best-selling products — now includes gift box sales too
CREATE VIEW best_selling_products AS
-- Individual products
SELECT
    p.id          AS product_id,
    p.name        AS product_name,
    p.partner_id,
    'PRODUCT'     AS item_type,
    SUM(oi.quantity) AS total_sold
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders   o ON oi.order_id   = o.order_id
WHERE o.status NOT IN ('CANCELLED')
  AND oi.product_id IS NOT NULL
GROUP BY p.id, p.name, p.partner_id

UNION ALL

-- Gift boxes
SELECT
    gb.id         AS product_id,
    gb.name       AS product_name,
    gb.partner_id,
    'GIFT_BOX'    AS item_type,
    SUM(oi.quantity) AS total_sold
FROM order_items oi
JOIN gift_boxes gb ON oi.gift_box_id = gb.id
JOIN orders     o  ON oi.order_id    = o.order_id
WHERE o.status NOT IN ('CANCELLED')
  AND oi.gift_box_id IS NOT NULL
GROUP BY gb.id, gb.name, gb.partner_id

ORDER BY total_sold DESC;

-- Admin overview: all orders with customer and vendor info
CREATE VIEW admin_order_overview AS
SELECT
    o.order_id,
    u_c.name     AS customer_name,
    u_p.name     AS vendor_name,
    pt.shop_name,
    o.status,
    o.total_amount,
    o.created_at
FROM orders o
JOIN customers c  ON o.customer_id = c.customer_id
JOIN users u_c    ON c.customer_id = u_c.user_id
JOIN partners pt  ON o.partner_id  = pt.partner_id
JOIN users u_p    ON pt.partner_id = u_p.user_id;

-- [NEW] Customer order summary — for "My Orders" page
CREATE VIEW customer_order_summary AS
SELECT
    o.order_id,
    o.customer_id,
    o.partner_id,
    pt.shop_name,
    o.status,
    o.total_amount,
    o.delivery_address,
    o.special_notes,
    o.created_at,
    COUNT(oi.id)     AS total_line_items,
    SUM(oi.quantity) AS total_qty
FROM orders o
JOIN partners   pt ON o.partner_id = pt.partner_id
JOIN order_items oi ON o.order_id  = oi.order_id
GROUP BY
    o.order_id,
    o.customer_id,
    o.partner_id,
    pt.shop_name,
    o.status,
    o.total_amount,
    o.delivery_address,
    o.special_notes,
    o.created_at;
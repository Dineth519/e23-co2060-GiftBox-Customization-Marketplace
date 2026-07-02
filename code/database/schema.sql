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
--   is_trusted  = Flag set by Admin to mark trusted vendors
CREATE TABLE partners (
    partner_id      INT PRIMARY KEY,
    shop_name       VARCHAR(100) NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    phone_number    VARCHAR(15)  NOT NULL,
    categories      VARCHAR(255) NULL,
    shop_address    TEXT         NOT NULL,
    verification_id VARCHAR(50)  NOT NULL,
    status          ENUM('PENDING', 'ACTIVE', 'REJECTED') DEFAULT 'PENDING',
    is_trusted      TINYINT(1) DEFAULT 0,   -- Admin sets this for trusted vendors
    FOREIGN KEY (partner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Assembler table
--   Assemblers handle gift box assembly and status updates
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
--    Vendors add individual items/products
--    is_active = vendor item ekak disable karanna puluwan
-- ============================================================
CREATE TABLE products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    partner_id  INT          NOT NULL,
    category_id INT          NOT NULL,
    name        VARCHAR(150) NOT NULL,
    description TEXT         NULL,
    price       DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2) DEFAULT 0.00,
    stock_quantity INT DEFAULT 0,
    sku VARCHAR(50) UNIQUE,
    image_url   VARCHAR(255) NULL,
    is_active   TINYINT(1)   DEFAULT 1,  
    rating DECIMAL(2,1) DEFAULT 0.0,   
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (partner_id)  REFERENCES partners(partner_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ============================================================
-- 6. GIFT BOXES
--    Vendors create customized gift boxes combining products
-- ============================================================
CREATE TABLE gift_boxes (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    partner_id  INT          NOT NULL,
    name        VARCHAR(150) NOT NULL,
    description TEXT         NULL,
    price       DECIMAL(10,2) NOT NULL,        -- Total gift box price (vendor sets this)
    image_url   VARCHAR(255) NULL,
    is_active   TINYINT(1)   DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (partner_id) REFERENCES partners(partner_id) ON DELETE CASCADE
);

-- Gift box inside items (which products are in this box)
CREATE TABLE gift_box_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    gift_box_id INT NOT NULL,
    product_id  INT NOT NULL,
    quantity    INT NOT NULL DEFAULT 1,

    FOREIGN KEY (gift_box_id) REFERENCES gift_boxes(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)  REFERENCES products(id)
);

-- ============================================================
-- 7. ORDERS
--    Customer places an order (no payment — COD only for now)
--    Status flow: PENDING → CONFIRMED → RECEIVED → ASSEMBLING
--                 → READY → SHIPPED → DELIVERED | CANCELLED
-- ============================================================
CREATE TABLE orders (
    order_id         INT AUTO_INCREMENT PRIMARY KEY,
    customer_id      INT          NOT NULL,
    partner_id       INT          NOT NULL,    -- Which vendor's shop this order is from
    assembler_id     INT          NULL,        -- Assigned assembler (nullable until assigned)
    status           ENUM(
                        'PENDING',       -- Customer placed order
                        'CONFIRMED',     -- Vendor confirmed
                        'RECEIVED',      -- Assembler received items
                        'ASSEMBLING',    -- Assembler is building gift box
                        'READY',         -- Assembly complete, ready to ship
                        'SHIPPED',       -- On the way
                        'DELIVERED',     -- Customer received
                        'CANCELLED'      -- Cancelled by vendor or customer
                     ) DEFAULT 'PENDING',
    delivery_address VARCHAR(255) NOT NULL,
    special_notes    TEXT         NULL,        -- Customer's special instructions
    total_amount     DECIMAL(10,2) NOT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id)  REFERENCES customers(customer_id),
    FOREIGN KEY (partner_id)   REFERENCES partners(partner_id),
    FOREIGN KEY (assembler_id) REFERENCES assemblers(assembler_id)
);

-- ============================================================
-- 8. ORDER ITEMS
--    Each order can have products AND/OR gift boxes
--    product_id OR gift_box_id — one will be NULL
-- ============================================================
CREATE TABLE order_items (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    order_id     INT           NOT NULL,
    product_id   INT           NULL,           -- NULL if this line is a gift box
    gift_box_id  INT           NULL,           -- NULL if this line is a product
    quantity     INT           NOT NULL DEFAULT 1,
    unit_price   DECIMAL(10,2) NOT NULL,       -- Price snapshot at order time
    subtotal     DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,

    FOREIGN KEY (order_id)    REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)  REFERENCES products(id),
    FOREIGN KEY (gift_box_id) REFERENCES gift_boxes(id),

    -- Ensure at least one of product_id or gift_box_id is set
    CONSTRAINT chk_item_type CHECK (
        (product_id IS NOT NULL AND gift_box_id IS NULL) OR
        (product_id IS NULL AND gift_box_id IS NOT NULL)
    )
);

-- ============================================================
-- 9. USEFUL VIEWS
-- ============================================================

-- Vendor daily revenue view (for dashboard graphs)
CREATE VIEW vendor_daily_revenue AS
SELECT
    o.partner_id,
    DATE(o.created_at)      AS order_date,
    COUNT(o.order_id)       AS total_orders,
    SUM(o.total_amount)     AS daily_revenue
FROM orders o
WHERE o.status NOT IN ('CANCELLED')
GROUP BY o.partner_id, DATE(o.created_at);

-- Vendor weekly revenue view
CREATE VIEW vendor_weekly_revenue AS
SELECT
    o.partner_id,
    YEAR(o.created_at)      AS yr,
    WEEK(o.created_at)      AS wk,
    COUNT(o.order_id)       AS total_orders,
    SUM(o.total_amount)     AS weekly_revenue
FROM orders o
WHERE o.status NOT IN ('CANCELLED')
GROUP BY o.partner_id, YEAR(o.created_at), WEEK(o.created_at);

-- Best-selling products (by total quantity ordered)
CREATE VIEW best_selling_products AS
SELECT
    p.id          AS product_id,
    p.name        AS product_name,
    p.partner_id,
    SUM(oi.quantity) AS total_sold
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders   o ON oi.order_id   = o.order_id
WHERE o.status NOT IN ('CANCELLED')
GROUP BY p.id, p.name, p.partner_id
ORDER BY total_sold DESC;

-- Admin overview: all orders with customer and vendor info
CREATE VIEW admin_order_overview AS
SELECT
    o.order_id,
    u_c.name        AS customer_name,
    u_p.name        AS vendor_name,
    pt.shop_name,
    o.status,
    o.total_amount,
    o.created_at
FROM orders o
JOIN customers c  ON o.customer_id = c.customer_id
JOIN users u_c    ON c.customer_id = u_c.user_id
JOIN partners pt  ON o.partner_id  = pt.partner_id
JOIN users u_p    ON pt.partner_id = u_p.user_id;
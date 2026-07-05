-- ============================================================
-- V1__initial_schema.sql
-- Flyway Migration - Initial Schema
-- NOTE: DROP/CREATE DATABASE & USE statements are not included.
--       Connects to the DB specified in Flyway application.properties.
-- ============================================================

-- ============================================================
-- 2. CORE USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    user_id     INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100),
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('ADMIN', 'CUSTOMER', 'PARTNER', 'ASSEMBLER') DEFAULT 'CUSTOMER',

    is_verified       TINYINT(1)   DEFAULT 0,
    verification_code VARCHAR(10),
    code_expires_at   DATETIME,

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. ROLE-SPECIFIC TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS admins (
    admin_id INT PRIMARY KEY,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customers (
    customer_id INT PRIMARY KEY,
    address     TEXT NULL,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS partners (
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

CREATE TABLE IF NOT EXISTS assemblers (
    assembler_id INT PRIMARY KEY,
    full_name    VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15)  NOT NULL,
    FOREIGN KEY (assembler_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- 4. PRODUCT CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- ============================================================
-- 5. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
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
CREATE TABLE IF NOT EXISTS gift_boxes (
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

CREATE TABLE IF NOT EXISTS gift_box_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    gift_box_id INT NOT NULL,
    product_id  INT NOT NULL,
    quantity    INT NOT NULL DEFAULT 1,

    FOREIGN KEY (gift_box_id) REFERENCES gift_boxes(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)  REFERENCES products(id)
);

-- ============================================================
-- 7. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    order_id         INT AUTO_INCREMENT PRIMARY KEY,
    customer_id      INT           NOT NULL,
    partner_id       INT           NOT NULL,
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
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id)  REFERENCES customers(customer_id),
    FOREIGN KEY (partner_id)   REFERENCES partners(partner_id),
    FOREIGN KEY (assembler_id) REFERENCES assemblers(assembler_id)
);

-- ============================================================
-- 8. ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    order_id    INT           NOT NULL,
    product_id  INT           NULL,
    gift_box_id INT           NULL,
    quantity    INT           NOT NULL DEFAULT 1,
    unit_price  DECIMAL(10,2) NOT NULL,
    subtotal    DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,

    FOREIGN KEY (order_id)    REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)  REFERENCES products(id),
    FOREIGN KEY (gift_box_id) REFERENCES gift_boxes(id),

    CONSTRAINT chk_item_type CHECK (
        (product_id IS NOT NULL AND gift_box_id IS NULL) OR
        (product_id IS NULL AND gift_box_id IS NOT NULL)
    )
);

-- ============================================================
-- 9. VIEWS
-- ============================================================

CREATE OR REPLACE VIEW vendor_daily_revenue AS
SELECT
    o.partner_id,
    DATE(o.created_at)  AS order_date,
    COUNT(o.order_id)   AS total_orders,
    SUM(o.total_amount) AS daily_revenue
FROM orders o
WHERE o.status NOT IN ('CANCELLED')
GROUP BY o.partner_id, DATE(o.created_at);

CREATE OR REPLACE VIEW vendor_weekly_revenue AS
SELECT
    o.partner_id,
    YEAR(o.created_at)  AS yr,
    WEEK(o.created_at)  AS wk,
    COUNT(o.order_id)   AS total_orders,
    SUM(o.total_amount) AS weekly_revenue
FROM orders o
WHERE o.status NOT IN ('CANCELLED')
GROUP BY o.partner_id, YEAR(o.created_at), WEEK(o.created_at);

CREATE OR REPLACE VIEW best_selling_products AS
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
JOIN partners pt  ON o.partner_id  = pt.partner_id
JOIN users u_p    ON pt.partner_id = u_p.user_id;

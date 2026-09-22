-- ============================================================
-- ADD CART FUNCTIONALITY
-- ============================================================

-- Create carts table
CREATE TABLE carts (
    cart_id      INT AUTO_INCREMENT PRIMARY KEY,
    customer_id  INT NOT NULL,
    partner_id   INT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (partner_id)  REFERENCES partners(partner_id) ON DELETE CASCADE,
    
    -- A customer can only have one active cart per vendor (partner)
    UNIQUE KEY unique_cart_customer_partner (customer_id, partner_id)
);

-- Create cart_items table
CREATE TABLE cart_items (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id      INT NOT NULL,
    product_id   INT NULL,
    gift_box_id  INT NULL,
    quantity     INT NOT NULL DEFAULT 1,
    
    FOREIGN KEY (cart_id)     REFERENCES carts(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (gift_box_id) REFERENCES gift_boxes(id) ON DELETE CASCADE,
    
    -- Ensure at least one of product_id or gift_box_id is set
    CONSTRAINT chk_cart_item_type CHECK (
        (product_id IS NOT NULL AND gift_box_id IS NULL) OR
        (product_id IS NULL AND gift_box_id IS NOT NULL)
    )
);

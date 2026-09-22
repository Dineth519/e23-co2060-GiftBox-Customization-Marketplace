-- Durable, customer-owned custom boxes. Existing migrations remain unchanged.
CREATE TABLE custom_box_cart (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    draft_key VARCHAR(36) NOT NULL,
    configuration LONGTEXT NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    order_id INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_box_cart_draft UNIQUE (customer_id, draft_key),
    CONSTRAINT fk_box_cart_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    CONSTRAINT fk_box_cart_order FOREIGN KEY (order_id) REFERENCES orders(order_id),
    INDEX ix_box_cart_customer_order (customer_id, order_id)
);

-- Preserve ribbon, card, sender, seal and requested delivery date on the order.
ALTER TABLE orders ADD COLUMN custom_box_details LONGTEXT NULL;

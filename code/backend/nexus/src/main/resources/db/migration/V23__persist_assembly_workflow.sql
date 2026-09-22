-- Keep assembly progress separate from the customer/vendor order lifecycle.
ALTER TABLE orders
    ADD COLUMN assembly_status VARCHAR(20) NOT NULL DEFAULT 'awaiting',
    ADD COLUMN assembly_revision INT NOT NULL DEFAULT 0,
    ADD COLUMN assembly_activity LONGTEXT NULL,
    ADD COLUMN assembly_submitted_at DATETIME NULL;

ALTER TABLE order_items
    ADD COLUMN received_quantity INT NOT NULL DEFAULT 0,
    ADD COLUMN received_condition VARCHAR(20) NOT NULL DEFAULT 'unchecked';

CREATE INDEX ix_orders_assembly_queue ON orders (assembler_id, status);

-- Preserve any issue already recorded before the live workflow was connected.
UPDATE orders SET assembly_status = 'hold' WHERE issue IS NOT NULL AND TRIM(issue) <> '';

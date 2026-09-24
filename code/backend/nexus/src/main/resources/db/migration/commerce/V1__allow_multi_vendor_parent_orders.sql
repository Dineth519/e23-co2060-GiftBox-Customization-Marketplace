-- A parent order represents the complete cart and therefore has no single vendor.
-- Vendor ownership and totals are stored in sub_orders.
ALTER TABLE orders MODIFY COLUMN vendor_id INT NULL;

-- Products created before optimistic locking was introduced have a NULL version.
-- Hibernate cannot increment a NULL @Version value when checkout updates stock.
UPDATE products SET version = 0 WHERE version IS NULL;
ALTER TABLE products MODIFY COLUMN version INT NOT NULL DEFAULT 0;

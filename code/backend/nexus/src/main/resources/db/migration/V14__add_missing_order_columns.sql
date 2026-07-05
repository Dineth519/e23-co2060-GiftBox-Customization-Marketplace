-- V14__add_missing_order_columns.sql

DROP PROCEDURE IF EXISTS AddColumnIfMissing;

CREATE PROCEDURE AddColumnIfMissing(
    IN tableName VARCHAR(255),
    IN columnName VARCHAR(255),
    IN columnDef VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = tableName
        AND COLUMN_NAME = columnName
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE ', tableName, ' ADD COLUMN ', columnName, ' ', columnDef);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END;

CALL AddColumnIfMissing('orders', 'order_type', 'VARCHAR(20) DEFAULT ''STANDARD''');
CALL AddColumnIfMissing('orders', 'occasion', 'VARCHAR(50) NULL');
CALL AddColumnIfMissing('orders', 'box_size', 'VARCHAR(50) NULL');
CALL AddColumnIfMissing('orders', 'gift_message', 'TEXT NULL');
CALL AddColumnIfMissing('orders', 'recipient_name', 'VARCHAR(100) NULL');
CALL AddColumnIfMissing('orders', 'wrapping_style', 'VARCHAR(50) NULL');

DROP PROCEDURE IF EXISTS AddColumnIfMissing;

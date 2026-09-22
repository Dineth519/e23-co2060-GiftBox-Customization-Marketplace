-- V22__add_assembler_order_fields.sql

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

CALL AddColumnIfMissing('orders', 'issue', 'TEXT NULL');
CALL AddColumnIfMissing('orders', 'assembler_notes', 'TEXT NULL');
CALL AddColumnIfMissing('orders', 'receipt_confirmed', 'TINYINT(1) DEFAULT 0');
CALL AddColumnIfMissing('orders', 'checks', 'VARCHAR(255) DEFAULT ''[]''');
CALL AddColumnIfMissing('orders', 'due_date', 'DATETIME NULL');

DROP PROCEDURE IF EXISTS AddColumnIfMissing;

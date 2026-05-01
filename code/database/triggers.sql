-- Drop the trigger if it already exists to prevent Error 1359
DROP TRIGGER IF EXISTS after_user_register;

DELIMITER $$
CREATE TRIGGER after_user_register
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'CUSTOMER' THEN
        INSERT INTO customers (customer_id) VALUES (NEW.user_id);
    ELSEIF NEW.role = 'ADMIN' THEN
        INSERT INTO admins (admin_id) VALUES (NEW.user_id);
    ELSEIF NEW.role = 'PARTNER' THEN
        INSERT INTO partners (partner_id, shop_name, full_name, phone_number, shop_address, verification_id) 
        VALUES (NEW.user_id, 'New Shop', NEW.name, '000', 'Address', '000');
    END IF;
END$$
DELIMITER ;
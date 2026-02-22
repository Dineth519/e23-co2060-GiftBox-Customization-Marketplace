-- 0. DROP EXISTING DATABASE
DROP DATABASE IF EXISTS nexus_db;

-- 1. DATABASE INITIALIZATION
CREATE DATABASE nexus_db;
USE nexus_db;

-- 2. CORE USERS TABLE
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    username VARCHAR(50) NOT NULL UNIQUE, 
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Entity එකේ නමට ගැළපෙන්න වෙනස් කළා
    role ENUM('ADMIN', 'CUSTOMER', 'PARTNER') DEFAULT 'CUSTOMER',
    
    -- Verification Fields (Java Entity එකට අවශ්‍යයි)
    is_verified TINYINT(1) DEFAULT 0,
    verification_code VARCHAR(10),
    code_expires_at DATETIME,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ROLE-SPECIFIC TABLES
CREATE TABLE admins (
    admin_id INT PRIMARY KEY,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    address TEXT NULL,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE partners (
    partner_id INT PRIMARY KEY,
    shop_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    categories VARCHAR(255) NULL,
    shop_address TEXT NOT NULL,
    verification_id VARCHAR(50) NOT NULL,
    status ENUM('PENDING', 'ACTIVE', 'REJECTED') DEFAULT 'PENDING',
    FOREIGN KEY (partner_id) REFERENCES users(user_id) ON DELETE CASCADE
);
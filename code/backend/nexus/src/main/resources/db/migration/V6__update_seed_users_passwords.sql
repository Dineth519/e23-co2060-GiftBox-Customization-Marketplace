-- ============================================================
-- V6__update_seed_users_passwords.sql
-- Update password of all seeded users to 'Password123!'
-- ============================================================

UPDATE users 
SET password = '$2a$10$EP3Pmk3NtiYH4lGQXvAvTOJDgJes6EelouLsERxKbCzgALwuLzGqG' 
WHERE password = '$2a$12$rpcYy8XmMneWhx5XwIZ1.uySIUpf1uOhCOr4az3L3YJ47mVcm25TW';

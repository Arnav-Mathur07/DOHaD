-- DOHaD Platform Authentication Database Schema
-- This file can be imported into MySQL, PostgreSQL, or SQLite.

CREATE DATABASE IF NOT EXISTS dohad_auth;
USE dohad_auth;

CREATE TABLE IF NOT EXISTS `login details` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example mock researcher insert
INSERT INTO `login details` (`first_name`, `last_name`, `email`, `password`)
VALUES ('Jane', 'Doe', 'researcher@university.edu', 'hashed_password_here');

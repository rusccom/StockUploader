-- Migration: Add upload statistics to topics table
-- Run this migration on existing databases

ALTER TABLE `topics` 
ADD COLUMN `uploaded_count` INT NOT NULL DEFAULT 0 COMMENT 'Number of successfully uploaded images' AFTER `created_at`,
ADD COLUMN `uploaded_at` DATETIME NULL COMMENT 'Date and time of last successful upload' AFTER `uploaded_count`;


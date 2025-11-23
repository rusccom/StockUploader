-- Stock Uploader Database Schema
-- MySQL 5.7+

-- Topics table: stores user-submitted topics for image generation
CREATE TABLE IF NOT EXISTS `topics` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `topic_name` VARCHAR(255) NOT NULL,
  `image_count` INT NOT NULL DEFAULT 20,
  `model` VARCHAR(50) NOT NULL CHECK (`model` IN ('flux', 'imagen4')),
  `upscale_model` VARCHAR(50) NOT NULL CHECK (`upscale_model` IN ('flux-vision', 'seedvr')),
  `status` VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (`status` IN ('new', 'processing', 'done')),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `uploaded_count` INT NOT NULL DEFAULT 0 COMMENT 'Number of successfully uploaded images',
  `uploaded_at` DATETIME NULL COMMENT 'Date and time of last successful upload',
  INDEX idx_status (`status`),
  INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adobe Stock credentials table: stores API and SFTP credentials
CREATE TABLE IF NOT EXISTS `adobe_credentials` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `client_id` VARCHAR(255) NOT NULL COMMENT 'Adobe I/O OAuth2 Client ID',
  `client_secret` VARCHAR(255) NOT NULL COMMENT 'Adobe I/O OAuth2 Client Secret',
  `access_token` TEXT COMMENT 'Cached OAuth2 access token',
  `token_expires_at` DATETIME COMMENT 'OAuth2 token expiration time',
  `sftp_host` VARCHAR(255) DEFAULT 'sftp.contributor.adobestock.com' COMMENT 'Adobe Stock SFTP server hostname',
  `sftp_username` VARCHAR(255) DEFAULT '' COMMENT 'SFTP username from Adobe Stock contributor portal',
  `sftp_password` VARCHAR(255) DEFAULT '' COMMENT 'SFTP password from Adobe Stock contributor portal',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default row for adobe_credentials (single row table)
INSERT INTO `adobe_credentials` (`id`, `client_id`, `client_secret`, `sftp_host`, `sftp_username`, `sftp_password`) 
VALUES (1, '', '', 'sftp.contributor.adobestock.com', '', '') 
ON DUPLICATE KEY UPDATE `id` = `id`;


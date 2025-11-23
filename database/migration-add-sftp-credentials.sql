-- Migration: Add SFTP credentials for Adobe Stock upload
-- Adobe Stock uses SFTP for content upload since 2021
-- Run this migration to add SFTP support to existing database

ALTER TABLE `adobe_credentials` 
ADD COLUMN `sftp_host` VARCHAR(255) DEFAULT 'sftp.contributor.adobestock.com' COMMENT 'Adobe Stock SFTP server hostname',
ADD COLUMN `sftp_username` VARCHAR(255) DEFAULT '' COMMENT 'SFTP username from Adobe Stock contributor portal',
ADD COLUMN `sftp_password` VARCHAR(255) DEFAULT '' COMMENT 'SFTP password from Adobe Stock contributor portal';

-- Note: Get your SFTP credentials from:
-- Adobe Stock Contributor Portal → Submit → Upload Options → FTP/SFTP


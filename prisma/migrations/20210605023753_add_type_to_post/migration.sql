-- AlterTable
ALTER TABLE `Post` ADD COLUMN     `sourceType` ENUM('image', 'video') NOT NULL DEFAULT 'image';

-- AlterTable
ALTER TABLE `User` ADD COLUMN     `backGroundItem` VARCHAR(191),
    ADD COLUMN     `backGroundItemType` ENUM('image', 'video');

/*
  Warnings:

  - You are about to drop the column `backGroundItem` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `backGroundItemType` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[backGroundItemId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `backGroundItem`,
    DROP COLUMN `backGroundItemType`,
    ADD COLUMN `backGroundItemId` INTEGER;

-- CreateTable
CREATE TABLE `BackGroundItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `type` ENUM('image', 'video') NOT NULL,
    `width` INTEGER,
    `height` INTEGER,
    `userId` VARCHAR(191),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_backGroundItemId_unique` ON `User`(`backGroundItemId`);

-- AddForeignKey
ALTER TABLE `User` ADD FOREIGN KEY (`backGroundItemId`) REFERENCES `BackGroundItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

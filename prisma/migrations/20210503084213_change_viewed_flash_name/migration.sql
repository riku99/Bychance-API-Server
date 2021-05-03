/*
  Warnings:

  - You are about to drop the `viewedFlash` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `viewedFlash` DROP FOREIGN KEY `viewedFlash_ibfk_2`;

-- DropForeignKey
ALTER TABLE `viewedFlash` DROP FOREIGN KEY `viewedFlash_ibfk_1`;

-- DropTable
DROP TABLE `viewedFlash`;

-- CreateTable
CREATE TABLE `ViewedFlash` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `flashId` INTEGER NOT NULL,
UNIQUE INDEX `userId_flashId_unique`(`userId`, `flashId`),
INDEX `flashId`(`flashId`),
INDEX `userId_flashId_index`(`userId`, `flashId`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ViewedFlash` ADD FOREIGN KEY (`flashId`) REFERENCES `Flash`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ViewedFlash` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

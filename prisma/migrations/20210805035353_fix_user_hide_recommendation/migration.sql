/*
  Warnings:

  - You are about to drop the `DeleteRecommendation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `DeleteRecommendation` DROP FOREIGN KEY `DeleteRecommendation_ibfk_2`;

-- DropForeignKey
ALTER TABLE `DeleteRecommendation` DROP FOREIGN KEY `DeleteRecommendation_ibfk_1`;

-- DropTable
DROP TABLE `DeleteRecommendation`;

-- CreateTable
CREATE TABLE `UserHideRecommendation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,
    `recommendationId` INTEGER NOT NULL,
INDEX `UserHideRecommendation.userId_index`(`userId`),
INDEX `UserHideRecommendation.recommendationId_index`(`recommendationId`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserHideRecommendation` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserHideRecommendation` ADD FOREIGN KEY (`recommendationId`) REFERENCES `Recommendation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

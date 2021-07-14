/*
  Warnings:

  - You are about to drop the column `image` on the `Recommendation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Recommendation` DROP COLUMN `image`,
    ADD COLUMN     `endTime` DATETIME(3);

-- CreateTable
CREATE TABLE `RecommendationImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `url` VARCHAR(191) NOT NULL,
    `recommendationId` INTEGER NOT NULL,
INDEX `RecommendationImage.recommendationId_index`(`recommendationId`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RecommendationImage` ADD FOREIGN KEY (`recommendationId`) REFERENCES `Recommendation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

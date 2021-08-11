-- CreateTable
CREATE TABLE `RecommendationClientReadNotification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `clientId` VARCHAR(191) NOT NULL,
    `notificationId` INTEGER NOT NULL,
INDEX `RecommendationClientReadNotification.clientId_index`(`clientId`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RecommendationClientReadNotification` ADD FOREIGN KEY (`clientId`) REFERENCES `RecommendationClient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecommendationClientReadNotification` ADD FOREIGN KEY (`notificationId`) REFERENCES `RecommendationClientNotification`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

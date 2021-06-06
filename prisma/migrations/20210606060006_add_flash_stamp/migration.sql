-- CreateTable
CREATE TABLE `FlashStamp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `value` ENUM('thumbsUp', 'yusyo', 'yoi', 'itibann', 'seikai') NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `flashId` INTEGER NOT NULL,
INDEX `FlashStamp.userId_flashId_index`(`userId`, `flashId`),
UNIQUE INDEX `FlashStamp.userId_flashId_value_unique`(`userId`, `flashId`, `value`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FlashStamp` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlashStamp` ADD FOREIGN KEY (`flashId`) REFERENCES `Flash`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

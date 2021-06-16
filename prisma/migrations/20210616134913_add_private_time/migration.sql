-- CreateTable
CREATE TABLE `PrivateTime` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `startHours` INTEGER NOT NULL,
    `startMinutes` INTEGER NOT NULL,
    `endHours` INTEGER NOT NULL,
    `endMinutes` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
INDEX `PrivateTime.userId_index`(`userId`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PrivateTime` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

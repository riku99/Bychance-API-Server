-- CreateTable
CREATE TABLE `BillingHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `planId` ENUM('shop') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `BillingHistory.transactionId_unique`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BillingHistory` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

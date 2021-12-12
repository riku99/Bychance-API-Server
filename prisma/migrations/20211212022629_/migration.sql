/*
  Warnings:

  - You are about to drop the `BillingHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BillingPlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `BillingHistory` DROP FOREIGN KEY `BillingHistory_ibfk_1`;

-- DropTable
DROP TABLE `BillingHistory`;

-- DropTable
DROP TABLE `BillingPlan`;

-- CreateTable
CREATE TABLE `IapReceipt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `IapReceipt.transactionId_unique`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `IapReceipt` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[originalTransactionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Subscription.userId_unique` ON `Subscription`(`userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Subscription.originalTransactionId_unique` ON `Subscription`(`originalTransactionId`);

-- CreateIndex
CREATE INDEX `Subscription.expireDate_index` ON `Subscription`(`expireDate`);

-- AddForeignKey
ALTER TABLE `Subscription` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

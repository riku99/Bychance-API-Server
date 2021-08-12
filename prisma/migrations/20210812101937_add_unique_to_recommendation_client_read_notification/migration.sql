/*
  Warnings:

  - A unique constraint covering the columns `[clientId,notificationId]` on the table `RecommendationClientReadNotification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `RecommendationClientReadNotification.clientId_notificationId_uni` ON `RecommendationClientReadNotification`(`clientId`, `notificationId`);

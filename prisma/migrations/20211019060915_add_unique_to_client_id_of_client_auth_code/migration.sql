/*
  Warnings:

  - A unique constraint covering the columns `[clientId]` on the table `ClientAuthCode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ClientAuthCode.clientId_unique` ON `ClientAuthCode`(`clientId`);

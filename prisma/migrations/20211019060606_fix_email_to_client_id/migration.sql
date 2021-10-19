/*
  Warnings:

  - You are about to drop the column `email` on the `ClientAuthCode` table. All the data in the column will be lost.
  - Added the required column `clientId` to the `ClientAuthCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ClientAuthCode` DROP COLUMN `email`,
    ADD COLUMN `clientId` INTEGER NOT NULL;

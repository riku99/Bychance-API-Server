/*
  Warnings:

  - You are about to drop the column `accessToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lineId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User.accessToken_index` ON `User`;

-- DropIndex
DROP INDEX `User.accessToken_unique` ON `User`;

-- DropIndex
DROP INDEX `User.lineId_index` ON `User`;

-- DropIndex
DROP INDEX `User.lineId_unique` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `accessToken`,
    DROP COLUMN `lineId`;

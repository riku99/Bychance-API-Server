/*
  Warnings:

  - Added the required column `createdAt` to the `ApplyingGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ApplyingGroup` ADD COLUMN `createdAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Block` ALTER COLUMN `createdAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `DeviceToken` ALTER COLUMN `createdAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `FlashStamp` ALTER COLUMN `createdAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Group` ALTER COLUMN `createdAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Post` ALTER COLUMN `createdAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `PrivateTime` ALTER COLUMN `createdAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `PrivateZone` ALTER COLUMN `createdAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `ReadTalkRoomMessage` ALTER COLUMN `createdAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Subscription` ALTER COLUMN `createdAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `TalkRoom` ALTER COLUMN `createdAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `TalkRoomMessage` ALTER COLUMN `createdAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `UserAuthCode` ALTER COLUMN `createdAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `ViewedFlash` ALTER COLUMN `createdAt` DROP DEFAULT;

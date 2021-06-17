-- AlterTable
ALTER TABLE `User` ADD COLUMN     `inPrivateZone` BOOLEAN NOT NULL DEFAULT false;

-- AlterIndex
ALTER TABLE `ReadTalkRoomMessage` RENAME INDEX `userId_messageId_roomId_index` TO `ReadTalkRoomMessage.userId_messageId_roomId_index`;

-- AlterIndex
ALTER TABLE `ViewedFlash` RENAME INDEX `flashId` TO `ViewedFlash.flashId_index`;

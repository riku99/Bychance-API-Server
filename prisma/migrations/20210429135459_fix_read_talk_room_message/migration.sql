/*
  Warnings:

  - You are about to drop the `readTalkRoomMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `readTalkRoomMessage` DROP FOREIGN KEY `readTalkRoomMessage_ibfk_2`;

-- DropForeignKey
ALTER TABLE `readTalkRoomMessage` DROP FOREIGN KEY `readTalkRoomMessage_ibfk_3`;

-- DropForeignKey
ALTER TABLE `readTalkRoomMessage` DROP FOREIGN KEY `readTalkRoomMessage_ibfk_1`;

-- DropTable
DROP TABLE `readTalkRoomMessage`;

-- CreateTable
CREATE TABLE `ReadTalkRoomMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `messageId` INTEGER NOT NULL,
    `roomId` INTEGER NOT NULL,
INDEX `ReadTalkRoomMessage.userId_messageId_roomId_index`(`userId`, `messageId`, `roomId`),
UNIQUE INDEX `ReadTalkRoomMessage.userId_messageId_roomId_unique`(`userId`, `messageId`, `roomId`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReadTalkRoomMessage` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReadTalkRoomMessage` ADD FOREIGN KEY (`messageId`) REFERENCES `TalkRoomMessage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReadTalkRoomMessage` ADD FOREIGN KEY (`roomId`) REFERENCES `TalkRoom`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

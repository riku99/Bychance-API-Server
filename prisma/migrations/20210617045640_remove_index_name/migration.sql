-- AlterIndex
ALTER TABLE `ReadTalkRoomMessage` RENAME INDEX `messageId` TO `ReadTalkRoomMessage.messageId_index`;

-- AlterIndex
ALTER TABLE `ReadTalkRoomMessage` RENAME INDEX `roomId` TO `ReadTalkRoomMessage.roomId_index`;

-- AlterIndex
ALTER TABLE `TalkRoom` RENAME INDEX `recipientId` TO `TalkRoom.recipientId_index`;

-- AlterIndex
ALTER TABLE `TalkRoomMessage` RENAME INDEX `roomId` TO `TalkRoomMessage.roomId_index`;

-- AlterIndex
ALTER TABLE `ViewedFlash` RENAME INDEX `userId_flashId_index` TO `ViewedFlash.userId_flashId_index`;

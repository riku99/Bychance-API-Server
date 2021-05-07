-- CreateIndex
CREATE INDEX `DeleteTalkRoom.userId_talkRoomId_index` ON `DeleteTalkRoom`(`userId`, `talkRoomId`);

-- AlterIndex
ALTER TABLE `ReadTalkRoomMessage` RENAME INDEX `ReadTalkRoomMessage.userId_messageId_roomId_index` TO `userId_messageId_roomId_index`;

-- AlterIndex
ALTER TABLE `ReadTalkRoomMessage` RENAME INDEX `ReadTalkRoomMessage.userId_messageId_roomId_unique` TO `userId_messageId_roomId_unique`;

-- AlterIndex
ALTER TABLE `TalkRoom` RENAME INDEX `TalkRoom.senderId_recipientId_index` TO `senderId_recipientId_index`;

-- AlterIndex
ALTER TABLE `TalkRoom` RENAME INDEX `TalkRoom.senderId_recipientId_unique` TO `senderId_recipientId_unique`;

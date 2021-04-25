/*
  Warnings:

  - You are about to drop the `Flash` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Nonce` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `readTalkRoomMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TalkRoom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TalkRoomMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `viewedFlash` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Flash` DROP FOREIGN KEY `Flash_ibfk_1`;

-- DropForeignKey
ALTER TABLE `readTalkRoomMessage` DROP FOREIGN KEY `readTalkRoomMessage_ibfk_2`;

-- DropForeignKey
ALTER TABLE `readTalkRoomMessage` DROP FOREIGN KEY `readTalkRoomMessage_ibfk_3`;

-- DropForeignKey
ALTER TABLE `readTalkRoomMessage` DROP FOREIGN KEY `readTalkRoomMessage_ibfk_1`;

-- DropForeignKey
ALTER TABLE `TalkRoom` DROP FOREIGN KEY `TalkRoom_ibfk_2`;

-- DropForeignKey
ALTER TABLE `TalkRoom` DROP FOREIGN KEY `TalkRoom_ibfk_1`;

-- DropForeignKey
ALTER TABLE `TalkRoomMessage` DROP FOREIGN KEY `TalkRoomMessage_ibfk_2`;

-- DropForeignKey
ALTER TABLE `TalkRoomMessage` DROP FOREIGN KEY `TalkRoomMessage_ibfk_1`;

-- DropForeignKey
ALTER TABLE `viewedFlash` DROP FOREIGN KEY `viewedFlash_ibfk_2`;

-- DropForeignKey
ALTER TABLE `viewedFlash` DROP FOREIGN KEY `viewedFlash_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Post` DROP FOREIGN KEY `Post_ibfk_1`;

-- DropTable
DROP TABLE `Flash`;

-- DropTable
DROP TABLE `Nonce`;

-- DropTable
DROP TABLE `readTalkRoomMessage`;

-- DropTable
DROP TABLE `TalkRoom`;

-- DropTable
DROP TABLE `TalkRoomMessage`;

-- DropTable
DROP TABLE `viewedFlash`;

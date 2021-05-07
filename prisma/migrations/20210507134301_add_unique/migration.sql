/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[userId,talkRoomId]` on the table `DeleteTalkRoom`. If there are existing duplicate values, the migration will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `DeleteTalkRoom.userId_talkRoomId_unique` ON `DeleteTalkRoom`(`userId`, `talkRoomId`);

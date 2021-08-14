-- CreateIndex
CREATE INDEX `TalkRoomMessage.userId_receipt_index` ON `TalkRoomMessage`(`userId`, `receipt`);

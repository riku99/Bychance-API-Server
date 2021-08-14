/*
  Warnings:

  - You are about to drop the `DeleteTalkRoom` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `DeleteTalkRoom` DROP FOREIGN KEY `DeleteTalkRoom_ibfk_2`;

-- DropForeignKey
ALTER TABLE `DeleteTalkRoom` DROP FOREIGN KEY `DeleteTalkRoom_ibfk_1`;

-- DropTable
DROP TABLE `DeleteTalkRoom`;

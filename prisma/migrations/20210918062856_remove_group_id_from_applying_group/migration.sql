/*
  Warnings:

  - You are about to drop the column `groupId` on the `ApplyingGroup` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `ApplyingGroup` DROP FOREIGN KEY `ApplyingGroup_ibfk_1`;

-- AlterTable
ALTER TABLE `ApplyingGroup` DROP COLUMN `groupId`;

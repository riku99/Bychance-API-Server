/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Group` ADD COLUMN `ownerId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Group_ownerId_unique` ON `Group`(`ownerId`);

-- AddForeignKey
ALTER TABLE `Group` ADD FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterIndex
ALTER TABLE `User` RENAME INDEX `groupId` TO `User.groupId_index`;

/*
  Warnings:

  - Added the required column `applyingUserId` to the `ApplyingGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ApplyingGroup` ADD COLUMN `applyingUserId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `ApplyingGroup.applyingUserId_appliedUserId_index` ON `ApplyingGroup`(`applyingUserId`, `appliedUserId`);

-- AddForeignKey
ALTER TABLE `ApplyingGroup` ADD FOREIGN KEY (`applyingUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

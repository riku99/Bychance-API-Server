/*
  Warnings:

  - A unique constraint covering the columns `[applyingUserId,appliedUserId]` on the table `ApplyingGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `ApplyingGroup.applyingUserId_appliedUserId_index` ON `ApplyingGroup`;

-- CreateIndex
CREATE UNIQUE INDEX `ApplyingGroup.applyingUserId_appliedUserId_unique` ON `ApplyingGroup`(`applyingUserId`, `appliedUserId`);

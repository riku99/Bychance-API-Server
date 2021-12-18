/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `PrivateTime` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PrivateZone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `PrivateTime` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `PrivateZone` DROP COLUMN `updatedAt`;

/*
  Warnings:

  - Added the required column `updatedAt` to the `IapReceipt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `IapReceipt` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

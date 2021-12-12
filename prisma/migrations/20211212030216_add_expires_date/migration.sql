/*
  Warnings:

  - Added the required column `expiresDate` to the `IapReceipt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `IapReceipt` ADD COLUMN `expiresDate` DATETIME(3) NOT NULL;

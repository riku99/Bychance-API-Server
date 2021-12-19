/*
  Warnings:

  - You are about to drop the `IapReceipt` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `IapReceipt` DROP FOREIGN KEY `IapReceipt_ibfk_1`;

-- DropTable
DROP TABLE `IapReceipt`;

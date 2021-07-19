/*
  Warnings:

  - You are about to drop the column `hide` on the `Recommendation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Recommendation` DROP COLUMN `hide`,
    ADD COLUMN     `display` BOOLEAN NOT NULL DEFAULT true;

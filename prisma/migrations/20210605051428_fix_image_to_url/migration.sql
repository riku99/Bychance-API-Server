/*
  Warnings:

  - You are about to drop the column `image` on the `Post` table. All the data in the column will be lost.
  - Added the required column `url` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- ALTER TABLE `Post` DROP COLUMN `image`,
--     ADD COLUMN     `url` VARCHAR(191) NOT NULL;

ALTER TABLE `Post` CHANGE COLUMN `image` `url` VARCHAR(191) NOT NULL;
/*
  Warnings:

  - You are about to drop the column `email` on the `RecommendationClient` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `RecommendationClient` table. All the data in the column will be lost.
  - The migration will add a unique constraint covering the columns `[uid]` on the table `RecommendationClient`. If there are existing duplicate values, the migration will fail.
  - Added the required column `uid` to the `RecommendationClient` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `RecommendationClient.email_index` ON `RecommendationClient`;

-- DropIndex
DROP INDEX `RecommendationClient.email_unique` ON `RecommendationClient`;

-- AlterTable
ALTER TABLE `RecommendationClient` DROP COLUMN `email`,
    DROP COLUMN `password`,
    ADD COLUMN     `uid` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `RecommendationClient.uid_unique` ON `RecommendationClient`(`uid`);

/*
  Warnings:

  - You are about to drop the column `geoHash` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User.display_login_inPrivateZone_geoHash_index` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `geoHash`,
    ADD COLUMN     `geohash` VARCHAR(191);

-- CreateIndex
CREATE INDEX `User.display_login_inPrivateZone_geohash_index` ON `User`(`display`, `login`, `inPrivateZone`, `geohash`);

-- DropIndex
DROP INDEX `User.display_login_inPrivateZone_index` ON `User`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN     `geoHash` VARCHAR(191);

-- CreateIndex
CREATE INDEX `User.display_login_inPrivateZone_geoHash_index` ON `User`(`display`, `login`, `inPrivateZone`, `geoHash`);

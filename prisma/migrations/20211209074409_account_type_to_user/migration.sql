-- DropIndex
DROP INDEX `User.display_login_inPrivateZone_geohash_lat_lng_index` ON `User`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `accountType` ENUM('NormalUser', 'Shop') NOT NULL DEFAULT 'NormalUser';

-- CreateIndex
CREATE INDEX `User.login_display_accountType_inPrivateZone_geohash_lat_lng_ind` ON `User`(`login`, `display`, `accountType`, `inPrivateZone`, `geohash`, `lat`, `lng`);

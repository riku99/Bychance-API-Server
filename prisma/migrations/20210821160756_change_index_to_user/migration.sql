-- DropIndex
DROP INDEX `User.display_login_inPrivateZone_geohash_index` ON `User`;

-- CreateIndex
CREATE INDEX `User.display_login_inPrivateZone_geohash_lat_lng_index` ON `User`(`display`, `login`, `inPrivateZone`, `geohash`, `lat`, `lng`);

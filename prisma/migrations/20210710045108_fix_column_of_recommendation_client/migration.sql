-- AlterTable
ALTER TABLE `RecommendationClient` ADD COLUMN     `image` VARCHAR(191),
    MODIFY `lat` DOUBLE,
    MODIFY `lng` DOUBLE,
    MODIFY `geohash` VARCHAR(191),
    MODIFY `address` VARCHAR(191);

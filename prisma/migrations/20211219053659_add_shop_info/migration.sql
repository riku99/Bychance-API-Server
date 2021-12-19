-- CreateTable
CREATE TABLE `ShopInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `genre` ENUM('RESTAURANT', 'CAFE', 'IZAKAYA', 'APPAREL') NOT NULL,

    UNIQUE INDEX `ShopInfo.userId_unique`(`userId`),
    INDEX `ShopInfo.genre_index`(`genre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ShopInfo` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

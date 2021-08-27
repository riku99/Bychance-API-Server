-- CreateTable
CREATE TABLE `Block` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `blockBy` VARCHAR(191) NOT NULL,
    `blockTo` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Block.blockBy_blockTo_unique`(`blockBy`, `blockTo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Block` ADD FOREIGN KEY (`blockBy`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Block` ADD FOREIGN KEY (`blockTo`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

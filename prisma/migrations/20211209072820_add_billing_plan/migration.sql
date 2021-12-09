-- CreateTable
CREATE TABLE `BillingPlan` (
    `id` ENUM('shop') NOT NULL,
    `name` ENUM('Shop') NOT NULL,
    `price` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

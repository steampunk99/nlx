-- CreateTable
CREATE TABLE `admin_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `siteName` VARCHAR(191) NOT NULL DEFAULT 'Earn Drip',
    `siteLogoUrl` VARCHAR(191) NULL,
    `siteBaseUrl` VARCHAR(191) NOT NULL DEFAULT 'https://earndrip.com',
    `mtnCollectionNumber` VARCHAR(191) NULL,
    `airtelCollectionNumber` VARCHAR(191) NULL,
    `supportPhone` VARCHAR(191) NULL,
    `supportEmail` VARCHAR(191) NULL,
    `supportLocation` VARCHAR(191) NULL,
    `depositDollarRate` DOUBLE NOT NULL DEFAULT 3900.0,
    `withdrawalDollarRate` DOUBLE NOT NULL DEFAULT 3900.0,
    `withdrawalCharge` DOUBLE NOT NULL DEFAULT 2.0,
    `usdtWalletAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_config_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

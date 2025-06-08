-- AlterTable
ALTER TABLE `packages` MODIFY `duration` INTEGER NOT NULL DEFAULT 450;

-- CreateTable
CREATE TABLE `prize_config` (
    `title` VARCHAR(191) NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DECIMAL(15, 2) NOT NULL,
    `startTimeUTC` VARCHAR(191) NOT NULL,
    `durationMinutes` INTEGER NOT NULL,
    `maxWinners` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

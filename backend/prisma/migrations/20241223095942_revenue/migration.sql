-- AlterTable
ALTER TABLE `commissions` MODIFY `status` ENUM('PENDING', 'PROCESSED', 'FAILED', 'WITHDRAWN') NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `system_revenue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DECIMAL(10, 2) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `payment_id` INTEGER NULL,
    `package_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `system_revenue_package_id_fkey`(`package_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `system_revenue` ADD CONSTRAINT `system_revenue_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

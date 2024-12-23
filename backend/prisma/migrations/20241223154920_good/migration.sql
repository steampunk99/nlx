/*
  Warnings:

  - The values [APPROVED] on the enum `withdrawals_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `pendingBalance` on the `nodes` table. All the data in the column will be lost.
  - The values [APPROVED] on the enum `withdrawals_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `node_withdrawals` MODIFY `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `nodes` DROP COLUMN `pendingBalance`;

-- AlterTable
ALTER TABLE `withdrawals` ADD COLUMN `attempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `completed_at` DATETIME(3) NULL,
    ADD COLUMN `failureReason` TEXT NULL,
    ADD COLUMN `processed_at` DATETIME(3) NULL,
    MODIFY `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

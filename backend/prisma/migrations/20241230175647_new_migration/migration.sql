/*
  Warnings:

  - The values [COMPLETED,REFUNDED] on the enum `node_payments_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [COMPLETED] on the enum `withdrawals_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [COMPLETED] on the enum `withdrawals_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `node_payments` MODIFY `status` ENUM('PENDING', 'SUCCESSFUL', 'FAILED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `node_withdrawals` MODIFY `status` ENUM('PENDING', 'PROCESSING', 'SUCCESSFUL', 'FAILED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `withdrawals` MODIFY `status` ENUM('PENDING', 'PROCESSING', 'SUCCESSFUL', 'FAILED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

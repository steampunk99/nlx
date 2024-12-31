/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `node_payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionId` to the `node_payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `node_payments` ADD COLUMN `transactionId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `node_payments_transactionId_key` ON `node_payments`(`transactionId`);

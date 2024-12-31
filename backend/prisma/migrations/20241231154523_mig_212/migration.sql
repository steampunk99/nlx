/*
  Warnings:

  - You are about to drop the column `failureReason` on the `withdrawals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transactionId]` on the table `node_withdrawals` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionId]` on the table `withdrawals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionId` to the `node_withdrawals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionId` to the `withdrawals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `node_withdrawals` ADD COLUMN `transactionId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `withdrawals` DROP COLUMN `failureReason`,
    ADD COLUMN `transactionId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `node_withdrawals_transactionId_key` ON `node_withdrawals`(`transactionId`);

-- CreateIndex
CREATE UNIQUE INDEX `withdrawals_transactionId_key` ON `withdrawals`(`transactionId`);

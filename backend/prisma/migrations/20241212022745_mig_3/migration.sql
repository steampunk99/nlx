/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `node_payments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `node_payments_reference_key` ON `node_payments`(`reference`);

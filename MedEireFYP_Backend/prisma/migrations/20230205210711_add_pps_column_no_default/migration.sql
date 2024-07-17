/*
  Warnings:

  - A unique constraint covering the columns `[pps]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pps` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `pps` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_pps_key` ON `User`(`pps`);

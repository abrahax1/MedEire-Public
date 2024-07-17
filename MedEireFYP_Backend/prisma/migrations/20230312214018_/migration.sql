/*
  Warnings:

  - The primary key for the `Roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userID` on the `Roles` table. All the data in the column will be lost.
  - You are about to drop the column `roleDescription` on the `UserRoles` table. All the data in the column will be lost.
  - You are about to drop the column `roleUserID` on the `UserRoles` table. All the data in the column will be lost.
  - You are about to drop the column `userID` on the `UserRoles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roleId,userId]` on the table `UserRoles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `Roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `UserRoles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `UserRoles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Roles` DROP FOREIGN KEY `Roles_userID_fkey`;

-- DropForeignKey
ALTER TABLE `UserRoles` DROP FOREIGN KEY `UserRoles_roleUserID_roleDescription_fkey`;

-- DropForeignKey
ALTER TABLE `UserRoles` DROP FOREIGN KEY `UserRoles_userID_fkey`;

-- DropIndex
DROP INDEX `UserRoles_userID_roleUserID_roleDescription_key` ON `UserRoles`;

-- AlterTable
ALTER TABLE `Roles` DROP PRIMARY KEY,
    DROP COLUMN `userID`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `UserRoles` DROP COLUMN `roleDescription`,
    DROP COLUMN `roleUserID`,
    DROP COLUMN `userID`,
    ADD COLUMN `roleId` INTEGER NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `UserRoles_roleId_userId_key` ON `UserRoles`(`roleId`, `userId`);

-- AddForeignKey
ALTER TABLE `UserRoles` ADD CONSTRAINT `UserRoles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRoles` ADD CONSTRAINT `UserRoles_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

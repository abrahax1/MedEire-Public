/*
  Warnings:

  - You are about to drop the column `id` on the `Roles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Roles` DROP COLUMN `id`;

-- CreateTable
CREATE TABLE `UserRoles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userID` INTEGER NOT NULL,
    `roleUserID` INTEGER NOT NULL,
    `roleDescription` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UserRoles_userID_roleUserID_roleDescription_key`(`userID`, `roleUserID`, `roleDescription`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserRoles` ADD CONSTRAINT `UserRoles_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRoles` ADD CONSTRAINT `UserRoles_roleUserID_roleDescription_fkey` FOREIGN KEY (`roleUserID`, `roleDescription`) REFERENCES `Roles`(`userID`, `description`) ON DELETE RESTRICT ON UPDATE CASCADE;

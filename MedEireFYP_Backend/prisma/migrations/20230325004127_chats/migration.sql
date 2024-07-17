/*
  Warnings:

  - You are about to drop the column `userID` on the `Chat` table. All the data in the column will be lost.
  - Added the required column `senderID` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Chat` DROP FOREIGN KEY `Chat_userID_fkey`;

-- AlterTable
ALTER TABLE `Chat` DROP COLUMN `userID`,
    ADD COLUMN `senderID` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_senderID_fkey` FOREIGN KEY (`senderID`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_receiverID_fkey` FOREIGN KEY (`receiverID`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

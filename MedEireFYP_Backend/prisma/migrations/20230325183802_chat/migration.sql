/*
  Warnings:

  - You are about to drop the column `dateCreated` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the `ChatRoom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `receiverID` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ChatRoom` DROP FOREIGN KEY `ChatRoom_chatID_fkey`;

-- DropForeignKey
ALTER TABLE `ChatRoom` DROP FOREIGN KEY `ChatRoom_roomID_fkey`;

-- AlterTable
ALTER TABLE `Chat` DROP COLUMN `dateCreated`,
    DROP COLUMN `message`,
    ADD COLUMN `receiverID` INTEGER NOT NULL;

-- DropTable
DROP TABLE `ChatRoom`;

-- DropTable
DROP TABLE `Room`;

-- CreateTable
CREATE TABLE `Message` (
    `messageID` INTEGER NOT NULL AUTO_INCREMENT,
    `message` VARCHAR(191) NOT NULL,
    `senderID` INTEGER NOT NULL,
    `dateCreate` DATETIME(3) NOT NULL,
    `chatID` INTEGER NOT NULL,

    PRIMARY KEY (`messageID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chatID_fkey` FOREIGN KEY (`chatID`) REFERENCES `Chat`(`chatID`) ON DELETE RESTRICT ON UPDATE CASCADE;

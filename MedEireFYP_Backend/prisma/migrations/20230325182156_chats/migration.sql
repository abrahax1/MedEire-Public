/*
  Warnings:

  - The primary key for the `Chat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `receiverID` on the `Chat` table. All the data in the column will be lost.
  - Added the required column `chatID` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateCreated` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Chat` DROP FOREIGN KEY `Chat_receiverID_fkey`;

-- DropForeignKey
ALTER TABLE `Chat` DROP FOREIGN KEY `Chat_senderID_fkey`;

-- AlterTable
ALTER TABLE `Chat` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `receiverID`,
    ADD COLUMN `chatID` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `dateCreated` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`chatID`);

-- CreateTable
CREATE TABLE `Room` (
    `roomID` INTEGER NOT NULL AUTO_INCREMENT,
    `senderID` INTEGER NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `receiverID` INTEGER NOT NULL,

    PRIMARY KEY (`roomID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatRoom` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomID` INTEGER NOT NULL,
    `chatID` INTEGER NOT NULL,

    UNIQUE INDEX `ChatRoom_roomID_chatID_key`(`roomID`, `chatID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChatRoom` ADD CONSTRAINT `ChatRoom_roomID_fkey` FOREIGN KEY (`roomID`) REFERENCES `Room`(`roomID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRoom` ADD CONSTRAINT `ChatRoom_chatID_fkey` FOREIGN KEY (`chatID`) REFERENCES `Chat`(`chatID`) ON DELETE RESTRICT ON UPDATE CASCADE;

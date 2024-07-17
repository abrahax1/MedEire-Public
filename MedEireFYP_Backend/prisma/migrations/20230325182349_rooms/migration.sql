/*
  Warnings:

  - You are about to drop the column `message` on the `Room` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Chat_senderID_fkey` ON `Chat`;

-- AlterTable
ALTER TABLE `Room` DROP COLUMN `message`;

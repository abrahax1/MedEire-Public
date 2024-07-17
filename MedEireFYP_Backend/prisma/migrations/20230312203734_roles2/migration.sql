/*
  Warnings:

  - The primary key for the `Roles` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `Roles` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`userID`, `description`);

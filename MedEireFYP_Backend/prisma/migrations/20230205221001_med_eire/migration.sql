/*
  Warnings:

  - Added the required column `appointmentTime` to the `Appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Appointments` ADD COLUMN `appointmentTime` DATETIME(3) NOT NULL;

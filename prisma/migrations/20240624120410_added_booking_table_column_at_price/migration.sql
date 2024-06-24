/*
  Warnings:

  - Added the required column `at_price_daily` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "at_price_daily" DOUBLE PRECISION NOT NULL;

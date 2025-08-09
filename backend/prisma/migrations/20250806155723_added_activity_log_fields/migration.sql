/*
  Warnings:

  - Added the required column `actionType` to the `ActivityLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `ActivityLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "actionType" TEXT NOT NULL,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "userAgent" TEXT;

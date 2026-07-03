/*
  Warnings:

  - You are about to alter the column `qualityScore` on the `ScanHistory` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('QUANTITY', 'ACTION', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('NONE', 'BADGE', 'CERTIFICATE', 'CASH', 'VOUCHER');

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "rewardType" "RewardType" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "targetValue" INTEGER,
ADD COLUMN     "type" "ChallengeType" NOT NULL DEFAULT 'COMMUNITY',
ADD COLUMN     "unit" TEXT;

-- AlterTable
ALTER TABLE "ScanHistory" ALTER COLUMN "qualityScore" SET DATA TYPE INTEGER;

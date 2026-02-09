/*
  Warnings:

  - You are about to drop the column `documents` on the `Applicant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Applicant" DROP COLUMN "documents",
ADD COLUMN     "achievementFiles" JSONB,
ADD COLUMN     "achievements" TEXT,
ADD COLUMN     "birthCertFile" TEXT,
ADD COLUMN     "birthPlace" TEXT,
ADD COLUMN     "bloodType" TEXT,
ADD COLUMN     "childPosition" INTEGER,
ADD COLUMN     "desiredMajor" TEXT,
ADD COLUMN     "fatherIncome" TEXT,
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "fatherOccupation" TEXT,
ADD COLUMN     "fullAddress" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "guardianAddress" TEXT,
ADD COLUMN     "guardianIncome" TEXT,
ADD COLUMN     "guardianName" TEXT,
ADD COLUMN     "guardianOccupation" TEXT,
ADD COLUMN     "guardianPhone" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "hobby" TEXT,
ADD COLUMN     "ijazahFile" TEXT,
ADD COLUMN     "ijazahNumber" TEXT,
ADD COLUMN     "ijazahYear" INTEGER,
ADD COLUMN     "livingWith" TEXT,
ADD COLUMN     "motherIncome" TEXT,
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "motherOccupation" TEXT,
ADD COLUMN     "parentsPhone" TEXT,
ADD COLUMN     "photoFile" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "skhunFile" TEXT,
ADD COLUMN     "skhunNumber" TEXT,
ADD COLUMN     "sttbFile" TEXT,
ADD COLUMN     "totalSiblings" INTEGER,
ADD COLUMN     "weight" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Applicant_userId_idx" ON "Applicant"("userId");

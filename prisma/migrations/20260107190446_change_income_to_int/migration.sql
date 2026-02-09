/*
  Warnings:

  - The `fatherIncome` column on the `Applicant` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `guardianIncome` column on the `Applicant` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `motherIncome` column on the `Applicant` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Applicant" DROP COLUMN "fatherIncome",
ADD COLUMN     "fatherIncome" INTEGER,
DROP COLUMN "guardianIncome",
ADD COLUMN     "guardianIncome" INTEGER,
DROP COLUMN "motherIncome",
ADD COLUMN     "motherIncome" INTEGER;

/*
  Warnings:

  - A unique constraint covering the columns `[code,gradeLevel]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gradeLevel` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "gradeLevel" "GradeLevel" NOT NULL;

-- CreateIndex
CREATE INDEX "Subject_gradeLevel_idx" ON "Subject"("gradeLevel");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_gradeLevel_key" ON "Subject"("code", "gradeLevel");

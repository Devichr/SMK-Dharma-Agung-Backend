/*
  Warnings:

  - A unique constraint covering the columns `[studentId,date,subjectId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Attendance_studentId_date_scheduleId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_date_subjectId_key" ON "Attendance"("studentId", "date", "subjectId");

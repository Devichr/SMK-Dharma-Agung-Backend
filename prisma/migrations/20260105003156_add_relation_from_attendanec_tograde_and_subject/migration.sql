/*
  Warnings:

  - The values [PRESENT,ABSENT,EXCUSED,LATE] on the enum `AttendanceStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `gradeClassId` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AttendanceStatus_new" AS ENUM ('HADIR', 'SAKIT', 'IZIN', 'ALPHA');
ALTER TABLE "public"."Attendance" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Attendance" ALTER COLUMN "status" TYPE "AttendanceStatus_new" USING ("status"::text::"AttendanceStatus_new");
ALTER TYPE "AttendanceStatus" RENAME TO "AttendanceStatus_old";
ALTER TYPE "AttendanceStatus_new" RENAME TO "AttendanceStatus";
DROP TYPE "public"."AttendanceStatus_old";
ALTER TABLE "Attendance" ALTER COLUMN "status" SET DEFAULT 'HADIR';
COMMIT;

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "gradeClassId" INTEGER NOT NULL,
ADD COLUMN     "subjectId" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'HADIR';

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_gradeClassId_fkey" FOREIGN KEY ("gradeClassId") REFERENCES "GradeClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `applicantId` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `applicantId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_AttendanceToStudent` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentId,date,scheduleId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[campusMapId,roomId]` on the table `MapRoom` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gradeClassId,day,period]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gradeClassId` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enrollmentYear` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GradeLevel" AS ENUM ('GRADE_10', 'GRADE_11', 'GRADE_12');

-- AlterEnum
ALTER TYPE "AttendanceStatus" ADD VALUE 'LATE';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'STUDENT';

-- DropForeignKey
ALTER TABLE "public"."Admin" DROP CONSTRAINT "Admin_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Applicant" DROP CONSTRAINT "Applicant_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "Attendance_applicantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MapRoom" DROP CONSTRAINT "MapRoom_campusMapId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Staff" DROP CONSTRAINT "Staff_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Teacher" DROP CONSTRAINT "Teacher_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AttendanceToStudent" DROP CONSTRAINT "_AttendanceToStudent_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AttendanceToStudent" DROP CONSTRAINT "_AttendanceToStudent_B_fkey";

-- DropIndex
DROP INDEX "public"."User_adminId_key";

-- DropIndex
DROP INDEX "public"."User_applicantId_key";

-- DropIndex
DROP INDEX "public"."User_teacherId_key";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "address" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Applicant" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "applicantId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "scheduleId" INTEGER,
ADD COLUMN     "studentId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "MapRoom" ADD COLUMN     "building" TEXT,
ADD COLUMN     "floor" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "gradeClassId" INTEGER NOT NULL,
ADD COLUMN     "startTime" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "enrollmentYear" INTEGER NOT NULL,
ADD COLUMN     "gradeClassId" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "adminId",
DROP COLUMN "applicantId",
DROP COLUMN "teacherId";

-- DropTable
DROP TABLE "public"."_AttendanceToStudent";

-- CreateTable
CREATE TABLE "GradeClass" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "gradeLevel" "GradeLevel" NOT NULL,
    "academicYear" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 30,
    "homeroomId" INTEGER,
    "classroomId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradeClass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GradeClass_gradeLevel_idx" ON "GradeClass"("gradeLevel");

-- CreateIndex
CREATE INDEX "GradeClass_academicYear_idx" ON "GradeClass"("academicYear");

-- CreateIndex
CREATE INDEX "GradeClass_homeroomId_idx" ON "GradeClass"("homeroomId");

-- CreateIndex
CREATE INDEX "GradeClass_classroomId_idx" ON "GradeClass"("classroomId");

-- CreateIndex
CREATE UNIQUE INDEX "GradeClass_name_academicYear_key" ON "GradeClass"("name", "academicYear");

-- CreateIndex
CREATE INDEX "Admin_nip_idx" ON "Admin"("nip");

-- CreateIndex
CREATE INDEX "Applicant_nisn_idx" ON "Applicant"("nisn");

-- CreateIndex
CREATE INDEX "Applicant_status_idx" ON "Applicant"("status");

-- CreateIndex
CREATE INDEX "Attendance_date_idx" ON "Attendance"("date");

-- CreateIndex
CREATE INDEX "Attendance_studentId_idx" ON "Attendance"("studentId");

-- CreateIndex
CREATE INDEX "Attendance_teacherId_idx" ON "Attendance"("teacherId");

-- CreateIndex
CREATE INDEX "Attendance_status_idx" ON "Attendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_date_scheduleId_key" ON "Attendance"("studentId", "date", "scheduleId");

-- CreateIndex
CREATE INDEX "CampusMap_isActive_idx" ON "CampusMap"("isActive");

-- CreateIndex
CREATE INDEX "Feedback_isRead_idx" ON "Feedback"("isRead");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "MapRoom_type_idx" ON "MapRoom"("type");

-- CreateIndex
CREATE INDEX "MapRoom_campusMapId_idx" ON "MapRoom"("campusMapId");

-- CreateIndex
CREATE UNIQUE INDEX "MapRoom_campusMapId_roomId_key" ON "MapRoom"("campusMapId", "roomId");

-- CreateIndex
CREATE INDEX "Schedule_day_idx" ON "Schedule"("day");

-- CreateIndex
CREATE INDEX "Schedule_teacherId_idx" ON "Schedule"("teacherId");

-- CreateIndex
CREATE INDEX "Schedule_gradeClassId_idx" ON "Schedule"("gradeClassId");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_gradeClassId_day_period_key" ON "Schedule"("gradeClassId", "day", "period");

-- CreateIndex
CREATE INDEX "Staff_employeeId_idx" ON "Staff"("employeeId");

-- CreateIndex
CREATE INDEX "Student_nisn_idx" ON "Student"("nisn");

-- CreateIndex
CREATE INDEX "Student_gradeClassId_idx" ON "Student"("gradeClassId");

-- CreateIndex
CREATE INDEX "Student_enrollmentYear_idx" ON "Student"("enrollmentYear");

-- CreateIndex
CREATE INDEX "Teacher_nip_idx" ON "Teacher"("nip");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_gradeClassId_fkey" FOREIGN KEY ("gradeClassId") REFERENCES "GradeClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeClass" ADD CONSTRAINT "GradeClass_homeroomId_fkey" FOREIGN KEY ("homeroomId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeClass" ADD CONSTRAINT "GradeClass_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "MapRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_gradeClassId_fkey" FOREIGN KEY ("gradeClassId") REFERENCES "GradeClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapRoom" ADD CONSTRAINT "MapRoom_campusMapId_fkey" FOREIGN KEY ("campusMapId") REFERENCES "CampusMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "TimePreference" AS ENUM ('MORNING', 'MIDDAY', 'AFTERNOON', 'ANY');

-- CreateTable
CREATE TABLE "SchoolTimeConfig" (
    "id" SERIAL NOT NULL,
    "academicYear" TEXT NOT NULL,
    "schoolStartTime" TEXT NOT NULL,
    "schoolEndTime" TEXT NOT NULL,
    "periodDuration" INTEGER NOT NULL,
    "breakDuration" INTEGER NOT NULL,
    "maxPeriodsPerDay" INTEGER NOT NULL,
    "breakTimes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolTimeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectHours" (
    "id" SERIAL NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "gradeClassId" INTEGER NOT NULL,
    "hoursPerWeek" INTEGER NOT NULL,
    "preferredDays" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherPreference" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "timePreference" "TimePreference" NOT NULL DEFAULT 'ANY',
    "maxHoursPerDay" INTEGER NOT NULL DEFAULT 8,
    "maxHoursPerWeek" INTEGER NOT NULL DEFAULT 40,
    "unavailableDays" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolTimeConfig_academicYear_key" ON "SchoolTimeConfig"("academicYear");

-- CreateIndex
CREATE INDEX "SchoolTimeConfig_academicYear_idx" ON "SchoolTimeConfig"("academicYear");

-- CreateIndex
CREATE INDEX "SubjectHours_subjectId_idx" ON "SubjectHours"("subjectId");

-- CreateIndex
CREATE INDEX "SubjectHours_gradeClassId_idx" ON "SubjectHours"("gradeClassId");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectHours_subjectId_gradeClassId_key" ON "SubjectHours"("subjectId", "gradeClassId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherPreference_teacherId_key" ON "TeacherPreference"("teacherId");

-- AddForeignKey
ALTER TABLE "SubjectHours" ADD CONSTRAINT "SubjectHours_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectHours" ADD CONSTRAINT "SubjectHours_gradeClassId_fkey" FOREIGN KEY ("gradeClassId") REFERENCES "GradeClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherPreference" ADD CONSTRAINT "TeacherPreference_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

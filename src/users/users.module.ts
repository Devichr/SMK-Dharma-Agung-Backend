import { Module } from '@nestjs/common';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { StaffModule } from './staff/staff.module';
import { ApplicantModule } from './applicant/applicant.module';

@Module({
  imports: [StudentsModule, TeachersModule, StaffModule, ApplicantModule],
  exports: [StudentsModule, TeachersModule, StaffModule, ApplicantModule],
})
export class UsersModule {}
import { Module } from '@nestjs/common';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { StaffModule } from './staff/staff.module';

@Module({
  imports: [StudentsModule, TeachersModule, StaffModule],
  exports: [StudentsModule, TeachersModule, StaffModule],
})
export class UsersModule {}
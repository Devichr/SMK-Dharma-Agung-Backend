import { Module } from '@nestjs/common';
import { GradeClassesModule } from './grade-classes/grade-class.module';
import { ScheduleModule } from './schedule/schedule.module';
import { SubjectModule } from './subject/subject.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [GradeClassesModule, ScheduleModule, SubjectModule, AttendanceModule],
  exports: [GradeClassesModule, ScheduleModule, SubjectModule, AttendanceModule],
})
export class AcademicModule {}
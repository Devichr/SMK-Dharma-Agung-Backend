import { Module } from '@nestjs/common';
import { GradeClassesModule } from './grade-classes/grade-class.module';
import { ScheduleModule } from './schedule/schedule.module';
import { SubjectModule } from './subject/subject.module';

@Module({
  imports: [GradeClassesModule, ScheduleModule, SubjectModule],
  exports: [GradeClassesModule, ScheduleModule, SubjectModule],
})
export class AcademicModule {}
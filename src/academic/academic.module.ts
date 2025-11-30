import { Module } from '@nestjs/common';
import { GradeClassesModule } from './grade-classes/grade-class.module';

@Module({
  imports: [GradeClassesModule],
  exports: [GradeClassesModule],
})
export class AcademicModule {}
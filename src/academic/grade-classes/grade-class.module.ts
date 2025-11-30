import { Module } from '@nestjs/common';
import { GradeClassService } from './grade-class.service';
import { GradeClassController } from './grade-class.controller';
import { PrismaModule } from '@prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GradeClassController],
  providers: [GradeClassService],
  exports: [GradeClassService],
})
export class GradeClassesModule {}
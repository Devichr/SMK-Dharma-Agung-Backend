import { Module } from '@nestjs/common';
import { TeacherService } from './teachers.service';
import { TeacherController } from './teachers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}

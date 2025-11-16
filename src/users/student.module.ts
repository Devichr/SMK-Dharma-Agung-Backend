import { Module } from '@nestjs/common';
import { StudentsService } from './student.service';
import { StudentsController } from './student.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}

import { IsString, IsOptional, IsNotEmpty, MaxLength, IsEnum } from 'class-validator';
import { GradeLevel } from '@prisma/client';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string; // "Wajib", "Peminatan", "Lintas Minat"

  @IsEnum(GradeLevel)
  @IsNotEmpty()
  gradeLevel: GradeLevel; // GRADE_10, GRADE_11, GRADE_12
}
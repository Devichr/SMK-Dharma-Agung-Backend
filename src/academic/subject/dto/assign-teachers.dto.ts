import { IsArray, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class AssignTeacherDto {
  @IsInt()
  teacherId: number;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class AssignTeachersDto {
  @IsArray()
  teachers: AssignTeacherDto[];
}
import { IsInt, Min, Max, IsOptional, IsArray } from "class-validator";

export class CreateSubjectHoursDto {
  @IsInt()
  subjectId: number;

  @IsInt()
  gradeClassId: number;

  @IsInt()
  @Min(1)
  @Max(20)
  hoursPerWeek: number; // Jam pelajaran per minggu

  @IsOptional()
  @IsArray()
  preferredDays?: number[]; // [1,2,3] = Monday, Tuesday, Wednesday
}

export class UpdateSubjectHoursDto {
  @IsOptional()
  @IsInt()
  hoursPerWeek?: number;

  @IsOptional()
  @IsArray()
  preferredDays?: number[];
}
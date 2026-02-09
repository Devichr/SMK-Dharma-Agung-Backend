import { IsInt, Min, IsOptional, IsArray, IsString } from "class-validator";

export class SubjectConfigDto {
  @IsInt()
  subjectId: number;

  @IsInt()
  @Min(1)
  hoursPerWeek: number; // Berapa jam per minggu untuk subject ini

  @IsOptional()
  @IsArray()
  preferredDays?: number[]; // Hari-hari yang diprefer
}

export class GenerateTimetableDto {
  @IsInt()
  gradeClassId: number;

  @IsArray()
  subjects: SubjectConfigDto[]; // Subject dengan konfigurasi jam

  @IsString()
  academicYear: string; // Untuk ambil SchoolTimeConfig

  @IsOptional()
  @IsArray()
  daysPerWeek?: number[]; // Default: [1,2,3,4,5,6]
}

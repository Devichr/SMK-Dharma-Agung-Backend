import { IsString, IsInt, IsArray, IsOptional, Min, Max } from 'class-validator';

export class BreakTimeDto {
  @IsInt()
  @Min(1)
  afterPeriod: number; // Setelah periode ke berapa

  @IsInt()
  @Min(5)
  duration: number; // Durasi istirahat dalam menit
}

export class CreateSchoolTimeConfigDto {
  @IsString()
  academicYear: string; // e.g., "2024/2025"

  @IsString()
  schoolStartTime: string; // e.g., "07:00"

  @IsString()
  schoolEndTime: string; // e.g., "16:00"

  @IsInt()
  @Min(30)
  @Max(90)
  periodDuration: number; // 30-90 menit

  @IsInt()
  @Min(5)
  @Max(30)
  breakDuration: number; // 5-30 menit

  @IsInt()
  @Min(4)
  @Max(12)
  maxPeriodsPerDay: number; // 4-12 jam pelajaran

  @IsArray()
  breakTimes: BreakTimeDto[]; // Jam istirahat
}

export class UpdateSchoolTimeConfigDto {
  @IsOptional()
  @IsString()
  schoolStartTime?: string;

  @IsOptional()
  @IsString()
  schoolEndTime?: string;

  @IsOptional()
  @IsInt()
  periodDuration?: number;

  @IsOptional()
  @IsInt()
  breakDuration?: number;

  @IsOptional()
  @IsInt()
  maxPeriodsPerDay?: number;

  @IsOptional()
  @IsArray()
  breakTimes?: BreakTimeDto[];
}
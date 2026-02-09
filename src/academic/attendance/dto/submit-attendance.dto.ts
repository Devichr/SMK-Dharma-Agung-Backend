import { IsArray, IsEnum, IsOptional, IsString, IsDateString, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export enum AttendanceStatus {
  HADIR = 'HADIR',
  SAKIT = 'SAKIT',
  IZIN = 'IZIN',
  ALPHA = 'ALPHA',
}

export class AttendanceItemDto {
  @IsNumber()
  studentId: number;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class SubmitAttendanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceItemDto)
  attendances: AttendanceItemDto[];

  @IsOptional()
  @IsDateString()
  date?: string;
}
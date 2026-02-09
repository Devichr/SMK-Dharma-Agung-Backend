import { IsOptional, IsDateString } from 'class-validator';

export class GetAttendanceQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class GetAttendanceSummaryQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
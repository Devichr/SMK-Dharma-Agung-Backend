import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Matches,
} from 'class-validator';
import { GradeLevel } from '@prisma/client';

export class CreateGradeClassDto {
  @ApiProperty({
    description: 'Nama kelas',
    example: 'X-1',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Tingkat kelas',
    enum: GradeLevel,
    example: GradeLevel.GRADE_10,
  })
  @IsEnum(GradeLevel)
  gradeLevel: GradeLevel;

  @ApiProperty({
    description: 'Tahun ajaran (format: YYYY/YYYY)',
    example: '2024/2025',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}\/\d{4}$/, {
    message: 'Academic year must be in format YYYY/YYYY (e.g., 2024/2025)',
  })
  academicYear: string;

  @ApiPropertyOptional({
    description: 'Kapasitas maksimal siswa',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({
    description: 'ID guru wali kelas',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  homeroomId?: number;

  @ApiPropertyOptional({
    description: 'ID ruang kelas',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  classroomId?: number;
}

export class UpdateGradeClassDto {
  @ApiPropertyOptional({
    description: 'Nama kelas',
    example: 'X-1',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    description: 'Tingkat kelas',
    enum: GradeLevel,
    example: GradeLevel.GRADE_10,
  })
  @IsOptional()
  @IsEnum(GradeLevel)
  gradeLevel?: GradeLevel;

  @ApiPropertyOptional({
    description: 'Tahun ajaran (format: YYYY/YYYY)',
    example: '2024/2025',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}\/\d{4}$/, {
    message: 'Academic year must be in format YYYY/YYYY (e.g., 2024/2025)',
  })
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Kapasitas maksimal siswa',
    example: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({
    description: 'ID guru wali kelas (null untuk menghapus)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  homeroomId?: number | null;

  @ApiPropertyOptional({
    description: 'ID ruang kelas (null untuk menghapus)',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  classroomId?: number | null;
}

export class FilterGradeClassDto {
  @ApiPropertyOptional({
    description: 'Filter berdasarkan tingkat kelas',
    enum: GradeLevel,
    example: GradeLevel.GRADE_10,
  })
  @IsOptional()
  @IsEnum(GradeLevel)
  gradeLevel?: GradeLevel;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan tahun ajaran',
    example: '2024/2025',
  })
  @IsOptional()
  @IsString()
  academicYear?: string;
}
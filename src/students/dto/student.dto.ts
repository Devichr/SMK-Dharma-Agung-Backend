import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({
    description: 'Nama lengkap siswa',
    example: 'Ahmad Rizki',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'NISN (Nomor Induk Siswa Nasional)',
    example: '0045678912',
  })
  @IsString()
  @IsNotEmpty()
  nisn: string;

  @ApiProperty({
    description: 'Nomor telepon siswa/orang tua',
    example: '08123456789',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Alamat lengkap siswa',
    example: 'Jl. Merdeka No. 10, Jakarta',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Tanggal lahir (ISO 8601)',
    example: '2008-05-15',
  })
  @IsDateString()
  birthDate: string;

  @ApiProperty({
    description: 'Asal sekolah (SMP)',
    example: 'SMP Negeri 12 Jakarta',
  })
  @IsString()
  @IsNotEmpty()
  schoolOrigin: string;

  @ApiPropertyOptional({
    description: 'Tahun masuk/diterima',
    example: 2024,
  })
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  enrollmentYear?: number;

  @ApiPropertyOptional({
    description: 'ID User yang terkait (jika ada)',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({
    description: 'ID Kelas yang ditempati',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  gradeClassId?: number;
}

export class UpdateStudentDto {
  @ApiPropertyOptional({
    description: 'Nama lengkap siswa',
    example: 'Ahmad Rizki',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    description: 'Nomor telepon siswa/orang tua',
    example: '08123456789',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Alamat lengkap siswa',
    example: 'Jl. Merdeka No. 10, Jakarta',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Tanggal lahir (ISO 8601)',
    example: '2008-05-15',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    description: 'Asal sekolah (SMP)',
    example: 'SMP Negeri 12 Jakarta',
  })
  @IsOptional()
  @IsString()
  schoolOrigin?: string;

  @ApiPropertyOptional({
    description: 'Tahun masuk/diterima',
    example: 2024,
  })
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  enrollmentYear?: number;

  @ApiPropertyOptional({
    description: 'ID Kelas yang ditempati',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  gradeClassId?: number;
}

export class AssignClassDto {
  @ApiProperty({
    description: 'ID Kelas yang akan ditempati siswa',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  gradeClassId: number;
}

export class FilterStudentDto {
  @ApiPropertyOptional({
    description: 'Filter berdasarkan ID kelas',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  gradeClassId?: number;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan tahun masuk',
    example: 2024,
  })
  @IsOptional()
  @IsInt()
  enrollmentYear?: number;

  @ApiPropertyOptional({
    description: 'Cari berdasarkan nama atau NISN',
    example: 'Ahmad',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
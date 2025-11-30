import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class LoginDto {
  @ApiProperty({
    description: 'Email user',
    example: 'admin@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password user',
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  // ==========================
  // BASE USER (Required)
  // ==========================
  @ApiProperty({
    description: 'Email user',
    example: 'newuser@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password user (min 6 karakter)',
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Role user (ADMIN, TEACHER, APPLICANT)',
    enum: Role,
    example: Role.APPLICANT,
  })
  @IsEnum(Role)
  role: Role;

  // ==========================
  // PROFILE DATA (Required for TEACHER & APPLICANT)
  // ==========================

  @ApiProperty({
    description: 'Nama lengkap user (required untuk TEACHER & APPLICANT)',
    example: 'Budi Santoso',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Nomor telepon user (required untuk TEACHER & APPLICANT)',
    example: '08123456789',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Alamat user (required untuk TEACHER & APPLICANT)',
    example: 'Jl. Merdeka No. 10',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  // ==========================
  // TEACHER SPECIFIC
  // ==========================

  @ApiPropertyOptional({
    description: 'NIP guru (required khusus role TEACHER)',
    example: '1987654321',
  })
  @IsOptional()
  @IsString()
  nip?: string;

  // ==========================
  // APPLICANT SPECIFIC
  // ==========================

  @ApiPropertyOptional({
    description: 'NISN siswa baru (required khusus role APPLICANT)',
    example: '0045678912',
  })
  @IsOptional()
  @IsString()
  nisn?: string;

  @ApiPropertyOptional({
    description: 'Tanggal lahir (required khusus role APPLICANT, format ISO 8601)',
    example: '2007-05-01',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    description: 'Asal sekolah siswa (required khusus role APPLICANT)',
    example: 'SMP Negeri 12 Jakarta',
  })
  @IsOptional()
  @IsString()
  schoolOrigin?: string;
}